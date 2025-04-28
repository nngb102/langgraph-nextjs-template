interface ChatHeaderProps {
    threadId: string | null;
    threadHistory: string[];
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
                            <span className="text-sm text-gray-600">Thread ID:</span>
                            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{threadId}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {threadHistory.length > 0 && (
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
                                    {threadHistory.map((id) => (
                                        <div
                                            key={id}
                                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => {
                                                onThreadSelect(id)
                                                setIsThreadsOpen(false)
                                            }}
                                        >
                                            <span className="text-sm text-gray-700">Thread {threadHistory.indexOf(id) + 1}</span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDeleteThread(id)
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
