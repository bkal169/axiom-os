import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

const IS_DEV = import.meta.env.DEV;

export class DebugErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (IS_DEV) {
            console.error("Uncaught error:", error, errorInfo);
        }
        this.setState({ errorInfo });
        // TODO: send to Sentry / error_log table in production
    }

    public render() {
        if (this.state.hasError) {
            // Production: clean user-facing message, no stack trace
            if (!IS_DEV) {
                return (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', minHeight: '100vh',
                        backgroundColor: '#0A0A0A', color: '#ECECEC',
                        fontFamily: 'Inter, sans-serif', padding: 32, textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 32, marginBottom: 16 }}>⬡</div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
                            Something went wrong
                        </h1>
                        <p style={{ color: '#64748B', fontSize: 15, marginBottom: 32, maxWidth: 400 }}>
                            Axiom encountered an unexpected error. Our team has been notified.
                            If this persists, contact{' '}
                            <a href="mailto:support@buildaxiom.dev" style={{ color: '#D4A843' }}>
                                support@buildaxiom.dev
                            </a>
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 28px', borderRadius: 8,
                                background: '#D4A843', color: '#000',
                                border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            Reload Axiom
                        </button>
                    </div>
                );
            }

            // Development: full stack trace for debugging
            return (
                <div style={{ padding: 32, background: '#1a0000', color: '#fca5a5', minHeight: '100vh', fontFamily: 'monospace' }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
                        [DEV] Uncaught Error
                    </h1>
                    <pre style={{ background: '#0a0000', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 13, marginBottom: 16 }}>
                        {this.state.error?.toString()}
                    </pre>
                    <details open>
                        <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Component Stack</summary>
                        <pre style={{ background: '#0a0000', padding: 16, borderRadius: 8, overflowX: 'auto', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>
                    <button
                        style={{ marginTop: 16, padding: '10px 20px', background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                        onClick={() => window.location.reload()}
                    >
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
