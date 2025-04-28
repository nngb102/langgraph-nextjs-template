interface ChatHeaderProps {
    threadId: string | null;
    threadHistory: string[];
    onThreadSelect: (threadId: string | null) => void;
    onNewThread: () => void;
    onDeleteThread: (threadId: string) => void;
}

const NewThreadIcon = () => (
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
        <path d="M21 12h-8m-4 0H3m8 0V4m0 16v-8" />
    </svg>
);

export function ChatHeader({
    threadId,
    threadHistory,
    onThreadSelect,
    onNewThread,
    onDeleteThread,
}: ChatHeaderProps) {
    return (
        <div className="p-4 border-b shadow-sm bg-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Chat Assistant</h1>
                    {threadId && <p className="text-sm text-gray-600">Thread ID: {threadId}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {threadHistory.length > 0 && (
                        <div className="relative">
                            <select
                                value={threadId || ''}
                                onChange={(e) => onThreadSelect(e.target.value || null)}
                                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm"
                            >
                                <option value="">Select Thread</option>
                                {threadHistory.map((id) => (
                                    <option key={id} value={id}>
                                        Thread {threadHistory.indexOf(id) + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button
                        onClick={onNewThread}
                        className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <NewThreadIcon />
                        New Thread
                    </button>

                    {threadId && (
                        <button
                            onClick={() => onDeleteThread(threadId)}
                            className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 transition-colors shadow-sm"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
