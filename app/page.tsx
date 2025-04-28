"use client"

import { useStream } from "@langchain/langgraph-sdk/react"
import type { Message } from "@langchain/langgraph-sdk"
import { useState, useEffect, useRef } from "react"
import { MessageItem } from "@/components/chat/message-item"
import { MessageInput } from "@/components/chat/message-input"
import { ChatHeader } from "@/components/chat/chat-header"
import { v4 as uuidv4 } from "uuid"

export default function Chat() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threadHistory, setThreadHistory] = useState<string[]>([])
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load thread history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("threadHistory")
    if (history) {
      setThreadHistory(JSON.parse(history))
    }
  }, [])

  // Save new thread to history
  useEffect(() => {
    if (threadId && !threadHistory.includes(threadId)) {
      const newHistory = [...threadHistory, threadId]
      setThreadHistory(newHistory)
      localStorage.setItem("threadHistory", JSON.stringify(newHistory))
    }
  }, [threadId, threadHistory])

  const thread = useStream<{ messages: Message[] }>({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
    threadId: threadId,
    onThreadId: setThreadId,
  })

  // Reset local messages when thread changes
  useEffect(() => {
    setLocalMessages([])
  }, [threadId])

  // Sync API messages with local messages
  useEffect(() => {
    if (thread.messages.length > 0) {
      const apiMessageContents = thread.messages.filter((msg) => msg.type === "human").map((msg) => msg.content)
      const filteredLocalMessages = localMessages.filter(
        (msg) => msg.type === "human" && !apiMessageContents.includes(msg.content),
      )
      setLocalMessages(filteredLocalMessages)
    }
  }, [thread.messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [thread.messages, localMessages])

  // Combine API messages with local messages for display
  const displayMessages = [...thread.messages, ...localMessages]

  const handleNewThread = () => {
    if (displayMessages.length > 0) {
      if (window.confirm("Start a new conversation? Current messages will be saved.")) {
        setThreadId(null)
        setLocalMessages([])
      }
    } else {
      setThreadId(null)
      setLocalMessages([])
    }
  }

  const handleDeleteThread = (id: string) => {
    if (window.confirm("Delete this conversation? This cannot be undone.")) {
      const newHistory = threadHistory.filter((t) => t !== id)
      setThreadHistory(newHistory)
      localStorage.setItem("threadHistory", JSON.stringify(newHistory))
      if (threadId === id) {
        setThreadId(null)
        setLocalMessages([])
      }
    }
  }

  const handleMessageSubmit = (message: string) => {
    const tempId = uuidv4()
    const humanMessage: Message = {
      id: tempId,
      type: "human",
      content: message,
    }
    setLocalMessages((prev) => [...prev, humanMessage])
    thread.submit({ messages: [{ type: "human", content: message }] })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader
        threadId={threadId}
        threadHistory={threadHistory}
        onThreadSelect={setThreadId}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {displayMessages.length === 0 ? (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation by typing a message below</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {displayMessages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          {thread.isLoading && (
            <div className="flex justify-start mt-4">
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 w-12 bg-gray-300 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <MessageInput
            isLoading={thread.isLoading}
            onSubmit={handleMessageSubmit}
            onStop={() => thread.stop()}
          />
        </div>
      </div>
    </div>
  )
}
