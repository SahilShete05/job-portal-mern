import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Circle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getConversations, getMessages, sendMessage } from '../services/messageService';
import { connectSocket } from '../services/socket';
import Button from '../components/Button';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [starterReceiver, setStarterReceiver] = useState('');
  const [starterJobId, setStarterJobId] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [deliveredMessageIds, setDeliveredMessageIds] = useState({});
  const deliveryTimeouts = useRef(new Map());

  useEffect(() => {
    return () => {
      deliveryTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      deliveryTimeouts.current.clear();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        setLoadingConversations(true);
        const data = await getConversations();
        setConversations(data);

        const targetConversation = searchParams.get('conversation');
        if (targetConversation) {
          setSelectedConversationId(targetConversation);
        }

        const targetUser = searchParams.get('user');
        const targetJob = searchParams.get('job');
        if (targetUser) {
          setStarterReceiver(targetUser);
          setStarterJobId(targetJob || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoadingConversations(false);
      }
    };

    init();
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();
    if (!socket) return;

    const handlePresence = (payload) => {
      setOnlineUsers(payload.users || []);
    };

    const handleMessage = ({ conversationId, message }) => {
      setConversations((prev) => {
        const exists = prev.some((conv) => conv._id === conversationId);
        if (!exists) return prev;

        return prev.map((conv) => {
          if (conv._id !== conversationId) return conv;
          const isActive = conversationId === selectedConversationId;
          const unreadCount = isActive
            ? 0
            : (conv.unreadCount || 0) + (message.sender?._id !== user._id ? 1 : 0);
          return {
            ...conv,
            lastMessage: message,
            unreadCount,
          };
        });
      });

      if (conversationId === selectedConversationId) {
        setMessages((prev) => [...prev, message]);
      }

      if (message?.sender?._id !== user?._id) {
        socket.emit('message:received', {
          messageId: message._id,
          senderId: message.sender?._id,
        });
      }
    };

    const handleDelivered = ({ messageId }) => {
      if (!messageId) return;
      setDeliveredMessageIds((prev) => ({ ...prev, [messageId]: true }));
      const timeout = deliveryTimeouts.current.get(messageId);
      if (timeout) {
        clearTimeout(timeout);
        deliveryTimeouts.current.delete(messageId);
      }
    };

    socket.on('presence:update', handlePresence);
    socket.on('message:new', handleMessage);
    socket.on('message:delivered', handleDelivered);

    return () => {
      socket.off('presence:update', handlePresence);
      socket.off('message:new', handleMessage);
      socket.off('message:delivered', handleDelivered);
      // keep socket alive for other features
    };
  }, [selectedConversationId, user]);

  useEffect(() => {
    const load = async () => {
      if (!selectedConversationId) {
        setMessages([]);
        return;
      }

      try {
        setLoadingMessages(true);
        const data = await getMessages(selectedConversationId);
        setMessages(data);
      } catch (err) {
        setError(err.message || 'Failed to load conversation');
      } finally {
        setLoadingMessages(false);
      }
    };

    load();
  }, [selectedConversationId]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const getOtherParticipant = (conversation) => {
    if (!conversation || !user) return null;
    return conversation.participants.find((member) => member._id !== user._id);
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const handleSend = async () => {
    if (!draft.trim()) return;

    try {
      setSending(true);
      setError('');
      const response = await sendMessage({
        content: draft,
        conversationId: selectedConversationId || undefined,
        receiverId: selectedConversationId ? undefined : starterReceiver,
        jobId: starterJobId || undefined,
      });

      if (response?.conversationId && !selectedConversationId) {
        setSelectedConversationId(response.conversationId);
      }

      setDraft('');
      const updatedConversations = await getConversations();
      setConversations(updatedConversations);
      if (response?.conversationId) {
        const refreshedMessages = await getMessages(response.conversationId);
        setMessages(refreshedMessages);
        if (response?.message?._id) {
          const timeout = setTimeout(() => {
            setDeliveredMessageIds((prev) => ({ ...prev, [response.message._id]: false }));
          }, 5000);
          deliveryTimeouts.current.set(response.message._id, timeout);
        }
      } else if (selectedConversationId) {
        const refreshedMessages = await getMessages(selectedConversationId);
        setMessages(refreshedMessages);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-app py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">Messages</h1>
          <p className="text-muted">Stay connected with candidates and employers.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-danger-soft bg-danger-soft p-4 text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-subtle rounded-2xl shadow-card p-4 sm:p-5">
            <h2 className="text-lg font-semibold text-primary mb-3">Inbox</h2>
            {loadingConversations ? (
              <div className="py-12 text-center text-muted">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-muted">No conversations yet.</div>
            ) : (
              <div className="space-y-2 max-h-[420px] sm:max-h-[540px] overflow-y-auto">
                {conversations.map((conversation) => {
                  const other = getOtherParticipant(conversation);
                  const active = conversation._id === selectedConversationId;
                  return (
                    <button
                      key={conversation._id}
                      type="button"
                      onClick={() => setSelectedConversationId(conversation._id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                        active
                          ? 'border-[color:var(--app-accent)] bg-[color:var(--app-accent-soft)]'
                          : 'border-subtle hover:bg-[color:var(--app-accent-soft)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-primary">
                            {other?.name || 'Conversation'}
                          </p>
                          <p className="text-xs text-muted">
                            {conversation.job?.title || 'General'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {other?._id && isUserOnline(other._id) && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                              <Circle size={8} fill="currentColor" />
                              Online
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--app-accent)]">
                            <Circle size={8} fill="currentColor" />
                            {conversation.unreadCount}
                          </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted line-clamp-1 mt-2">
                        {conversation.lastMessage?.body || 'No messages yet'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 bg-card border border-subtle rounded-2xl shadow-card p-4 sm:p-6 flex flex-col min-h-[420px] sm:min-h-[520px]">
            {!selectedConversationId && !starterReceiver ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted">
                <MessageSquare size={42} className="mb-4" />
                <p>Select a conversation to start chatting.</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-subtle">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">
                      {getOtherParticipant(activeConversation)?.name || 'New conversation'}
                    </h3>
                    <p className="text-sm text-muted">
                      {activeConversation?.job?.title || 'General discussion'}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                  {loadingMessages ? (
                    <div className="text-center text-muted">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted">No messages yet. Start the conversation.</div>
                  ) : (
                    messages.map((message) => {
                      const isMine = message.sender?._id === user?._id;
                      const delivered = deliveredMessageIds[message._id];
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-soft ${
                              isMine
                                ? 'bg-[color:var(--app-accent)] text-white'
                                : 'bg-surface text-primary border border-subtle'
                            }`}
                          >
                            <p>{message.body}</p>
                            <p className={`text-xs mt-2 ${isMine ? 'text-[color:var(--app-surface)] opacity-70' : 'text-muted'}`}>
                              {new Date(message.createdAt).toLocaleString()}
                              {isMine && (
                                <span className="ml-2">
                                  {delivered ? 'Delivered' : 'Sent'}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-4 border-t border-subtle flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 rounded-lg border border-subtle bg-surface px-4 py-2 text-primary focus:border-[color:var(--app-accent)] focus:outline-none focus:ring-2 ring-accent"
                  />
                  <Button
                    variant="primary"
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    icon={Send}
                    className="w-full sm:w-auto"
                  >
                    {sending ? 'Sending' : 'Send'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
