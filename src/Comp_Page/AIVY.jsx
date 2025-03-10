import React, { useState, useRef, useEffect } from 'react';

const AIVY = () => {
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of chat when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  // Simulate sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    setChatHistory([...chatHistory, { type: 'user', text: inputValue }]);
    setInputValue('');
    
    // Simulate bot response (in a real app, this would call an API)
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: "I'm AIVY, your co-pilot for Competitive Intelligence. How can I help you today?" 
      }]);
    }, 1000);
  };
  
  return (
    <div className="flex h-screen bg-white">
      {/* Left sidebar */}
      <div className="w-80 bg-[#004567] flex flex-col text-white">
        <div className="p-4 border-b border-blue-800">
          <h1 className="text-xl font-semibold">Chat History</h1>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4 mt-2">
          <button className="flex items-center w-full bg-white text-gray-800 rounded p-2 hover:bg-gray-100">
            <span className="mr-2">+</span>
            <span className='text-[14px] font-[500]'>Start a New Chat</span>
          </button>
        </div>
        
        {/* Chat history list - Empty state */}
        <div className="flex-1 overflow-y-auto p-4 text-center text-gray-300">
          <p>No previous chats</p>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {/* AIVY Logo and intro */}
          <div className="mt-32 flex flex-col items-center">
            <img src="/png/aivy.png" alt="AIVY Logo" className="w-auto h-12 mb-4" />
            <div className="text-blue-900 text-3xl font-semibold mb-2">Hi I'm AIVY</div>
            <div className="text-gray-400 text-[12px]">Your Co-Pilot for Competitive Intelligence</div>
          </div>
          
          {/* Chat messages would appear here */}
          <div className="w-full mt-6">
            {chatHistory.map((message, index) => (
              <div 
                key={index} 
                className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-md ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-center bg-gray-100 rounded-lg overflow-hidden p-1">
            <img src="/png/aivy.png" alt="AIVY" className="h-8 w-auto ml-2" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send a message."
              className="flex-1 py-2 px-3 bg-transparent focus:outline-none"
            />
            <button 
              type="submit" 
              className="bg-amber-300 hover:bg-amber-400 text-white px-4 py-2 rounded"
            >
              →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIVY;