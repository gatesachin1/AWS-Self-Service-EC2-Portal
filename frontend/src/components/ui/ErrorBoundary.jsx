import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-surface dark:bg-aws-navy flex items-center justify-center p-6">
        <div className="aws-card max-w-md w-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.834-1.964-.834-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">Something went wrong</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            The portal hit an unexpected error. Reloading usually fixes it — if it keeps happening, check the browser console for details.
          </p>
          <pre className="mt-3 text-left text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-aws-navy-lt rounded-lg p-3 overflow-x-auto">
            {this.state.error.message}
          </pre>
          <button onClick={() => window.location.reload()} className="btn-primary mt-5 justify-center w-full">
            Reload Portal
          </button>
        </div>
      </div>
    )
  }
}
