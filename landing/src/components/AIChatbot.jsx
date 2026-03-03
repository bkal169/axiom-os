import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: 'Hi there! I am your Axiom OS guide. Any questions about underwriting or deployment?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Mock AI Response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "That's a great question! Our enterprise plan handles advanced custom modeling. Let's get you set up with a free trial so you can explore the engine yourself."
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="glass-panel"
                style={{
                    position: 'fixed', bottom: '24px', right: '24px', zIndex: 99,
                    width: '60px', height: '60px', borderRadius: '50%',
                    display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))',
                    boxShadow: '0 8px 32px rgba(6,182,212,0.4)',
                    cursor: 'pointer', border: 'none', transition: 'transform 0.2s',
                    animation: 'fade-up 0.5s ease-out'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageSquare size={28} color="white" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="glass-panel" style={{
                    position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
                    width: '350px', height: '500px', display: 'flex', flexDirection: 'column',
                    boxShadow: 'var(--shadow-surface), 0 0 40px rgba(6,182,212,0.1)',
                    animation: 'fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: '1px solid var(--border-focus)', overflow: 'hidden'
                }}>
                    {/* header */}
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ background: 'var(--color-accent-cyan)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={18} color="white" />
                            </div>
                            <div>
                                <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Axiom Guide</h4>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: 0 }}>Online &middot; Ask me anything</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* messages */}
                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '80%', padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.5,
                                    background: msg.role === 'user' ? 'var(--color-accent-cyan)' : 'rgba(255,255,255,0.05)',
                                    color: msg.role === 'user' ? '#000' : 'var(--color-text-primary)',
                                    fontWeight: msg.role === 'user' ? 600 : 400,
                                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* input */}
                    <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about AI models..."
                            style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'white', outline: 'none' }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-cyan)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                        />
                        <button type="submit" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                            <Send size={16} color="white" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}

export default AIChatbot;
