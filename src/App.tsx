import React, { useState, useEffect, useMemo, ErrorInfo, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User,
  signOut,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage, handleFirestoreError, OperationType } from './lib/firebase';
import { UserProfile, Photo, Rating } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  User as UserIcon, 
  Star, 
  LayoutDashboard, 
  Info, 
  HelpCircle, 
  Users,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Mail,
  UserCircle,
  ShieldCheck,
  Shuffle,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  Upload,
  Trash2,
  Download as DownloadIcon,
  Plus,
  X,
  FileSpreadsheet,
  Clock,
  Edit2,
  Check,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from './lib/utils';

// --- Error Boundary Component ---
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('Uncaught error:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Something went wrong</h2>
            <p className="text-zinc-500 font-medium">We encountered an unexpected error. Please try refreshing the page.</p>
            <div className="p-4 bg-zinc-50 rounded-2xl text-left overflow-auto max-h-40">
              <code className="text-xs text-red-600 font-mono">{this.state.error?.message || 'Unknown error'}</code>
            </div>
            <button onClick={() => window.location.reload()} className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all">Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Navbar Component ---
interface NavbarProps {
  view: string;
  setView: (view: any) => void;
  user: User | null;
  profile: UserProfile | null;
  handleLogout: () => void;
  totalUsers: number;
}
function Navbar({ view, setView, user, profile, handleLogout, totalUsers }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-zinc-200 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('landing')}>
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Face Rating</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => { const el = document.getElementById('about'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else setView('landing'); }} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"><Info className="w-4 h-4" />About</button>
          <button onClick={() => { const el = document.getElementById('how-it-works'); if (el) el.scrollIntoView({ behavior: 'smooth' }); else setView('landing'); }} className="text-sm font-medium text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"><HelpCircle className="w-4 h-4" />How it works</button>
          <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-600"><Users className="w-4 h-4" /><span>{totalUsers} Users</span></div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {profile?.role === 'admin' ? (
                <button onClick={() => setView('admin')} className={cn("text-sm font-medium px-4 py-2 rounded-full transition-colors flex items-center gap-2", view === 'admin' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100")}><LayoutDashboard className="w-4 h-4" />Admin</button>
              ) : (
                <>
                  <button onClick={() => setView('rating')} className={cn("text-sm font-medium px-4 py-2 rounded-full transition-colors", view === 'rating' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100")}>Rate</button>
                  <button onClick={() => setView('my-ratings')} className={cn("text-sm font-medium px-4 py-2 rounded-full transition-colors", view === 'my-ratings' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100")}>My Ratings</button>
                </>
              )}
              <div className="h-4 w-px bg-zinc-200" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-zinc-900">{profile?.username}</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{profile?.role}</span>
                </div>
                <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"><LogOut className="w-5 h-5" /></button>
              </div>
            </>
          ) : (
            <button onClick={() => setView('auth')} className="bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200">Login</button>
          )}
        </div>
      </div>
    </nav>
  );
}

// --- Landing Page Component ---
function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-24">
      <section className="text-center space-y-8 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-zinc-600 text-sm font-medium"><Zap className="w-4 h-4 text-amber-500 fill-amber-500" />New: Professional Celebrity Face Rating</motion.div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 leading-[0.9]">RATE THE <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-500 to-zinc-900">PERFECT FACE</span></h1>
        <p className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">The ultimate platform for analyzing facial aesthetics. Rate celebrities across 5 different angles and help build the most comprehensive face database.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onStart} className="group bg-zinc-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center gap-2">Let's Get Started<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-full text-lg font-bold text-zinc-600 hover:bg-zinc-100 transition-colors">Learn More</button>
        </div>
      </section>
      <section id="about" className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <Star className="w-6 h-6" />, title: "Multi-Angle Rating", desc: "Rate faces from Front, Left, Right, Top, and 45-degree angles for maximum precision." },
          { icon: <Shield className="w-6 h-6" />, title: "Verified Data", desc: "Our admin team ensures all photos are high-quality and correctly categorized." },
          { icon: <Users className="w-6 h-6" />, title: "Global Community", desc: "Join thousands of users in defining the standards of facial aesthetics." }
        ].map((feature, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-6">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
      <section id="how-it-works" className="bg-zinc-900 rounded-[3rem] p-12 md:p-24 text-white overflow-hidden relative">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">HOW THE <br /> SYSTEM WORKS</h2>
            <div className="space-y-6">
              {["Register your account with a unique username", "View shuffled celebrity photos from various angles", "Rate each photo using our 5-star system", "Track and update your ratings in your profile"].map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                  <p className="text-zinc-400 text-lg font-medium pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative"><div className="aspect-square bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center p-12"><Star className="w-32 h-32 text-white/20 animate-pulse" /></div></div>
        </div>
      </section>
    </div>
  );
}

// --- Auth Component ---
function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        let loginEmail = email;
        if (!email.includes('@')) {
          try {
            const usernameDoc = await getDoc(doc(db, 'usernames', email));
            if (!usernameDoc.exists()) throw new Error('Username not found');
            loginEmail = usernameDoc.data().email;
          } catch (err) {
            if (err instanceof Error && err.message === 'Username not found') throw err;
            handleFirestoreError(err, OperationType.GET, `usernames/${email}`);
          }
        }
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
        if (isAdminLogin) {
          try {
            const docSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
            const role = docSnap.data()?.role;
            const isBootstrapAdmin = userCredential.user.email === "252-15-974@diu.edu.bd";
            if (role !== 'admin' && !isBootstrapAdmin) {
              await auth.signOut();
              throw new Error('Unauthorized: Admin access only');
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes('Unauthorized')) throw err;
            handleFirestoreError(err, OperationType.GET, `users/${userCredential.user.uid}`);
          }
        }
      } else {
        if (!username || !email || !password) throw new Error('All fields are required');
        try {
          const usernameDoc = await getDoc(doc(db, 'usernames', username));
          if (usernameDoc.exists()) throw new Error('Username already taken');
        } catch (err) {
          if (err instanceof Error && err.message === 'Username already taken') throw err;
          handleFirestoreError(err, OperationType.GET, `usernames/${username}`);
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), { uid: userCredential.user.uid, username, email, role: 'user', createdAt: serverTimestamp() });
          await setDoc(doc(db, 'usernames', username), { email, uid: userCredential.user.uid });
          await setDoc(doc(db, 'stats', 'summary'), { userCount: increment(1) }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'users/usernames/stats');
        }
      }
      onAuthSuccess();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{isLogin ? (isAdminLogin ? 'Admin Portal' : 'Welcome Back') : 'Create Account'}</h2>
          <p className="text-zinc-500 font-medium">{isLogin ? (isAdminLogin ? 'Enter your admin credentials' : 'Login to continue rating') : 'Join the community today'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative"><UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" /><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-medium" placeholder="johndoe" /></div>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">{isLogin && !isAdminLogin ? 'Username or Email' : 'Email'}</label>
            <div className="relative">{isLogin && !isAdminLogin ? <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" /> : <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />}<input type={isLogin && !isAdminLogin ? "text" : "email"} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-medium" placeholder={isLogin && !isAdminLogin ? "username or email" : "email@example.com"} /></div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none transition-all font-medium" placeholder="••••••••" /></div>
          </div>
          {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-xl">{error}</motion.p>}
          <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? 'Login' : 'Create Account'}<ArrowRight className="w-5 h-5" /></>}</button>
        </form>
        <div className="mt-8 pt-8 border-t border-zinc-100 space-y-4">
          <button onClick={() => { setIsLogin(!isLogin); setIsAdminLogin(false); setError(''); }} className="w-full text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">{isLogin ? "Don't have an account? Register" : "Already have an account? Login"}</button>
          {isLogin && <button onClick={() => { setIsAdminLogin(!isAdminLogin); setError(''); }} className="w-full flex items-center justify-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors"><ShieldCheck className="w-4 h-4" />{isAdminLogin ? 'Switch to User Login' : 'Admin Login'}</button>}
        </div>
      </div>
    </div>
  );
}

