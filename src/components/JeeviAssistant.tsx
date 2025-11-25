import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface JeeviAssistantProps {
  onNavigate: (page: string) => void;
  userEmail?: string;
  userName?: string;
}

export function JeeviAssistant({ onNavigate, userEmail = 'guest@example.com', userName = 'Guest User' }: JeeviAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Jeevi, your healthcare assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [liveChatRequested, setLiveChatRequested] = useState(false);
  const [liveChatActive, setLiveChatActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    'Book an appointment',
    'Find doctors',
    'Order medicines',
    'Find hospitals',
    'Talk to admin (Live Chat)'
  ];

  const handleRequestLiveChat = () => {
    setLiveChatRequested(true);
    const botMessage: Message = {
      id: Date.now().toString(),
      text: '🔴 Live Chat Request Sent!\n\nYour message has been sent to our admin team. An admin will respond to you shortly. You can continue chatting here, and the admin will see all your messages.',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
    setLiveChatActive(true);

    // Store message in localStorage to simulate sending to admin
    const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
    existingMessages.push({
      id: Date.now().toString(),
      userName,
      userEmail,
      message: inputMessage || 'User requested live chat support',
      timestamp: new Date().toLocaleString(),
      status: 'unread',
      replies: [],
    });
    localStorage.setItem('adminMessages', JSON.stringify(existingMessages));
    toast.success('Connected to live admin chat!');
  };

  const sendMessageToAdmin = (message: string) => {
    if (!liveChatActive) return;

    const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
    const currentChat = existingMessages.find((msg: any) => msg.userEmail === userEmail && msg.status !== 'closed');

    if (currentChat) {
      currentChat.replies.push({
        admin: false,
        text: message,
        timestamp: new Date().toLocaleString()
      });
      localStorage.setItem('adminMessages', JSON.stringify(existingMessages));
    }
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('live chat') || lowerMessage.includes('talk to admin') || lowerMessage.includes('talk with admin') || lowerMessage.includes('admin')) {
      setTimeout(() => handleRequestLiveChat(), 100);
      return 'Connecting you with a live admin...';
    } else if (lowerMessage.includes('refund')) {
      return 'To request a refund, I can connect you with an admin who will process your request. Would you like to talk to a live admin? Type "live chat" to connect.';
    } else if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      return 'To book an appointment, please visit our Doctors page and select your preferred doctor. You can choose from various specialists including Cardiologists, Neurologists, and more. Would you like me to guide you there?';
    } else if (lowerMessage.includes('doctor')) {
      return 'We have 156+ verified doctors across multiple specialties. You can search for doctors by specialty, location, or name. Each doctor profile includes their qualifications, experience, and available time slots.';
    } else if (lowerMessage.includes('medicine')) {
      return 'You can order medicines through our Medicine section. We offer 458+ medicines with fast delivery. You can also upload your prescription for convenient ordering. Delivery is available across Dhaka.';
    } else if (lowerMessage.includes('hospital')) {
      return 'We partner with leading hospitals in Bangladesh. You can view detailed information about each hospital including their specialties, facilities, and contact information in our Hospitals section.';
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('bkash') || lowerMessage.includes('nagad')) {
      return 'We accept payments via bKash and Nagad. After booking, you\'ll receive payment instructions with our bKash number (01625691878). Submit your transaction ID for verification. Our admin team verifies payments within 5 minutes.';
    } else if (lowerMessage.includes('prescription')) {
      return 'You can upload your prescription when ordering medicines. Our pharmacists will verify it and process your order. This ensures you get the right medications as prescribed by your doctor.';
    } else if (lowerMessage.includes('delivery')) {
      return 'We offer fast and reliable medicine delivery across Bangladesh. Delivery charges are ৳50. Most orders are delivered within 24-48 hours depending on your location.';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('fee') || lowerMessage.includes('cost')) {
      return 'Consultation fees vary by doctor, typically ranging from ৳500-1500. Medicine prices are clearly displayed on each product. There\'s a delivery fee of ৳50 for medicine orders.';
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      return 'You can reach us at:\n📧 Email: jeevitasupport@gmail.com\n📱 Phone: 01625691878\nOur support team is available 24/7 to assist you. You can also talk to a live admin through this chat!';
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! Welcome to Jeevita. I\'m here to help you with appointments, medicines, hospital information, and more. What would you like to know?';
    } else if (lowerMessage.includes('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with today?';
    } else {
      return 'I\'m here to help! I can assist you with:\n• Booking doctor appointments\n• Ordering medicines\n• Finding hospitals\n• Payment information\n• Prescription uploads\n• Live chat with admin\n\nWhat would you like to know more about?';
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    if (liveChatActive) {
      sendMessageToAdmin(inputMessage);
    }

    const currentInput = inputMessage;
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const response = getBotResponse(currentInput);
      if (response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-110 z-50 animate-pulse"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl border-2 border-amber-200 z-50 flex flex-col rounded-2xl bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full animate-bounce">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold">Jeevi Assistant</h3>
                <p className="text-xs text-white/90">
                  {liveChatActive ? '🔴 Live Admin Chat Active' : 'Always here to help 24/7'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages - Scrollable */}
          <div
            ref={messagesContainerRef}
            className="flex-1 p-4 bg-gradient-to-b from-amber-50/30 to-white overflow-y-auto"
            style={{ maxHeight: 'calc(600px - 200px)' }}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'bot' && (
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 border-2 border-amber-200">
                      <Bot className="h-4 w-4 text-amber-700" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl break-words ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-white border-2 border-amber-100 text-gray-900 shadow-md'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-line break-words">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/80' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 bg-white flex-shrink-0 border-t border-amber-100">
              <p className="text-xs text-amber-700 mb-2 font-medium">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full transition-all hover:shadow-md"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t-2 border-amber-200 bg-white flex-shrink-0">
            <div className="flex gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={liveChatActive ? "Message admin..." : "Type your message..."}
                className="flex-1 px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 flex-shrink-0 px-4 py-2 rounded-xl text-white transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
