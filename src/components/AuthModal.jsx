import React, { useState } from 'react';
import {
  User,
  Lock,
  LogIn,
  UserPlus,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BadgeDollarSign,
} from 'lucide-react';
import { DBService } from '../services/supabase';
import { sounds } from '../services/audio';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const switchMode = (nextMode) => {
    sounds.playClick();
    setMode(nextMode);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanUser = username.trim();
    if (cleanUser.length < 3 || cleanUser.length > 20) {
      setError('Tên tài khoản phải từ 3 đến 20 ký tự!');
      return;
    }
    if (/\s/.test(cleanUser)) {
      setError('Tên tài khoản không được chứa khoảng trắng!');
      return;
    }
    if (password.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự!');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    const res =
      mode === 'register'
        ? await DBService.register(cleanUser, password)
        : await DBService.login(cleanUser, password);
    setLoading(false);

    if (!res?.success) {
      sounds.playClick();
      setError(res?.message || 'Thao tác thất bại, vui lòng thử lại!');
      return;
    }

    sounds.playWin();
    setSuccessMsg(res.message);
    onAuthSuccess(res.user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2b0b0b] via-[#170908] to-[#0e0706] border border-[#b8923a]/60 rounded-3xl overflow-hidden shadow-2xl shadow-black">
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 z-10 p-2 text-stone-300 hover:text-white rounded-full bg-black/50 hover:bg-black/80 border border-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="bg-gradient-to-r from-[#3f1111] via-[#280b0b] to-[#1a0808] px-6 py-5 border-b border-[#b8923a]/30 text-center">
          <div className="w-14 h-14 mx-auto mb-2.5 rounded-2xl bg-gradient-to-tr from-[#b58420] via-[#e5be53] to-[#fce08b] p-0.5 shadow-xl shadow-amber-900/40">
            <div className="w-full h-full bg-[#120807] rounded-[14px] flex items-center justify-center text-3xl">
              🎲
            </div>
          </div>
          <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fce08b] via-[#f5d061] to-[#c89428] flex items-center justify-center gap-1.5">
            <span>ROYAL CASINO CLUB</span>
            <Sparkles className="w-4 h-4 text-[#f5d061]" />
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Đăng nhập để lưu số dư, tham gia bảng xếp hạng và cược thời gian thực
          </p>
        </div>

        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                mode === 'login'
                  ? 'royal-gold-btn text-stone-950'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition ${
                mode === 'register'
                  ? 'royal-gold-btn text-stone-950'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký Mới</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div className="p-3 rounded-2xl bg-[#b8923a]/10 border border-[#b8923a]/30 flex items-center gap-2.5 text-xs text-stone-200 font-semibold">
              <BadgeDollarSign className="w-5 h-5 text-[#f5d061] flex-shrink-0" />
              <span>
                Tài khoản đăng ký mới được tặng ngay <b className="text-[#f5d061]">$100,000</b> vốn khởi nghiệp!
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#f5d061] uppercase mb-1.5">
              Tên Tài Khoản
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên (3-20 ký tự, không dấu cách)"
                maxLength={20}
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#f5d061] text-white text-sm font-semibold focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#f5d061] uppercase mb-1.5">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (tối thiểu 4 ký tự)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#f5d061] text-white text-sm font-semibold focus:outline-none transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#f5d061] uppercase mb-1.5">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/60 border border-white/15 focus:border-[#f5d061] text-white text-sm font-semibold focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="royal-gold-btn w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase text-stone-950 border border-[#fce08b]/50 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-98"
          >
            {loading
              ? 'Đang kết nối Supabase...'
              : mode === 'register'
              ? 'Đăng Ký & Nhận $100,000'
              : 'Đăng Nhập Vào Bàn'}
          </button>
        </form>
      </div>
    </div>
  );
}