// --- Rating System Component ---
function RatingSystem({ profile }: { profile: UserProfile }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubPhotos = onSnapshot(collection(db, 'photos'), (snapshot) => { setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo))); setLoading(false); }, (error) => { handleFirestoreError(error, OperationType.LIST, 'photos'); });
    const q = query(collection(db, 'ratings'), where('userId', '==', profile.uid));
    const unsubRatings = onSnapshot(q, (snapshot) => { const ratings: Record<string, number> = {}; snapshot.docs.forEach(doc => { const data = doc.data(); ratings[data.photoId] = data.rating; }); setUserRatings(ratings); }, (error) => { handleFirestoreError(error, OperationType.LIST, 'ratings'); });
    return () => { unsubPhotos(); unsubRatings(); };
  }, [profile.uid]);

  const unratedPhotos = useMemo(() => { const filtered = photos.filter(p => !userRatings[p.id]); return [...filtered].sort(() => Math.random() - 0.5); }, [photos, userRatings]);
  const currentPhoto = unratedPhotos[currentIndex];

  const handleRate = async (rating: number) => {
    if (!currentPhoto || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const ratingId = `${profile.uid}_${currentPhoto.id}`;
      await setDoc(doc(db, 'ratings', ratingId), { userId: profile.uid, username: profile.username, photoId: currentPhoto.id, photoName: currentPhoto.name, angle: currentPhoto.angle, rating, timestamp: serverTimestamp() });
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, `ratings/${profile.uid}_${currentPhoto.id}`); } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;
  if (!currentPhoto) return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
      <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-12 h-12" /></div>
      <h2 className="text-4xl font-black tracking-tight">All Caught Up!</h2>
      <p className="text-zinc-500 text-lg font-medium">You've rated all available photos. Check back later for more celebrities!</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="relative aspect-[4/5] md:aspect-video rounded-[3rem] overflow-hidden bg-zinc-200 shadow-2xl group">
        <AnimatePresence mode="wait"><motion.img key={currentPhoto.id} src={currentPhoto.url} alt={currentPhoto.name} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" referrerPolicy="no-referrer" /></AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">{currentPhoto.name}</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-xs font-bold uppercase tracking-widest border border-white/10">{currentPhoto.angle}</div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/40 font-black text-6xl italic leading-none">0{photos.length - unratedPhotos.length + 1}</div>
        </div>
      </div>
      <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-200/50 text-center space-y-8">
        <div className="space-y-2"><h3 className="text-2xl font-black tracking-tight">Rate this Face</h3><p className="text-zinc-500 font-medium">How would you rate the facial aesthetics from this angle?</p></div>
        <div className="flex items-center justify-center gap-2 md:gap-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} disabled={isSubmitting} className="group relative p-2 transition-transform hover:scale-110 active:scale-95 disabled:opacity-50">
              <Star className={cn("w-10 h-10 md:w-16 md:h-16 transition-all", (hoverRating || 0) >= star ? "text-amber-400 fill-amber-400" : "text-zinc-200")} />
            </button>
          ))}
        </div>
        <div className="pt-8 border-t border-zinc-50 flex items-center justify-center gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
          <div className="flex items-center gap-2"><Shuffle className="w-4 h-4" />Shuffled Order</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Auto-Save</div>
        </div>
      </div>
    </div>
  );
}

