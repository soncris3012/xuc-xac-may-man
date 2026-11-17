import React, { useState } from 'react';
import { Gift, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { DBService } from '../services/supabase';
import { sounds } from '../services/audio';

export default function GiftCodeModal({ isOpen, onClose, profile, onProfileUpdate, onRequireAuth }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    if (!profile?.id) {
      onClose();
      onRequireAuth?.();
      return;
    }

    setLoading(true);
    setFeedback(null);

    const result = await DBService.redeemCode(code, profile.id);
    setLoading(false);

    if (result?.success && result?.user) {
      sounds.playWin();
      setFeedback({ type: 'success', message: result.message });
      onProfileUpdate(result.user);
      setCode('');
    } else {
      sounds.playClick();
      setFeedback({ type: 'error', message: result?.message || 'Mã giftcode không hợp lệ!' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nhập Mã Giftcode</h3>
            <p className="text-xs text-slate-400">Xác thực trực tiếp trên Supabase & nhận $ miễn phí</p>
          </div>
        </div>

        {!profile?.id && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            Bạn cần đăng nhập tài khoản để nhận thưởng từ Giftcode!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">
              Mã Quà Tặng
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: XUCXACMAYMAN, TANTHU, FREEXU"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-center tracking-wider text-base focus:outline-none focus:border-amber-400 transition"
              autoFocus
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-xl text-xs text-slate-400">
            <span className="font-bold text-amber-300">Mã khả dụng: </span>
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">XUCXACMAYMAN</code>,{' '}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">TANTHU</code>,{' '}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">FREEXU</code>,{' '}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">VIPCASINO</code>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {!profile?.id ? 'Đăng Nhập Để Nhận' : loading ? 'Đang xác thực...' : 'Nhận Thưởng Ngay'}
          </button>
        </form>
      </div>
    </div>
  );
}
