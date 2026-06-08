import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateChatReply } from '../services/geminiService';
import { Button, Input, Badge } from '../components/ui';
import { Search, Send, Bot, User, MessageSquare, Camera, Phone, Video, Mail, RefreshCw } from 'lucide-react';
import { Conversation, Message, Channel } from '../types';
import { fetchConversations, fetchMessages, insertOutboundMessage, toggleHumanTakeover } from '../services/api';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from '../constants';

const ChannelIcon = ({ channel, className }: { channel: Channel, className?: string }) => {
  switch (channel) {
    case 'whatsapp': return <Phone className={`text-green-500 ${className}`} />;
    case 'instagram': return <Camera className={`text-pink-500 ${className}`} />;
    case 'facebook': return <MessageSquare className={`text-blue-500 ${className}`} />;
    case 'telegram': return <Send className={`text-blue-400 ${className}`} />;
    case 'tiktok': return <Video className={`text-white ${className}`} />;
    case 'email': return <Mail className={`text-red-400 ${className}`} />;
    default: return <MessageSquare className={`text-gray-400 ${className}`} />;
  }
};

export const Inbox: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConv = conversations.find(c => c.id === selectedId);
  // AI is enabled when human_takeover is false
  const aiEnabled = selectedConv ? !selectedConv.human_takeover : false;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchConversations();
      if (data.length > 0) {
        setConversations(data);
      } else {
        setConversations(MOCK_CONVERSATIONS);
      }
    } catch (error) {
      console.error(error);
      setConversations(MOCK_CONVERSATIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const data = await fetchMessages(convId);
      if (data.length > 0) {
        setMessages(data);
      } else {
        setMessages(MOCK_MESSAGES[convId] || []);
      }
    } catch (error) {
      console.error(error);
      setMessages(MOCK_MESSAGES[convId] || []);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !selectedId || !selectedConv) return;

    const textToSend = inputText;
    setInputText('');
    setIsSending(true);

    try {
      await insertOutboundMessage(selectedId, selectedConv.customer_id, textToSend);
      
      const newUserMsg: Message = {
        id: Date.now().toString(),
        conversation_id: selectedId,
        customer_id: selectedConv.customer_id,
        content: textToSend,
        direction: 'outbound',
        is_ai_generated: false,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newUserMsg]);

    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Check database connection.");
    } finally {
      setIsSending(false);
    }
  }, [inputText, selectedId, selectedConv]);

  const handleToggleAI = async () => {
    if (!selectedId || !selectedConv) return;
    
    const newHumanTakeover = !selectedConv.human_takeover; // toggle
    // Optimistic update
    setConversations(prev => prev.map(c => 
      c.id === selectedId ? { ...c, human_takeover: newHumanTakeover } : c
    ));

    try {
      await toggleHumanTakeover(selectedId, newHumanTakeover);
    } catch (error) {
      console.error("Failed to toggle AI:", error);
      // Revert on failure
      setConversations(prev => prev.map(c => 
        c.id === selectedId ? { ...c, human_takeover: !newHumanTakeover } : c
      ));
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar List */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Omnichannel Inbox</h2>
            <button onClick={loadConversations} className="text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 bg-background" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : conversations.map(conv => {
            const convAiEnabled = !conv.human_takeover;
            return (
              <div 
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${selectedId === conv.id ? 'bg-secondary/50 border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">{conv.customer_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={convAiEnabled ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0 h-4">
                      {convAiEnabled ? 'AI' : 'HUMAN'}
                    </Badge>
                    <ChannelIcon channel={conv.channel} className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate" dir="auto">{conv.last_message}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="font-semibold">{selectedConv.customer_name}</div>
                <ChannelIcon channel={selectedConv.channel} className="w-5 h-5" />
              </div>
              <Button 
                variant={aiEnabled ? 'outline' : 'default'} 
                size="sm"
                onClick={handleToggleAI}
              >
                {aiEnabled ? (
                  <><User className="w-4 h-4 mr-2" /> Take Over (Human)</>
                ) : (
                  <><Bot className="w-4 h-4 mr-2" /> Enable AI Agent</>
                )}
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => {
                const isOutbound = msg.direction === 'outbound';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[75%] ${isOutbound ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm ${isOutbound ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'}`} dir="auto">
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {isOutbound ? (msg.is_ai_generated ? 'AI Agent' : 'You') : selectedConv.customer_name}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-card border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">
                {aiEnabled ? "AI is active. Taking over will disable AI." : "Type message as human agent..."}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-background"
                  dir="auto"
                />
                <Button onClick={handleSendMessage} disabled={!inputText.trim() || isSending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};