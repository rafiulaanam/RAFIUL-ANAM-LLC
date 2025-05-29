"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Send,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  User,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isVendor: boolean;
  status: "sent" | "delivered" | "read";
}

interface Conversation {
  id: string;
  customerName: string;
  customerAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  orderId?: string;
  status: "active" | "archived";
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: "CONV001",
    customerName: "John Doe",
    customerAvatar: "",
    lastMessage: "When will my order be delivered?",
    timestamp: "2024-03-16T10:30:00",
    unreadCount: 2,
    orderId: "ORD001",
    status: "active",
    messages: [
      {
        id: "MSG001",
        content: "Hi, I have a question about my order",
        timestamp: "2024-03-16T10:25:00",
        isVendor: false,
        status: "read",
      },
      {
        id: "MSG002",
        content: "When will my order be delivered?",
        timestamp: "2024-03-16T10:30:00",
        isVendor: false,
        status: "read",
      },
    ],
  },
  {
    id: "CONV002",
    customerName: "Jane Smith",
    customerAvatar: "",
    lastMessage: "Thank you for your help!",
    timestamp: "2024-03-15T15:45:00",
    unreadCount: 0,
    status: "active",
    messages: [
      {
        id: "MSG003",
        content: "Hello, I need help with product sizing",
        timestamp: "2024-03-15T15:30:00",
        isVendor: false,
        status: "read",
      },
      {
        id: "MSG004",
        content: "I can help you with that. What's your usual size?",
        timestamp: "2024-03-15T15:35:00",
        isVendor: true,
        status: "read",
      },
      {
        id: "MSG005",
        content: "Thank you for your help!",
        timestamp: "2024-03-15T15:45:00",
        isVendor: false,
        status: "read",
      },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    mockConversations[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const filteredConversations = conversations.filter((conversation) =>
    conversation.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim()) return;

    const newMsg: Message = {
      id: `MSG${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isVendor: true,
      status: "sent",
    };

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === selectedConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMsg],
              lastMessage: newMessage,
              timestamp: newMsg.timestamp,
            }
          : conv
      )
    );

    setSelectedConversation((prev) =>
      prev ? { ...prev, messages: [...prev.messages, newMsg] } : null
    );

    setNewMessage("");
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] p-6">
      {/* Conversations List */}
      <Card className="mr-6 w-80 overflow-hidden">
        <div className="border-b p-4">
          <h2 className="mb-4 text-lg font-semibold">Messages</h2>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div className="h-full overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`cursor-pointer border-b p-4 transition-colors hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id
                  ? "bg-blue-50"
                  : ""
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={conversation.customerAvatar} />
                  <AvatarFallback>
                    {conversation.customerName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{conversation.customerName}</h3>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-gray-500">
                    {conversation.lastMessage}
                  </p>
                  {conversation.orderId && (
                    <Badge variant="secondary" className="mt-1">
                      Order #{conversation.orderId}
                    </Badge>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <Badge>{conversation.unreadCount}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      {selectedConversation ? (
        <Card className="flex flex-1 flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedConversation.customerAvatar} />
                <AvatarFallback>
                  {selectedConversation.customerName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {selectedConversation.customerName}
                </h3>
                {selectedConversation.orderId && (
                  <p className="text-sm text-gray-500">
                    Order #{selectedConversation.orderId}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isVendor ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.isVendor
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`mt-1 text-right text-xs ${
                        message.isVendor ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">Select a conversation to start messaging</p>
        </Card>
      )}
    </div>
  );
} 