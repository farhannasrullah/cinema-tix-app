import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChevronRight, Star, MessageSquare, MessageCircle, Send } from 'lucide-react';

export default function CommunityView({ user, userProfile, appId, triggerLogin, showToast }) {
  const [reviews, setReviews] = useState([]);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'reviews');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setReviews(data);
    });
    return () => unsubscribe();
  }, [appId]);

  const handleReplySubmit = async (reviewId) => {
    if (!user) { triggerLogin(); return; }
    if (!replyContent.trim()) return;

    try {
      const reviewRef = doc(db, 'artifacts', appId, 'public', 'data', 'reviews', reviewId);
      await updateDoc(reviewRef, {
        replies: arrayUnion({
          userId: user.uid,
          userName: userProfile?.displayName || 'Pengguna',
          userPhoto: userProfile?.photoURL || '',
          text: replyContent,
          timestamp: new Date().toISOString()
        })
      });
      setReplyContent('');
      setActiveReplyId(null);
      showToast('Balasan terkirim', 'success');
    } catch (e) {
      console.error(e);
      showToast('Gagal membalas', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold">Forum Diskusi</h2><div className="bg-neutral-800 px-3 py-1 rounded-full text-xs text-neutral-400">{reviews.length} Postingan</div></div>
      {!user && (<div onClick={triggerLogin} className="mb-6 bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-blue-900/30 transition-colors"><div className="text-sm text-blue-200">Login untuk bergabung dalam diskusi</div><ChevronRight size={16} className="text-blue-400"/></div>)}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map(rev => (
          <div key={rev.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl hover:border-neutral-700 transition-colors flex flex-col h-full shadow-md">
             {/* Review Header */}
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-neutral-700 shadow-inner">
                    {rev.userPhoto ? <img src={rev.userPhoto} className="w-full h-full object-cover" alt="User"/> : <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600">{rev.userName[0]}</div>}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-white leading-tight">{rev.userName}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">menonton <span className="text-red-400 font-bold">{rev.movieTitle}</span></p>
                 </div>
               </div>
               <div className="bg-neutral-800/80 backdrop-blur px-2 py-1 rounded-lg text-xs flex items-center gap-1 text-yellow-500 font-bold border border-neutral-700/50">
                  <Star size={12} fill="currentColor"/> {rev.rating}
               </div>
             </div>
             
             {/* Tags */}
             <div className="flex flex-wrap gap-1.5 mb-4">
                {rev.tags && rev.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-neutral-900/50 text-neutral-400 px-2.5 py-1 rounded-md border border-neutral-800/80">{tag}</span>
                ))}
             </div>

             {/* Content */}
             <div className="bg-neutral-950/30 p-4 rounded-xl border border-neutral-800/30 mb-4 flex-grow">
                <p className="text-neutral-300 text-sm leading-relaxed">{rev.comment}</p>
             </div>
             
             {/* REPLIES SECTION */}
             <div className="mt-auto space-y-3">
                {/* Existing Replies */}
                {rev.replies && rev.replies.length > 0 && (
                  <div className="bg-neutral-950 rounded-xl p-3 space-y-3 border border-neutral-800/60">
                    {rev.replies.map((reply, idx) => (
                      <div key={idx} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-neutral-800 overflow-hidden flex-shrink-0 mt-0.5 border border-neutral-700/50">
                             {reply.userPhoto ? <img src={reply.userPhoto} className="w-full h-full object-cover" alt="User"/> : <div className="flex items-center justify-center h-full w-full text-[10px] text-neutral-500 font-bold">{reply.userName[0]}</div>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                               <span className="text-xs font-bold text-neutral-300">{reply.userName}</span>
                               <span className="text-[9px] text-neutral-600">{new Date(reply.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-neutral-400 leading-snug">{reply.text}</p>
                          </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="flex items-center justify-between border-t border-neutral-800 pt-3">
                   <span className="text-[10px] text-neutral-600 font-medium">{new Date(rev.timestamp).toLocaleDateString()}</span>
                   <button 
                      onClick={() => {
                         if (!user) { triggerLogin(); return; }
                         setActiveReplyId(activeReplyId === rev.id ? null : rev.id);
                      }}
                      className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
                   >
                      <MessageCircle size={14}/> {activeReplyId === rev.id ? 'Batal' : 'Balas'}
                   </button>
                </div>

                {activeReplyId === rev.id && (
                  <div className="flex gap-2 animate-fade-in pt-1">
                    <input 
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Tulis balasan..." 
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:border-red-600 outline-none transition-colors"
                      autoFocus
                    />
                    <button onClick={() => handleReplySubmit(rev.id)} className="bg-red-600 p-2 rounded-lg text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"><Send size={14}/></button>
                  </div>
                )}
             </div>
          </div>
        ))}
        {reviews.length === 0 && (<div className="col-span-full text-center py-20 opacity-50"><MessageSquare size={48} className="mx-auto mb-2"/><p>Belum ada diskusi yang dimulai.</p></div>)}
      </div>
    </div>
  )
}