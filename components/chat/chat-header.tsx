interface Thread {
    thread_id: string;
    title: string;
    created_at: string;
    last_accessed_at: string;
}

interface ChatHeaderProps {
    threadId: string | null;
    threadHistory: Thread[];
    onThreadSelect: (threadId: string | null) => void;
    onNewThread: () => void;
    onDeleteThread: (threadId: string) => void;
}

import { Plus, Trash2, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export function ChatHeader({
    threadId,
    threadHistory,
    onThreadSelect,
    onNewThread,
    onDeleteThread,
}: ChatHeaderProps) {
    const [isThreadsOpen, setIsThreadsOpen] = useState(false)
    const threadsRef = useRef<HTMLDivElement>(null)

    // Filter out invalid threads
    const validThreads = threadHistory.filter(thread => thread && thread.thread_id);

    // Handle click outside for dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (threadsRef.current && !threadsRef.current.contains(event.target as Node)) {
                setIsThreadsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Handle keyboard navigation
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsThreadsOpen(false)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    return (
        <div className="p-4 border-b shadow-sm bg-white">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-900">Chat Assistant</h1>
                    {threadId && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Thread:</span>
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                {validThreads.find(t => t.thread_id === threadId)?.title || threadId}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {validThreads.length > 0 && (
                        <div className="relative" ref={threadsRef}>
                            <button
                                onClick={() => setIsThreadsOpen(!isThreadsOpen)}
                                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm flex items-center gap-2"
                            >
                                <span>Threads</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isThreadsOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isThreadsOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 animate-in fade-in slide-in-from-top-2">
                                    {validThreads.map((thread) => (
                                        <div
                                            key={thread.thread_id}
                                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                onThreadSelect(thread.thread_id)
                                                setIsThreadsOpen(false)
                                            }}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-700">{thread.thread_id}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(thread.last_accessed_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDeleteThread(thread.thread_id)
                                                }}
                                                className="p-1 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={onNewThread}
                        className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        New Thread
                    </button>
                </div>
            </div>
        </div>
    );
}
