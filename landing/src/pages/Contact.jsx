import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare, Star, Mail, MapPin, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Contact = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    // Contact form state
    const [contact, setContact] = useState({ name: '', email: '', company: '', subject: 'General Inquiry', message: '' });
    const [contactSent, setContactSent] = useState(false);
    const [contactLoading, setContactLoading] = useState(false);

    // Feedback state
    const [feedback, setFeedback] = useState({ rating: 0, hoveredRating: 0, category: 'Feature Request', message: '' });
    const [feedbackSent, setFeedbackSent] = useState(false);

    // Public comments state
    const [comments, setComments] = useState([
        { id: 1, name: 'Marcus T.', role: 'Land Developer · Phoenix, AZ', text: 'The IC Memo generator alone saved us 6 hours per deal. Best investment we\'ve made for our acquisition team this year.', date: 'Feb 14, 2026', rating: 5 },
        { id: 2, name: 'Rachel N.', role: 'Managing Director · Houston, TX', text: 'Jurisdiction intel feature is a game-changer for multi-state portfolios. Worth every dollar.', date: 'Jan 28, 2026', rating: 5 },
        { id: 3, name: 'David K.', role: 'Principal · Miami, FL', text: 'Finally a platform built for actual developers, not just investors. The financial engine is incredibly precise.', date: 'Jan 12, 2026', rating: 5 },
    ]);
    const [newComment, setNewComment] = useState({ name: '', role: '', text: '', rating: 5 });
    const [commentSubmitted, setCommentSubmitted] = useState(false);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!contact.name || !contact.email || !contact.message) return;
        setContactLoading(true);
        // Simulate sending — in production, POST to your backend or use Formspree/Resend
        await new Promise(r => setTimeout(r, 1200));
        setContactLoading(false);
        setContactSent(true);
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        if (!feedback.message) return;
        setFeedbackSent(true);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!newComment.name || !newComment.text) return;
        setComments([{
            id: Date.now(),
            name: newComment.name,
            role: newComment.role || 'Platform User',
            text: newComment.text,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            rating: newComment.rating,
        }, ...comments]);
        setNewComment({ name: '', role: '', text: '', rating: 5 });
        setCommentSubmitted(true);
        setTimeout(() => setCommentSubmitted(false), 4000);
    };

    const inp = { background: 'var(--color-bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px 14px', color: 'white', fontSize: '0.9rem', width: '100%', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
    const sel = { ...inp, cursor: 'pointer' };

    return (
        <>
            <Header />
            <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container">
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-accent-cyan)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Get In Touch</div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Contact & Support</h1>
                        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
                            Our team is available Monday–Friday, 9am–6pm ET. For urgent platform issues, use the live chat widget in the bottom right corner.
                        </p>
                    </div>

                    {/* Info cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '64px' }}>
                        {[
                            { icon: <Mail size={20} />, title: 'Email Support', value: 'support@buildaxiom.dev', href: 'mailto:support@buildaxiom.dev' },
                            { icon: <Clock size={20} />, title: 'Response Time', value: 'Within 24 business hours', href: null },
                            { icon: <MessageSquare size={20} />, title: 'Live Chat', value: 'Available on all pages', href: null },
                            { icon: <MapPin size={20} />, title: 'Headquarters', value: 'United States', href: null },
                        ].map((card, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ color: 'var(--color-accent-cyan)', flexShrink: 0, marginTop: '2px' }}>{card.icon}</div>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.title}</div>
                                    {card.href
                                        ? <a href={card.href} style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>{card.value}</a>
                                        : <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{card.value}</div>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '80px' }}>
                        {/* ─── Contact Form ─── */}
                        <div className="glass-panel" style={{ padding: '36px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Send a Message</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>For sales, billing, enterprise inquiries, or general questions.</p>

                            {contactSent ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
                                    <div style={{ color: 'var(--color-accent-cyan)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>Message Sent!</div>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>We'll get back to you at {contact.email} within 24 hours.</p>
                                    <button onClick={() => { setContactSent(false); setContact({ name: '', email: '', company: '', subject: 'General Inquiry', message: '' }); }}
                                        className="btn btn-secondary" style={{ marginTop: '20px' }}>Send Another</button>
                                </div>
                            ) : (
                                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Name *</label>
                                            <input style={inp} value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} placeholder="Your name" required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Email *</label>
                                            <input style={inp} type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="you@company.com" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Company</label>
                                        <input style={inp} value={contact.company} onChange={e => setContact({ ...contact, company: e.target.value })} placeholder="Your firm name" />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Subject</label>
                                        <select style={sel} value={contact.subject} onChange={e => setContact({ ...contact, subject: e.target.value })}>
                                            {['General Inquiry', 'Sales / Enterprise', 'Billing Question', 'Technical Support', 'Partnership', 'Press / Media'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Message *</label>
                                        <textarea style={{ ...inp, minHeight: '120px', resize: 'vertical', lineHeight: 1.6 }} value={contact.message} onChange={e => setContact({ ...contact, message: e.target.value })} placeholder="How can we help you?" required />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={contactLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                                        {contactLoading ? 'Sending…' : <><Send size={16} /> Send Message</>}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* ─── Feedback Form ─── */}
                        <div className="glass-panel" style={{ padding: '36px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Product Feedback</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>Tell us what's working, what's not, and what you'd like to see next.</p>

                            {feedbackSent ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                                    <div style={{ color: 'var(--color-accent-cyan)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>Thank You!</div>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Your feedback helps us build a better product. We review every submission.</p>
                                    <button onClick={() => { setFeedbackSent(false); setFeedback({ rating: 0, hoveredRating: 0, category: 'Feature Request', message: '' }); }}
                                        className="btn btn-secondary" style={{ marginTop: '20px' }}>Submit More</button>
                                </div>
                            ) : (
                                <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Star rating */}
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px', display: 'block' }}>Overall Experience</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={28}
                                                    fill={(feedback.hoveredRating || feedback.rating) >= star ? '#FCD34D' : 'transparent'}
                                                    color={(feedback.hoveredRating || feedback.rating) >= star ? '#FCD34D' : 'var(--color-text-muted)'}
                                                    style={{ cursor: 'pointer', transition: 'all 0.1s' }}
                                                    onMouseEnter={() => setFeedback(f => ({ ...f, hoveredRating: star }))}
                                                    onMouseLeave={() => setFeedback(f => ({ ...f, hoveredRating: 0 }))}
                                                    onClick={() => setFeedback(f => ({ ...f, rating: star }))}
                                                />
                                            ))}
                                            {feedback.rating > 0 && <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginLeft: '4px', alignSelf: 'center' }}>{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][feedback.rating]}</span>}
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Category</label>
                                        <select style={sel} value={feedback.category} onChange={e => setFeedback(f => ({ ...f, category: e.target.value }))}>
                                            {['Feature Request', 'Bug Report', 'UI / UX Suggestion', 'Performance', 'AI Agent Quality', 'Documentation', 'Other'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Your Feedback *</label>
                                        <textarea style={{ ...inp, minHeight: '160px', resize: 'vertical', lineHeight: 1.6 }} value={feedback.message} onChange={e => setFeedback(f => ({ ...f, message: e.target.value }))} placeholder="Be as specific as possible — feature name, use case, expected vs. actual behavior…" required />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                                        <Send size={16} /> Submit Feedback
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* ─── Community Comments ─── */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '64px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Community Testimonials</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Real perspectives from real estate professionals using Axiom OS.</p>
                            </div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{comments.length} reviews</div>
                        </div>

                        {/* Comment list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
                            {comments.map(c => (
                                <div key={c.id} className="glass-panel" style={{ padding: '24px 28px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                                            {c.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                                <div>
                                                    <span style={{ fontWeight: 600, color: 'white', marginRight: '8px' }}>{c.name}</span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{c.role}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < c.rating ? '#FCD34D' : 'transparent'} color={i < c.rating ? '#FCD34D' : 'var(--color-text-muted)'} />)}
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '6px' }}>{c.date}</span>
                                                </div>
                                            </div>
                                            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>"{c.text}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add comment */}
                        <div className="glass-panel" style={{ padding: '36px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Share Your Experience</h3>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Using Axiom OS? Let the community know what you think.</p>

                            {commentSubmitted && (
                                <div style={{ padding: '12px 16px', marginBottom: '20px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '6px', color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>
                                    ✓ Your review has been added! Thank you.
                                </div>
                            )}

                            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Name *</label>
                                        <input style={inp} value={newComment.name} onChange={e => setNewComment(c => ({ ...c, name: e.target.value }))} placeholder="Your name or initials" required />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Role & Location</label>
                                        <input style={inp} value={newComment.role} onChange={e => setNewComment(c => ({ ...c, role: e.target.value }))} placeholder="e.g. Developer · Dallas, TX" />
                                    </div>
                                </div>
                                {/* Rating */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '10px', display: 'block' }}>Rating</label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star key={star} size={22} fill={newComment.rating >= star ? '#FCD34D' : 'transparent'} color={newComment.rating >= star ? '#FCD34D' : 'var(--color-text-muted)'} style={{ cursor: 'pointer' }} onClick={() => setNewComment(c => ({ ...c, rating: star }))} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Your Review *</label>
                                    <textarea style={{ ...inp, minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }} value={newComment.text} onChange={e => setNewComment(c => ({ ...c, text: e.target.value }))} placeholder="Share your experience with Axiom OS…" required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', maxWidth: '200px' }}>
                                    <Send size={16} /> Post Review
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Cross-links */}
                    <div style={{ marginTop: '60px', paddingTop: '32px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <Link to="/privacy" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Privacy Policy →</Link>
                        <Link to="/terms" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Terms of Service →</Link>
                        <Link to="/refunds" style={{ color: 'var(--color-accent-cyan)', fontSize: '0.9rem' }}>Refund Policy →</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Contact;
