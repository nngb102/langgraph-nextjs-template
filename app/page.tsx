"use client"

import { useStream } from "@langchain/langgraph-sdk/react"
import type { Message } from "@langchain/langgraph-sdk"
import { useState, useEffect, useRef, useCallback } from "react"
import { MessageItem } from "@/components/chat/message-item"
import { MessageInput } from "@/components/chat/message-input"
import { ChatHeader } from "@/components/chat/chat-header"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

export default function Chat() {
  const [threadId, setThreadId] = useState<string | null>(null)
  const [threadHistory, setThreadHistory] = useState<string[]>([])
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)

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

  // Reset SCROLL state when thread explicitly becomes null (New Thread button)
  // Do NOT reset localMessages here anymore to preserve first message optimistic update
  useEffect(() => {
    if (threadId === null) {
      // Only reset scroll/read state when explicitly starting a new thread
      setIsAtBottom(true)
      setHasUnreadMessages(false)
      // Optionally clear localMessages IF you want the input area cleared too,
      // but typically handleNewThread already does this.
      // setLocalMessages([]) 
    }
    // Note: We don't clear localMessages based on threadId change anymore.
    // handleNewThread is responsible for clearing messages when starting fresh.
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

  // Combine API messages with local messages for display
  const displayMessages = [...thread.messages, ...localMessages]

  // Function to check if the user is at the bottom
  const checkIfAtBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      // Consider user at bottom if they are within a small threshold (e.g., 10px)
      const threshold = 10
      const atBottom = scrollHeight - scrollTop - clientHeight <= threshold
      setIsAtBottom(atBottom)

      // If user scrolls to bottom, mark messages as read
      if (atBottom) {
        setHasUnreadMessages(false)
      }
    } else {
      // Default to true if container isn't rendered yet
      setIsAtBottom(true)
      setHasUnreadMessages(false)
    }
  }, [])

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom)
      // Initial check in case content is not scrollable initially
      checkIfAtBottom()
      return () => container.removeEventListener('scroll', checkIfAtBottom)
    }
  }, [checkIfAtBottom])

  // Scroll to bottom function
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
      setIsAtBottom(true) // Assume we are at bottom after manual scroll
      setHasUnreadMessages(false)
    }
  }

  // Auto-scroll or show unread indicator when new messages arrive
  useEffect(() => {
    // Only act on new messages, not initial load or thread change
    if (displayMessages.length > 0) {
      if (isAtBottom) {
        // If user is already at the bottom, scroll smoothly
        scrollToBottom("smooth")
      } else {
        // If user has scrolled up, show the indicator
        setHasUnreadMessages(true)
      }
    }
    // Trigger ONLY when messages change, not on scroll state change
  }, [thread.messages, localMessages])

  // Scroll instantly on initial load or thread switch if needed
  useEffect(() => {
    scrollToBottom("auto")
  }, [threadId]) // Trigger only when threadId changes

  const handleNewThread = () => {
    if (displayMessages.length > 0) {
      if (window.confirm("Start a new conversation? Current messages will be saved.")) {
        setThreadId(null)
        setLocalMessages([]) // Explicitly clear local messages here
      }
    } else {
      setThreadId(null)
      setLocalMessages([]) // Explicitly clear local messages here
    }
  }

  const handleDeleteThread = (id: string) => {
    if (window.confirm("Delete this conversation? This cannot be undone.")) {
      const newHistory = threadHistory.filter((t) => t !== id)
      setThreadHistory(newHistory)
      localStorage.setItem("threadHistory", JSON.stringify(newHistory))
      if (threadId === id) {
        setThreadId(null)
        setLocalMessages([]) // Explicitly clear local messages here too
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
    // Ensure user sees their own message immediately
    if (!isAtBottom) {
      setHasUnreadMessages(true) // Indicate bot response might be coming
    } else {
      // If user is at bottom when sending, scroll down after slight delay
      // to ensure the new message is rendered before scrolling.
      setTimeout(() => scrollToBottom("smooth"), 50);
    }
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

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
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
              <div ref={messagesEndRef} className="h-0" />
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

        {hasUnreadMessages && (
          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-lg bg-white hover:bg-gray-100"
              onClick={() => scrollToBottom("smooth")}
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        )}
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
