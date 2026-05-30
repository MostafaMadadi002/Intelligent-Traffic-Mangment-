import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-10 font-mono flex flex-col justify-center items-center overflow-auto">
          <div className="max-w-4xl w-full bg-red-950/30 border border-red-500/50 p-8 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold text-red-500 mb-6 flex items-center gap-3">
              <span>⚠️</span> SYSTEM CRITICAL ERROR
            </h1>
            
            <div className="space-y-6">
              <div className="bg-black/50 p-4 rounded border border-red-500/20">
                <p className="text-red-400 font-bold mb-2 uppercase text-xs tracking-widest">Error Message</p>
                <p className="text-lg text-red-200">{this.state.error?.message || 'Unknown Error'}</p>
              </div>

              {this.state.errorInfo && (
                <div className="bg-black/50 p-4 rounded border border-white/10 overflow-auto max-h-96">
                  <p className="text-slate-500 font-bold mb-2 uppercase text-xs tracking-widest">Stack Trace</p>
                  <pre className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-900/20"
              >
                REBOOT SYSTEM
              </button>
            </div>
          </div>
          <p className="mt-8 text-slate-600 text-sm italic">Error captured by Global Monitor</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
