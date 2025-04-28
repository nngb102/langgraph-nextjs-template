"use client"

import { useStream } from "@langchain/langgraph-sdk/react"
import type { Message } from "@langchain/langgraph-sdk"
import { useState, useEffect } from "react"
import { MessageItem } from "@/components/chat/message-item"
import { MessageInput } from "@/components/chat/message-input"
import { ChatHeader } from "@/components/chat/chat-header"
import { v4 as uuidv4 } from "uuid"

export default function Chat() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threadHistory, setThreadHistory] = useState<string[]>([])
  // Add a new state for locally managed messages
  const [localMessages, setLocalMessages] = useState<Message[]>([])

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
      // Filter out any local human messages that are now in the API response
      // by comparing content (this assumes content is a string)
      const apiMessageContents = thread.messages.filter((msg) => msg.type === "human").map((msg) => msg.content)

      const filteredLocalMessages = localMessages.filter(
        (msg) => msg.type === "human" && !apiMessageContents.includes(msg.content),
      )

      setLocalMessages(filteredLocalMessages)
    }
  }, [thread.messages])

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
    // Create a temporary message ID
    const tempId = uuidv4()

    // Immediately add the human message to local state
    const humanMessage: Message = {
      id: tempId,
      type: "human",
      content: message,
    }

    setLocalMessages((prev) => [...prev, humanMessage])

    // Submit to the API
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start a conversation by typing a message below</p>
            </div>
          </div>
        ) : (
          displayMessages.map((message) => <MessageItem key={message.id} message={message} />)
        )}
        {thread.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 w-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        )}
      </div>

      <MessageInput isLoading={thread.isLoading} onSubmit={handleMessageSubmit} onStop={() => thread.stop()} />
    </div>
  )
}
