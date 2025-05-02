import type { Message, ToolMessage, AIMessage } from "@langchain/langgraph-sdk"
import { useState, useMemo, useCallback } from "react"

// Type guards
export const isToolMessage = (msg: Message): msg is ToolMessage => msg.type === 'tool';
export const isAIMessage = (msg: Message): msg is AIMessage => msg.type === 'ai';

// Style helpers
export const getToolBoxStyle = (toolResult: ToolMessage | null | undefined) => {
    const base = "rounded-lg p-3 border-2 shadow-sm ";

    if (!toolResult) return base + "bg-blue-50 border-blue-300";
    if (toolResult.status === "error") return base + "bg-red-50 border-red-400";
    if (toolResult.status === "success") return base + "bg-green-50 border-green-400";

    return base + "bg-gray-50 border-gray-400";
};

export const getMessageStyle = (message: Message) => {
    switch (message.type) {
        case "human":
            return "bg-blue-600 text-white shadow-md"
        case "tool": {
            const status = (message as ToolMessage).status;
            return `bg-gray-50 border-2 shadow-sm ${status === "error" ? "border-red-400" :
                    status === "success" ? "border-green-400" :
                        "border-gray-400"
                }`
        }
        case "ai": {
            const aiMessage = message as AIMessage;
            return aiMessage.invalid_tool_calls?.length
                ? "bg-red-50 border-2 border-red-400 shadow-sm"
                : "bg-white border-2 border-blue-300 shadow-md"
        }
        default:
            return "bg-white border-2 border-gray-400 shadow-sm"
    }
}

// Message logic hook
export const useMessageLogic = (message: Message, allMessages: Message[], messageIndex: number) => {
    const [isCopied, setIsCopied] = useState(false)
    const [toolExpansionState, setToolExpansionState] = useState<Record<string, boolean>>({});

    // Copy function
    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(message.content as string)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }, [message.content]);

    // Toggle tool expansion
    const toggleToolExpansion = useCallback((toolCallId: string) => {
        setToolExpansionState(prev => ({ ...prev, [toolCallId]: !prev[toolCallId] }));
    }, []);

    // Find tool results for each tool call
    const toolResultsMap = useMemo(() => {
        const results = new Map<string, ToolMessage | null>();

        // Skip if not AI message or no tool calls
        if (!isAIMessage(message) || !message.tool_calls) return results;

        // Get IDs from tool calls
        const toolCallIds = new Set(message.tool_calls
            .map(tc => tc.id)
            .filter(Boolean) as string[]);

        // Initialize with null for loading state
        toolCallIds.forEach(id => results.set(id, null));

        // Find corresponding tool messages
        const nextMessages = allMessages.slice(messageIndex + 1);
        for (const msg of nextMessages) {
            if (
                isToolMessage(msg) &&
                msg.tool_call_id &&
                toolCallIds.has(msg.tool_call_id) &&
                !results.get(msg.tool_call_id)
            ) {
                results.set(msg.tool_call_id, msg);
            }

            // Stop if all results found or next AI message
            if (Array.from(results.values()).every(Boolean) || isAIMessage(msg)) break;
        }

        return results;
    }, [allMessages, messageIndex, message]);

    // Determine if message should be rendered
    const shouldRenderMessage = useMemo(() => {
        if (!isToolMessage(message) || messageIndex <= 0) return true;

        const prevMessage = allMessages[messageIndex - 1];
        return !(
            isAIMessage(prevMessage) &&
            prevMessage.tool_calls?.some(tc => tc.id === message.tool_call_id)
        );
    }, [message, messageIndex, allMessages]);

    return {
        isCopied,
        toolExpansionState,
        toolResultsMap,
        handleCopy,
        toggleToolExpansion,
        shouldRenderMessage
    };
}; 