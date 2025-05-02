import type { Message, ToolMessage, AIMessage } from "@langchain/langgraph-sdk"
import { memo } from "react"
import {
    isToolMessage,
    getToolBoxStyle,
    getMessageStyle,
    useMessageLogic
} from "../../lib/message-item-logic"
import {
    HumanMessage,
    ToolContent,
    AIMessageHeader,
    MessageContainer
} from "./message-types"

interface MessageItemProps {
    message: Message
    isGrouped?: boolean
    allMessages: Message[]
    messageIndex: number
}

// Main component
export const MessageItem = memo(function MessageItem({
    message,
    allMessages,
    messageIndex
}: MessageItemProps) {
    // Get all necessary values and functions from the hook
    const {
        isCopied,
        toolExpansionState,
        toolResultsMap,
        handleCopy,
        toggleToolExpansion,
        shouldRenderMessage
    } = useMessageLogic(message, allMessages, messageIndex);

    // Don't render if this is a tool message that's part of a sequence
    if (!shouldRenderMessage) return null;

    // Render content based on message type
    const renderContent = () => {
        // Human message
        if (message.type === 'human') {
            return (
                <HumanMessage
                    content={message.content as string}
                    style={getMessageStyle(message)}
                    onCopy={handleCopy}
                    isCopied={isCopied}
                />
            );
        }

        // AI message
        if (message.type === 'ai') {
            const aiMessage = message as AIMessage;
            const toolCalls = aiMessage.tool_calls || [];

            return (
                <>
                    <AIMessageHeader aiMessage={aiMessage} />

                    {/* AI message content */}
                    {typeof message.content === 'string' && message.content.trim() !== '' && (
                        <p className={`whitespace-pre-wrap mb-2 ${aiMessage.invalid_tool_calls?.length ? "text-red-600" : ""}`}>
                            {message.content}
                        </p>
                    )}

                    {/* Tool calls */}
                    {toolCalls.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {toolCalls.map(toolCall => {
                                const id = toolCall.id;
                                if (!id) return null;

                                const toolResult = toolResultsMap.get(id);

                                return (
                                    <div key={id} className={getToolBoxStyle(toolResult)}>
                                        <ToolContent
                                            toolCall={toolCall}
                                            toolResult={toolResult}
                                            isExpanded={toolExpansionState[id] ?? false}
                                            onToggleExpand={() => toggleToolExpansion(id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            );
        }

        // Tool message
        if (isToolMessage(message)) {
            const toolMsg = message as ToolMessage;
            const toolId = toolMsg.tool_call_id ?? toolMsg.id ?? 'fallback-id';

            return (
                <div className={getToolBoxStyle(toolMsg)}>
                    <ToolContent
                        toolCall={{ name: toolMsg.name || "Tool Result", id: toolId }}
                        toolResult={toolMsg}
                        isExpanded={toolExpansionState[toolId] ?? false}
                        onToggleExpand={() => toggleToolExpansion(toolId)}
                    />
                </div>
            );
        }

        // Default for any other message type
        return <p className="whitespace-pre-wrap">{message.content as string}</p>;
    };

    // Render the message container with the appropriate content
    return (
        <MessageContainer type={message.type}>
            {renderContent()}
        </MessageContainer>
    );
});

MessageItem.displayName = "MessageItem";
