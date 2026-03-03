import React from 'react';
import { ArrowRight, Hexagon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(3, 4, 11, 0.7)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)', padding: '16px 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
          {/* Logo container showing monogram on mobile, full logo on desktop. Fallback to CSS text if images missing. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo-ax.png" alt="Axiom OS" style={{ height: '32px', width: 'auto', display: 'block' }}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
              <Hexagon size={24} color="var(--color-accent-purple)" />
              <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
                Axiom<span className="text-gradient">OS</span>
              </span>
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="https://app.buildaxiom.dev" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }}
            onMouseOver={(e) => e.target.style.color = 'white'}
            onMouseOut={(e) => e.target.style.color = 'var(--color-text-secondary)'}>
            Log In
          </a>
          <Link to="/trial" className="btn btn-primary">
            Start Free Trial <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
