// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCiVCVEa7HiXHHJSx8frpitqqspQBlvN4g",
  authDomain: "cinema-tix-app.firebaseapp.com",
  projectId: "cinema-tix-app",
  storageBucket: "cinema-tix-app.firebasestorage.app",
  messagingSenderId: "497740074012",
  appId: "1:497740074012:web:90aef7aeb527e01f1923d9",
  measurementId: "G-BNK7251WDJ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// App id untuk struktur koleksi
export const appId = 'cinema-tix-production';

// Seeding helper (dipanggil dari App setelah user siap)
export const seedDataIfEmpty = async () => {
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
      // addDoc ke koleksi
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
