import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Leaf } from './Icons';
import { ChatMessage, PlantData } from '../types';
import { sendMessageToGemini, initializeChat } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface ChatBotProps {
  plantContext?: PlantData;
}

const ChatBot: React.FC<ChatBotProps> = ({ plantContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when context changes
  useEffect(() => {
    initializeChat(plantContext);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: plantContext 
          ? `I see you're looking at a **${plantContext.name}**! I can help you with specific care tips or answer any gardening questions.`
          : "Hi! I'm GreenThumb. Upload a photo to identify a plant, or ask me any gardening questions right here!"
      }
    ]);
  }, [plantContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userText);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I'm having trouble connecting to the garden network right now. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-green-600'
        } text-white`}
        aria-label="Toggle Chat"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed z-40 bg-white shadow-2xl transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
          bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] max-h-[70vh] rounded-2xl flex flex-col overflow-hidden border border-stone-200 font-sans`}
      >
        {/* Header */}
        <div className="bg-green-900 p-4 flex items-center space-x-3 text-white">
          <div className="bg-white/20 p-2 rounded-full">
            <Leaf size={20} />
          </div>
          <div>
            <h3 className="font-bold">GreenThumb Assistant</h3>
            <p className="text-xs text-green-200">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-green-600 text-white rounded-br-none' 
                    : 'bg-white text-stone-800 rounded-bl-none border border-stone-100'
                }`}
              >
                {msg.role === 'model' ? (
                   <ReactMarkdown 
                    className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-stone-900 prose-ul:my-1"
                    components={{
                      p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} />
                    }}
                   >
                     {msg.text}
                   </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 border border-stone-100 shadow-sm flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin text-green-600" />
                <span className="text-xs text-stone-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-100">
          <div className="flex items-center space-x-2 bg-stone-100 rounded-full px-4 py-2 border border-stone-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your plants..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm text-stone-700 placeholder-stone-400"
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-full transition-colors ${
                inputValue.trim() && !isLoading ? 'text-green-600 hover:bg-green-100' : 'text-stone-300'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
