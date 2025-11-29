import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, Loader2, Film, Flame, Award, Heart, Star } from 'lucide-react';

export default function HomeView({ onMovieClick, appId }) {
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
        <img src={movie.posterUrl} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={(e) => e.target.src='https://via.placeholder.com/150'} alt={movie.title} />
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
          <section>
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Film size={20} className="text-red-500"/> Semua Film ({filteredMovies.length})</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredMovies.map(movie => (
                  <div key={movie.id} onClick={() => onMovieClick(movie)} className="group bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 cursor-pointer hover:border-red-600 transition-all hover:scale-[1.02] shadow-lg relative">
                    <div className="aspect-[2/3] bg-neutral-800 relative overflow-hidden">
                      <img src={movie.posterUrl} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" onError={(e) => e.target.src = 'https://via.placeholder.com/300x450?text=Error'} alt={movie.title}/>
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-yellow-500 flex items-center gap-1"><Star size={10} fill="currentColor" /> {movie.rating || '0.0'}</div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-white truncate">{movie.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-1 rounded uppercase tracking-wider">{movie.genre?.split(',')[0]}</span>
                        <span className="text-sm font-bold text-red-500">Rp {movie.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </section>

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