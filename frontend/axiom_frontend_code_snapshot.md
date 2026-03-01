
# Axiom Frontend Code Snapshot

Generated for verification and debugging.

## 1. `src/main.tsx` (Entry Point & Router Fix)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App.tsx'
import { DebugErrorBoundary } from './components/DebugErrorBoundary'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

console.log('Mounting React Application...');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <DebugErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DebugErrorBoundary>
    </StrictMode>,
  );
  console.log('React Mount call successful');
} catch (e) {
  console.error("Failed to render app", e);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;"><h1>App Crashed</h1><pre>${e}</pre></div>`;
}
```

## 2. `src/lib/AuthProvider.tsx` (Timeout & Logic Fix)

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';
import { fetchUserProfile, type UserProfile } from './rbac';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, signOut: async () => { } });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthProvider: Initializing...");
        let mounted = true;

        // Safety timeout in case Supabase hangs
        const timeoutId = setTimeout(() => {
            if (mounted) {
                console.warn("AuthProvider: Supabase connection timed out, forcing loading=false");
                setLoading((prev) => {
                    if (prev) return false;
                    return prev;
                });
            }
        }, 5000);

        // Check active session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (!mounted) return;
            console.log("AuthProvider: getSession result", { session, error });
            setUser(session?.user ?? null);
            if (session?.user) {
                console.log("AuthProvider: Fetching profile for", session.user.id);
                fetchUserProfile(session.user.id).then((p) => {
                    if (mounted) {
                        console.log("AuthProvider: Profile fetched", p);
                        setProfile(p);
                    }
                }).catch(e => console.error("AuthProvider: Profile fetch failed", e));
            } else {
                console.log("AuthProvider: No session found");
            }
            clearTimeout(timeoutId);
            setLoading(false);
            console.log("AuthProvider: setLoading(false) called");
        }).catch(e => {
            console.error("AuthProvider: getSession failed", e);
            if (mounted) setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) return;
            console.log("AuthProvider: Auth state change", _event, session?.user?.id);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserProfile(session.user.id).then(p => { if (mounted) setProfile(p) });
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
```

## 3. `src/lib/supabase.ts` (Client Config)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase Config:", { 
  url: supabaseUrl ? "Found" : "Missing", 
  key: supabaseAnonKey ? "Found" : "Missing" 
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Authentication may fail.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
```

## 4. `vite.config.ts` (Port Config)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8008,
  },
})
```

## 5. `.env` (Credentials)

```env
VITE_SUPABASE_URL=https://ubdhpacoqmlxudcvhyuu.supabase.co
VITE_SUPABASE_ANON_KEY=[HIDDEN_FOR_SECURITY_BUT_PRESENT]
```

## 6. `index.html` (Shell)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Axiom CRM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
