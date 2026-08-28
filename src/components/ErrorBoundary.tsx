import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Zap } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Hop Uncaught Error:', error, errorInfo);
  }

  public handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-[#f5f5f7] flex items-center justify-center p-4 font-sans">
          <div className="w-full max-w-md rounded-3xl apple-card border border-white/15 p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center mx-auto text-white shadow-lg">
              <Zap className="w-7 h-7 fill-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white font-sans">Hop Studio</h2>
              <p className="text-xs text-zinc-400">
                An unexpected state occurred. Click below to refresh your connection.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.08] text-[11px] font-mono text-rose-300 text-left overflow-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Hop</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
