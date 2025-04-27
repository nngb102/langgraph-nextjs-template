import type { Message, ToolMessage, AIMessage } from "@langchain/langgraph-sdk";

interface MessageItemProps {
    message: Message;
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
);

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
);

const StatusIcon = ({ status }: { status?: "error" | "success" }) => {
    if (!status) return null;

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
        );
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
    );
};

export function MessageItem({ message }: MessageItemProps) {
    const getMessageStyle = () => {
        switch (message.type) {
            case 'human':
                return 'bg-blue-600 text-white shadow-md';
            case 'tool':
                return `bg-gray-50 border-2 shadow-sm ${(message as ToolMessage).status === 'error'
                    ? 'border-red-400'
                    : (message as ToolMessage).status === 'success'
                        ? 'border-green-400'
                        : 'border-gray-400'
                    }`;
            case 'ai':
                const aiMessage = message as AIMessage;
                if (aiMessage.invalid_tool_calls?.length) {
                    return 'bg-red-50 border-2 border-red-400 shadow-sm';
                }
                return 'bg-white border-2 border-blue-300 shadow-md';
            default:
                return 'bg-white border-2 border-gray-400 shadow-sm';
        }
    };

    const renderAIMessageHeader = (aiMessage: AIMessage) => {
        const hasToolCalls = aiMessage.tool_calls && aiMessage.tool_calls.length > 0;
        const hasInvalidToolCalls = aiMessage.invalid_tool_calls && aiMessage.invalid_tool_calls.length > 0;
        const hasUsageMetadata = aiMessage.usage_metadata;

        if (!hasToolCalls && !hasInvalidToolCalls && !hasUsageMetadata) return null;

        return (
            <div className="flex flex-col gap-1 mb-2">
                {hasInvalidToolCalls && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Invalid Tool Calls
                    </span>
                )}

                {hasToolCalls && aiMessage.tool_calls && (
                    <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs font-medium text-gray-600">Tool Calls:</span>
                        {aiMessage.tool_calls.map((call, index) => (
                            <div key={call.id || index} className="flex items-center gap-2 text-xs text-gray-600">
                                <ToolIcon />
                                <span>{call.name}</span>
                            </div>
                        ))}
                    </div>
                )}
                {hasInvalidToolCalls && aiMessage.invalid_tool_calls && (
                    <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs font-medium text-red-600">Invalid Tool Calls:</span>
                        {aiMessage.invalid_tool_calls.map((call, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-red-600">
                                <StatusIcon status="error" />
                                <span>{call.name || 'Unknown Tool'}</span>
                                {call.error && <span className="text-red-400">Error: {call.error}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`flex ${message.type === 'human' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${getMessageStyle()}`}>
                {message.type === 'tool' && (
                    <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-2 text-gray-600">
                            <ToolIcon />
                            <span className="font-medium">
                                {(message as ToolMessage).name || 'Tool Result'}
                            </span>
                            <StatusIcon status={(message as ToolMessage).status} />
                        </div>
                        <div className="flex gap-2 items-center">
                            {(message as ToolMessage).status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${(message as ToolMessage).status === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {(message as ToolMessage).status}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {message.type === 'ai' && renderAIMessageHeader(message as AIMessage)}
                <p className={`whitespace-pre-wrap ${message.type === 'tool'
                    ? `text-sm font-mono ${(message as ToolMessage).status === 'error'
                        ? 'text-red-700'
                        : 'text-gray-700'
                    }`
                    : message.type === 'ai' && (message as AIMessage).invalid_tool_calls?.length
                        ? 'text-red-600'
                        : ''
                    }`}>
                    {message.content as string}
                </p>
            </div>
        </div>
    );
}
