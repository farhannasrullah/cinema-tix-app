import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Menu, Trash2 } from 'lucide-react';

export default function AdminView({ appId, showToast }) {
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ title: '', price: '', posterUrl: '', genre: '', description: '', trailerUrl: '', cast: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'movies');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMovies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [appId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const col = collection(db, 'artifacts', appId, 'public', 'data', 'movies');
    try {
      if (editingId) {
        await updateDoc(doc(col, editingId), form);
        showToast('Film berhasil diupdate', 'success');
      } else {
        await addDoc(col, { ...form, rating: '0.0', purchaseCount: 0, favoriteCount: 0 });
        showToast('Film berhasil ditambahkan', 'success');
      }
      setForm({ title: '', price: '', posterUrl: '', genre: '', description: '', trailerUrl: '', cast: '' });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus film ini secara permanen?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'movies', id));
      showToast('Film dihapus', 'success');
    }
  };

  const handleEdit = (movie) => {
    setForm(movie);
    setEditingId(movie.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in pb-24">
       <div className="flex items-center gap-2 mb-6"><div className="bg-red-600 p-2 rounded-lg"><Plus size={20} className="text-white"/></div><h2 className="text-2xl font-bold">Kelola Database Film</h2></div>
       <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 mb-8 space-y-4 shadow-xl">
         <h3 className="font-bold text-lg mb-2 border-b border-neutral-800 pb-2">{editingId ? 'Edit Data Film' : 'Input Film Baru'}</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs text-neutral-500 uppercase font-bold">Judul Film</label><input required className="w-full bg-black border border-neutral-700 p-3 rounded-lg focus:border-red-600 outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div><div className="space-y-1"><label className="text-xs text-neutral-500 uppercase font-bold">URL Poster (Image Link)</label><input required className="w-full bg-black border border-neutral-700 p-3 rounded-lg focus:border-red-600 outline-none" value={form.posterUrl} onChange={e => setForm({...form, posterUrl: e.target.value})} /></div></div>
         <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-xs text-neutral-500 uppercase font-bold">Harga (Ribu Rupiah)</label><input placeholder="Ex: 50" type="number" required className="w-full bg-black border border-neutral-700 p-3 rounded-lg focus:border-red-600 outline-none" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div><div className="space-y-1"><label className="text-xs text-neutral-500 uppercase font-bold">Genre</label><input placeholder="Action, Horror..." required className="w-full bg-black border border-neutral-700 p-3 rounded-lg focus:border-red-600 outline-none" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} /></div></div>
         <div className="space-y-1"><label className="text-xs text-neutral-500 uppercase font-bold">Link Trailer (YouTube)</label><input placeholder="https://youtube.com/watch?v=..." className="w-full bg-black border border-neutral-700 p-3 rounded-lg focus:border-red-600 outline-none" value={form.trailerUrl} onChange={e => setForm({...form, trailerUrl: e.target.value})} /></div>
         <div className="space-y-1"><label className="text-xs text-neutral-500 uppercase font-bold">Daftar Pemeran (Pisahkan dengan koma)</label><input placeholder="Actor 1, Actor 2..." className="w-full bg-black border border-neutral-700 p-3 rounded-lg focus:border-red-600 outline-none" value={form.cast} onChange={e => setForm({...form, cast: e.target.value})} /></div>
         <div className="space-y-1"><label className="text-xs text-neutral-500 uppercase font-bold">Sinopsis</label><textarea className="w-full bg-black border border-neutral-700 p-3 rounded-lg focus:border-red-600 outline-none" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea></div>
         <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-white text-black hover:bg-neutral-200 p-3 rounded-lg font-bold transition-colors">{editingId ? 'Simpan Perubahan' : 'Upload Film'}</button>{editingId && <button type="button" onClick={() => {setEditingId(null); setForm({ title: '', price: '', posterUrl: '', genre: '', description: '', trailerUrl: '', cast: '' });}} className="bg-neutral-800 text-white px-6 rounded-lg font-bold hover:bg-neutral-700">Batal</button>}</div>
       </form>
       <div className="space-y-3">
         {movies.map(m => (
           <div key={m.id} className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-4 rounded-xl hover:border-neutral-600 transition-colors">
              <div className="flex items-center gap-4 overflow-hidden"><img src={m.posterUrl} className="w-12 h-16 object-cover rounded-md bg-neutral-800 shadow-sm" alt="t" onError={(e)=>e.target.style.display='none'}/><div><p className="font-bold truncate text-lg">{m.title}</p><p className="text-xs text-neutral-400">{m.genre} • IDR {m.price}k • Rating: {m.rating || 0}</p></div></div>
              <div className="flex gap-2"><button onClick={() => handleEdit(m)} className="p-2 bg-blue-900/20 text-blue-500 rounded-lg hover:bg-blue-900/40 transition-colors"><Menu size={18}/></button><button onClick={() => handleDelete(m.id)} className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-900/40 transition-colors"><Trash2 size={18}/></button></div>
           </div>
         ))}
       </div>
    </div>
  )
}