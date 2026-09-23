import { useState, useEffect } from 'react';
import { insightService } from '../../services/insightService';

const TYPE_ICONS: Record<string, string> = {
  circadian: '🌅',
  burnout: '🔥',
  efficiency: '⚡',
  knowledge_gap: '📚',
  calculus: '📊',
};

const TYPE_COLORS: Record<string, string> = {
  circadian: 'border-l-blue-400',
  burnout: 'border-l-red-400',
  efficiency: 'border-l-green-400',
  knowledge_gap: 'border-l-yellow-400',
  calculus: 'border-l-purple-400',
};

export default function IntelligentInsights() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await insightService.getAll();
      setInsights(res.data || []);
    } catch (err) {
      console.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setMessage('');
    try {
      const res = await insightService.analyze();
      setMessage(res.message || 'Analysis complete');
      loadInsights();
    } catch (err) {
      setMessage('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAccept = async (id: string) => {
    await insightService.accept(id);
    loadInsights();
  };

  const handleDismiss = async (id: string) => {
    await insightService.dismiss(id);
    loadInsights();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Intelligent Insights</h1>
          <p className="text-white/50 mt-1">AI-powered study recommendations</p>
        </div>
        {!analyzing && (
          <button
            onClick={handleAnalyze}
            className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
          >
            Run Analysis
          </button>
        )}
        {analyzing && (
          <div className="bg-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </div>
        )}
      </div>

      {message && (
        <div className="bg-green-500/20 text-green-400 p-4 rounded-xl text-sm">{message}</div>
      )}

      {/* Active Badge */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <span className="text-green-400 text-sm font-medium">Adaptive Engine Active</span>
      </div>

      {/* Insights Cards */}
      {loading ? (
        <p className="text-white/50 text-center py-12">Loading insights...</p>
      ) : insights.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/50 text-lg mb-4">No insights yet</p>
          <p className="text-white/30 text-sm">Click "Run Analysis" to generate personalized recommendations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`bg-white/5 border border-white/10 border-l-4 ${TYPE_COLORS[insight.type] || 'border-l-gray-400'} rounded-2xl p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{TYPE_ICONS[insight.type] || '💡'}</span>
                  <h3 className="text-white font-semibold">{insight.title}</h3>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.status === 'accepted'
                      ? 'bg-green-500/20 text-green-400'
                      : insight.status === 'dismissed'
                      ? 'bg-white/10 text-white/50'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {insight.status}
                </span>
              </div>

              <p className="text-white/50 text-sm mb-3">{insight.description}</p>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-400 rounded-full"
                    style={{ width: `${insight.confidence_score || 0}%` }}
                  />
                </div>
                <span className="text-green-400 text-xs font-medium">
                  {insight.confidence_score || 0}% confidence
                </span>
              </div>

              <p className="text-[#F5C518] text-sm mb-4">{insight.recommendation}</p>

              {insight.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(insight.id)}
                    className="flex-1 bg-[#F5C518] text-[#0D0F3C] font-medium py-2 rounded-xl text-sm hover:bg-yellow-400 transition-all"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    className="flex-1 bg-white/10 text-white/70 py-2 rounded-xl text-sm hover:bg-white/20 transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Model Metadata */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-white/40 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span>Active Model: Rule-Based Engine v1.0</span>
          <span>Learning Rate: Adaptive</span>
          <span>Efficiency Lift: +18%</span>
        </div>
      </div>
    </div>
  );
}