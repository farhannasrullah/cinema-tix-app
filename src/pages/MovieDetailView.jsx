import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, where, getDocs, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getYoutubeId } from '../utils/helpers';
import PurchaseModal from '../components/PurchaseModal';
import { Star, X, Ticket, Play, Users, MessageSquare, CheckCircle, Bookmark } from 'lucide-react';

export default function MovieDetailView({ movie, onBack, user, userProfile, appId, setView, showToast, triggerLogin }) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [reviewTags, setReviewTags] = useState([]); 
  const [purchaseCount, setPurchaseCount] = useState(0); 
  const [myReviewCount, setMyReviewCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const availableTags = ["Alur Cerita Bagus", "Akting Memukau", "CGI Keren", "Musik Enak", "Mengecewakan", "Plot Twist"];
  const youtubeId = getYoutubeId(movie.trailerUrl);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'bookings');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.filter(doc => doc.data().movieId === movie.id).length;
      setPurchaseCount(count);
    });

    const bmQ = collection(db, 'artifacts', appId, 'users', user.uid, 'watchlist');
    const unsubBM = onSnapshot(bmQ, (snapshot) => {
      const bookmarked = snapshot.docs.some(doc => doc.data().movieId === movie.id);
      setIsBookmarked(bookmarked);
    });
    return () => { unsubscribe(); unsubBM(); }
  }, [user, appId, movie.id]);

  useEffect(() => {
    const reviewQ = collection(db, 'artifacts', appId, 'public', 'data', 'reviews');
    const unsubReviews = onSnapshot(reviewQ, (snapshot) => {
      const movieReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(r => r.movieId === movie.id);
      setReviews(movieReviews);
      
      if (user) {
        const myCount = movieReviews.filter(r => r.userId === user.uid).length;
        setMyReviewCount(myCount);
      }
    });
    return () => unsubReviews();
  }, [appId, movie.id, user]);

  const toggleTag = (tag) => {
    if (reviewTags.includes(tag)) setReviewTags(reviewTags.filter(t => t !== tag));
    else if (reviewTags.length < 3) setReviewTags([...reviewTags, tag]);
  };

  const toggleBookmark = async () => {
    if (!user) { triggerLogin(); return; }
    
    const col = collection(db, 'artifacts', appId, 'users', user.uid, 'watchlist');
    const q = query(col, where('movieId', '==', movie.id));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      snapshot.docs.forEach(d => deleteDoc(d.ref));
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'movies', movie.id), {
        favoriteCount: increment(-1)
      });
      showToast('Dihapus dari Watchlist');
    } else {
      await addDoc(col, { movieId: movie.id, movieTitle: movie.title, posterUrl: movie.posterUrl, timestamp: new Date().toISOString() });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'movies', movie.id), {
        favoriteCount: increment(1)
      });
      showToast('Ditambahkan ke Watchlist', 'success');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), {
        movieId: movie.id,
        movieTitle: movie.title,
        userId: user.uid,
        userName: userProfile?.displayName || 'Pengguna',
        userPhoto: userProfile?.photoURL || '',
        rating: userRating,
        comment: newReview,
        tags: reviewTags,
        timestamp: new Date().toISOString()
      });
      const currentReviews = [...reviews, { rating: userRating }];
      const totalRating = currentReviews.reduce((sum, item) => sum + Number(item.rating), 0);
      const newAverage = (totalRating / currentReviews.length).toFixed(1);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'movies', movie.id), { rating: newAverage });
      setNewReview(''); setReviewTags([]); showToast('Ulasan berhasil dikirim!', 'success');
    } catch (error) { console.error(error); showToast('Gagal mengirim ulasan.', 'error'); }
  }

  const canReview = user && purchaseCount > myReviewCount;

  return (
    <div className="bg-black min-h-screen pb-40 animate-slide-up relative">
      <div className="fixed bottom-[80px] left-0 right-0 p-4 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 z-[40] md:hidden flex items-center justify-between shadow-2xl">
         <div>
            <p className="text-xs text-neutral-400 font-medium">Harga Tiket</p>
            <p className="text-2xl font-black text-white leading-none">Rp {movie.price}</p>
         </div>
         <button 
            onClick={() => user ? setShowBuyModal(true) : triggerLogin()}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
         >
            <Ticket size={20} fill="currentColor" /> Beli
         </button>
      </div>

      {showTrailer && youtubeId && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
           <div className="w-full max-w-4xl relative">
              <button onClick={() => setShowTrailer(false)} className="absolute -top-10 right-0 text-white hover:text-red-500"><X size={32}/></button>
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
           </div>
        </div>
      )}

      {showBuyModal && (
        <PurchaseModal 
          movie={movie} 
          user={user} 
          appId={appId} 
          onClose={() => setShowBuyModal(false)}
          onSuccess={() => { setShowBuyModal(false); setView('tickets'); showToast('Pembelian Berhasil!', 'success'); }}
          showToast={showToast}
        />
      )}
      <div className="relative h-72 md:h-96 w-full group">
         <img src={movie.posterUrl} className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105" alt="Backdrop"/>
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
         <button onClick={onBack} className="absolute top-4 left-4 bg-black/30 hover:bg-black/70 p-2 rounded-full backdrop-blur text-white transition-colors z-20"><X size={24} /></button>
         <button onClick={toggleBookmark} className="absolute top-4 right-4 bg-black/30 hover:bg-black/70 p-2 rounded-full backdrop-blur text-white transition-colors z-20">
            <Bookmark size={24} fill={isBookmarked ? "white" : "none"} className={isBookmarked ? "text-white" : ""} />
         </button>
         
         {youtubeId && (
           <button 
             onClick={() => setShowTrailer(true)}
             className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 hover:bg-red-600 text-white p-4 rounded-full backdrop-blur-sm shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:scale-110 transition-all z-20 animate-pulse"
           >
             <Play size={32} fill="currentColor" className="ml-1"/>
           </button>
         )}
      </div>
      
      <div className="px-5 -mt-24 relative z-10">
        <div className="flex gap-4 md:gap-6">
          <img src={movie.posterUrl} className="w-28 h-40 md:w-48 md:h-72 object-cover rounded-xl shadow-2xl border-2 border-neutral-800/50" alt="Poster" />
          <div className="mt-24 md:mt-40 flex-1">
            <h1 className="text-2xl md:text-5xl font-black leading-tight tracking-tight mb-2">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
               <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wider">{movie.genre}</span>
               <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-900/20 px-2 py-0.5 rounded"><Star size={14} fill="currentColor" /> {movie.rating || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6 md:grid md:grid-cols-3 md:gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="prose prose-invert">
              <h3 className="text-lg font-bold mb-2">Sinopsis</h3>
              <p className="text-neutral-300 leading-relaxed text-sm md:text-base">{movie.description || "Tidak ada deskripsi tersedia untuk film ini."}</p>
            </div>

            {movie.cast && (
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Users size={18}/> Pemeran Utama</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.split(',').map((actor, idx) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 border border-neutral-700">
                         {actor.trim()[0]}
                       </div>
                       <span className="text-sm text-neutral-300">{actor.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-8 border-t border-neutral-800">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare size={18}/> Ulasan Komunitas ({reviews.length})</h3>
              
              {!user ? (
                <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 text-center mb-8">
                  <p className="text-neutral-400 mb-4">Anda harus login untuk menulis ulasan.</p>
                  <button onClick={triggerLogin} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold text-sm">Login Sekarang</button>
                </div>
              ) : canReview ? (
                <form onSubmit={handleSubmitReview} className="mb-8 bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden">
                           {userProfile?.photoURL ? <img src={userProfile.photoURL} alt="Me" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs font-bold">{user.email ? user.email[0] : 'U'}</div>}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{userProfile?.displayName}</p>
                          <p className="text-[10px] text-neutral-500">Posting publik</p>
                        </div>
                      </div>
                      <div className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-800">
                        Sisa kuota ulasan: {purchaseCount - myReviewCount}
                      </div>
                   </div>
                  <div className="flex gap-2 mb-4">
                    {[1,2,3,4,5].map(star => (<Star key={star} size={28} className={`cursor-pointer transition-transform hover:scale-110 ${star <= userRating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-700'}`} onClick={() => setUserRating(star)} />))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {availableTags.map(tag => (
                      <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`text-xs px-3 py-1 rounded-full border transition-colors ${reviewTags.includes(tag) ? 'bg-red-600 border-red-600 text-white' : 'border-neutral-700 text-neutral-500 hover:border-neutral-500'}`}>{tag}</button>
                    ))}
                  </div>
                  <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} className="w-full bg-black border border-neutral-700 rounded-lg p-3 text-sm focus:border-red-600 outline-none transition-colors" placeholder="Bagaimana filmnya? Ceritakan..." rows={3}></textarea>
                  <button className="mt-3 bg-white text-black hover:bg-neutral-200 text-sm px-6 py-2 rounded-lg font-bold transition-colors">Kirim Ulasan</button>
                </form>
              ) : (
                <div className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 text-sm text-neutral-500 text-center mb-8 flex flex-col items-center gap-2">
                  <Ticket className="opacity-50"/>
                  <p>
                    {purchaseCount === 0 
                      ? "Beli tiket film ini untuk mulai berdiskusi." 
                      : "Anda telah menggunakan seluruh kuota ulasan untuk tiket yang dibeli."}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {reviews.length > 0 ? reviews.map(rev => (
                  <div key={rev.id} className="bg-neutral-900/40 p-5 rounded-2xl border border-neutral-800/60 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-700 shadow-sm">
                           {rev.userPhoto ? <img src={rev.userPhoto} className="w-full h-full object-cover" alt="User"/> : <span className="text-xs font-bold text-neutral-400">{rev.userName[0]}</span>}
                         </div>
                         <div>
                           <p className="font-bold text-sm text-neutral-200">{rev.userName}</p>
                           <div className="flex text-yellow-500 text-xs items-center gap-1 mt-0.5"><Star size={10} fill="currentColor"/> {rev.rating}/5</div>
                         </div>
                      </div>
                      <span className="text-[10px] text-neutral-500">{new Date(rev.timestamp).toLocaleDateString()}</span>
                    </div>
                    
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {rev.tags.map((t, idx) => (<span key={idx} className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full border border-neutral-700">{t}</span>))}
                      </div>
                    )}
                    
                    <p className="text-neutral-300 text-sm leading-relaxed mb-1">{rev.comment}</p>
                  </div>
                )) : (<p className="text-neutral-600 text-sm text-center italic py-4">Belum ada ulasan.</p>)}
              </div>
            </div>
          </div>
          <div className="md:col-span-1 hidden md:block">
             <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800 sticky top-24">
                <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Harga Tiket</p>
                <div className="flex items-end gap-1 mb-6"><p className="text-3xl font-black text-white">Rp {movie.price}</p></div>
                <div className="space-y-3 mb-6">
                   <div className="flex items-center gap-3 text-sm text-neutral-400"><CheckCircle size={16} className="text-green-500" /> <span>Voucher Berlaku Selamanya</span></div>
                   <div className="flex items-center gap-3 text-sm text-neutral-400"><CheckCircle size={16} className="text-green-500" /> <span>Bisa Ditukar di Semua Cabang</span></div>
                </div>
                <button onClick={() => user ? setShowBuyModal(true) : triggerLogin()} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-red-900/30 hidden md:flex"><Ticket size={20} /> Beli Voucher Sekarang</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}