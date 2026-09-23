import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // For now, just show success
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
      <p className="text-white/50 mb-6">
        {sent
          ? 'Check your email for a reset link.'
          : 'Enter your email and we\'ll send you a reset link.'}
      </p>

      {sent ? (
        <div className="bg-green-500/20 text-green-400 p-4 rounded-xl mb-4 text-sm text-center">
          Reset link sent! Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F5C518]"
              placeholder="you@university.edu"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5C518] text-[#0D0F3C] font-semibold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50 transition-all"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      <p className="text-white/50 text-sm text-center mt-6">
        <Link to="/sign-in" className="text-[#F5C518] hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}