// --- Admin Panel Component ---
function AdminPanel({ profile }: { profile: UserProfile }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAngle, setNewAngle] = useState<'Front' | 'Left' | 'Right' | 'Top' | '45 degree'>('Front');
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubPhotos = onSnapshot(query(collection(db, 'photos'), orderBy('createdAt', 'desc')), (snapshot) => { setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Photo))); }, (error) => { handleFirestoreError(error, OperationType.LIST, 'photos'); });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => { setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile))); }, (error) => { handleFirestoreError(error, OperationType.LIST, 'users'); });
    const unsubRatings = onSnapshot(collection(db, 'ratings'), (snapshot) => { setRatings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating))); }, (error) => { handleFirestoreError(error, OperationType.LIST, 'ratings'); });
    return () => { unsubPhotos(); unsubUsers(); unsubRatings(); };
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile || !newName || isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const storageRef = ref(storage, `photos/${Date.now()}_${newFile.name}`);
      // Use uploadBytes for better compatibility, then simulate progress
      const interval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200);
      await uploadBytes(storageRef, newFile);
      clearInterval(interval);
      setUploadProgress(100);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'photos'), { name: newName, angle: newAngle, url, uploadedBy: profile.uid, createdAt: serverTimestamp() });
      setShowUploadModal(false); setNewName(''); setNewFile(null); setUploadProgress(0);
    } catch (err) { handleFirestoreError(err, OperationType.WRITE, 'photos'); } finally { setIsUploading(false); }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      const storageRef = ref(storage, photo.url);
      await deleteObject(storageRef).catch(e => console.warn('Storage delete failed:', e));
      await deleteDoc(doc(db, 'photos', photo.id));
    } catch (err) { handleFirestoreError(err, OperationType.DELETE, `photos/${photo.id}`); }
  };

  const exportToExcel = () => {
    const photoStats: Record<string, { total: number, count: number }> = {};
    ratings.forEach(r => { if (!photoStats[r.photoName]) photoStats[r.photoName] = { total: 0, count: 0 }; photoStats[r.photoName].total += r.rating; photoStats[r.photoName].count += 1; });
    const data = ratings.map(r => ({ Username: r.username, 'Celebrity Name': r.photoName, Angle: r.angle, Rating: r.rating, 'Average for Celebrity': (photoStats[r.photoName].total / photoStats[r.photoName].count).toFixed(2), 'Segment': (photoStats[r.photoName].total / photoStats[r.photoName].count) >= 4 ? 'Good' : (photoStats[r.photoName].total / photoStats[r.photoName].count) >= 2.5 ? 'Average' : 'Low' }));
    const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Ratings"); XLSX.writeFile(wb, "Face_Ratings_Report.xlsx");
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div><h2 className="text-4xl font-black tracking-tight">Admin Panel</h2><p className="text-zinc-500 font-medium">Manage users, photos, and ratings</p></div>
        <div className="flex items-center gap-3"><button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm"><FileSpreadsheet className="w-4 h-4 text-green-600" />Export Excel</button><button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"><Plus className="w-4 h-4" />Upload Photo</button></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
          {[{ label: 'Total Users', value: users.length, icon: <Users className="w-5 h-5" /> }, { label: 'Total Photos', value: photos.length, icon: <ImageIcon className="w-5 h-5" /> }, { label: 'Total Ratings', value: ratings.length, icon: <Star className="w-5 h-5" /> }].map((stat, i) => (
            <div key={i} className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between"><div><p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{stat.label}</p><p className="text-3xl font-black">{stat.value}</p></div><div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">{stat.icon}</div></div>
          ))}
        </div>
        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden h-fit"><div className="p-6 border-b border-zinc-50 bg-zinc-50/50"><h3 className="font-bold flex items-center gap-2"><Users className="w-4 h-4" />Recent Users</h3></div><div className="divide-y divide-zinc-50 max-h-[400px] overflow-y-auto">{users.map(u => (<div key={u.uid} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"><div><p className="text-sm font-bold">{u.username}</p><p className="text-xs text-zinc-400">{u.email}</p></div><span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 rounded-md">{u.role}</span></div>))}</div></div>
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-zinc-100 shadow-sm overflow-hidden"><div className="p-6 border-b border-zinc-50 bg-zinc-50/50 flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><ImageIcon className="w-4 h-4" />Manage Photos</h3></div><div className="grid sm:grid-cols-2 gap-4 p-6 max-h-[600px] overflow-y-auto">{photos.map(p => (<div key={p.id} className="group relative aspect-video rounded-2xl overflow-hidden border border-zinc-100"><img src={p.url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" /><div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity"><p className="text-sm font-bold">{p.name}</p><p className="text-[10px] uppercase tracking-widest opacity-80">{p.angle}</p></div><button onClick={() => handleDeletePhoto(p)} className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md text-white hover:bg-red-500 transition-colors rounded-xl opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button></div>))}</div></div>
      </div>
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUploadModal(false)} className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-zinc-100 flex items-center justify-between"><h3 className="text-2xl font-black tracking-tight">Upload New Photo</h3><button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X className="w-6 h-6" /></button></div>
              <form onSubmit={handleUpload} className="p-8 space-y-6">
                <div className="space-y-1.5"><label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Celebrity Name</label><input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium" placeholder="e.g. Brad Pitt" /></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Angle</label><select value={newAngle} onChange={(e) => setNewAngle(e.target.value as any)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-zinc-900 outline-none font-medium appearance-none">{['Front', 'Left', 'Right', 'Top', '45 degree'].map(a => (<option key={a} value={a}>{a}</option>))}</select></div>
                <div className="space-y-1.5"><label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Photo File</label><div className="relative group"><input type="file" required accept="image/*" onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" /><div className="w-full h-32 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-zinc-900 transition-colors bg-zinc-50"><Upload className="w-8 h-8 text-zinc-400 group-hover:text-zinc-900 transition-colors" /><p className="text-sm font-bold text-zinc-500">{newFile ? newFile.name : 'Click or drag to upload'}</p></div></div></div>
                <button type="submit" disabled={isUploading} className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 flex flex-col items-center justify-center gap-2 disabled:opacity-50">
                  {isUploading ? (<div className="w-full space-y-2 px-4"><div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Uploading {Math.round(uploadProgress)}%</span></div><div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden"><motion.div className="h-full bg-white" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} /></div></div>) : (<><div className="flex items-center gap-2"><Upload className="w-5 h-5" /><span>Upload to Database</span></div></>)}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- My Ratings Component ---
function MyRatings({ profile }: { profile: UserProfile }) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'ratings'), where('userId', '==', profile.uid), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => { setRatings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rating))); setLoading(false); }, (error) => { handleFirestoreError(error, OperationType.LIST, 'ratings'); });
    return () => unsubscribe();
  }, [profile.uid]);

  const handleUpdateRating = async (ratingId: string) => {
    try { await updateDoc(doc(db, 'ratings', ratingId), { rating: editValue, timestamp: serverTimestamp() }); setEditingId(null); } catch (err) { handleFirestoreError(err, OperationType.UPDATE, `ratings/${ratingId}`); }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div><h2 className="text-4xl font-black tracking-tight">My Ratings</h2><p className="text-zinc-500 font-medium">Review and update your facial aesthetic evaluations</p></div>
      <div className="grid gap-6">
        {ratings.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400"><ImageIcon className="w-8 h-8" /></div>
              <div><h3 className="font-bold text-lg">{r.photoName}</h3><div className="flex items-center gap-3 mt-1"><span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-100 rounded-md">{r.angle}</span><span className="flex items-center gap-1 text-xs text-zinc-400 font-medium"><Clock className="w-3 h-3" />{r.timestamp?.toDate().toLocaleDateString()}</span></div></div>
            </div>
            <div className="flex items-center gap-4">
              {editingId === r.id ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (<button key={star} onClick={() => setEditValue(star)} className="p-1"><Star className={cn("w-6 h-6", editValue >= star ? "text-amber-400 fill-amber-400" : "text-zinc-200")} /></button>))}
                  <button onClick={() => handleUpdateRating(r.id)} className="ml-2 p-2 bg-zinc-900 text-white rounded-xl"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-100 text-zinc-400 rounded-xl"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map(star => (<Star key={star} className={cn("w-5 h-5", r.rating >= star ? "text-amber-400 fill-amber-400" : "text-zinc-100")} />))}</div>
                  <button onClick={() => { setEditingId(r.id); setEditValue(r.rating); }} className="p-3 bg-zinc-50 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors rounded-2xl"><Edit2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          </div>
        ))}
        {ratings.length === 0 && <div className="text-center py-24 bg-white rounded-[3rem] border border-zinc-100 border-dashed"><p className="text-zinc-400 font-medium">You haven't rated any photos yet.</p></div>}
      </div>
    </div>
  );
}

