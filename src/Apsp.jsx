import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query, 
  where,
  increment,
  arrayUnion 
} from 'firebase/firestore';
import { 
  Home, 
  Film, 
  Ticket, 
  User, 
  Star, 
  Plus, 
  Trash2, 
  LogOut, 
  Menu, 
  X, 
  QrCode, 
  MessageSquare, 
  Calendar, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  CreditCard,
  Loader2,
  Edit,
  Camera,
  Heart,
  Bookmark,
  ChevronRight,
  LogIn,
  TrendingUp,
  Award,
  Flame,
  Play,
  Users,
  Wallet,
  Smartphone,
  Send,
  MessageCircle,
  Clapperboard,
  AlertTriangle,
  History,
  Check
} from 'lucide-react';

// --- FIREBASE SETUP ---
const firebaseConfig = {
    apiKey: "AIzaSyCiVCVEa7HiXHHJSx8frpitqqspQBlvN4g",
    authDomain: "cinema-tix-app.firebaseapp.com",
    projectId: "cinema-tix-app",
    storageBucket: "cinema-tix-app.firebasestorage.app",
    messagingSenderId: "497740074012",
    appId: "1:497740074012:web:90aef7aeb527e01f1923d9",
    measurementId: "G-BNK7251WDJ"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- HELPERS ---
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- COMPONENT UTAMA ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true); 
  const [view, setView] = useState('auth'); 
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Swipe Gesture State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Global UI State
  const [toast, setToast] = useState(null); 

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        }
      } catch (error) {
        console.error("Auth Error", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setView('home');
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          const safeName = currentUser.email ? currentUser.email.split('@')[0] : 'User';
          const initialData = {
            displayName: safeName,
            photoURL: '',
            bio: 'Penggemar Film Sejati',
            role: 'member'
          };
          await setDoc(docRef, initialData);
          setUserProfile(initialData);
        }
      } else {
        setUserProfile(null);
        setView('auth');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const triggerLogin = () => {
    setShowLoginModal(true);
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setView('detail');
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setView('ticketDetail');
  };

  // --- SWIPE GESTURE LOGIC ---
  const minSwipeDistance = 70; 
  const navOrder = ['home', 'tickets', 'community', 'profile']; 

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    if (!navOrder.includes(view)) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = navOrder.indexOf(view);

    if (isLeftSwipe) {
      if (currentIndex < navOrder.length - 1) {
        const nextView = navOrder[currentIndex + 1];
        setView(nextView);
      }
    } else if (isRightSwipe) {
      if (currentIndex > 0) {
        setView(navOrder[currentIndex - 1]);
      }
    }
  };

  if (showSplash) return <SplashScreen />;
  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Loading Cinema Tix...</div>;

  const renderView = () => {
    switch(view) {
      case 'auth': return <AuthScreen onLogin={() => showToast('Login Berhasil!', 'success')} showToast={showToast} />;
      case 'home': return <HomeView onMovieClick={handleMovieClick} appId={appId} />;
      case 'detail': return <MovieDetailView movie={selectedMovie} onBack={() => setView('home')} user={user} userProfile={userProfile} appId={appId} setView={setView} showToast={showToast} triggerLogin={triggerLogin} />;
      case 'tickets': return <MyTicketsView onTicketClick={handleTicketClick} user={user} appId={appId} triggerLogin={triggerLogin} />;
      case 'ticketDetail': return <TicketDetailView ticket={selectedTicket} onBack={() => setView('tickets')} user={user} appId={appId} showToast={showToast} />;
      case 'community': return <CommunityView user={user} userProfile={userProfile} appId={appId} triggerLogin={triggerLogin} showToast={showToast}/>;
      case 'profile': return <ProfileView user={user} userProfile={userProfile} setUserProfile={setUserProfile} isAdmin={isAdmin} setIsAdmin={setIsAdmin} showToast={showToast} triggerLogin={triggerLogin} appId={appId} />;
      case 'admin': return <AdminView appId={appId} showToast={showToast} />;
      default: return <HomeView onMovieClick={handleMovieClick} appId={appId} />;
    }
  };

  if (view === 'auth') return renderView();

  return (
    <div 
      className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-red-600 selection:text-white pb-24 md:pb-0 relative touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-slide-down ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-md">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-red-600 transition-colors"><X size={20}/></button>
            <AuthScreen 
              onLogin={() => {
                setShowLoginModal(false);
                showToast('Login Berhasil!', 'success');
              }} 
              showToast={showToast}
              isModal={true}
            />
          </div>
        </div>
      )}

      <nav className="hidden md:flex items-center justify-between px-8 py-4 bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-red-600 p-1.5 rounded-lg shadow-red-glow">
            <Film size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter">CINEMA<span className="text-red-600">TIX</span></h1>
        </div>
        <div className="flex items-center gap-8">
          <NavButton active={view === 'home'} onClick={() => setView('home')} icon={<Home size={18} />} label="Beranda" />
          <NavButton active={view === 'tickets' || view === 'ticketDetail'} onClick={() => setView('tickets')} icon={<Ticket size={18} />} label="Tiket Saya" />
          <NavButton active={view === 'community'} onClick={() => setView('community')} icon={<MessageSquare size={18} />} label="Komunitas" />
          {isAdmin && (
             <NavButton active={view === 'admin'} onClick={() => setView('admin')} icon={<Plus size={18} />} label="Admin Panel" />
          )}
          {user ? (
             <NavButton active={view === 'profile'} onClick={() => setView('profile')} icon={<User size={18} />} label={userProfile?.displayName || "Profil"} />
          ) : (
             <button onClick={triggerLogin} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">Masuk</button>
          )}
        </div>
      </nav>

      <div className="md:hidden flex items-center justify-between p-4 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40 border-b border-neutral-800">
        <div className="flex items-center gap-2" onClick={() => setView('home')}>
           <div className="bg-red-600 p-1 rounded">
            <Film size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-bold">CINEMA<span className="text-red-600">TIX</span></h1>
        </div>
        <div onClick={() => user ? setView('profile') : triggerLogin()} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 active:scale-95 transition-transform overflow-hidden">
           {user && userProfile?.photoURL ? (
             <img src={userProfile.photoURL} alt="User" className="w-full h-full object-cover"/>
           ) : (
             <span className="text-xs font-bold">
              {user && user.email ? user.email[0].toUpperCase() : <LogIn size={14}/>}
             </span>
           )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto min-h-[calc(100vh-140px)]">
        {renderView()}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 flex justify-around py-3 pb-6 z-50 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <MobileNavItem active={view === 'home' || view === 'detail'} onClick={() => setView('home')} icon={<Home size={22} />} label="Home" />
        <MobileNavItem active={view === 'tickets' || view === 'ticketDetail'} onClick={() => setView('tickets')} icon={<Ticket size={22} />} label="Tiket" />
        <MobileNavItem active={view === 'community'} onClick={() => setView('community')} icon={<MessageSquare size={22} />} label="Forum" />
        {isAdmin && (
          <MobileNavItem active={view === 'admin'} onClick={() => setView('admin')} icon={<Plus size={22} />} label="Admin" />
        )}
        <MobileNavItem active={view === 'profile'} onClick={() => setView('profile')} icon={<User size={22} />} label="Profil" />
      </div>

    </div>
  );
}

