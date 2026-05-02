 import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', padding: 40, textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(196,100,91,0.12)', border: '1px solid rgba(196,100,91,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="#C4645B" strokeWidth="1.5"/>
              <path d="M10 6.5V11M10 13.5h.01" stroke="#C4645B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--c-tx-primary)', marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, color: 'var(--c-tx-muted)', marginBottom: 20, maxWidth: 340, lineHeight: 1.6 }}>
            {this.state.error?.message ?? 'An unexpected error occurred in this section.'}
          </p>
          <button
            className="btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
