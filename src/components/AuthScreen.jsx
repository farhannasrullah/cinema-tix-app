import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Film, Loader2, X } from 'lucide-react';

export default function AuthScreen({ onLogin, showToast, isModal = false }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLogin(); 
    } catch (err) {
      showToast(err.message.replace('Firebase:', '').trim(), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 relative overflow-hidden ${isModal ? 'bg-neutral-900 rounded-2xl border border-neutral-800' : 'min-h-screen bg-black'}`}>
      {!isModal && <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black opacity-50 z-0"></div>}
      
      <div className={`w-full max-w-md relative z-10 ${isModal ? '' : 'bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 p-8 rounded-2xl shadow-2xl animate-fade-in'}`}>
        <div className="flex justify-center mb-6">
           <div className="bg-red-600 p-3 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <Film size={40} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-2">Cinema<span className="text-red-600">Tix</span></h2>
        <p className="text-neutral-400 text-center mb-8">{isLogin ? 'Selamat datang kembali.' : 'Mulai perjalanan sinematikmu.'}</p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Email</label>
            <input type="email" required className="w-full bg-black/50 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Password</label>
            <input type="password" required className="w-full bg-black/50 border border-neutral-800 rounded-lg p-3 text-white focus:border-red-600 focus:outline-none transition-colors" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg shadow-red-900/30 disabled:opacity-50 flex justify-center">{loading ? <Loader2 className="animate-spin"/> : (isLogin ? 'Masuk' : 'Daftar')}</button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-neutral-400 text-sm hover:text-white transition-colors">{isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}</button>
        </div>
      </div>
    </div>
  );
}