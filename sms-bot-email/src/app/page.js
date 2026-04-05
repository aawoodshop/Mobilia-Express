'use client';

import { useState, useEffect, useRef } from 'react';

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [carrier, setCarrier] = useState('att');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sms-bot-messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    
    const savedCarrier = localStorage.getItem('sms-bot-carrier');
    if (savedCarrier) {
      setCarrier(savedCarrier);
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('sms-bot-messages', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCarrierChange = (e) => {
    setCarrier(e.target.value);
    localStorage.setItem('sms-bot-carrier', e.target.value);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const messageText = input.trim();
    setInput('');
    setIsSending(true);

    const newMessage = {
      id: Date.now().toString(),
      text: messageText,
      status: 'sending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          carrier: carrier,
          phone: '+1 9542341937'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'sent' } : m));
      } else {
        setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'failed' } : m));
        alert(data.error || 'Failed to send it natively. You might have missing creds.');
      }
    } catch (err) {
       setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, status: 'failed' } : m));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="chat-container">
      <header className="chat-header">
        <div className="chat-title">
          <h1>Direct to +1 (954) 234-1937</h1>
          <p>Email-to-SMS Gateway</p>
        </div>
        <select className="carrier-select" value={carrier} onChange={handleCarrierChange}>
          <option value="att">AT&amp;T</option>
          <option value="verizon">Verizon</option>
          <option value="tmobile">T-Mobile</option>
        </select>
      </header>

      <section className="messages-area" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            No messages yet. Send a message to start!
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
               <div className="message-node message-user">
                 {m.text}
               </div>
               <div className="message-status">
                 {m.timestamp} • {m.status === 'sending' ? 'Sending...' : m.status === 'sent' ? 'Delivered' : 'Failed'}
               </div>
            </div>
          ))
        )}
      </section>

      <footer className="input-area">
        <form onSubmit={handleSend} className="input-form">
          <input 
            type="text" 
            className="input-field" 
            placeholder="Text Message" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || isSending}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
             </svg>
          </button>
        </form>
      </footer>
    </main>
  );
}
