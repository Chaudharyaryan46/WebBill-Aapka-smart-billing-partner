"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F6FA', padding: 20, textAlign: 'center' }}>
          <div style={{ background: '#fff', padding: 40, borderRadius: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', maxWidth: 500 }}>
            <span style={{ fontSize: 64 }}>⚠️</span>
            <h1 style={{ color: '#0D3370', fontSize: 24, fontWeight: 900, marginTop: 16 }}>Something went wrong.</h1>
            <p style={{ color: '#6B7280', fontSize: 14, fontWeight: 500, margin: '16px 0 24px' }}>
              The application encountered an unexpected error. Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '14px 28px', background: 'linear-gradient(135deg,#0059D6,#FF7A45)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Poppins,sans-serif', boxShadow: '0 6px 20px rgba(255,82,0,0.3)' }}
            >
              🔄 Refresh Application
            </button>
            <div style={{ marginTop: 24, padding: 12, background: '#FFF5F5', borderRadius: 8, color: '#FF3B3B', fontSize: 11, textAlign: 'left', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              {this.state.error?.message || "Unknown Error"}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
