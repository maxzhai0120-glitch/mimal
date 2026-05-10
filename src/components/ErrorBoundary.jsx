import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="bg-dota-card rounded-xl p-8 border border-red-800 max-w-lg w-full">
            <h2 className="text-xl font-bold text-red-400 mb-4">页面渲染出错</h2>
            <p className="text-gray-300 text-sm mb-4">
              请刷新页面或返回首页重试。如果问题持续，请检查该对局数据是否完整。
            </p>
            <pre className="bg-gray-900 rounded p-3 text-xs text-gray-400 overflow-auto max-h-48">
              {this.state.error?.toString?.() || '未知错误'}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-dota-gold text-dota-dark font-bold rounded-lg text-sm hover:bg-yellow-400"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