// --- SPLASH SCREEN ---
function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center animate-fade-out-delay">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 rounded-full animate-pulse"></div>
        <div className="bg-gradient-to-br from-neutral-900 to-black p-6 rounded-2xl border border-neutral-800 shadow-2xl relative z-10 animate-bounce-slow">
          <Clapperboard size={64} className="text-red-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold tracking-tighter text-white animate-slide-up">
        CINEMA<span className="text-red-600">TIX</span>
      </h1>
      <p className="text-neutral-500 text-sm mt-2 tracking-widest uppercase animate-slide-up delay-100">Your Movie Companion</p>
      
      <div className="mt-8 w-32 h-1 bg-neutral-900 rounded-full overflow-hidden">
        <div className="h-full bg-red-600 animate-loading-bar"></div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---
const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${active ? 'text-red-500' : 'text-neutral-400 hover:text-white'}`}>{icon} {label}</button>
);

const MobileNavItem = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-red-500' : 'text-neutral-500'}`}>{icon}<span className="text-[10px] font-medium">{label}</span></button>
);

// --- AUTH SCREEN ---
function AuthScreen({ onLogin, showToast, isModal = false }) {
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

// --- HOME VIEW ---
function HomeView({ onMovieClick, appId }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'movies');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moviesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMovies(moviesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [appId]);

  const genres = ['All', 'Action', 'Drama', 'Horror', 'Comedy', 'Sci-Fi'];

  // FIX: ROBUST CATEGORY LOGIC WITH TYPE CONVERSION
  const mostWatched = [...movies].sort((a, b) => (Number(b.purchaseCount) || 0) - (Number(a.purchaseCount) || 0)).slice(0, 5);
  const topRated = [...movies].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)).slice(0, 5);
  const mostFavorited = [...movies].sort((a, b) => (Number(b.favoriteCount) || 0) - (Number(a.favoriteCount) || 0)).slice(0, 5);

  const filteredMovies = movies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genre === 'All' || m.genre.toLowerCase().includes(genre.toLowerCase());
    return matchSearch && matchGenre;
  });

  const CategoryCard = ({ movie, badge, badgeColor }) => (
    <div onClick={() => onMovieClick(movie)} className="flex-shrink-0 w-36 md:w-44 cursor-pointer group relative">
      <div className="aspect-[2/3] bg-neutral-800 rounded-xl overflow-hidden mb-2 relative">
        <img src={movie.posterUrl} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={(e) => e.target.src='https://via.placeholder.com/150'} />
        {badge && (
          <div className={`absolute top-2 left-2 ${badgeColor} text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1`}>
             {badge}
          </div>
        )}
      </div>
      <h3 className="text-sm font-bold truncate text-white">{movie.title}</h3>
      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span className="flex items-center gap-1 text-yellow-500"><Star size={10} fill="currentColor"/> {movie.rating || '0.0'}</span>
        <span>•</span>
        <span>{movie.genre?.split(',')[0]}</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 animate-fade-in pb-20">
      <div className="mb-8 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center px-4 focus-within:border-red-600 transition-colors">
            <Search size={20} className="text-neutral-500" />
            <input type="text" placeholder="Cari film..." className="w-full bg-transparent p-3 outline-none text-white placeholder:text-neutral-600" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map(g => (
            <button key={g} onClick={() => setGenre(g)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${genre === g ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}>{g}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto"/></div>
      ) : search ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {filteredMovies.map(m => (
             <CategoryCard key={m.id} movie={m} />
           ))}
           {filteredMovies.length === 0 && <p className="col-span-full text-center text-neutral-500">Film tidak ditemukan.</p>}
        </div>
      ) : (
        <div className="space-y-12">
          {/* ALL MOVIES SECTION - MOVED TO TOP */}
          <section>
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Film size={20} className="text-red-500"/> Semua Film ({filteredMovies.length})</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredMovies.map(movie => (
                  <div key={movie.id} onClick={() => onMovieClick(movie)} className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 cursor-pointer hover:border-red-600 transition-all hover:scale-[1.02] shadow-lg relative">
                    <div className="aspect-[2/3] bg-neutral-800 relative overflow-hidden">
                      <img src={movie.posterUrl} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={(e) => e.target.src = 'https://via.placeholder.com/300x450?text=Error'}/>
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-500 flex items-center gap-1"><Star size={10} fill="currentColor" /> {movie.rating || '0.0'}</div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-white truncate">{movie.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-1 rounded uppercase tracking-wider">{movie.genre?.split(',')[0]}</span>
                        <span className="text-sm font-bold text-red-500">Rp {movie.price}k</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* CATEGORY SECTIONS BELOW */}
          <section>
             <div className="flex items-center gap-2 mb-4">
                <Flame className="text-orange-500" size={24} fill="currentColor"/>
                <h2 className="text-xl font-bold">Paling Laris (Most Watched)</h2>
             </div>
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {mostWatched.map(m => (
                  <CategoryCard 
                    key={m.id} 
                    movie={m} 
                    badge={`${m.purchaseCount || 0} Terjual`} 
                    badgeColor="bg-orange-600"
                  />
                ))}
             </div>
          </section>

          <section>
             <div className="flex items-center gap-2 mb-4">
                <Award className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold">Rating Tertinggi</h2>
             </div>
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {topRated.map(m => (
                  <CategoryCard 
                    key={m.id} 
                    movie={m} 
                    badge={`Score: ${m.rating}`} 
                    badgeColor="bg-yellow-600"
                  />
                ))}
             </div>
          </section>

          <section>
             <div className="flex items-center gap-2 mb-4">
                <Heart className="text-pink-500" size={24} fill="currentColor"/>
                <h2 className="text-xl font-bold">Paling Banyak Disukai</h2>
             </div>
             <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {mostFavorited.map(m => (
                  <CategoryCard 
                    key={m.id} 
                    movie={m} 
                    badge={`${m.favoriteCount || 0} Likes`} 
                    badgeColor="bg-pink-600"
                  />
                ))}
             </div>
          </section>
        </div>
      )}
    </div>
  );
}

// --- MOVIE DETAIL VIEW ---
function MovieDetailView({ movie, onBack, user, userProfile, appId, setView, showToast, triggerLogin }) {
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
      {/* Mobile Sticky Buy Button - Positioned ABOVE Navbar */}
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

      {/* TRAILER MODAL */}
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
         
         {/* PLAY BUTTON CENTER */}
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
          {/* ... existing detail content ... */}
          <div className="md:col-span-2 space-y-6">
            <div className="prose prose-invert">
              <h3 className="text-lg font-bold mb-2">Sinopsis</h3>
              <p className="text-neutral-300 leading-relaxed text-sm md:text-base">{movie.description || "Tidak ada deskripsi tersedia untuk film ini."}</p>
            </div>

            {/* CAST SECTION */}
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
                           {rev.userPhoto ? <img src={rev.userPhoto} className="w-full h-full object-cover"/> : <span className="text-xs font-bold text-neutral-400">{rev.userName[0]}</span>}
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

// --- PURCHASE MODAL ---
function PurchaseModal({ movie, user, appId, onClose, onSuccess, showToast }) {
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
                 <img src={movie.posterUrl} className="w-8 h-10 object-cover rounded bg-neutral-800"/>
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

// --- MY TICKETS VIEW (WITH TABS & REDEEM STATUS) ---
function MyTicketsView({ onTicketClick, user, appId, triggerLogin }) {
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

// --- TICKET DETAIL (VOUCHER) WITH REDEEM ---
function TicketDetailView({ ticket, onBack, user, appId, showToast }) {
  const [redeeming, setRedeeming] = useState(false);

  const handleRedeem = async () => {
    if (!confirm('Gunakan tiket ini sekarang? Tindakan ini tidak dapat dibatalkan.')) return;
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

// --- COMMUNITY VIEW (WITH REPLIES) ---
function CommunityView({ user, userProfile, appId, triggerLogin, showToast }) {
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
                    {rev.userPhoto ? <img src={rev.userPhoto} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600">{rev.userName[0]}</div>}
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
                            {reply.userPhoto ? <img src={reply.userPhoto} className="w-full h-full object-cover"/> : <div className="flex items-center justify-center h-full w-full text-[10px] text-neutral-500 font-bold">{reply.userName[0]}</div>}
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

// --- PROFILE VIEW ---
function ProfileView({ user, userProfile, setUserProfile, isAdmin, setIsAdmin, showToast, triggerLogin, appId }) {
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
                  {formData.photoURL ? <img src={formData.photoURL} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{formData.displayName ? formData.displayName[0] : 'U'}</div>}
              </div>
              <div className="flex gap-2">{presetAvatars.map((url, i) => (<img key={i} src={url} className="w-10 h-10 rounded-full border border-neutral-700 cursor-pointer hover:border-red-600" onClick={() => setFormData({...formData, photoURL: url})}/>))}</div>
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
      <div className="mb-6"><h3 className="font-bold text-sm text-neutral-400 mb-3 flex items-center gap-2"><Bookmark size={16}/> Daftar Tonton ({watchlist.length})</h3>{watchlist.length > 0 ? (<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">{watchlist.map((m, i) => (<div key={i} className="flex-shrink-0 w-24"><img src={m.posterUrl} className="w-full h-32 object-cover rounded-lg mb-1 opacity-80 hover:opacity-100 transition-opacity"/><p className="text-[10px] truncate text-neutral-400">{m.movieTitle}</p></div>))}</div>) : (<div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-center text-xs text-neutral-500">Belum ada film yang disimpan.</div>)}</div>
      <div className="space-y-3">
        <button onClick={() => { setIsAdmin(!isAdmin); showToast(isAdmin ? 'Mode Admin Nonaktif' : 'Mode Admin Aktif', isAdmin ? 'error' : 'success'); }} className={`w-full border p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${isAdmin ? 'bg-red-900/10 border-red-600/50 text-red-500' : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800'}`}><div className="flex items-center gap-3"><div className={`p-2 rounded transition-colors ${isAdmin ? 'bg-red-900/20' : 'bg-neutral-800'}`}><Menu size={18}/></div><span className="font-medium text-sm">Dashboard Admin</span></div><div className={`w-10 h-5 rounded-full relative transition-colors ${isAdmin ? 'bg-red-600' : 'bg-neutral-700'}`}><div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isAdmin ? 'left-6' : 'left-1'}`}></div></div></button>
        <button onClick={handleLogout} className="w-full bg-white text-black hover:bg-gray-200 p-4 rounded-xl flex items-center justify-center gap-2 font-bold mt-8 transition-colors shadow-lg"><LogOut size={18} /> Keluar Aplikasi</button>
      </div>
      <p className="text-center text-[10px] text-neutral-600 mt-12">Cinema Tix App v2.1.0<br/>Build with React & Firebase</p>
    </div>
  );
}

// --- ADMIN VIEW (CRUD) ---
function AdminView({ appId, showToast }) {
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
    if (confirm('Hapus film ini secara permanen?')) {
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