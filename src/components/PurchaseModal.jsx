import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CheckCircle, QrCode, CreditCard, Wallet, ChevronRight, Loader2, X } from 'lucide-react';

export default function PurchaseModal({ movie, user, appId, onClose, onSuccess, showToast }) {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState('card'); // card, qris, wallet
  
  // Card State
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Wallet State
  const [walletPhone, setWalletPhone] = useState('');

  const totalPrice = Number(movie.price) + 2;

  const handleConfirm = async () => {
    // Basic Mock Validation
    if (method === 'card') {
      if (cardNum.length < 16 || expiry.length < 5 || cvv.length < 3) {
        showToast('Mohon lengkapi detail kartu', 'error');
        return;
      }
    } else if (method === 'wallet') {
      if (walletPhone.length < 10) {
        showToast('Nomor HP tidak valid', 'error');
        return;
      }
    }

    setProcessing(true);
    try {
      // Simulate Processing Delay
      await new Promise(r => setTimeout(r, 2000));
      
      const voucherCode = 'CT-' + Math.random().toString(36).substr(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'bookings'), {
        movieId: movie.id, movieTitle: movie.title, moviePoster: movie.posterUrl, purchaseDate: new Date().toISOString(), price: movie.price, voucherCode: voucherCode, status: 'active', paymentMethod: method
      });
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'movies', movie.id), {
        purchaseCount: increment(1)
      });
      onSuccess();
    } catch (e) { console.error(e); showToast('Transaksi Gagal', 'error'); setProcessing(false); }
  };

  const renderPaymentContent = () => {
    switch (method) {
      case 'card':
        return (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700">
              <input 
                placeholder="Nomor Kartu (16 digit)" 
                maxLength={16}
                value={cardNum} 
                onChange={(e) => setCardNum(e.target.value.replace(/\D/g,''))} 
                className="w-full bg-transparent outline-none text-white placeholder:text-neutral-500 mb-2 font-mono" 
              />
              <div className="flex gap-2 border-t border-neutral-700 pt-2">
                <input 
                  placeholder="MM/YY" 
                  maxLength={5}
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-1/2 bg-transparent outline-none text-white placeholder:text-neutral-500 font-mono" 
                />
                <input 
                  placeholder="CVV" 
                  maxLength={3}
                  value={cvv}
                  type="password"
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g,''))}
                  className="w-1/2 bg-transparent outline-none text-white placeholder:text-neutral-500 font-mono text-right" 
                />
              </div>
            </div>
            <p className="text-[10px] text-neutral-500 flex items-center gap-1"><CheckCircle size={10}/> Transaksi terenkripsi 128-bit SSL</p>
          </div>
        );
      case 'qris':
        return (
          <div className="flex flex-col items-center justify-center py-4 animate-fade-in bg-white rounded-lg p-4">
            <QrCode size={150} className="text-black"/>
            <p className="text-black text-xs font-bold mt-2">Scan QRIS untuk Bayar</p>
            <p className="text-gray-500 text-[10px]">Cinema Tix Merchant</p>
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-3 animate-fade-in">
             <div className="flex gap-2 mb-2">
               <button className="flex-1 bg-blue-600/20 border border-blue-600 text-blue-500 py-2 rounded text-xs font-bold">Gopay</button>
               <button className="flex-1 bg-purple-600/20 border border-purple-600 text-purple-500 py-2 rounded text-xs font-bold">OVO</button>
             </div>
             <div className="bg-neutral-800 p-3 rounded-lg border border-neutral-700 flex items-center gap-2">
               <span className="text-neutral-500 text-sm">+62</span>
               <input 
                  placeholder="812-3456-7890" 
                  type="tel"
                  value={walletPhone}
                  onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g,''))}
                  className="w-full bg-transparent outline-none text-white font-mono"
               />
             </div>
          </div>
        )
      default: return null;
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
       <div className="bg-neutral-900 w-full max-w-sm rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl animate-slide-up">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <h3 className="font-bold">{step === 1 ? 'Pilih Pembayaran' : 'Selesaikan Pembayaran'}</h3>
            <button onClick={onClose}><X size={20} className="text-neutral-500 hover:text-white"/></button>
          </div>
          
          <div className="p-6">
             {/* Order Summary Compact */}
             <div className="flex justify-between items-center mb-6 text-sm bg-neutral-950 p-3 rounded-lg border border-neutral-800">
               <div className="flex items-center gap-2">
                 <img src={movie.posterUrl} className="w-8 h-10 object-cover rounded bg-neutral-800" alt="Poster"/>
                 <div>
                   <p className="font-bold line-clamp-1">{movie.title}</p>
                   <p className="text-[10px] text-neutral-500">1x Tiket Nonton</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="font-bold text-red-500">Rp {totalPrice}</p>
               </div>
             </div>

             {step === 1 ? (
               <div className="space-y-2">
                 <button onClick={() => {setMethod('card'); setStep(2)}} className="w-full bg-neutral-800 hover:bg-neutral-700 p-4 rounded-xl flex items-center justify-between transition-colors border border-neutral-700">
                    <div className="flex items-center gap-3"><CreditCard className="text-blue-400"/> <span className="font-medium">Kartu Kredit / Debit</span></div>
                    <ChevronRight size={16} className="text-neutral-500"/>
                 </button>
                 <button onClick={() => {setMethod('qris'); setStep(2)}} className="w-full bg-neutral-800 hover:bg-neutral-700 p-4 rounded-xl flex items-center justify-between transition-colors border border-neutral-700">
                    <div className="flex items-center gap-3"><QrCode className="text-white"/> <span className="font-medium">QRIS</span></div>
                    <ChevronRight size={16} className="text-neutral-500"/>
                 </button>
                 <button onClick={() => {setMethod('wallet'); setStep(2)}} className="w-full bg-neutral-800 hover:bg-neutral-700 p-4 rounded-xl flex items-center justify-between transition-colors border border-neutral-700">
                    <div className="flex items-center gap-3"><Wallet className="text-green-400"/> <span className="font-medium">E-Wallet</span></div>
                    <ChevronRight size={16} className="text-neutral-500"/>
                 </button>
               </div>
             ) : (
               <div className="space-y-6">
                 {/* Payment Form */}
                 {renderPaymentContent()}

                 <div className="flex gap-3">
                   <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors" disabled={processing}>Kembali</button>
                   <button 
                    onClick={handleConfirm} 
                    disabled={processing} 
                    className="flex-1 bg-white text-black hover:bg-neutral-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                   >
                    {processing ? <Loader2 className="animate-spin" /> : `Bayar Rp ${totalPrice}`}
                   </button>
                 </div>
               </div>
             )}
          </div>
       </div>
    </div>
  )
}