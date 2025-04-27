'use client';

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useState, useEffect } from 'react';
import { MessageItem } from '@/components/chat/message-item';
import { MessageInput } from '@/components/chat/message-input';
import { ChatHeader } from '@/components/chat/chat-header';

export default function Chat() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadHistory, setThreadHistory] = useState<string[]>([]);

  // Load thread history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('threadHistory');
    if (history) {
      setThreadHistory(JSON.parse(history));
    }
  }, []);

  // Save new thread to history
  useEffect(() => {
    if (threadId && !threadHistory.includes(threadId)) {
      const newHistory = [...threadHistory, threadId];
      setThreadHistory(newHistory);
      localStorage.setItem('threadHistory', JSON.stringify(newHistory));
    }
  }, [threadId, threadHistory]);

  const thread = useStream<{ messages: Message[] }>({
    apiUrl: "http://localhost:2024",
    assistantId: "agent",
    messagesKey: "messages",
    threadId: threadId,
    onThreadId: setThreadId,
  });

  const handleNewThread = () => {
    if (thread.messages.length > 0) {
      if (window.confirm('Start a new conversation? Current messages will be saved.')) {
        setThreadId(null);
      }
    } else {
      setThreadId(null);
    }
  };

  const handleDeleteThread = (id: string) => {
    if (window.confirm('Delete this conversation? This cannot be undone.')) {
      const newHistory = threadHistory.filter(t => t !== id);
      setThreadHistory(newHistory);
      localStorage.setItem('threadHistory', JSON.stringify(newHistory));
      if (threadId === id) {
        setThreadId(null);
      }
    }
  };

  const handleMessageSubmit = (message: string) => {
    thread.submit({ messages: [{ type: "human", content: message }] });
  };

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
        {thread.messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {thread.isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 w-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        )}
      </div>

      <MessageInput
        isLoading={thread.isLoading}
        onSubmit={handleMessageSubmit}
        onStop={() => thread.stop()}
      />
    </div>
  );
}
