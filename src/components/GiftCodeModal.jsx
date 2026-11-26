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
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2b0b0b] to-[#120807] border border-[#b8923a]/50 rounded-3xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-black/40 hover:bg-black/70 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#b8923a]/15 border border-[#b8923a]/40 rounded-2xl text-[#f5d061]">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nhập Mã Giftcode</h3>
            <p className="text-xs text-stone-400">Xác thực trực tiếp trên Supabase & nhận $ miễn phí</p>
          </div>
        </div>

        {!profile?.id && (
          <div className="mb-4 p-3 rounded-xl bg-[#b8923a]/15 border border-[#b8923a]/40 text-[#f5d061] text-xs font-semibold">
            Bạn cần đăng nhập tài khoản để nhận thưởng từ Giftcode!
          </div>
        )}

        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5 uppercase">
              Mã Quà Tặng
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VD: XUCXACMAYMAN, TANTHU, FREEXU"
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-center tracking-wider text-base focus:outline-none focus:border-[#f5d061] transition"
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

          <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-stone-400">
            <span className="font-bold text-[#f5d061]">Mã khả dụng: </span>
            <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-200">XUCXACMAYMAN</code>,{' '}
            <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-200">TANTHU</code>,{' '}
            <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-200">FREEXU</code>,{' '}
            <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-200">VIPCASINO</code>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="royal-gold-btn w-full py-3 rounded-xl font-black text-stone-950 border border-[#fce08b]/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {!profile?.id ? 'Đăng Nhập Để Nhận' : loading ? 'Đang xác thực...' : 'Nhận Thưởng Ngay'}
          </button>
        </form>
      </div>
    </div>
  );
}
