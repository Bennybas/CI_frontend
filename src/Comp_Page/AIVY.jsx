import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react';

const AIVY = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m AIVY, your Competitive Intelligence assistant. What would you like to know about market trends or competitors?'
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Predefined responses for Competitive Intelligence
  const getResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('market trends')) {
      return 'Here are the latest market trends in your industry...';
    }
    if (lowerInput.includes('competitor')) {
      return 'I can help you analyze competitor strategies and performance.';
    }
    if (lowerInput.includes('pricing')) {
      return 'Let\'s dive into competitive pricing insights.';
    }
    return 'I\'m processing your request. Would you like to be more specific?';
  };

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input
    };

    // Add bot response
    const newBotMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: getResponse(input)
    };

    setMessages([...messages, newUserMessage, newBotMessage]);
    setInput('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: 'Hello! I\'m AIVY, your Competitive Intelligence assistant. What would you like to know about market trends or competitors?'
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[540px] w-full max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden mt-[4rem]">
      {/* Header */}
      <div className="bg-blue-400 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8" />
          <h2 className="text-md font-semibold">AIVY CI Assistant</h2>
        </div>
        <button 
          onClick={resetChat} 
          className="hover:bg-[#004567] p-2 rounded-full transition"
          title="Reset Chat"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[80%] p-3 rounded-lg  text-sm
                ${msg.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-black'}
              `}
            >
              {msg.type === 'bot' && (
                <Bot className="h-5 w-5 mb-1 text-blue-600 inline-block mr-2" />
              )}
              {msg.type === 'user' && (
                <User className="h-5 w-5 mb-1 text-white inline-block mr-2" />
              )}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t flex items-center space-x-2 text-sm">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about competitors, market trends..."
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={handleSendMessage}
          className="bg-[#004567]/80 text-white p-2 rounded-full hover:bg-[#004567] transition"
        >
          <Send className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default AIVY;