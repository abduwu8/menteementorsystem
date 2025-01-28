import React, { useState, useRef, useEffect } from 'react';
import { RiSendPlaneLine, RiRobot2Line, RiUser3Line, RiDeleteBin6Line, RiInformationLine } from 'react-icons/ri';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Add initial greeting
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant. I can help you with mentoring, education, and career development questions. How can I assist you today?'
        }
      ]);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    if (!GROQ_API_KEY) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error: Groq API key is missing. Please check the configuration.' 
      }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant for an educational mentoring platform called OviEdu. 
              Your role is to assist both mentors and mentees with their questions about education, career development, 
              and mentoring relationships. You should be professional, encouraging, and provide actionable advice. 
              Focus on being clear, concise, and helpful. When appropriate, provide examples or step-by-step guidance.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      }]);
    } catch (error: any) {
      console.error('Error:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'There seems to be an issue with the AI service configuration. Please contact support.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'The service is currently busy. Please try again in a moment.';
      } else if (error.message.includes('connect')) {
        errorMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. How can I help you?'
    }]);
  };

  return (
    <div className="flex-1 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-3xl h-[90vh] mx-4">
          {/* Animated border effect */}
          <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-400 animate-border-glow opacity-75" />
          <div className="absolute inset-0 rounded-2xl bg-white" /> {/* White background behind content */}
          
          {/* Content container */}
          <div className="relative h-full flex flex-col rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <RiRobot2Line className="text-lg" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">AI Assistant</h1>
                    <p className="text-xs text-white/80">Your personal mentor and guide</p>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  title="Clear chat"
                >
                  <RiDeleteBin6Line className="text-lg" />
                </button>
              </div>
            </div>

            {/* Info Banner */}
            <div className="px-3 py-1 bg-indigo-50 border-b border-indigo-100 flex items-center space-x-2">
              <RiInformationLine className="text-indigo-600 text-sm" />
              <p className="text-xs text-indigo-700">
                Ask me anything about mentoring, education, or career development!
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-full">
                      <RiRobot2Line className="text-base text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-xl p-3 max-w-[70%] shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-gray-50 text-gray-800 border border-gray-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="bg-gray-200 p-1.5 rounded-full">
                      <RiUser3Line className="text-base text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 rounded-full">
                    <RiRobot2Line className="text-base text-white" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-2 border-t border-gray-100 bg-white">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 py-1.5 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-sm"
                >
                  <span>Send</span>
                  <RiSendPlaneLine className="text-base" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot; 