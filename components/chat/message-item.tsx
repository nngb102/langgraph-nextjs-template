import type { Message, ToolMessage, AIMessage } from "@langchain/langgraph-sdk"
import { format } from "date-fns"
import { Copy, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { useState, memo, useMemo, useCallback } from "react"

// Type guards for better type safety
const isToolMessage = (msg: Message): msg is ToolMessage => msg.type === 'tool';
const isAIMessage = (msg: Message): msg is AIMessage => msg.type === 'ai';

interface MessageItemProps {
    message: Message
    isGrouped?: boolean
    allMessages: Message[]
    messageIndex: number
}

const ToolIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
)

const AIIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-500"
    >
        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
        <path d="M12 2a10 10 0 1 1-10 10h10V2z" />
        <circle cx="12" cy="12" r="4" />
    </svg>
)

const UserAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <span className="text-blue-600 font-medium">U</span>
    </div>
)

const AIAvatar = () => (
    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
        <span className="text-purple-600 font-medium">AI</span>
    </div>
)

const StatusIcon = ({ status }: { status?: "error" | "success" }) => {
    if (!status) return null

    if (status === "error") {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-red-500"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        )
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="text-green-500"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6L9 17l-5-5" />
        </svg>
    )
}

// Spinner component (optional, can use emoji)
const InlineSpinner = () => (
    <Loader2 className="w-4 h-4 inline animate-spin text-gray-500 mr-1" />
);

