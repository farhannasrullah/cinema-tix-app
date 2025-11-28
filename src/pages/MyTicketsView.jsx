import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ticket, Calendar, CheckCircle, QrCode, AlertTriangle } from 'lucide-react';

export default function MyTicketsView({ onTicketClick, user, appId, triggerLogin }) {
  const [tickets, setTickets] = useState([]);
  const [activeMovies, setActiveMovies] = useState({});
  const [tab, setTab] = useState('ready'); // ready, used, expired

  useEffect(() => {
    if (!user) return;
    
    // Fetch Movies first to map status
    const movieQ = collection(db, 'artifacts', appId, 'public', 'data', 'movies');
    const unsubMovies = onSnapshot(movieQ, (snapshot) => {
        const movieMap = {};
        snapshot.docs.forEach(doc => {
            movieMap[doc.id] = true;
        });
        setActiveMovies(movieMap);
    });

    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'bookings');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
      setTickets(data);
    });
    
    return () => {
        unsubscribe();
        unsubMovies();
    };
  }, [user, appId]);

  if (!user) return (<div className="flex flex-col items-center justify-center h-[60vh] p-8 text-center animate-fade-in"><Ticket size={64} className="text-neutral-700 mb-4"/><h2 className="text-xl font-bold mb-2">Login Diperlukan</h2><p className="text-neutral-400 mb-6">Silakan masuk ke akun Anda untuk melihat koleksi tiket.</p><button onClick={triggerLogin} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold">Login Sekarang</button></div>);

  // FILTER LOGIC
  const readyTickets = tickets.filter(t => activeMovies[t.movieId] && t.status === 'active');
  const usedTickets = tickets.filter(t => t.status === 'used');
  const expiredTickets = tickets.filter(t => !activeMovies[t.movieId] && t.status === 'active');

  const getFilteredTickets = () => {
    switch(tab) {
      case 'ready': return readyTickets;
      case 'used': return usedTickets;
      case 'expired': return expiredTickets;
      default: return [];
    }
  }

  const currentTickets = getFilteredTickets();

  return (
    <div className="p-4 md:p-8 animate-fade-in pb-24">
      <h2 className="text-2xl font-bold mb-4">Dompet Voucher</h2>
      
      {/* TABS */}
      <div className="flex p-1 bg-neutral-900 rounded-xl mb-6 border border-neutral-800">
        <button onClick={() => setTab('ready')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'ready' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-white'}`}>Ready ({readyTickets.length})</button>
        <button onClick={() => setTab('used')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'used' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-white'}`}>Terpakai ({usedTickets.length})</button>
        <button onClick={() => setTab('expired')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'expired' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-white'}`}>Hangus ({expiredTickets.length})</button>
      </div>

      {currentTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
          <div className="bg-neutral-800 p-6 rounded-full border border-neutral-700">
             <Ticket size={48} className="text-neutral-400"/>
          </div>
          <p className="text-center text-neutral-400 text-sm">Tidak ada tiket di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTickets.map(ticket => {
            const isHangus = tab === 'expired';
            return (
                <div 
                    key={ticket.id} 
                    onClick={() => !isHangus && onTicketClick(ticket)} 
                    className={`rounded-xl border flex overflow-hidden cursor-pointer transition-colors group shadow-lg relative ${isHangus ? 'bg-neutral-900 border-neutral-800 opacity-60 grayscale cursor-not-allowed' : 'bg-neutral-900 border-neutral-800 hover:border-red-600'}`}
                >
                    {isHangus && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                            <div className="bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full flex items-center gap-2 text-xs font-bold text-neutral-400">
                                <AlertTriangle size={14}/> Film Dihapus / Hangus
                            </div>
                        </div>
                    )}
                    <div className="w-24 bg-neutral-800 relative">
                        <img src={ticket.moviePoster} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Poster" />
                        {tab === 'used' && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><CheckCircle className="text-green-500" size={32}/></div>}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between relative">
                        <div className="absolute -left-2 top-1/2 w-4 h-4 bg-black rounded-full"></div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight mb-1">{ticket.movieTitle}</h3>
                            <p className="text-xs text-neutral-400 flex items-center gap-1"><Calendar size={12}/> {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className={`px-3 py-1 rounded border text-xs font-mono font-bold tracking-wider ${tab === 'used' ? 'bg-green-900/20 text-green-500 border-green-900' : 'bg-neutral-950 text-red-500 border-neutral-800'}`}>
                              {ticket.voucherCode}
                            </div>
                            {tab === 'ready' && <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black"><QrCode size={18}/></div>}
                        </div>
                    </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
}