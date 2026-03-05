import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate(`/dashboard${window.location.search}`);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            alert('Check your email for the confirmation link!');
            setLoading(false);
        }
    }

    return (
        <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
            <div style={{
                width: '100%',
                maxWidth: 420,
                padding: 40,
                backgroundColor: '#111',
                borderRadius: 16,
                border: '1px solid #222',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '2px', color: '#fff', marginBottom: 40 }}>
                    ⬡ AXIOM<span style={{ color: '#D4A843' }}>OS</span>
                </div>

                <h2 style={{ fontSize: 20, color: '#fff', marginBottom: 12 }}>Welcome Back</h2>
                <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>Authenticate to access your workspace</p>

                {error && (
                    <div style={{
                        marginBottom: 24,
                        padding: '12px 16px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#FCA5A5',
                        borderRadius: 8,
                        fontSize: 13,
                        textAlign: 'left'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: 8,
                                    backgroundColor: '#0A0A0A',
                                    border: '1px solid #333',
                                    color: '#fff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#D4A843'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#333'}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: 8,
                                    backgroundColor: '#0A0A0A',
                                    border: '1px solid #333',
                                    color: '#fff',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#D4A843'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#333'}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: 8,
                                backgroundColor: '#D4A843',
                                color: '#000',
                                border: 'none',
                                fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'transform 0.1s, background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
                        </button>
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: 8,
                                backgroundColor: 'transparent',
                                color: '#D4A843',
                                border: '1px solid #D4A843',
                                fontWeight: 600,
                                cursor: 'not-allowed', // Signup disabled for Beta
                                opacity: 0.5
                            }}
                            title="Signup currently disabled for private beta"
                        >
                            Request Invite
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: 32, fontSize: 12, color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Shield size={12} /> Secure Enterprise Authentication
                </div>
            </div>
        </div>
    );
};