// --- Helper Function to Render Tool Content in both loading and completed states ---
const RenderToolContent = ({
    toolCall,
    toolResult,
    isExpanded,
    onToggleExpand
}: {
    toolCall: { name: string; id?: string; },
    toolResult: ToolMessage | null,
    isExpanded: boolean,
    onToggleExpand: () => void
}) => {
    const isLoading = !toolResult;

    return (
        <>
            {/* Tool Header Row - consistent for both loading and completed states */}
            <div className="flex items-center gap-2 text-gray-600 mb-1">
                <ToolIcon />
                <span className="font-medium">{(toolResult?.name || toolCall.name || "Tool")}</span>

                {/* Show loading spinner or status icon */}
                {isLoading ? (
                    <InlineSpinner />
                ) : (
                    <StatusIcon status={toolResult.status} />
                )}

                {/* Only show expand/collapse button for completed tools with content */}
                {!isLoading && (
                    <button
                        onClick={onToggleExpand}
                        className="ml-auto p-1 rounded hover:bg-gray-200 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>

            {/* Status Badge Row - for both states */}
            <div className="flex gap-2 items-center">
                {isLoading ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Executing
                    </span>
                ) : toolResult.status && (
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full ${toolResult.status === "error"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                            }`}
                    >
                        {toolResult.status}
                    </span>
                )}
            </div>

            {/* Tool Content - only for completed tools when expanded */}
            {!isLoading && isExpanded && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <p
                        className={`whitespace-pre-wrap text-sm font-mono ${toolResult.status === "error" ? "text-red-700" : "text-gray-700"
                            }`}
                    >
                        {toolResult.content as string}
                    </p>
                </div>
            )}
        </>
    );
};

// Style helper function for tool box appearance based on tool state
const getToolBoxStyle = (toolResult: ToolMessage | null | undefined) => {
    const baseClasses = "rounded-lg p-3 border-2 shadow-sm ";

    if (!toolResult) {
        return baseClasses + "bg-blue-50 border-blue-300"; // Loading state - use blue tint
    }

    if (toolResult.status === "error") {
        return baseClasses + "bg-red-50 border-red-400";
    }

    if (toolResult.status === "success") {
        return baseClasses + "bg-green-50 border-green-400";
    }

    return baseClasses + "bg-gray-50 border-gray-400"; // Default state
};

// Core component that renders message items
export const MessageItem = memo(function MessageItem({
    message,
    isGrouped = false,
    allMessages,
    messageIndex
}: MessageItemProps) {
    const [isCopied, setIsCopied] = useState(false)
    const [toolExpansionState, setToolExpansionState] = useState<Record<string, boolean>>({});

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(message.content as string)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }, [message.content]);

    const toggleToolExpansion = useCallback((toolCallId: string) => {
        setToolExpansionState(prev => ({
            ...prev,
            [toolCallId]: !prev[toolCallId]
        }));
    }, []);

    const toolResultsMap = useMemo(() => {
        const results = new Map<string, ToolMessage | null>();
        if (!isAIMessage(message) || !message.tool_calls) {
            return results;
        }

        const currentToolCallIds = new Set(message.tool_calls.map(tc => tc.id).filter(id => id != null) as string[]);
        const subsequentMessages = allMessages.slice(messageIndex + 1);

        for (const toolCallId of currentToolCallIds) {
            results.set(toolCallId, null);
        }

        for (const msg of subsequentMessages) {
            if (isToolMessage(msg) && msg.tool_call_id && currentToolCallIds.has(msg.tool_call_id)) {
                if (!results.get(msg.tool_call_id)) {
                    results.set(msg.tool_call_id, msg);
                }
            }

            if (Array.from(results.values()).every(Boolean) || isAIMessage(msg)) {
                break;
            }
        }
        return results;
    }, [allMessages, messageIndex, message]);

    const getMessageStyle = () => {
        switch (message.type) {
            case "human":
                return "bg-blue-600 text-white shadow-md"
            case "tool":
                return `bg-gray-50 border-2 shadow-sm ${(message as ToolMessage).status === "error"
                    ? "border-red-400"
                    : (message as ToolMessage).status === "success"
                        ? "border-green-400"
                        : "border-gray-400"
                    }`
            case "ai":
                const aiMessage = message as AIMessage
                if (aiMessage.invalid_tool_calls?.length) {
                    return "bg-red-50 border-2 border-red-400 shadow-sm"
                }
                return "bg-white border-2 border-blue-300 shadow-md"
            default:
                return "bg-white border-2 border-gray-400 shadow-sm"
        }
    }

    const renderAIMessageHeader = (aiMessage: AIMessage) => {
        const hasInvalidToolCalls = aiMessage.invalid_tool_calls && aiMessage.invalid_tool_calls.length > 0

        if (!hasInvalidToolCalls) return null

        return (
            <div className="flex flex-col gap-1 mb-2">
                {hasInvalidToolCalls && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Invalid Tool Calls</span>
                )}
                {hasInvalidToolCalls && aiMessage.invalid_tool_calls && (
                    <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs font-medium text-red-600">Invalid Tool Calls:</span>
                        {aiMessage.invalid_tool_calls.map((call, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-red-600">
                                <StatusIcon status="error" />
                                <span>{call.name || "Unknown Tool"}</span>
                                {call.error && <span className="text-red-400">Error: {call.error}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (isToolMessage(message) && messageIndex > 0) {
        const prevMessage = allMessages[messageIndex - 1];
        if (isAIMessage(prevMessage) && prevMessage.tool_calls) {
            const wasCalledById = prevMessage.tool_calls.some(tc => tc.id === message.tool_call_id);
            if (wasCalledById) {
                return null;
            }
        }
    }

    return (
        <div className={`flex ${message.type === "human" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-start gap-3 max-w-[85%] ${message.type !== 'human' ? 'ml-0' : ''}`}>
                <div className="flex flex-col w-full">
                    {message.type === 'human' ? (
                        <div className={`rounded-2xl p-4 ${getMessageStyle()}`}>
                            <p className="whitespace-pre-wrap">
                                {message.content as string}
                            </p>
                        </div>
                    ) : message.type === 'ai' ? (
                        <>
                            {renderAIMessageHeader(message as AIMessage)}
                            {typeof message.content === 'string' && message.content.trim() !== '' && (
                                <p className={`whitespace-pre-wrap mb-2 ${(message as AIMessage).invalid_tool_calls?.length ? "text-red-600" : ""}`}>
                                    {message.content}
                                </p>
                            )}
                            {message.tool_calls && message.tool_calls.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {message.tool_calls.map((toolCall) => {
                                        const toolCallId = toolCall.id;
                                        if (!toolCallId) return null;

                                        const toolResult = toolResultsMap.get(toolCallId);
                                        const isExpanded = toolExpansionState[toolCallId] ?? false;

                                        return (
                                            <div
                                                key={toolCallId}
                                                className={getToolBoxStyle(toolResult)}
                                            >
                                                <RenderToolContent
                                                    toolCall={toolCall}
                                                    toolResult={toolResult as ToolMessage | null}
                                                    isExpanded={isExpanded}
                                                    onToggleExpand={() => toggleToolExpansion(toolCallId)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : isToolMessage(message) ? (
                        (() => {
                            const toolId = message.tool_call_id ?? message.id ?? 'fallback-id';
                            const isExpanded = toolExpansionState[toolId] ?? false;

                            return (
                                <div className={getToolBoxStyle(message as ToolMessage)}>
                                    <RenderToolContent
                                        toolCall={{ name: message.name || "Tool Result", id: toolId }}
                                        toolResult={message as ToolMessage}
                                        isExpanded={isExpanded}
                                        onToggleExpand={() => toggleToolExpansion(toolId)}
                                    />
                                </div>
                            );
                        })()
                    ) : (
                        <p className="whitespace-pre-wrap">{message.content as string}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                        {message.type === 'human' && (
                            <button
                                onClick={handleCopy}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Copy message"
                            >
                                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                            </button>
                        )}
                    </div>
                </div>
                {message.type === "human" ? <UserAvatar /> : null}
            </div>
        </div>
    )
})

MessageItem.displayName = "MessageItem";
