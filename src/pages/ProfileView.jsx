import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, ChevronRight, Edit, Bookmark, Menu, LogOut } from 'lucide-react';

export default function ProfileView({ user, userProfile, setUserProfile, isAdmin, setIsAdmin, showToast, triggerLogin, appId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', photoURL: '', bio: '' });
  const [watchlist, setWatchlist] = useState([]);
  
  useEffect(() => { if (userProfile) setFormData({ displayName: userProfile.displayName || '', photoURL: userProfile.photoURL || '', bio: userProfile.bio || '' }); }, [userProfile]);
  
  useEffect(() => { if(!user) return; const q = collection(db, 'artifacts', appId, 'users', user.uid, 'watchlist'); const unsub = onSnapshot(q, (snapshot) => { setWatchlist(snapshot.docs.map(d => d.data())); }); return () => unsub(); }, [user, appId]);
  
  const handleLogout = () => { signOut(auth); showToast('Berhasil keluar', 'success'); }
  
  const handleSaveProfile = async (e) => {
    e.preventDefault(); if (!user) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      await setDoc(docRef, { ...formData, role: 'member' }, { merge: true });
      
      const reviewsRef = collection(db, 'artifacts', appId, 'public', 'data', 'reviews');
      const q = query(reviewsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const updates = querySnapshot.docs.map(d => 
        updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reviews', d.id), {
          userName: formData.displayName,
          userPhoto: formData.photoURL
        })
      );
      await Promise.all(updates);

      setUserProfile(prev => ({ ...prev, ...formData })); setIsEditing(false); showToast('Profil berhasil diperbarui!', 'success');
    } catch (error) { console.error(error); showToast('Gagal update profil', 'error'); }
  };
  const presetAvatars = ['https://api.dicebear.com/9.x/avataaars/svg?seed=Felix','https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka','https://api.dicebear.com/9.x/avataaars/svg?seed=Zack','https://api.dicebear.com/9.x/avataaars/svg?seed=Bella'];

  if (!user) return (<div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center animate-fade-in"><User size={64} className="text-neutral-700 mb-4"/><h2 className="text-xl font-bold mb-2">Profil Pengguna</h2><p className="text-neutral-400 mb-6">Masuk untuk mengelola profil, tiket, dan pengaturan aplikasi.</p><button onClick={triggerLogin} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-red-900/20">Login / Daftar</button></div>);

  if (isEditing) {
    return (
      <div className="p-6 md:p-8 animate-fade-in max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-6"><button onClick={() => setIsEditing(false)} className="p-2 bg-neutral-800 rounded-full"><ChevronRight size={20} className="rotate-180"/></button><h2 className="text-xl font-bold">Edit Profil</h2></div>
        <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-neutral-800 overflow-hidden border-2 border-red-600 relative">
                  {formData.photoURL ? <img src={formData.photoURL} className="w-full h-full object-cover" alt="User"/> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{formData.displayName ? formData.displayName[0] : 'U'}</div>}
              </div>
              <div className="flex gap-2">{presetAvatars.map((url, i) => (<img key={i} src={url} className="w-10 h-10 rounded-full border border-neutral-700 cursor-pointer hover:border-red-600" onClick={() => setFormData({...formData, photoURL: url})} alt="Avatar"/>))}</div>
              <input type="text" placeholder="Atau paste URL gambar..." className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-xs" value={formData.photoURL} onChange={e => setFormData({...formData, photoURL: e.target.value})}/>
            </div>
            <div className="space-y-1"><label className="text-xs text-neutral-500 font-bold uppercase">Nama Tampilan</label><input required className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded-lg focus:border-red-600 outline-none transition-colors" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})}/></div>
            <div className="space-y-1"><label className="text-xs text-neutral-500 font-bold uppercase">Bio Singkat</label><textarea className="w-full bg-neutral-900 border border-neutral-800 p-3 rounded-lg focus:border-red-600 outline-none transition-colors" rows="3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}/></div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg">Simpan Profil</button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-8 text-center">Akun Saya</h2>
      <div className="bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 rounded-3xl p-8 text-center mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="absolute top-4 right-4 z-20"><button onClick={() => setIsEditing(true)} className="p-2 bg-black/30 backdrop-blur rounded-full hover:bg-white/10 transition-colors"><Edit size={16} className="text-white"/></button></div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-neutral-950 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden">
             {userProfile?.photoURL ? (
                 <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover"/>
             ) : (
                 <span className="text-3xl font-bold">{user.email ? user.email[0].toUpperCase() : 'U'}</span>
             )}
          </div>
          <h3 className="text-2xl font-bold text-white">{userProfile?.displayName || 'Pengguna'}</h3>
          <p className="text-neutral-400 text-sm mb-4">{user.email || 'Mode Tamu'}</p>
          <p className="text-neutral-500 text-xs italic mb-4">"{userProfile?.bio || '...'}"</p>
          <div className="inline-block bg-yellow-600/20 text-yellow-500 border border-yellow-600/30 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Gold Member</div>
        </div>
      </div>
      <div className="mb-6"><h3 className="font-bold text-sm text-neutral-400 mb-3 flex items-center gap-2"><Bookmark size={16}/> Daftar Tonton ({watchlist.length})</h3>{watchlist.length > 0 ? (<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">{watchlist.map((m, i) => (<div key={i} className="flex-shrink-0 w-24"><img src={m.posterUrl} className="w-full h-32 object-cover rounded-lg mb-1 opacity-80 hover:opacity-100 transition-opacity" alt="poster"/><p className="text-[10px] truncate text-neutral-400">{m.movieTitle}</p></div>))}</div>) : (<div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center text-xs text-neutral-500">Belum ada film yang disimpan.</div>)}</div>
      <div className="space-y-3">
        <button onClick={() => { setIsAdmin(!isAdmin); showToast(isAdmin ? 'Mode Admin Nonaktif' : 'Mode Admin Aktif', isAdmin ? 'error' : 'success'); }} className={`w-full border p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${isAdmin ? 'bg-red-900/10 border-red-600/50 text-red-500' : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800'}`}><div className="flex items-center gap-3"><div className={`p-2 rounded transition-colors ${isAdmin ? 'bg-red-900/20' : 'bg-neutral-800'}`}><Menu size={18}/></div><span className="font-medium text-sm">Dashboard Admin</span></div><div className={`w-10 h-5 rounded-full relative transition-colors ${isAdmin ? 'bg-red-600' : 'bg-neutral-700'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isAdmin ? 'left-6' : 'left-1'}`}></div></div></button>
        <button onClick={handleLogout} className="w-full bg-white text-black hover:bg-gray-200 p-4 rounded-xl flex items-center justify-center gap-2 font-bold mt-8 transition-colors shadow-lg"><LogOut size={18} /> Keluar Aplikasi</button>
      </div>
      <p className="text-center text-[10px] text-neutral-600 mt-12">Cinema Tix App v2.1.0<br/>Build with React & Firebase</p>
    </div>
  );
}