import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db, appId } from './lib/firebase';

import { Film, Home, Ticket, User, MessageSquare, Plus, LogIn, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

import SplashScreen from './components/SplashScreen';
import { NavButton, MobileNavItem } from './components/Navigation';
import AuthScreen from './components/AuthScreen';

// Pages
import HomeView from './pages/HomeView';
import MovieDetailView from './pages/MovieDetailView';
import MyTicketsView from './pages/MyTicketsView';
import TicketDetailView from './pages/TicketDetailView';
import CommunityView from './pages/CommunityView';
import ProfileView from './pages/ProfileView';
import AdminView from './pages/AdminView';

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