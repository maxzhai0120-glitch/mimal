import { useState } from 'react';

export default function ChatBox({ messages, onSend, loading }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  }

  return (
    <div className="bg-dota-card rounded-lg border border-gray-800 flex flex-col h-96">
      <div className="p-3 border-b border-gray-800">
        <h4 className="text-dota-gold font-semibold">AI 教练对话</h4>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">对这局还有疑问？继续问 AI 教练...</div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-dota-gold text-dota-dark'
                : 'bg-gray-800 text-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 rounded-lg px-3 py-2 text-sm">正在思考...</div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-dota-gold"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-dota-gold text-dota-dark font-bold rounded-lg text-sm hover:bg-yellow-400 disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
