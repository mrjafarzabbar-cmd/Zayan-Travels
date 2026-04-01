import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Search, 
  Compass, 
  Star, 
  ArrowRight, 
  Menu, 
  X, 
  MessageSquare, 
  Send,
  Loader2,
  ChevronRight,
  Globe,
  Shield,
  Clock,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { DESTINATIONS as STATIC_DESTINATIONS, Destination } from './constants';
import { getTravelAdvice } from './services/gemini';
import { cn } from './lib/utils';
import ReactMarkdown from 'react-markdown';

// Firebase Imports
import { auth, db } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from 'firebase/firestore';

// Error Handling Types
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, errorInfo: string | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-paper p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-serif mb-4 text-ink">Something went wrong</h2>
            <p className="text-ink/60 text-sm mb-6 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>
            <div className="bg-red-50 p-4 rounded-xl text-left mb-6 overflow-hidden">
              <p className="text-[10px] font-mono text-red-800 break-all">
                {this.state.errorInfo}
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-accent text-white px-8 py-3 rounded-full font-medium hover:bg-accent/90 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function MainApp() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);
      
      if (firebaseUser) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          let role = 'user';
          if (userSnap.exists()) {
            role = userSnap.data().role;
          } else {
            // Default admin check
            if (firebaseUser.email === 'mrjafarzabbar@gmail.com') {
              role = 'admin';
            }
            await setDoc(userRef, {
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              role: role
            });
          }
          setIsAdmin(role === 'admin');
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Destinations
  useEffect(() => {
    const path = 'destinations';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      if (snapshot.empty) {
        // If empty, seed with static data (only if admin or for demo)
        setDestinations(STATIC_DESTINATIONS);
      } else {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Destination));
        setDestinations(fetched);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  // Fetch All Bookings for Admin
  useEffect(() => {
    if (!isAdmin) return;
    
    const path = 'bookings';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllBookings(fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleBooking = async (dest: Destination) => {
    if (!user) {
      handleLogin();
      return;
    }

    setBookingStatus({ type: 'loading', message: 'Processing your booking...' });
    const path = 'bookings';
    
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        destinationId: dest.id,
        destinationName: dest.name,
        status: 'pending',
        createdAt: serverTimestamp(),
        totalPrice: dest.price
      });
      setBookingStatus({ type: 'success', message: `Successfully booked your trip to ${dest.name}!` });
      setTimeout(() => setBookingStatus(null), 5000);
    } catch (error) {
      setBookingStatus({ type: 'error', message: 'Failed to book trip. Please try again.' });
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    const path = `bookings/${bookingId}`;
    try {
      await setDoc(doc(db, 'bookings', bookingId), { status: newStatus }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    const path = `bookings/${bookingId}`;
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await getTravelAdvice(userMsg);
      setChatMessages(prev => [...prev, { role: 'ai', content: response || "I'm sorry, I couldn't process that. How else can I help you?" }]);
    } catch (error) {
      console.error(error);
      setChatMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Booking Status Toast */}
      <AnimatePresence>
        {bookingStatus && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-6"
          >
            <div className={cn(
              "p-4 rounded-2xl shadow-2xl flex items-center gap-3 border",
              bookingStatus.type === 'success' ? "bg-green-50 border-green-100 text-green-800" : 
              bookingStatus.type === 'error' ? "bg-red-50 border-red-100 text-red-800" : 
              "bg-white border-ink/5 text-ink"
            )}>
              {bookingStatus.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {bookingStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {bookingStatus.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-accent" />}
              <span className="text-sm font-medium">{bookingStatus.message}</span>
              {bookingStatus.type !== 'loading' && (
                <button onClick={() => setBookingStatus(null)} className="ml-auto">
                  <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 flex items-center justify-between",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-serif text-xl font-bold">Z</div>
          <span className={cn("text-2xl font-serif font-bold tracking-tight", scrolled ? "text-ink" : "text-white")}>
            Zayan <span className="font-light italic">Travels</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Destinations', 'Packages', 'About', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className={cn(
                "text-sm uppercase tracking-widest font-medium hover:text-accent transition-colors",
                scrolled ? "text-ink/70" : "text-white/80"
              )}
            >
              {item}
            </a>
          ))}
          
          {isAuthReady && (
            user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-white" />
                  )}
                  <span className={cn("text-xs font-medium", scrolled ? "text-ink" : "text-white")}>
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => setShowAdminPanel(true)}
                    className={cn("text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border transition-all", 
                      scrolled ? "border-accent text-accent hover:bg-accent hover:text-white" : "border-white text-white hover:bg-white hover:text-ink")}
                  >
                    Admin
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className={cn("hover:text-accent transition-colors", scrolled ? "text-ink" : "text-white")}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-accent text-white px-6 py-2 rounded-full text-sm uppercase tracking-widest font-medium hover:bg-accent/90 transition-all"
              >
                Login
              </button>
            )
          )}
        </div>

        <button className="md:hidden text-ink" onClick={() => setIsMenuOpen(true)}>
          <Menu className={scrolled ? "text-ink" : "text-white"} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white p-8 flex flex-col"
          >
            <div className="flex justify-end">
              <button onClick={() => setIsMenuOpen(false)}><X className="w-8 h-8" /></button>
            </div>
            <div className="flex flex-col gap-8 mt-12">
              {['Destinations', 'Packages', 'About', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-4xl font-serif"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              {!user && (
                <button 
                  onClick={() => { handleLogin(); setIsMenuOpen(false); }}
                  className="text-4xl font-serif text-accent text-left"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/80 uppercase tracking-[0.3em] text-sm mb-4"
          >
            Explore the Unexplored
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl text-white font-serif mb-8 leading-tight"
          >
            Journey Beyond <br /> <span className="italic font-light">Expectations</span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md p-2 rounded-full flex items-center max-w-2xl mx-auto border border-white/20"
          >
            <div className="flex-1 flex items-center px-6 gap-3">
              <Search className="text-white/60 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Where do you want to go?" 
                className="bg-transparent border-none outline-none text-white placeholder:text-white/60 w-full py-3"
              />
            </div>
            <button className="bg-white text-ink px-8 py-3 rounded-full font-medium hover:bg-accent hover:text-white transition-all flex items-center gap-2">
              Search <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-12 bg-white/40 mx-auto" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-paper border-b border-ink/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Destinations', value: '100+' },
            { label: 'Happy Travelers', value: '25k+' },
            { label: 'Expert Guides', value: '200+' },
            { label: 'Years Experience', value: '20+' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-serif text-accent mb-2">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-ink/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Destinations */}
      <section id="destinations" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-4">Curated Experiences</h2>
            <h3 className="text-5xl font-serif">Featured Destinations</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Adventure', 'Relaxation', 'Culture', 'Luxury', 'Family', 'Transport'].map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all",
                  selectedCategory === cat 
                    ? "bg-accent text-white" 
                    : "bg-paper text-ink/40 hover:bg-ink/5"
                )}
              >
                {cat === 'Transport' ? 'Cars' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations
            .filter(dest => selectedCategory === 'All' || dest.category === selectedCategory)
            .map((dest) => (
            <motion.div 
              key={dest.id}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold">
                  {dest.category}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleBooking(dest); }}
                    className="w-full bg-white text-ink py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-accent hover:text-white transition-colors"
                  >
                    Book Trip <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-2xl font-serif">{dest.name}</h4>
                <div className="text-accent font-medium">${dest.price}</div>
              </div>
              <div className="flex items-center gap-4 text-ink/50 text-sm">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {dest.country}</div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {dest.duration}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-24 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1000" 
                alt="Travel Experience" 
                className="rounded-3xl aspect-[3/4] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-3xl -z-10 hidden lg:block" />
            </div>
            
            <div>
              <h2 className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-6">Our Philosophy</h2>
              <h3 className="text-5xl font-serif mb-8 leading-tight">We Trips: Your Partner in Global Exploration</h3>
              <p className="text-white/60 mb-12 leading-relaxed text-lg">
                At Zayan Travels, we believe travel is more than just visiting a place—it's about the stories you bring back. Our "We Trips" initiative focuses on sustainable, community-driven tourism that respects local cultures and preserves natural wonders.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { icon: Globe, title: 'Global Network', desc: 'Partners in over 50 countries ensuring seamless travel.' },
                  { icon: Shield, title: 'Safe & Secure', desc: '24/7 support and comprehensive travel insurance.' },
                  { icon: Compass, title: 'Expert Guides', desc: 'Local experts who know the hidden gems.' },
                  { icon: Star, title: 'Premium Quality', desc: 'Handpicked accommodations and experiences.' },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <feature.icon className="text-accent w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl mb-1">{feature.title}</h4>
                      <p className="text-white/40 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-paper">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-4">Voices of Travelers</h2>
          <h3 className="text-5xl font-serif">Unforgettable Memories</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { name: 'Sarah Jenkins', role: 'Adventure Seeker', text: 'Zayan Travels organized the most incredible safari in Kenya. Every detail was perfect, from the lodges to our amazing guide.' },
            { name: 'David Chen', role: 'Culture Enthusiast', text: 'My trip to Kyoto was life-changing. The local experiences they curated were something I could never have found on my own.' },
            { name: 'Elena Rodriguez', role: 'Luxury Traveler', text: 'The Amalfi Coast package exceeded all expectations. True luxury combined with authentic Italian charm.' },
          ].map((t, i) => (
            <div key={i} className="bg-white p-10 rounded-3xl shadow-sm border border-ink/5">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-accent text-accent" />)}
              </div>
              <p className="text-ink/70 italic mb-8 leading-relaxed">"{t.text}"</p>
              <div>
                <div className="font-serif text-xl">{t.name}</div>
                <div className="text-xs uppercase tracking-widest text-ink/40">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Travel Gallery */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-sm uppercase tracking-[0.2em] text-accent font-semibold mb-4">Visual Journey</h2>
              <h3 className="text-5xl font-serif">Capture the Moment</h3>
            </div>
            <p className="max-w-md text-ink/60 leading-relaxed">
              A glimpse into the extraordinary landscapes and vibrant cultures our travelers experience every day.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&q=80&w=800',
              'https://images.unsplash.com/photo-1512100356956-c1227c3317bb?auto=format&fit=crop&q=80&w=800',
            ].map((img, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl aspect-square",
                  i === 1 || i === 6 ? "md:col-span-2 md:aspect-video" : ""
                )}
              >
                <img 
                  src={img} 
                  alt={`Gallery ${i}`} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-paper border-t border-ink/5 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-serif text-lg font-bold">Z</div>
                <span className="text-xl font-serif font-bold tracking-tight">Zayan Travels</span>
              </div>
              <p className="text-ink/50 text-sm leading-relaxed mb-6">
                Curating extraordinary journeys for the modern explorer. Discover the world with Zayan.
              </p>
              <div className="flex gap-4">
                {['fb', 'tw', 'ig', 'li'].map(s => (
                  <div key={s} className="w-8 h-8 rounded-full border border-ink/10 flex items-center justify-center text-ink/40 hover:border-accent hover:text-accent cursor-pointer transition-all text-xs uppercase font-bold">
                    {s}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-serif text-xl mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm text-ink/50">
                <li><a href="#" className="hover:text-accent transition-colors">Home</a></li>
                <li><a href="#destinations" className="hover:text-accent transition-colors">Destinations</a></li>
                <li><a href="#about" className="hover:text-accent transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Travel Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-serif text-xl mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-ink/50">
                <li><a href="#" className="hover:text-accent transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-serif text-xl mb-6">Newsletter</h4>
              <p className="text-sm text-ink/50 mb-4">Subscribe for travel inspiration and exclusive offers.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-white border border-ink/10 px-4 py-2 rounded-lg text-sm flex-1 outline-none focus:border-accent" />
                <button className="bg-ink text-white px-4 py-2 rounded-lg text-sm hover:bg-accent transition-all">Join</button>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-6 text-ink/30 text-xs uppercase tracking-widest font-medium">
            <div>© 2026 Zayan Travels. All rights reserved.</div>
            <div className="flex gap-8">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="bg-ink p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <Shield className="text-accent w-6 h-6" />
                  <h4 className="font-serif text-2xl">Admin Dashboard</h4>
                </div>
                <button onClick={() => setShowAdminPanel(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h5 className="text-xl font-serif">Manage All Bookings</h5>
                    <div className="text-xs uppercase tracking-widest text-ink/40 font-bold">
                      Total Bookings: {allBookings.length}
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'All', count: allBookings.length, status: 'all', color: 'bg-ink/5 text-ink' },
                      { label: 'Pending', count: allBookings.filter(b => b.status === 'pending').length, status: 'pending', color: 'bg-yellow-100 text-yellow-700' },
                      { label: 'Approved', count: allBookings.filter(b => b.status === 'approved').length, status: 'approved', color: 'bg-green-100 text-green-700' },
                      { label: 'Rejected', count: allBookings.filter(b => b.status === 'rejected').length, status: 'rejected', color: 'bg-red-100 text-red-700' }
                    ].map(stat => (
                      <button 
                        key={stat.label}
                        onClick={() => setAdminStatusFilter(stat.status as any)}
                        className={cn(
                          "p-4 rounded-2xl border transition-all text-left",
                          adminStatusFilter === stat.status ? "border-accent ring-2 ring-accent/20" : "border-ink/5 hover:border-ink/20",
                          stat.color
                        )}
                      >
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-1">{stat.label}</div>
                        <div className="text-2xl font-serif">{stat.count}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {allBookings.filter(b => adminStatusFilter === 'all' || b.status === adminStatusFilter).length === 0 ? (
                    <div className="text-center py-20 text-ink/30 italic">No {adminStatusFilter !== 'all' ? adminStatusFilter : ''} bookings found in the system.</div>
                  ) : (
                    allBookings
                      .filter(b => adminStatusFilter === 'all' || b.status === adminStatusFilter)
                      .map((booking) => (
                      <div key={booking.id} className="bg-paper p-6 rounded-2xl border border-ink/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                              "text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
                              booking.status === 'approved' ? "bg-green-100 text-green-700" :
                              booking.status === 'rejected' ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            )}>
                              {booking.status}
                            </span>
                            <span className="text-xs text-ink/40 font-mono">ID: {booking.id.slice(0, 8)}...</span>
                          </div>
                          <h6 className="text-lg font-serif mb-1">{booking.destinationName}</h6>
                          <div className="flex flex-wrap gap-4 text-sm text-ink/60">
                            <div className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {booking.userName || 'Anonymous'} ({booking.userEmail})</div>
                            <div className="flex items-center gap-1"><Star className="w-3 h-3" /> ${booking.totalPrice}</div>
                            <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {booking.createdAt?.toDate().toLocaleDateString()}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {booking.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => updateBookingStatus(booking.id, 'approved')}
                                className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(booking.id, 'rejected')}
                                className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => updateBookingStatus(booking.id, 'pending')}
                              className="text-ink/40 hover:text-ink text-xs font-bold transition-colors"
                            >
                              Reset to Pending
                            </button>
                          )}
                          <button 
                            onClick={() => deleteBooking(booking.id)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gemini Assistant Toggle */}
      <button 
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-8 right-8 z-[70] bg-accent text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform group"
      >
        <MessageSquare className="w-7 h-7" />
        <div className="absolute right-full mr-4 bg-white text-ink px-4 py-2 rounded-xl text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-ink/5">
          Plan your trip with AI
        </div>
      </button>

      {/* Gemini Assistant Modal */}
      <AnimatePresence>
        {isAssistantOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-accent p-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl leading-none mb-1">Zayan AI Assistant</h4>
                    <p className="text-white/60 text-xs uppercase tracking-widest">Powered by Gemini</p>
                  </div>
                </div>
                <button onClick={() => setIsAssistantOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-paper/50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="text-accent w-8 h-8" />
                    </div>
                    <h5 className="font-serif text-2xl mb-2">Where to next?</h5>
                    <p className="text-ink/50 text-sm max-w-xs mx-auto">
                      Tell me about your dream vacation, budget, or interests and I'll find the perfect package for you.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                      {['Adventure in Alps', 'Relax in Bali', 'Culture in Kyoto'].map(suggestion => (
                        <button 
                          key={suggestion}
                          onClick={() => {
                            setChatInput(suggestion);
                          }}
                          className="text-xs bg-white border border-ink/10 px-4 py-2 rounded-full hover:border-accent hover:text-accent transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-accent text-white rounded-tr-none" 
                        : "bg-white text-ink shadow-sm border border-ink/5 rounded-tl-none markdown-body"
                    )}>
                      {msg.role === 'ai' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-ink/5 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      <span className="text-xs text-ink/40 uppercase tracking-widest font-bold">Zayan is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-ink/5 flex gap-3">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about destinations, prices, or advice..."
                  className="flex-1 bg-paper border border-ink/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="bg-accent text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-accent/90 transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