// --- Main App Component ---
function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'auth' | 'rating' | 'admin' | 'my-ratings'>('landing');
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            if (firebaseUser.email === "252-15-974@diu.edu.bd" && profileData.role !== 'admin') profileData.role = 'admin';
            setProfile(profileData);
            if (profileData.role === 'admin') setView('admin'); else setView('rating');
          } else if (firebaseUser.email === "252-15-974@diu.edu.bd") {
            const adminProfile: UserProfile = { uid: firebaseUser.uid, username: 'Admin', email: firebaseUser.email, role: 'admin', createdAt: new Date() };
            setProfile(adminProfile); setView('admin');
          }
        } catch (error) { handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`); }
      } else { setProfile(null); setView('landing'); }
      setLoading(false);
    });
    const statsRef = doc(db, 'stats', 'summary');
    const unsubscribeStats = onSnapshot(statsRef, (doc) => { if (doc.exists()) setTotalUsers(doc.data().userCount || 0); }, (error) => { console.warn('Stats document not found or inaccessible'); });
    return () => { unsubscribe(); unsubscribeStats(); };
  }, []);

  const handleLogout = async () => { await signOut(auth); setView('landing'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900"></div></div>;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <Navbar view={view} setView={setView} user={user} profile={profile} handleLogout={handleLogout} totalUsers={totalUsers} />
      <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'landing' && <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}><LandingPage onStart={() => setView('auth')} /></motion.div>}
          {view === 'auth' && <motion.div key="auth" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}><Auth onAuthSuccess={() => {}} /></motion.div>}
          {view === 'rating' && user && profile && <motion.div key="rating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RatingSystem profile={profile} /></motion.div>}
          {view === 'my-ratings' && user && profile && <motion.div key="my-ratings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MyRatings profile={profile} /></motion.div>}
          {view === 'admin' && user && profile?.role === 'admin' && <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AdminPanel profile={profile} /></motion.div>}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
