import type { ToolMessage, AIMessage } from "@langchain/langgraph-sdk"
import { Copy, Check, ChevronDown, ChevronUp, Loader2, XCircle, CheckCircle, Wrench } from "lucide-react"
import { ReactNode } from "react"

// Các biến CSS cơ bản để tái sử dụng
const flexGap2 = "flex items-center gap-2";
const badgeBase = "text-xs px-2 py-0.5 rounded-full";

// Các icon đơn giản hóa
export const ToolIcon = () => <Wrench className="w-4 h-4" />
export const ErrorIcon = () => <XCircle className="w-4 h-4 text-red-500" />
export const SuccessIcon = () => <CheckCircle className="w-4 h-4 text-green-500" />
export const InlineSpinner = () => <Loader2 className="w-4 h-4 inline animate-spin text-gray-500 mr-1" />

// Status icon
export const StatusIcon = ({ status }: { status?: "error" | "success" }) => {
    if (!status) return null;
    return status === "error" ? <ErrorIcon /> : <SuccessIcon />;
}

// Copy button
export const CopyButton = ({ isCopied, onClick }: { isCopied: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
        title="Copy message"
    >
        {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
    </button>
);

// Human message component
export const HumanMessage = ({
    content,
    style,
    onCopy,
    isCopied
}: {
    content: string;
    style: string;
    onCopy: () => void;
    isCopied: boolean
}) => (
    <>
        <div className={`rounded-2xl p-4 ${style}`}>
            <p className="whitespace-pre-wrap">{content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
            <CopyButton isCopied={isCopied} onClick={onCopy} />
        </div>
    </>
);

// Status badge component
const StatusBadge = ({ isLoading, status }: { isLoading: boolean; status?: string }) => {
    if (isLoading) {
        return <span className={`${badgeBase} bg-blue-100 text-blue-700`}>Executing</span>;
    }

    if (!status) return null;

    return (
        <span className={`${badgeBase} ${status === "error"
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"}`}
        >
            {status}
        </span>
    );
};

// Tool content display component
export const ToolContent = ({
    toolCall,
    toolResult,
    isExpanded,
    onToggleExpand
}: {
    toolCall: { name: string; id?: string; },
    toolResult: ToolMessage | null | undefined,
    isExpanded: boolean,
    onToggleExpand: () => void
}) => {
    const isLoading = !toolResult;
    const toolName = toolResult?.name || toolCall.name || "Tool";

    return (
        <>
            {/* Tool Header */}
            <div className={`${flexGap2} text-gray-600 mb-1`}>
                <ToolIcon />
                <span className="font-medium">{toolName}</span>
                {isLoading ? <InlineSpinner /> : <StatusIcon status={toolResult.status} />}

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

            {/* Status Badge */}
            <div className={flexGap2}>
                <StatusBadge isLoading={isLoading} status={toolResult?.status} />
            </div>

            {/* Tool Content */}
            {!isLoading && isExpanded && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className={`whitespace-pre-wrap text-sm font-mono ${toolResult.status === "error" ? "text-red-700" : "text-gray-700"
                        }`}>
                        {toolResult.content as string}
                    </p>
                </div>
            )}
        </>
    );
};

// AI Message Error Header
export const AIMessageHeader = ({ aiMessage }: { aiMessage: AIMessage }) => {
    const invalidToolCalls = aiMessage.invalid_tool_calls || [];
    const hasInvalidToolCalls = invalidToolCalls.length > 0;

    if (!hasInvalidToolCalls) return null;

    return (
        <div className="flex flex-col gap-1 mb-2">
            <span className={`${badgeBase} bg-red-100 text-red-700`}>Invalid Tool Calls</span>
            <div className="flex flex-col gap-1 mt-1">
                <span className="text-xs font-medium text-red-600">Invalid Tool Calls:</span>
                {invalidToolCalls.map((call, index) => (
                    <div key={index} className={`${flexGap2} text-xs text-red-600`}>
                        <ErrorIcon />
                        <span>{call.name || "Unknown Tool"}</span>
                        {call.error && <span className="text-red-400">Error: {call.error}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Message container component
export const MessageContainer = ({
    type,
    children
}: {
    type: "human" | "ai" | "tool" | string;
    children: ReactNode
}) => (
    <div className={`flex ${type === "human" ? "justify-end" : "justify-start"}`}>
        <div className={`flex items-start gap-3 max-w-[85%] ${type !== 'human' ? 'ml-0' : ''}`}>
            <div className="flex flex-col w-full">{children}</div>
        </div>
    </div>
); 