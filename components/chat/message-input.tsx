"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface MessageInputProps {
  isLoading: boolean
  onSubmit: (message: string) => void
  onStop: () => void
}

export function MessageInput({ isLoading, onSubmit, onStop }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus the input when the component mounts or loading state changes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!message.trim()) return

    onSubmit(message)
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (message.trim()) {
        onSubmit(message)
        setMessage("")
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

  return (
    <div className="border-t bg-white p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="flex-1 rounded-lg border-2 border-gray-400 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-500 shadow-sm text-gray-700 placeholder-gray-500 min-h-[40px] max-h-[200px] resize-none"
          disabled={isLoading}
          rows={1}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        )}
      </form>
    </div>
  )
}
