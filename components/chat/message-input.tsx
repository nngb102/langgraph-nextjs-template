"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, X } from "lucide-react"

interface MessageInputProps {
    isLoading: boolean
    onSubmit: (message: string) => void
    onStop: () => void
}

const SUGGESTIONS = [
    "Tell me about yourself",
    "What can you help me with?",
    "How does this work?",
    "Show me an example",
]

export function MessageInput({ isLoading, onSubmit, onStop }: MessageInputProps) {
    const [message, setMessage] = useState("")
    const [showSuggestions, setShowSuggestions] = useState(true)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Auto-focus the input when the component mounts or loading state changes
    useEffect(() => {
        if (!isLoading && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isLoading])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!message.trim()) return

        try {
            await onSubmit(message)
            setMessage("")
            setShowSuggestions(false)
        } catch (error) {
            console.error("Error submitting message:", error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Submit on Enter (without Shift)
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (message.trim()) {
                handleSubmit(e as any)
            }
        }
    }

    // Auto-resize textarea
    const handleInput = () => {
        if (inputRef.current) {
            inputRef.current.style.height = "auto"
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setMessage(suggestion)
        setShowSuggestions(false)
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    return (
        <div className="border-t bg-white p-4 shadow-sm">
            {showSuggestions && !message && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    placeholder="Type your message... (Shift+Enter for new line)"
                    className="flex-1 rounded-lg border-2 border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 shadow-sm text-gray-700 placeholder-gray-500 min-h-[40px] max-h-[200px] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                    rows={1}
                />
                {isLoading ? (
                    <button
                        type="button"
                        onClick={onStop}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-4 h-4" />
                        Stop
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!message.trim()}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                )}
            </form>
        </div>
    )
}
