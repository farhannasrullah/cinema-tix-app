import React, { useState, useEffect } from 'react';
import { 
  Home, Ticket, User, Search, Star, Clock, ChevronLeft, CreditCard, 
  QrCode, Tag, Heart, X, Flame, CheckCircle, Play, Sun, Moon, LogOut, 
  Menu, Wallet, Building2, History, AlertCircle, Calendar, Smartphone,
  Settings, Camera, Mail, Lock, Phone, Plus, Trash2, ShieldCheck, Bell,
  MessageSquare, Edit3, ThumbsUp, Send, Share2, Filter, Crown, TrendingUp,
  Minus, FileText, ShoppingBag, LayoutDashboard
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut
} from 'firebase/auth';
import { 
  getFirestore, collection, addDoc, getDocs, query, onSnapshot, orderBy, Timestamp, doc, updateDoc, deleteDoc, where, increment, setDoc, getDoc 
} from 'firebase/firestore';

/* --- FIREBASE CONFIGURATION (MILIK ANDA) --- */
const firebaseConfig = {
  apiKey: "AIzaSyCiVCVEa7HiXHHJSx8frpitqqspQBlvN4g",
  authDomain: "cinema-tix-app.firebaseapp.com",
  projectId: "cinema-tix-app",
  storageBucket: "cinema-tix-app.firebasestorage.app",
  messagingSenderId: "497740074012",
  appId: "1:497740074012:web:90aef7aeb527e01f1923d9",
  measurementId: "G-BNK7251WDJ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// App ID manual untuk struktur database Anda
const appId = 'cinema-tix-production';

/* --- UTILS --- */
const seedDataIfEmpty = async () => {
  try {
    const moviesRef = collection(db, 'artifacts', appId, 'public', 'data', 'movies');
    const snapshot = await getDocs(moviesRef);
    if (snapshot.empty) {
      const initialMovies = [
        { id: 'mv1', title: "Garuda Superhero", genre: "Action", rating: 4.5, price: 45000, image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80", desc: "Seorang pahlawan lokal bangkit untuk menyelamatkan kota dari ancaman asteroid raksasa.", duration: "1j 50m" },
        { id: 'mv2', title: "Midnight Horror", genre: "Horror", rating: 4.8, price: 50000, image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80", desc: "Teror mencekam di bioskop tua yang ternyata menyimpan misteri masa lalu.", duration: "1j 45m" },
        { id: 'mv3', title: "Love in Jogja", genre: "Romance", rating: 4.2, price: 40000, image: "https://images.unsplash.com/photo-1518834107812-cf49795bf327?auto=format&fit=crop&w=600&q=80", desc: "Kisah cinta dua mahasiswa yang bertemu di Malioboro saat hujan turun.", duration: "2j 10m" },
        { id: 'mv4', title: "Space Odyssey X", genre: "Sci-Fi", rating: 4.9, price: 60000, image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80", desc: "Perjalanan melintasi galaksi untuk mencari planet baru bagi umat manusia.", duration: "2j 30m" }
      ];
      initialMovies.forEach(async (movie) => await addDoc(moviesRef, movie));
      
      const vouchersRef = collection(db, 'artifacts', appId, 'public', 'data', 'vouchers');
      const voucherData = [
        { title: "Couple Package", price: 85000, desc: "2 Tiket + 1 Popcorn Large. Hemat 20%!", type: "bundle" },
        { title: "Student Deal", price: 35000, desc: "Berlaku hari Senin-Kamis dengan kartu pelajar.", type: "discount" }
      ];
      voucherData.forEach(async (v) => await addDoc(vouchersRef, v));
    }
  } catch (e) {
    console.error("Seeding error:", e);
  }
};

const getRankInfo = (ticketCount) => {
  if (ticketCount > 50) return { name: 'Cinephile God', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500', icon: Crown };
  if (ticketCount > 10) return { name: 'Movie Buff', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500', icon: Star };
  return { name: 'Newbie', color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500', icon: User };
};

/* --- COMPONENTS (Stateless/Pure) --- */

const SkeletonLoader = () => (
  <div className="p-4 space-y-4 animate-pulse w-full max-w-7xl mx-auto">
    <div className="h-48 md:h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl w-full"></div>
    <div className="flex space-x-3 overflow-hidden">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
    </div>
  </div>
);

const Toast = ({ message, type = "success", onClose }) => (
  <div className="fixed top-4 right-4 z-[100] animate-bounce-in">
    <div className={`
      ${type === 'error' ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}
      text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-3
    `}>
      <div className={`${type === 'error' ? 'bg-red-100 dark:bg-red-800' : 'bg-emerald-100 dark:bg-emerald-900/50'} p-1.5 rounded-full`}>
        {type === 'error' ? <AlertCircle size={18} className="text-red-600 dark:text-red-400" /> : <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />}
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X size={16} className="text-slate-400 hover:text-slate-600" /></button>
    </div>
  </div>
);

const MovieCard = ({ movie, onClick, isAdmin, onDelete, isFavorite, onToggleFavorite }) => (
  <div 
    onClick={() => onClick(movie)}
    className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-lg dark:hover:shadow-yellow-500/10 cursor-pointer transform transition-all duration-300 border border-slate-100 dark:border-slate-800"
  >
    <div className="relative h-64 md:h-80 w-full overflow-hidden">
      <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 dark:opacity-90"></div>
      
      <div className="absolute top-3 left-3 bg-white/30 dark:bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
        <div className="flex items-center space-x-1">
          <Star size={12} className="text-yellow-400 fill-yellow-400"/>
          <span className="text-xs font-bold text-white">{movie.rating}</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(movie); }}
          className={`p-2 rounded-full backdrop-blur-sm border transition-colors ${isFavorite ? 'bg-red-500/80 text-white border-red-500' : 'bg-black/30 text-white border-white/20 hover:bg-black/50'}`}
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>

        {isAdmin && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(movie.id); }}
            className="p-2 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>

    <div className="p-4">
      <span className="text-[10px] uppercase tracking-wider text-yellow-600 dark:text-yellow-500 font-bold mb-1 block">{movie.genre}</span>
      <h3 className="text-slate-800 dark:text-white font-bold text-lg leading-tight mb-2 truncate group-hover:text-yellow-600 dark:group-hover:text-yellow-500 transition-colors">{movie.title}</h3>
      <div className="flex justify-between items-center">
        <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">Rp {movie.price.toLocaleString()}</span>
        <div className="bg-yellow-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-md">
            <Play size={10} className="ml-0.5 fill-current" />
        </div>
      </div>
    </div>
  </div>
);

const ReviewCard = ({ review, onLike }) => {
  const RankIcon = review.userRank === 'Cinephile God' ? Crown : (review.userRank === 'Movie Buff' ? Star : User);
  const rankColor = review.userRank === 'Cinephile God' ? 'text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20' : (review.userRank === 'Movie Buff' ? 'text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20' : 'text-slate-500 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800');

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={review.userPhoto || `https://ui-avatars.com/api/?name=${review.userName}&background=random`} 
            alt={review.userName} 
            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.userName}</h4>
              <div className={`flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${rankColor}`}>
                <RankIcon size={10} className="mr-1" />
                {review.userRank || 'Newbie'}
              </div>
            </div>
            <p className="text-xs text-slate-500 flex items-center mt-0.5">
              {review.timestamp?.seconds ? new Date(review.timestamp.seconds * 1000).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
              <span className="mx-1.5 opacity-50">•</span>
              Menonton <span className="text-yellow-600 dark:text-yellow-500 font-bold ml-1">{review.movieTitle}</span>
            </p>
          </div>
        </div>
        <div className={`flex items-center px-2.5 py-1 rounded-xl border ${review.rating >= 4 ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : review.rating === 3 ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <Star size={12} className={`mr-1 ${review.rating >= 4 ? 'fill-emerald-500 text-emerald-500' : review.rating === 3 ? 'fill-yellow-500 text-yellow-500' : 'fill-red-500 text-red-500'}`}/>
          <span className={`text-xs font-bold ${review.rating >= 4 ? 'text-emerald-700 dark:text-emerald-400' : review.rating === 3 ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400'}`}>{review.rating}/5</span>
        </div>
      </div>
      <div className="pl-13 ml-1">
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{review.comment}</p>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-6">
        <button onClick={() => onLike(review.id)} className="flex items-center text-slate-400 hover:text-red-500 text-xs font-medium transition-colors group">
          <div className="p-1.5 rounded-full group-hover:bg-red-500/10 mr-1.5 transition-colors"><Heart size={16} className={`group-hover:fill-red-500 transition-colors ${review.likes > 0 ? 'fill-red-500 text-red-500' : ''}`}/></div>
          <span>{review.likes || 0} Suka</span>
        </button>
      </div>
    </div>
  );
};

/* --- MAIN APP --- */
export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); 
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  // Modals States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [itemToBuy, setItemToBuy] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [managePaymentOpen, setManagePaymentOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [adminAddMovieOpen, setAdminAddMovieOpen] = useState(false); 
  const [checkoutOpen, setCheckoutOpen] = useState(false); 
  const [invoiceData, setInvoiceData] = useState(null); 
  
  // Data States
  const [movies, setMovies] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]); 
  
  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [reviewFilter, setReviewFilter] = useState('Semua');
  const [notification, setNotification] = useState(null);

  const categories = ['All', 'Action', 'Horror', 'Romance', 'Sci-Fi', 'Adventure', 'Drama'];
  const reviewCategories = ['Semua', 'Positif', 'Netral', 'Negatif'];

  // Clear search on tab change
  useEffect(() => {
    setSearchQuery('');
    setReviewFilter('Semua');
  }, [activeTab]);

  // Auth & Data Init
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Perbaikan: Jangan gunakan __initial_auth_token karena config manual.
        // Langsung cek user state.
        if (!auth.currentUser) {
            try {
              await signInAnonymously(auth);
            } catch (e) {
              console.log("Anonymous login not enabled in console or failed:", e);
            }
        }
      } catch (error) { console.error("Auth Error:", error); }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      const isAdministrator = u?.email && u.email.includes('admin');
      setIsAdmin(isAdministrator);
      if (isAdministrator) setActiveTab('admin');
      if (u) { 
        seedDataIfEmpty(); 
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Public Data
  useEffect(() => {
    if (!user) return; 
    const unsubMovies = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'movies'), (s) => setMovies(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubVouchers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'vouchers'), (s) => setVouchers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubReviews = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setReviews(data);
    });
    return () => { unsubMovies(); unsubVouchers(); unsubReviews(); };
  }, [user]);

  // Fetch User Specific Data
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setMyTickets([]); setPaymentMethods([]); setFavorites([]); return;
    }
    const unsubTickets = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'bookings'), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.purchaseDate?.seconds || 0) - (a.purchaseDate?.seconds || 0));
      setMyTickets(data);
    });
    const unsubPayments = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods'), (s) => setPaymentMethods(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubFavorites = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'favorites'), (s) => setFavorites(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubTickets(); unsubPayments(); unsubFavorites(); };
  }, [user]);

  const showToast = (msg, type="success") => { setNotification({msg, type}); setTimeout(() => setNotification(null), 3000); };
  
  // ACTIONS
  const handleToggleFavorite = async (movie) => {
    if (!user || user.isAnonymous) { setAuthModalOpen(true); return; }
    const isFav = favorites.some(f => f.movieId === movie.id);
    try {
      if (isFav) {
        const favDoc = favorites.find(f => f.movieId === movie.id);
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'favorites', favDoc.id));
        showToast("Dihapus dari favorit");
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'favorites'), { movieId: movie.id, title: movie.title, image: movie.image, genre: movie.genre });
        showToast("Ditambahkan ke favorit");
      }
    } catch (e) { showToast("Gagal update favorit", "error"); }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user || user.isAnonymous) { setAuthModalOpen(true); return; }
    try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reviews', reviewId), { likes: increment(1) }); } catch (e) { console.error(e); }
  };

  const initPurchase = (item, type = 'movie') => {
    if (!user || user.isAnonymous) { showToast("Silakan Login untuk membeli tiket", "error"); setAuthModalOpen(true); return; }
    setItemToBuy({ ...item, type });
    setCheckoutOpen(true);
  };

  const handleDeleteMovie = async (id) => {
    if (!isAdmin) return;
    if (confirm("Apakah anda yakin ingin menghapus film ini?")) {
      try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'movies', id)); showToast("Film berhasil dihapus"); } catch (e) { showToast("Gagal menghapus film", "error"); }
    }
  };

  /* --- MODAL COMPONENTS (Defined Inside App for State Access) --- */
  
  const AuthModal = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loadingAuth, setLoadingAuth] = useState(false);
    
    const handleAuth = async (e) => { e.preventDefault(); setLoadingAuth(true); try { if (isLogin) { await signInWithEmailAndPassword(auth, email, password); showToast("Login Berhasil!"); } else { const res = await createUserWithEmailAndPassword(auth, email, password); await updateProfile(res.user, { displayName: name, photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + name }); showToast("Akun Berhasil Dibuat!"); } setAuthModalOpen(false); } catch (err) { showToast(err.message, "error"); } finally { setLoadingAuth(false); } };
    
    return ( <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4"><div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative border border-slate-100 dark:border-slate-800"><button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20}/></button><div className="text-center mb-6"><h2 className="text-2xl font-bold text-slate-800 dark:text-white">{isLogin ? 'Selamat Datang' : 'Buat Akun'}</h2><p className="text-xs text-slate-500 mt-1">Admin? Gunakan email mengandung 'admin'</p></div><form onSubmit={handleAuth} className="space-y-4">{!isLogin && <input required type="text" placeholder="Nama Lengkap" className="bg-slate-50 dark:bg-slate-800 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500" value={name} onChange={e => setName(e.target.value)} />}<input required type="email" placeholder="Email Address" className="bg-slate-50 dark:bg-slate-800 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500" value={email} onChange={e => setEmail(e.target.value)} /><input required type="password" placeholder="Password" className="bg-slate-50 dark:bg-slate-800 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500" value={password} onChange={e => setPassword(e.target.value)} /><button disabled={loadingAuth} type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50">{loadingAuth ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}</button></form><p className="text-center text-xs text-slate-500 mt-6"><button onClick={() => setIsLogin(!isLogin)} className="text-yellow-600 dark:text-yellow-500 font-bold hover:underline">{isLogin ? "Daftar disini" : "Login disini"}</button></p></div></div> );
  };

  const CheckoutModal = () => {
    const [quantity, setQuantity] = useState(1);
    const [step, setStep] = useState('review');
    const totalPrice = (itemToBuy?.price || 0) * quantity;
    const serviceFee = 2500 * quantity;
    const finalPrice = totalPrice + serviceFee;

    const handlePay = () => {
      setStep('processing');
      setTimeout(async () => {
        try {
          const now = new Date();
          const expiryDate = new Date(now);
          expiryDate.setMonth(now.getMonth() + 1);
          const invoiceId = "INV-" + Math.random().toString(36).substring(2, 9).toUpperCase();
          for(let i=0; i<quantity; i++) {
             await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'bookings'), {
                itemId: itemToBuy.id, title: itemToBuy.title, price: itemToBuy.price, type: itemToBuy.type,
                status: 'success', used: false, paymentMethod: 'QRIS', purchaseDate: Timestamp.now(),
                expiryDate: Timestamp.fromDate(expiryDate), invoiceId: invoiceId,
                qrCode: Math.random().toString(36).substring(7).toUpperCase()
             });
          }
          setInvoiceData({ id: invoiceId, item: itemToBuy.title, qty: quantity, date: now.toLocaleString(), total: finalPrice });
          setCheckoutOpen(false); setSelectedMovie(null); showToast("Pembayaran Berhasil!");
        } catch (e) { setCheckoutOpen(false); showToast("Gagal memproses", "error"); }
      }, 2000);
    };

    return (
      <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full md:max-w-md md:rounded-3xl rounded-t-3xl p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800">
          {step === 'review' && (
            <>
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-slate-800 dark:text-white">Checkout</h2><button onClick={() => setCheckoutOpen(false)}><X className="text-slate-500" /></button></div>
              <div className="flex gap-4 mb-6">{itemToBuy.image && <img src={itemToBuy.image} className="w-20 h-28 object-cover rounded-xl" />}<div className="flex-1"><h3 className="font-bold text-slate-900 dark:text-white">{itemToBuy.title}</h3><p className="text-sm text-slate-500">{itemToBuy.type === 'movie' ? 'Tiket Bioskop' : 'Voucher Hemat'}</p><p className="text-yellow-600 dark:text-yellow-500 font-bold mt-2">Rp {itemToBuy.price.toLocaleString()}</p></div></div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-4"><span className="text-slate-700 dark:text-slate-300 font-medium">Jumlah Tiket</span><div className="flex items-center gap-4"><button onClick={() => setQuantity(Math.max(1, quantity-1))} className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm"><Minus size={16} className="dark:text-white"/></button><span className="font-bold text-lg dark:text-white w-4 text-center">{quantity}</span><button onClick={() => setQuantity(quantity+1)} className="p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm"><Plus size={16} className="dark:text-white"/></button></div></div>
              <div className="space-y-2 mb-6 text-sm"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>Rp {totalPrice.toLocaleString()}</span></div><div className="flex justify-between text-slate-500"><span>Biaya Layanan</span><span>Rp {serviceFee.toLocaleString()}</span></div><div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-lg text-slate-900 dark:text-white"><span>Total Bayar</span><span>Rp {finalPrice.toLocaleString()}</span></div></div>
              <button onClick={handlePay} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl shadow-lg transition-all">Bayar Sekarang</button>
            </>
          )}
          {step === 'processing' && <div className="py-10 text-center"><div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><h3 className="text-lg font-bold dark:text-white">Memproses Pembayaran...</h3></div>}
        </div>
      </div>
    );
  };

  const InvoiceModal = () => {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
         <div className="bg-white w-full max-w-sm rounded-3xl p-0 overflow-hidden shadow-2xl relative">
            <div className="bg-emerald-500 p-6 text-center"><div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-white"/></div><h2 className="text-white font-bold text-xl">Pembayaran Sukses!</h2><p className="text-emerald-100 text-sm">{invoiceData.date}</p></div>
            <div className="p-6 relative"><div className="absolute -top-3 left-0 right-0 h-6 bg-white rounded-t-3xl"></div><div className="text-center mb-6"><p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Pembayaran</p><h3 className="text-3xl font-bold text-gray-900">Rp {invoiceData.total.toLocaleString()}</h3></div><div className="space-y-4 border-t border-dashed border-gray-200 pt-4"><div className="flex justify-between text-sm"><span className="text-gray-500">No. Invoice</span><span className="font-mono font-bold text-gray-900">{invoiceData.id}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Item</span><span className="font-medium text-gray-900 text-right w-1/2 truncate">{invoiceData.item}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Jumlah</span><span className="font-medium text-gray-900">{invoiceData.qty}x</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">LUNAS</span></div></div><button onClick={() => setInvoiceData(null)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl mt-8">Tutup Invoice</button></div>
         </div>
      </div>
    );
  };

  const AdminAddMovieModal = () => {
    const [title, setTitle] = useState(''); const [genre, setGenre] = useState(''); const [price, setPrice] = useState(''); const [rating, setRating] = useState(''); const [image, setImage] = useState(''); const [desc, setDesc] = useState(''); const [duration, setDuration] = useState('');
    const handleSubmit = async (e) => { e.preventDefault(); try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'movies'), { title, genre, price: Number(price), rating: Number(rating), image, desc, duration }); showToast("Film berhasil ditambahkan!"); setAdminAddMovieOpen(false); } catch (e) { showToast("Gagal menambah film", "error"); } };
    return ( <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"><div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"><button onClick={() => setAdminAddMovieOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Tambah Film Baru</h2><form onSubmit={handleSubmit} className="space-y-4"><input required placeholder="Judul Film" className="input-field" value={title} onChange={e => setTitle(e.target.value)} /><div className="grid grid-cols-2 gap-4"><input required placeholder="Genre" className="input-field" value={genre} onChange={e => setGenre(e.target.value)} /><input required placeholder="Durasi (e.g 1j 30m)" className="input-field" value={duration} onChange={e => setDuration(e.target.value)} /></div><div className="grid grid-cols-2 gap-4"><input required type="number" placeholder="Harga" className="input-field" value={price} onChange={e => setPrice(e.target.value)} /><input required type="number" step="0.1" max="5" placeholder="Rating (0-5)" className="input-field" value={rating} onChange={e => setRating(e.target.value)} /></div><input required placeholder="URL Gambar Poster" className="input-field" value={image} onChange={e => setImage(e.target.value)} /><textarea required rows={3} placeholder="Sinopsis" className="input-field" value={desc} onChange={e => setDesc(e.target.value)} /><button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl mt-2">Simpan Film</button></form></div><style jsx>{` .input-field { width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.75rem 1rem; font-size: 0.875rem; color: #1e293b; outline: none; } .dark .input-field { background-color: #1e293b; border-color: #334155; color: white; } `}</style></div> );
  };

  const EditProfileModal = () => {
    const [newName, setNewName] = useState(user?.displayName || ''); const [newPhoto, setNewPhoto] = useState(user?.photoURL || '');
    const handleSave = async () => { try { await updateProfile(auth.currentUser, { displayName: newName, photoURL: newPhoto }); showToast("Profil diperbarui!"); setEditProfileOpen(false); } catch (e) { showToast("Gagal update", "error"); } };
    return ( <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 relative shadow-xl"><button onClick={() => setEditProfileOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Edit Profil</h2><div className="space-y-4"><input placeholder="Nama" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white"/><input placeholder="URL Foto" value={newPhoto} onChange={e => setNewPhoto(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white"/><button onClick={handleSave} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl">Simpan</button></div></div></div> );
  };

  const ManagePaymentModal = () => {
    const [cardNumber, setCardNumber] = useState(''); const [cardName, setCardName] = useState('');
    const handleAddCard = async (e) => { e.preventDefault(); try { await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods'), { type: 'Credit Card', number: `**** **** **** ${cardNumber.slice(-4)}`, name: cardName, brand: 'Visa' }); setCardNumber(''); setCardName(''); showToast("Kartu berhasil ditambahkan"); } catch (e) { showToast("Gagal menambah kartu", "error"); } };
    const handleDelete = async (id) => { if(!confirm("Hapus metode pembayaran ini?")) return; await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'paymentMethods', id)); };
    return ( <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto"><button onClick={() => setManagePaymentOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Metode Pembayaran</h2><div className="space-y-3 mb-6">{paymentMethods.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Belum ada kartu tersimpan.</p>}{paymentMethods.map(pm => (<div key={pm.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-200 dark:border-slate-700"><div className="flex items-center gap-3"><div className="bg-blue-600/10 p-2 rounded text-blue-600 dark:text-blue-400"><CreditCard size={18}/></div><div><p className="text-sm font-bold text-slate-900 dark:text-white">{pm.brand} {pm.number}</p><p className="text-xs text-slate-500">{pm.name}</p></div></div><button onClick={() => handleDelete(pm.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-full"><Trash2 size={16}/></button></div>))}</div><form onSubmit={handleAddCard} className="border-t border-slate-200 dark:border-slate-700 pt-4"><h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Tambah Kartu Baru</h3><div className="space-y-3"><input required type="text" maxLength={16} placeholder="Nomor Kartu (16 digit)" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" /><input required type="text" placeholder="Nama Pemilik Kartu" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white" /><button type="submit" className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold py-3 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition"><Plus size={16} className="inline mr-2"/> Tambah Kartu</button></div></form></div></div> );
  };

  const WriteReviewModal = () => {
    const [selectedTicketId, setSelectedTicketId] = useState(''); const [rating, setRating] = useState(5); const [comment, setComment] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
    const reviewableTickets = myTickets.filter(t => t.type === 'movie' && (t.status === 'success' || t.status === 'used')); const uniqueMovies = Array.from(new Set(reviewableTickets.map(t => t.itemId))).map(id => reviewableTickets.find(t => t.itemId === id));
    const handleSubmit = async (e) => { e.preventDefault(); const ticket = reviewableTickets.find(t => t.itemId === selectedTicketId); setIsSubmitting(true); const rankInfo = getRankInfo(myTickets.length); try { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reviews'), { userId: user.uid, userName: user.displayName || 'Pengguna', userPhoto: user.photoURL || '', userRank: rankInfo.name, movieId: ticket.itemId, movieTitle: ticket.title, rating, comment, timestamp: Timestamp.now(), likes: 0 }); showToast("Review diposting!"); setWriteReviewOpen(false); } catch (err) { showToast("Gagal posting", "error"); } setIsSubmitting(false); };
    if (uniqueMovies.length === 0) return null; 
    return ( <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 relative"><button onClick={() => setWriteReviewOpen(false)} className="absolute top-4 right-4 text-slate-400"><X size={20}/></button><h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Tulis Ulasan</h2><form onSubmit={handleSubmit} className="space-y-4"><select className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white" onChange={e => setSelectedTicketId(e.target.value)} required><option value="">Pilih Film</option>{uniqueMovies.map(m => <option key={m.itemId} value={m.itemId}>{m.title}</option>)}</select><div className="flex justify-center space-x-2">{[1,2,3,4,5].map(s => <Star key={s} size={30} onClick={() => setRating(s)} className={s <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-slate-300 dark:text-slate-600'} />)}</div><textarea className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white" rows={4} placeholder="Komentar..." value={comment} onChange={e => setComment(e.target.value)} required/><button disabled={isSubmitting} className="w-full bg-yellow-500 font-bold py-3 rounded-xl shadow-lg shadow-yellow-500/20">Kirim</button></form></div></div> );
  };

  const DetailModal = () => {
    const movieReviews = reviews.filter(r => r.movieId === selectedMovie.id);
    return (
     <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-w-4xl md:rounded-3xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl max-h-screen">
        <button onClick={() => setSelectedMovie(null)} className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur text-white p-2 rounded-full md:hidden"><ChevronLeft size={24} /></button>
        <div className="w-full md:w-2/5 h-80 md:h-auto relative shrink-0"><img src={selectedMovie.image} className="w-full h-full object-cover" alt="Cover" /><div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 md:from-transparent via-transparent to-transparent opacity-100 md:opacity-50"></div></div>
        <div className="flex-1 p-6 md:p-10 flex flex-col h-full overflow-y-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
           <div className="hidden md:flex justify-between items-start mb-6"><div className="flex gap-2"><span className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 px-3 py-1 rounded-lg text-xs font-bold">{selectedMovie.genre}</span></div><button onClick={() => setSelectedMovie(null)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={20} className="text-slate-500 dark:text-slate-400" /></button></div>
           <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{selectedMovie.title}</h1>
           <div className="flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-400 mb-8"><span className="flex items-center"><Clock size={18} className="mr-2 text-yellow-500" /> {selectedMovie.duration}</span><span className="flex items-center"><Star size={18} className="mr-2 text-yellow-500" /> {selectedMovie.rating}</span></div>
           <div className="mb-8"><h3 className="font-bold text-lg mb-3">Sinopsis</h3><p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base">{selectedMovie.desc}</p></div>
           <div className="mb-24 md:mb-8 border-t border-slate-100 dark:border-slate-800 pt-6"><h3 className="font-bold text-lg mb-4 flex items-center"><MessageSquare size={18} className="mr-2 text-yellow-500"/> Ulasan Pengguna ({movieReviews.length})</h3>{movieReviews.length === 0 ? <p className="text-slate-500 text-sm">Belum ada ulasan.</p> : <div className="space-y-4">{movieReviews.slice(0, 3).map(r => <ReviewCard key={r.id} review={r} onLike={handleLikeReview} />)}{movieReviews.length > 3 && <button onClick={() => { setSelectedMovie(null); setActiveTab('reviews'); }} className="text-yellow-500 text-sm font-bold mt-2 hover:underline">Lihat semua</button>}</div>}</div>
           <div className="md:mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sticky bottom-0 bg-white dark:bg-slate-900 pb-6 md:pb-0"><div><p className="text-xs text-slate-500 uppercase font-bold">Harga Tiket</p><p className="text-2xl font-bold text-slate-900 dark:text-white">Rp {selectedMovie.price.toLocaleString()}</p></div><button onClick={() => initPurchase(selectedMovie)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold shadow-xl shadow-yellow-500/20 transition-transform active:scale-95 flex items-center"><Ticket className="mr-2 h-5 w-5" /> Beli Voucher</button></div>
        </div>
      </div>
    </div>
  )};

  const AdminView = () => (
    <div className="pb-24 animate-fade-in">
      <div className="sticky top-0 z-30 px-4 py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <ShieldCheck className="text-blue-500" />
      </div>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manajemen Film</h2>
            <button onClick={() => setAdminAddMovieOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-600 transition-colors flex items-center"><Plus size={16} className="mr-2"/> Tambah Film</button>
          </div>
          <p className="text-slate-500 text-sm mb-4">Total Film Aktif: {movies.length}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{movies.map(movie => (<div key={movie.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"><img src={movie.image} className="w-12 h-16 object-cover rounded-lg" /><div className="flex-1 min-w-0"><h4 className="font-bold text-slate-900 dark:text-white truncate">{movie.title}</h4><p className="text-xs text-slate-500">{movie.genre}</p></div><button onClick={() => handleDeleteMovie(movie.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"><Trash2 size={16}/></button></div>))}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm opacity-70"><div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-slate-900 dark:text-white">Manajemen Voucher</h2><button disabled className="bg-slate-200 dark:bg-slate-700 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed">Segera Hadir</button></div><p className="text-slate-500 text-sm">Fitur manajemen voucher sedang dalam pengembangan.</p></div>
      </div>
    </div>
  );

  const ReviewsView = () => {
    const filteredReviews = reviews.filter(r => { const matchSearch = r.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) || r.comment.toLowerCase().includes(searchQuery.toLowerCase()); let matchFilter = true; if (reviewFilter === 'Positif') matchFilter = r.rating >= 4; if (reviewFilter === 'Netral') matchFilter = r.rating === 3; if (reviewFilter === 'Negatif') matchFilter = r.rating <= 2; return matchSearch && matchFilter; });
    return ( <div className="pb-24 animate-fade-in"><div className="sticky top-0 z-30 px-4 pt-4 pb-2 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"><div className="flex justify-between items-center mb-4"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Komunitas</h1>{user && !user.isAnonymous && <button onClick={() => setWriteReviewOpen(true)} className="bg-yellow-500 text-black px-3 py-2 rounded-lg font-bold text-xs flex items-center shadow-lg shadow-yellow-500/20"><Edit3 size={14} className="mr-1"/> Tulis</button>}</div><div className="relative mb-4"><Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" /><input type="text" placeholder="Cari ulasan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-yellow-500" /></div><div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">{reviewCategories.map(cat => (<button key={cat} onClick={() => setReviewFilter(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${reviewFilter === cat ? 'bg-yellow-500 text-black border-yellow-500' : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{cat}</button>))}</div></div><div className="p-4 md:p-8 max-w-2xl mx-auto mt-2">{filteredReviews.length === 0 ? <p className="text-center text-slate-500 py-10">Tidak ada ulasan.</p> : <div className="space-y-4">{filteredReviews.map(r => <ReviewCard key={r.id} review={r} onLike={handleLikeReview} />)}</div>}</div></div> );
  };

  const VouchersView = () => {
    const filteredVouchers = vouchers.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return ( <div className="pb-24 animate-fade-in"><div className="sticky top-0 z-30 px-4 py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"><h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 mb-4">Deals & Promo</h1><div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" /><input type="text" placeholder="Cari voucher hemat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-yellow-500 text-sm shadow-sm" /></div></div><div className="p-4 md:p-8 max-w-5xl mx-auto">{filteredVouchers.length === 0 ? (<div className="text-center py-20 text-slate-500"><p>Tidak ada promo yang cocok.</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">{filteredVouchers.map(v => (<div key={v.id} onClick={() => initPurchase(v, 'bundle')} className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 cursor-pointer hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-xl dark:shadow-none"><div className="relative z-10 flex justify-between items-start mb-8"><div><span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-lg mb-3 uppercase tracking-wider">Bundle</span><h3 className="text-slate-900 dark:text-white font-bold text-2xl">{v.title}</h3><p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{v.desc}</p></div><div className="bg-purple-100 dark:bg-purple-600 p-3 rounded-2xl text-purple-600 dark:text-white shadow-lg"><Tag size={24} /></div></div><div className="flex justify-between items-end relative z-10"><div className="flex flex-col"><span className="text-sm text-slate-400 line-through">Rp {(v.price * 1.2).toLocaleString()}</span><span className="text-3xl font-bold text-slate-900 dark:text-white">Rp {v.price.toLocaleString()}</span></div><button className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg">Beli</button></div></div>))}</div>)}</div></div> );
  };

  const TicketsView = () => {
    if (user && user.isAnonymous) return ( <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in"><div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6"><Lock size={40} className="text-yellow-600 dark:text-yellow-500"/></div><h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Akses Terbatas</h2><p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">Silakan login atau daftar akun terlebih dahulu.</p><button onClick={() => setAuthModalOpen(true)} className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400 transition shadow-lg">Login / Daftar</button></div> );
    const [filter, setFilter] = useState('active'); const now = new Date(); const checkStatus = (ticket) => { if (ticket.status === 'failed') return 'failed'; const expiryDate = ticket.expiryDate ? ticket.expiryDate.toDate() : null; if (expiryDate && now > expiryDate) return 'expired'; if (ticket.used) return 'used'; return 'active'; }; const processedTickets = myTickets.map(t => ({...t, displayStatus: checkStatus(t)})); const displayList = processedTickets.filter(t => { const matchTab = filter === 'active' ? t.displayStatus === 'active' : ['expired', 'used', 'failed'].includes(t.displayStatus); const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.qrCode && t.qrCode.toLowerCase().includes(searchQuery.toLowerCase())); return matchTab && matchSearch; });
    return ( <div className="pb-24 animate-fade-in"><div className="sticky top-0 z-30 px-4 py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800"><h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">E-Wallet Tiket</h1><div className="relative mb-4"><Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" /><input type="text" placeholder="Cari tiket atau kode booking..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-yellow-500 text-sm shadow-sm" /></div><div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl w-full md:w-auto md:inline-flex"><button onClick={() => setFilter('active')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'active' ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm' : 'text-slate-500'}`}>Aktif</button><button onClick={() => setFilter('history')} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'history' ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm' : 'text-slate-500'}`}>Riwayat</button></div></div><div className="p-4 md:p-8 max-w-4xl mx-auto">{displayList.length === 0 ? <div className="flex flex-col items-center justify-center mt-20 space-y-6"><Ticket size={40} className="text-slate-400 opacity-50"/><p className="text-slate-500 dark:text-slate-400 text-lg">Tidak ada tiket {filter === 'active' ? 'aktif' : 'di riwayat'} yang cocok.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{displayList.map(ticket => (<div key={ticket.id} className={`relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border transition-transform hover:-translate-y-1 ${ticket.displayStatus === 'failed' ? 'border-red-200 dark:border-red-900/30' : 'border-slate-200 dark:border-slate-800'}`}><div className="p-6 pb-10"><h3 className="text-slate-900 dark:text-white font-bold text-xl leading-tight">{ticket.title}</h3><p className="text-xs text-slate-400 mt-2 font-medium">Via {ticket.paymentMethod || 'Manual'}</p></div><div className="bg-slate-50 dark:bg-black/20 p-5 flex justify-between items-center"><p className="text-slate-900 dark:text-white font-mono font-bold text-lg tracking-widest">{ticket.qrCode || '----'}</p>{ticket.displayStatus === 'active' && <QrCode size={30} className="text-slate-900 dark:text-white" />}</div></div>))}</div>}</div></div> );
  };

  const HomeView = () => {
    const filteredMovies = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) && (selectedCategory === 'All' || m.genre.includes(selectedCategory)));
    return (
      <div className="pb-24 md:pb-8 animate-fade-in">
        <div className="sticky top-0 z-30 px-4 md:px-8 py-4 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Selamat Datang 👋</p><h1 className="text-slate-900 dark:text-white font-bold text-xl md:text-2xl">Cinema Tix</h1></div>
          <div className="flex items-center gap-2 w-full md:w-auto"><div className="relative group w-full md:w-80"><Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" /><input type="text" placeholder="Cari film..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm shadow-sm focus:outline-none focus:border-yellow-500" /></div></div>
        </div>
        <div className="p-4 md:p-8 space-y-8">
          <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">{categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap ${selectedCategory === cat ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>{cat}</button>)}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">{filteredMovies.map(movie => <MovieCard key={movie.id} movie={movie} onClick={setSelectedMovie} isFavorite={favorites.some(f => f.movieId === movie.id)} onToggleFavorite={handleToggleFavorite} isAdmin={isAdmin} onDelete={handleDeleteMovie} />)}</div>
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    if (user && user.isAnonymous) return ( <div className="pb-24 p-8 pt-12 flex flex-col items-center justify-center min-h-[60vh] text-center"><div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8 relative"><User size={64} className="text-slate-400"/></div><h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Mode Tamu</h2><button onClick={() => setAuthModalOpen(true)} className="w-full bg-yellow-500 text-black font-bold py-4 rounded-xl shadow-lg">Login / Daftar</button></div> );
    const rank = getRankInfo(myTickets.length); const RankIcon = rank.icon;
    return (
      <div className="pb-24 p-4 pt-8 md:p-8 animate-fade-in max-w-md mx-auto">
        <div className="text-center mb-8 relative">
          <div className={`w-28 h-28 mx-auto relative group rounded-full border-4 ${rank.border} p-1`}><img src={user?.photoURL || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full rounded-full object-cover"/><div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-2 rounded-full border shadow-sm"><RankIcon size={20} className={rank.color} /></div></div>
          <h2 className="text-slate-900 dark:text-white font-bold text-2xl mt-4">{user?.displayName || 'Member'}</h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mt-2 ${rank.bg} ${rank.color}`}><span className="mr-1">{rank.name}</span><span>• {myTickets.length} Tiket</span></div>
        </div>
        <div className="mb-8 bg-slate-100 dark:bg-slate-800 rounded-2xl p-4"><div className="flex justify-between text-xs text-slate-500 mb-2"><span>Level Progress</span><span>{myTickets.length < 10 ? 'Next: Movie Buff (10)' : myTickets.length < 50 ? 'Next: Cinephile (50)' : 'Max Level'}</span></div><div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2.5"><div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (myTickets.length / 50) * 100)}%` }}></div></div></div>
        {favorites.length > 0 && (<div className="mb-8"><h3 className="font-bold text-slate-900 dark:text-white mb-3 ml-1 flex items-center"><Heart size={16} className="text-red-500 mr-2 fill-red-500"/> Film Favorit ({favorites.length})</h3><div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">{favorites.map(fav => (<div key={fav.id} className="min-w-[100px] w-[100px] relative group cursor-pointer" onClick={() => showToast(`Favorit: ${fav.title}`)}><img src={fav.image} className="w-full h-32 object-cover rounded-xl shadow-md" /><p className="text-xs font-bold mt-2 truncate text-slate-800 dark:text-slate-200">{fav.title}</p></div>))}</div></div>)}
        <div className="space-y-4"><button onClick={() => setEditProfileOpen(true)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center text-slate-700 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><User size={20} className="mr-4 text-blue-500"/><span className="flex-1 text-left">Edit Profil</span></button><button onClick={() => setManagePaymentOpen(true)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl flex items-center text-slate-700 dark:text-slate-200 font-medium border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><CreditCard size={20} className="mr-4 text-green-500"/><span className="flex-1 text-left">Metode Pembayaran</span></button><button onClick={async () => { await signOut(auth); await signInAnonymously(auth); }} className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 p-5 rounded-2xl font-bold border border-red-100 dark:border-red-500/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"><LogOut size={18} className="mr-2"/> Keluar</button></div>
      </div>
    );
  };

  /* --- RENDER --- */
  if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}><SkeletonLoader /></div>;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-300`}>
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen font-sans text-slate-900 dark:text-slate-100 flex">
        {notification && <Toast message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
        {selectedMovie && <DetailModal />}
        {checkoutOpen && itemToBuy && <CheckoutModal />}
        {invoiceData && <InvoiceModal />}
        {authModalOpen && <AuthModal />}
        {editProfileOpen && <EditProfileModal />}
        {adminAddMovieOpen && <AdminAddMovieModal />}
        {writeReviewOpen && <WriteReviewModal />}
        {managePaymentOpen && <ManagePaymentModal />}

        <aside className="hidden md:flex flex-col w-64 fixed h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40">
          <div className="p-8 flex items-center space-x-3"><div className="bg-yellow-500 p-2 rounded-xl"><Ticket className="text-black w-6 h-6" /></div><span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Cinema<span className="text-yellow-500">Tix</span></span></div>
          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'home', icon: Home, label: 'Jelajah' },
              { id: 'reviews', icon: MessageSquare, label: 'Ulasan' },
              { id: 'vouchers', icon: Tag, label: 'Promo' },
              isAdmin ? { id: 'admin', icon: LayoutDashboard, label: 'Admin Panel' } : { id: 'tickets', icon: Ticket, label: 'Tiket' },
              { id: 'profile', icon: User, label: 'Akun' }
            ].map(tab => { const TabIcon = tab.icon; return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <TabIcon size={20} className={activeTab === tab.id ? 'fill-current' : ''} /><span>{tab.label}</span>
                </button>
              );})}
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800"><button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}<span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span></button></div>
        </aside>

        <main className="flex-1 md:ml-64 w-full relative">
          <div className="md:hidden absolute top-4 right-4 z-40"><button onClick={() => setIsDarkMode(!isDarkMode)} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur p-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-800">{isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-600" />}</button></div>
          <div className="max-w-7xl mx-auto">
            {activeTab === 'home' && <HomeView />}
            {activeTab === 'reviews' && <ReviewsView />}
            {activeTab === 'vouchers' && <VouchersView />}
            {activeTab === 'tickets' && !isAdmin && <TicketsView />}
            {activeTab === 'admin' && isAdmin && <AdminView />}
            {activeTab === 'profile' && <ProfileView />}
          </div>
        </main>

        <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl dark:shadow-black/50 p-2 flex justify-around items-center h-16">
            {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'reviews', icon: MessageSquare, label: 'Ulasan' },
              { id: 'vouchers', icon: Tag, label: 'Promo' },
              isAdmin ? { id: 'admin', icon: LayoutDashboard, label: 'Admin' } : { id: 'tickets', icon: Ticket, label: 'Tiket' },
              { id: 'profile', icon: User, label: 'Akun' }
            ].map(tab => { const TabIcon = tab.icon; return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex flex-col items-center justify-center w-full h-full rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'text-yellow-600 dark:text-yellow-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
                  {activeTab === tab.id && <span className="absolute -top-1 w-1 h-1 bg-yellow-500 rounded-full"></span>}
                  <TabIcon size={activeTab === tab.id ? 24 : 20} className={`transition-all ${activeTab === tab.id ? 'mb-1 fill-current' : ''}`} />
                  {activeTab === tab.id && <span className="text-[10px] font-bold">{tab.label}</span>}
                </button>
              );})}
          </div>
        </div>
      </div>
    </div>
  );
}