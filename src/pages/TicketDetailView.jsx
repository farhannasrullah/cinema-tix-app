import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, CheckCircle, QrCode, Loader2, Check } from 'lucide-react';

export default function TicketDetailView({ ticket, onBack, user, appId, showToast }) {
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!window.confirm('Gunakan tiket ini sekarang? Tindakan ini tidak dapat dibatalkan.')) return;
    setRedeeming(true);
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'bookings', ticket.id), {
        status: 'used',
        usedAt: new Date().toISOString()
      });
      showToast('Tiket berhasil digunakan!', 'success');
      onBack(); // Go back to list
    } catch (e) {
      console.error(e);
      showToast('Gagal menggunakan tiket', 'error');
      setRedeeming(false);
    }
  };

  const isUsed = ticket.status === 'used';

  return (
    <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center animate-slide-up relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 to-neutral-950 z-0"></div>
      <div className="w-full max-w-sm z-10 pb-20">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"><X size={20} /> Kembali</button>
        
        <div className={`bg-white text-black w-full rounded-3xl overflow-hidden shadow-2xl relative ${isUsed ? 'opacity-75 grayscale' : ''}`}>
          <div className={`${isUsed ? 'bg-gray-600' : 'bg-red-600'} p-4 flex justify-center`}>
             <h2 className="text-white font-bold tracking-widest text-sm uppercase">{isUsed ? 'TIKET SUDAH DIGUNAKAN' : 'E-VOUCHER'}</h2>
          </div>
          <div className="p-8 pb-10 text-center relative">
             <div className="w-24 h-36 mx-auto mb-4 rounded-lg shadow-xl overflow-hidden"><img src={ticket.moviePoster} className="w-full h-full object-cover" alt="poster"/></div>
             <h2 className="text-2xl font-black uppercase mb-1 tracking-tight leading-none">{ticket.movieTitle}</h2>
             <p className="text-gray-500 text-xs">Berlaku untuk 1 Orang</p>
             
             <div className="my-8 border-b-2 border-dashed border-gray-300 relative">
               <div className="absolute -left-12 -top-3 w-8 h-8 bg-neutral-950 rounded-full"></div>
               <div className="absolute -right-12 -top-3 w-8 h-8 bg-neutral-950 rounded-full"></div>
             </div>

             <div className="flex justify-center mb-2">
               <div className="bg-white p-2 border-2 border-black rounded-xl relative">
                 <QrCode size={140} className="text-black" />
                 {isUsed && (
                   <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                     <CheckCircle size={64} className="text-green-600"/>
                   </div>
                 )}
               </div>
             </div>
             <p className="font-mono text-xl font-bold tracking-widest text-gray-800">{ticket.voucherCode}</p>
          </div>
          <div className="bg-gray-100 p-4 text-center"><p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Cinema Tix Official</p></div>
        </div>

        {!isUsed && (
          <div className="mt-8">
            <button 
              onClick={handleRedeem}
              disabled={redeeming}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {redeeming ? <Loader2 className="animate-spin"/> : <><Check size={20}/> Gunakan Sekarang</>}
            </button>
            <p className="text-center text-neutral-500 text-xs mt-3">Tekan tombol di atas hanya jika Anda sudah berada di depan petugas bioskop.</p>
          </div>
        )}
      </div>
    </div>
  );
}