import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary] Caught:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0b1121] flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
                            <AlertTriangle className="text-red-400" size={40} />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
                                Đã xảy ra lỗi
                            </h1>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang để tiếp tục.
                            </p>
                        </div>
                        {this.state.error && (
                            <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-left">
                                <p className="text-[10px] text-red-400/60 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-[#aa771c] text-black rounded-xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl"
                        >
                            <RefreshCw size={16} /> Tải lại trang
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
