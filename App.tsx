
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Briefcase, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus,
  ArrowRight,
  Brain,
  Search,
  Clock,
  User as UserIcon,
  Shield,
  BarChart3,
  Trash2,
  MoreVertical,
  ShieldAlert,
  UserPlus,
  Sun,
  Moon,
  Cpu,
  Zap,
  Filter,
  RefreshCcw,
  Download,
  ExternalLink,
  BookOpen,
  Tag,
  Star,
  Trophy,
  Edit3
} from 'lucide-react';

import { UserRole, UserProfile, AuthState, Project, Resource, Challenge, ClubEvent } from './types';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_RESOURCES } from './services/mockData';

// --- Theme Management ---
const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({ isDark: true, toggleTheme: () => {} });

const useTheme = () => useContext(ThemeContext);

// --- Auth Context ---
const AuthContext = createContext<{
  authState: AuthState;
  login: (email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
} | undefined>(undefined);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- Reusable UI Components ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }> = ({ 
  children, className = '', variant = 'primary', size = 'md', ...props 
}) => {
  const variants = {
    primary: 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.3)]',
    secondary: 'bg-amber-500 text-navy-950 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold',
    outline: 'border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-cyan-50 dark:hover:bg-cyan-950/30 text-slate-700 dark:text-slate-300',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };
  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base font-semibold'
  };
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-full font-mono transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: React.ElementType }> = ({ label, icon: Icon, className = '', ...props }) => (
  <div className="w-full space-y-1.5">
    {label && <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono ml-2">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </div>
      )}
      <input 
        className={`w-full ${Icon ? 'pl-11' : 'px-5'} py-2.5 border border-slate-300 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white dark:bg-navy-900 dark:text-white font-mono text-sm ${className}`}
        {...props}
      />
    </div>
  </div>
);

const Badge: React.FC<{ children: React.ReactNode, variant?: 'cyan' | 'gold' | 'navy' | 'slate' | 'red' }> = ({ children, variant = 'slate' }) => {
  const colors = {
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800',
    gold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    navy: 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono ${colors[variant]}`}>{children}</span>;
};

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-navy-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

// --- Layout Wrapper ---
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!authState.user) return <>{children}</>;

  const menuItems = [
    { label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { label: 'Events', icon: Calendar, path: '/events' },
    { label: 'Projects', icon: Briefcase, path: '/projects' },
    { label: 'Challenges', icon: Trophy, path: '/challenges' },
    { label: 'Resources', icon: FileText, path: '/resources' },
    { label: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  if (authState.user.role === UserRole.ADMIN) {
    menuItems.push({ label: 'Admin Panel', icon: Shield, path: '/admin' });
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-navy-950 transition-colors duration-500">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full tech-grid">
          <div className="flex items-center justify-between p-6 h-16 border-b border-slate-100 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2 font-black text-xl tracking-tighter text-navy-950 dark:text-white">
              <div className="w-8 h-8 bg-cyan-600 rounded-xl flex items-center justify-center glow-cyan">
                <Brain size={20} className="text-white" />
              </div>
              <span>STAHIZA ICT HUB</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-cyan-600">
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group font-mono text-sm tracking-tight
                  ${location.pathname === item.path 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20'}
                `}
              >
                <item.icon size={18} className={location.pathname === item.path ? 'text-white' : 'group-hover:text-cyan-600'} />
                <span className="font-bold uppercase text-[11px] tracking-widest">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 px-3 py-4 mb-4 bg-slate-50 dark:bg-navy-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <img 
                src={authState.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authState.user.full_name)}`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-xl border-2 border-cyan-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate text-navy-950 dark:text-white uppercase tracking-tight">{authState.user.full_name}</p>
                <p className="text-[10px] text-amber-500 truncate font-black uppercase tracking-widest">{authState.user.role}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-500 transition-colors font-mono text-xs font-black uppercase tracking-widest"
            >
              <LogOut size={16} />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-30 transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-navy-950 dark:text-white">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
               <Cpu size={20} className="text-cyan-600" />
               <h1 className="text-sm font-black text-navy-950 dark:text-white uppercase tracking-widest font-mono">
                {menuItems.find(i => i.path === location.pathname)?.label || 'Core System'}
               </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
             <button className="p-2 text-slate-400 hover:text-cyan-600 transition-colors relative">
               <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
               <Calendar size={18} />
             </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 tech-grid">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Pages ---

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 overflow-x-hidden transition-colors duration-500">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-2xl text-navy-950 dark:text-white tracking-tighter">
            <Brain size={28} className="text-cyan-600" />
            <span>STAHIZA ICT HUB</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-slate-600 dark:text-slate-400 font-mono text-xs font-bold uppercase tracking-widest">
            <a href="#about" className="hover:text-cyan-600 transition-colors">// About</a>
            <a href="#events" className="hover:text-cyan-600 transition-colors">// Events</a>
            <a href="#projects" className="hover:text-cyan-600 transition-colors">// Projects</a>
            <ThemeToggle />
          </div>
          <Link to="/auth">
            <Button variant="primary">Access System</Button>
          </Link>
        </div>
      </nav>
      <section className="pt-32 pb-20 px-6 tech-grid">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-200 dark:border-cyan-800 font-mono">
              <Zap size={12} className="text-amber-500 animate-pulse" />
              Node: Active Innovation
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-navy-950 dark:text-white leading-[1] tracking-tighter uppercase">
              Engineer the <span className="text-cyan-600">Future</span> of <span className="text-amber-500">Technology</span>.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
              Join the elite circle of campus innovators. Build complex systems, master modern stacks, and lead the technical revolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Initiate Membership <ArrowRight size={20} />
                </Button>
              </Link>
              <a href="#about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-cyan-200 dark:border-cyan-900">Research Hub</Button>
              </a>
            </div>
          </div>
          <div className="relative animate-in zoom-in duration-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-amber-500 opacity-20 blur-3xl rounded-full"></div>
            <div className="relative rounded-3xl overflow-hidden border-2 border-navy-950 dark:border-white shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/cyber/800/600" 
                  alt="Tech" 
                  className="w-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-navy-950/20 mix-blend-overlay"></div>
            </div>
          </div>
        </div>
      </section>
      <section id="about" className="py-24 px-6 bg-white dark:bg-navy-900 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-1 bg-cyan-600"></div>
              <h2 className="text-4xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">The Research Hub</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Our Research Hub is the central nervous system of STAHIZA ICT HUB. It houses a vast library of technical documentation, research papers, and workshop materials curated by our elite members.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <FileText className="text-cyan-600 mb-2" size={24} />
                  <h4 className="font-black text-navy-950 dark:text-white text-xs uppercase tracking-widest">Documentation</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Deep dives into modern architectures.</p>
                </div>
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <BookOpen className="text-amber-500 mb-2" size={24} />
                  <h4 className="font-black text-navy-950 dark:text-white text-xs uppercase tracking-widest">Case Studies</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Real-world system implementations.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <img src="https://picsum.photos/seed/research1/400/400" className="rounded-2xl grayscale hover:grayscale-0 transition-all" alt="Research" referrerPolicy="no-referrer" />
              <img src="https://picsum.photos/seed/research2/400/400" className="rounded-2xl grayscale hover:grayscale-0 transition-all mt-8" alt="Research" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>
      <footer className="py-12 bg-navy-950 text-slate-400 border-t border-slate-800 font-mono text-[10px]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-black text-xl text-white tracking-tighter">
            <Brain size={24} className="text-cyan-400" />
            <span>STAHIZA ICT HUB</span>
          </div>
          <div className="flex gap-8 uppercase tracking-widest font-black">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Protocol</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Secure Contact</a>
          </div>
          <p className="opacity-50">© 2024 STAHIZA ICT HUB CORE REPOSITORY. v2.5.0-STABLE</p>
        </div>
      </footer>
    </div>
  );
};

const AuthPage = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-navy-950 tech-grid">
      <Card className="w-full max-w-md p-8 border-t-4 border-t-cyan-600">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 dark:bg-cyan-950 text-cyan-600 rounded-2xl mb-4">
            <Cpu size={28} />
          </div>
          <h1 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">{isLogin ? 'Identity Verification' : 'User Registration'}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-widest mt-2">{isLogin ? 'Login to Secure Node' : 'Initialize New Account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="System Identifier (Email)" 
            type="email" 
            placeholder="member_id@ict.hub" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Security Token (Password)" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
          <Button className="w-full" variant="primary" size="lg">
            {isLogin ? 'Verify Identity' : 'Create Profile'}
          </Button>
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-mono"><span className="px-2 bg-white dark:bg-navy-900 text-slate-400">OR</span></div>
          </div>
          <Button className="w-full" variant="outline" type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Request Access' : 'Switch to Login'}
          </Button>
        </form>
        <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Demo: admin@ictclub.com | sarah@ictclub.com</p>
        </div>
      </Card>
    </div>
  );
};

const DashboardPage = () => {
  const { authState } = useAuth();
  const [stats, setStats] = useState({
    events: 0,
    projects: 0,
    users: 0,
    rank: 'B-04'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then(res => res.json()),
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ]).then(([events, projects, users]) => {
      setStats({
        events: events.length,
        projects: projects.length,
        users: users.length,
        rank: authState.user?.role === UserRole.ADMIN ? 'S-01' : 'B-04'
      });
      setLoading(false);
    });
  }, [authState.user]);

  const user = authState.user;
  if (!user) return null;
  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Synchronizing Terminal...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <section className="bg-navy-950 dark:bg-navy-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-l-8 border-amber-500 tech-grid">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/50 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-800 font-mono">
                Status: Connection Stable
              </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Greetings, Engineer {user.full_name.split(' ')[0]}</h2>
          <p className="text-cyan-100/70 text-base font-mono max-w-2xl">Terminal synchronized. You have {stats.events} active events and {stats.projects} projects currently in your sector.</p>
          <div className="pt-2">
            <Link to="/events">
              <Button variant="secondary" size="md" className="gap-2">
                View Command Center <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 p-8 hidden lg:block opacity-20">
          <Cpu size={180} className="text-white rotate-12" />
        </div>
      </section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        {[
          { label: 'Active Events', value: stats.events.toString().padStart(2, '0'), icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Node Projects', value: stats.projects.toString().padStart(2, '0'), icon: Briefcase, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Registry Count', value: stats.users.toString(), icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'System Rank', value: stats.rank, icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 group border-b-2 border-b-transparent hover:border-b-cyan-500 transition-all rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} glow-cyan`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-cyan-600 uppercase">Syncing...</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
            <p className="text-3xl font-black text-navy-950 dark:text-white mt-1 tracking-tighter">{stat.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-600"></div>
                <h3 className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-[0.3em] font-mono">Neural Library</h3>
             </div>
            <Link to="/resources" className="text-cyan-600 text-[10px] font-black uppercase tracking-widest hover:underline font-mono">All Files</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="group cursor-pointer overflow-hidden border-navy-950/10 dark:border-white/5">
              <div className="h-40 overflow-hidden relative">
                <img src="https://picsum.photos/seed/tech1/400/200" className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-transparent"></div>
                <div className="absolute bottom-4 left-4"><Badge variant="cyan">Mastery</Badge></div>
              </div>
              <div className="p-5 space-y-2">
                <h4 className="font-black text-navy-950 dark:text-white uppercase tracking-tight text-sm">Kubernetes Orchestration 101</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">Master the art of containerization and cluster management for high availability systems.</p>
              </div>
            </Card>
            <Card className="group cursor-pointer overflow-hidden border-navy-950/10 dark:border-white/5">
              <div className="h-40 overflow-hidden relative">
                <img src="https://picsum.photos/seed/tech2/400/200" className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-transparent"></div>
                <div className="absolute bottom-4 left-4"><Badge variant="gold">Active</Badge></div>
              </div>
              <div className="p-5 space-y-2">
                <h4 className="font-black text-navy-950 dark:text-white uppercase tracking-tight text-sm">Autonomous Drone Swarm Project</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">Collaborative effort in developing localized swarm intelligence for monitoring.</p>
              </div>
            </Card>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-amber-500"></div>
            <h3 className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-[0.3em] font-mono">Event Log</h3>
          </div>
          <Card className="divide-y divide-slate-100 dark:divide-slate-800 border-l-4 border-l-cyan-600 bg-white/50 dark:bg-navy-900/30">
            {[
              { title: 'Cybersecurity Sync', time: 'T-Minus 12h', type: 'Brief' },
              { title: 'Mainframe Migration', time: 'In Progress', type: 'Core' },
              { title: 'Project Zero-One', time: 'Friday 2000h', type: 'Demo' },
            ].map((item, i) => (
              <div key={i} className="p-4 flex items-start gap-4 hover:bg-cyan-600/5 transition-all group">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-600 animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-tight">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-black flex items-center gap-1 mt-1 font-mono uppercase">
                    <Clock size={10} /> {item.time}
                  </p>
                </div>
                <Badge variant={item.type === 'Brief' ? 'navy' : 'gold'}>{item.type}</Badge>
              </div>
            ))}
          </Card>
          <Button variant="outline" className="w-full uppercase text-[10px] font-black tracking-widest border-dashed">
            View Archives
          </Button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { authState, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ ...authState.user });
  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authState.user) {
      setProfileData({ ...authState.user });
    }
  }, [authState.user]);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile(profileData as any);
    setIsSaving(false);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills?.includes(newSkill.trim())) {
      setProfileData({ ...profileData, skills: [...(profileData.skills || []), newSkill.trim()] } as any);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData({ ...profileData, skills: profileData.skills?.filter(s => s !== skill) } as any);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatar_url: reader.result as string } as any);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <Card className="mb-8 border-none overflow-hidden shadow-2xl">
        <div className="h-48 bg-gradient-to-r from-navy-950 via-cyan-900 to-blue-950 relative tech-grid border-b border-white/10">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
              <img 
                src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.full_name || '')}`} 
                alt="Profile" 
                className="w-32 h-32 rounded-3xl border-4 border-white dark:border-navy-900 shadow-2xl bg-white object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-navy-950/60 text-white flex flex-col items-center justify-center transition-opacity rounded-3xl p-2 cursor-pointer group-hover:opacity-100 opacity-0">
                  <Cpu size={24} className="mb-2 animate-pulse" />
                  <p className="text-[10px] font-black uppercase text-center">Upload New Bio-Metric Image</p>
                  <input 
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4"><Badge variant="gold">Level 2 Specialist</Badge></div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-navy-900 transition-colors">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2 max-w-md">
                <Input 
                  label="Full Name" 
                  value={profileData.full_name || ''} 
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value} as any)}
                />
                <Input 
                  label="Username" 
                  value={profileData.username || ''} 
                  onChange={(e) => setProfileData({...profileData, username: e.target.value} as any)}
                />
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black text-navy-950 dark:text-white tracking-tighter uppercase font-mono">{authState.user?.full_name}</h2>
                <p className="text-cyan-600 font-mono text-sm font-black uppercase tracking-widest">@{authState.user?.username}</p>
              </>
            )}
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-2 font-mono text-xs uppercase tracking-widest font-black">
              <Shield size={16} className="text-cyan-600" />
              <span>Identity Type: <span className="text-amber-500">{authState.user?.role}</span></span>
              <span className="opacity-20">|</span>
              <span>Registry: {authState.user?.joined_at}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant={isEditing ? "outline" : "primary"} 
              onClick={() => {
                if (isEditing) setProfileData({...authState.user});
                setIsEditing(!isEditing);
              }}
              disabled={isSaving}
            >
              {isEditing ? 'Discard' : 'Edit Profile'}
            </Button>
            {isEditing && (
              <Button variant="secondary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Syncing...' : 'Verify Changes'}
              </Button>
            )}
          </div>
        </div>
      </Card>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-6 border-l-4 border-cyan-600">
            <h3 className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-[0.3em] font-mono mb-4 flex items-center gap-2">
              <UserIcon size={16} className="text-cyan-600" /> User Manifest
            </h3>
            {isEditing ? (
              <textarea 
                className="w-full h-32 p-3 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-navy-950 dark:text-white font-mono text-sm outline-none focus:ring-1 focus:ring-cyan-600"
                value={profileData.bio || ''}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value} as any)}
              />
            ) : (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium font-mono text-sm">{authState.user?.bio || "No data available in manifest."}</p>
            )}
          </Card>
          <Card className="p-6 border-l-4 border-amber-500">
            <h3 className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-[0.3em] font-mono mb-4 flex items-center gap-2">
              <Briefcase size={16} className="text-amber-500" /> Operation Logs
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Project Delta-Sync', role: 'Architect', status: 'Inbound' },
                { title: 'Hardware Security Layer', role: 'Audit', status: 'Closed' },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-950/50 border border-slate-200 dark:border-slate-800 rounded group hover:border-cyan-500/50 transition-all">
                  <div>
                    <p className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-tight">{act.title}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase font-mono">{act.role}</p>
                  </div>
                  <Badge variant={act.status === 'Inbound' ? 'cyan' : 'gold'}>{act.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-8">
          <Card className="p-6">
            <h3 className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-[0.3em] font-mono mb-6">Stack Specs</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {(isEditing ? profileData.skills : authState.user?.skills)?.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400 text-[10px] font-black uppercase font-mono border border-cyan-200 dark:border-cyan-800">
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500 ml-1">
                      <X size={10} />
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input 
                  placeholder="New Spec..." 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button variant="outline" onClick={addSkill} className="shrink-0 text-[10px] px-2 uppercase">Inject</Button>
              </div>
            )}
          </Card>
          <Card className="p-6 bg-navy-950 dark:bg-black text-white border-none shadow-xl glow-cyan">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-4">Core Standing</h3>
            <div className="space-y-5">
              <div className="flex justify-between text-[10px] font-black uppercase font-mono tracking-widest">
                <span className="text-cyan-100 opacity-60">System Sync</span>
                <span className="text-amber-500">92%</span>
              </div>
              <div className="w-full h-1 bg-navy-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-[92%] shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
              </div>
              <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest leading-relaxed">Account status is currently optimized for development nodes.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const { authState } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Accessing Event Registry...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></div>
              <h2 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">System Operations</h2>
           </div>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Synchronized Global Event Registry</p>
        </div>
        {authState.user?.role !== UserRole.MEMBER && (
          <Button variant="secondary" className="gap-2"><Plus size={16} /> Schedule Operation</Button>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="group overflow-hidden border-b-4 border-b-transparent hover:border-b-amber-500">
            <div className="h-44 overflow-hidden relative">
              <img src={event.image_url || `https://picsum.photos/seed/${event.id}/400/200`} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={event.title} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-navy-950/30"></div>
            </div>
            <div className="p-6 space-y-4 bg-white dark:bg-navy-900 transition-colors">
              <h3 className="text-lg font-black text-navy-950 dark:text-white uppercase tracking-tight">{event.title}</h3>
              <div className="space-y-2 text-[10px] text-slate-500 dark:text-slate-400 font-black font-mono uppercase tracking-widest">
                <p className="flex items-center gap-2"><Calendar size={14} className="text-cyan-600" /> {new Date(event.date).toLocaleDateString()}</p>
                <p className="flex items-center gap-2"><Clock size={14} className="text-cyan-600" /> {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} HRS</p>
                <p className="flex items-center gap-2"><Users size={14} className="text-cyan-600" /> {event.location}</p>
              </div>
              <Button 
                variant="primary" 
                className="w-full uppercase text-[10px] tracking-widest font-black"
              >
                Register Deployment
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProjectsPage = () => {
  const { authState } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    tech_stack: '',
    lead_id: authState.user?.id || ''
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/projects').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ]).then(([projectsData, usersData]) => {
      setProjects(projectsData);
      setUsers(usersData);
      setLoading(false);
    });
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const project = {
      title: newProject.title,
      description: newProject.description,
      tech_stack: newProject.tech_stack.split(',').map(s => s.trim()).filter(s => s !== ''),
      status: 'active',
      lead_id: newProject.lead_id,
      created_at: new Date().toISOString().split('T')[0],
      members: [newProject.lead_id]
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      const saved = await res.json();
      setProjects([saved, ...projects]);
      setShowCreateForm(false);
      setNewProject({ title: '', description: '', tech_stack: '', lead_id: authState.user?.id || '' });
    } catch (err) {
      alert("Failed to initialize project");
    }
  };

  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Scanning Project Nodes...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></div>
              <h2 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Project Nodes</h2>
           </div>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Active Technical Initiatives Registry</p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? <X size={16} /> : <Plus size={16} />} 
          {showCreateForm ? 'Cancel Operation' : 'Initialize Project'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 border-t-4 border-t-amber-500 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                label="Project Title" 
                placeholder="e.g., Neural Network Optimizer" 
                required 
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              />
              <div className="w-full space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Project Lead</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white dark:bg-navy-900 dark:text-white font-mono text-sm"
                  value={newProject.lead_id}
                  onChange={(e) => setNewProject({...newProject, lead_id: e.target.value})}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <Input 
              label="Tech Stack (comma separated)" 
              placeholder="React, TypeScript, Tailwind" 
              required 
              value={newProject.tech_stack}
              onChange={(e) => setNewProject({...newProject, tech_stack: e.target.value})}
            />
            <div className="w-full space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Description</label>
              <textarea 
                className="w-full h-24 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-3xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white dark:bg-navy-900 dark:text-white font-mono text-sm"
                placeholder="Detailed project objectives and scope..."
                required
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              />
            </div>
            <Button type="submit" className="w-full">Commit Project to Registry</Button>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const lead = users.find(u => u.id === project.lead_id);
          return (
            <Card key={project.id} className="p-6 flex flex-col justify-between border-l-4 border-l-cyan-600">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-black text-navy-950 dark:text-white uppercase tracking-tight">{project.title}</h3>
                  <Badge variant={project.status === 'active' ? 'cyan' : project.status === 'completed' ? 'gold' : 'slate'}>
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium line-clamp-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase font-mono border border-slate-200 dark:border-slate-700">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={lead?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead?.full_name || '')}`} 
                    className="w-6 h-6 rounded border border-cyan-600"
                    alt="Lead"
                  />
                  <div className="text-[10px] font-black uppercase tracking-widest font-mono">
                    <p className="text-slate-400">Lead</p>
                    <p className="text-navy-950 dark:text-white">{lead?.full_name}</p>
                  </div>
                </div>
                <div className="text-right text-[10px] font-black uppercase tracking-widest font-mono">
                  <p className="text-slate-400">Created</p>
                  <p className="text-navy-950 dark:text-white">{project.created_at}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        setChallenges(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Loading Challenges...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="text-amber-500" size={24} />
          <h2 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Skill Challenges</h2>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Prove your technical superiority</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="p-6 flex flex-col justify-between hover:border-cyan-500 transition-all group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <Badge variant={challenge.difficulty === 'hard' ? 'red' : challenge.difficulty === 'medium' ? 'gold' : 'cyan'}>
                  {challenge.difficulty}
                </Badge>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase font-mono">Points</p>
                  <p className="text-lg font-black text-navy-950 dark:text-white leading-none">{challenge.points}</p>
                </div>
              </div>
              <h3 className="text-xl font-black text-navy-950 dark:text-white uppercase tracking-tight group-hover:text-cyan-600 transition-colors">{challenge.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium line-clamp-3">{challenge.description}</p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest font-mono">
                <p className="text-slate-400">Deadline</p>
                <p className="text-navy-950 dark:text-white">{challenge.deadline}</p>
              </div>
              <Button size="sm" className="text-[10px] font-black uppercase tracking-widest">Accept Mission</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ResourcesPage = () => {
  const { authState } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    category: 'Development',
    file_url: '',
    file_type: 'link' as const
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/resources').then(res => res.json()),
      fetch('/api/users').then(res => res.json())
    ]).then(([resourcesData, usersData]) => {
      setResources(resourcesData);
      setUsers(usersData);
      setLoading(false);
    });
  }, []);

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [resources, searchTerm, selectedCategory]);

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const resource = {
      title: newResource.title,
      description: newResource.description,
      category: newResource.category,
      file_url: newResource.file_url,
      file_type: newResource.file_type,
      uploaded_by: authState.user?.id || 'unknown',
      created_at: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resource)
      });
      const saved = await res.json();
      setResources([saved, ...resources]);
      setShowAddForm(false);
      setNewResource({ title: '', description: '', category: 'Development', file_url: '', file_type: 'link' });
    } catch (err) {
      alert("Failed to inject resource");
    }
  };

  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Accessing Neural Library...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse"></div>
              <h2 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Research Hub</h2>
           </div>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Neural Library & Technical Documentation</p>
        </div>
        <Button variant="secondary" className="gap-2" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <X size={16} /> : <Plus size={16} />} 
          {showAddForm ? 'Cancel Upload' : 'Inject Resource'}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search library..." 
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-mono text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedCategory === cat 
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/20' 
                : 'bg-white dark:bg-navy-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showAddForm && (
        <Card className="p-6 border-t-4 border-t-amber-500 animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddResource} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                label="Resource Title" 
                placeholder="e.g., Advanced React Patterns" 
                required 
                value={newResource.title}
                onChange={(e) => setNewResource({...newResource, title: e.target.value})}
              />
              <div className="w-full space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Category</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white dark:bg-navy-900 dark:text-white font-mono text-sm"
                  value={newResource.category}
                  onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                >
                  <option value="Development">Development</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Research">Research</option>
                  <option value="Design">Design</option>
                  <option value="Security">Security</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input 
                label="Resource URL" 
                placeholder="https://..." 
                required 
                value={newResource.file_url}
                onChange={(e) => setNewResource({...newResource, file_url: e.target.value})}
              />
              <div className="w-full space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white dark:bg-navy-900 dark:text-white font-mono text-sm"
                  value={newResource.file_type}
                  onChange={(e) => setNewResource({...newResource, file_type: e.target.value as any})}
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video Lecture</option>
                  <option value="link">External Link</option>
                </select>
              </div>
            </div>
            <div className="w-full space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Description</label>
              <textarea 
                className="w-full h-24 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-3xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white dark:bg-navy-900 dark:text-white font-mono text-sm"
                placeholder="Brief summary of the resource content..."
                required
                value={newResource.description}
                onChange={(e) => setNewResource({...newResource, description: e.target.value})}
              />
            </div>
            <Button type="submit" className="w-full">Commit Resource to Library</Button>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const uploader = users.find(u => u.id === resource.uploaded_by);
          return (
            <Card key={resource.id} className="group hover:border-cyan-500 transition-all duration-300 flex flex-col">
              <div className="p-6 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-navy-800 text-cyan-600`}>
                    {resource.file_type === 'pdf' ? <FileText size={20} /> : 
                     resource.file_type === 'video' ? <BookOpen size={20} /> : <ExternalLink size={20} />}
                  </div>
                  <Badge variant="slate">{resource.category}</Badge>
                </div>
                <div>
                  <h3 className="text-lg font-black text-navy-950 dark:text-white uppercase tracking-tight group-hover:text-cyan-600 transition-colors">{resource.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 line-clamp-3">{resource.description}</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-navy-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-[9px] font-black uppercase tracking-widest font-mono">
                    <p className="text-slate-400">By {uploader?.full_name || 'System'}</p>
                    <p className="text-slate-400 opacity-50">{resource.created_at}</p>
                  </div>
                </div>
                <a 
                  href={resource.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-950/30 rounded-full transition-all"
                >
                  <Download size={16} />
                </a>
              </div>
            </Card>
          );
        })}
      </div>
      
      {filteredResources.length === 0 && (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700 opacity-50" />
          <p className="text-slate-500 dark:text-slate-400 font-mono text-xs font-black uppercase tracking-widest">No resources found in this sector.</p>
        </div>
      )}
    </div>
  );
};

const AdminPanelPage = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'projects' | 'challenges'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, eRes, pRes, cRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/events'),
          fetch('/api/projects'),
          fetch('/api/challenges')
        ]);
        const [uData, eData, pData, cData] = await Promise.all([
          uRes.json(),
          eRes.json(),
          pRes.json(),
          cRes.json()
        ]);
        setUsers(uData);
        setEvents(eData);
        setProjects(pData);
        setChallenges(cData);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const lowerSearch = searchTerm.toLowerCase();
      // Search by name, email, OR exact/partial ID
      const matchesSearch = 
        user.full_name.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch) ||
        user.username?.toLowerCase().includes(lowerSearch) ||
        user.id.toLowerCase() === lowerSearch || 
        user.id.toLowerCase().includes(lowerSearch);

      // Joined date logic
      const userDate = new Date(user.joined_at);
      const isAfterStart = startDate ? userDate >= new Date(startDate) : true;
      // Inclusive end date (end of day)
      const isBeforeEnd = endDate ? userDate <= new Date(`${endDate}T23:59:59`) : true;

      return matchesSearch && isAfterStart && isBeforeEnd;
    });
  }, [users, searchTerm, startDate, endDate]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleDeactivate = async (userId: string) => {
    if (window.confirm('Confirm permanent deactivation for this user record?')) {
      try {
        await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err) {
        alert("Failed to deactivate user");
      }
    }
  };

  const handleRateUser = async (userId: string, rating: number) => {
    try {
      const res = await fetch(`/api/users/${userId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      const updatedUser = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      alert("Failed to rate user");
    }
  };

  const handleAddChallenge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newChallenge = {
      title: formData.get('title'),
      description: formData.get('description'),
      difficulty: formData.get('difficulty'),
      points: Number(formData.get('points')),
      deadline: formData.get('deadline'),
      created_at: new Date().toISOString().split('T')[0],
      created_by: '1'
    };

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChallenge)
      });
      const saved = await res.json();
      setChallenges(prev => [...prev, saved]);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert("Failed to add challenge");
    }
  };

  const handleUpdateEvent = async (eventId: string, updates: Partial<ClubEvent>) => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setEvents(prev => prev.map(e => e.id === eventId ? updated : e));
    } catch (err) {
      alert("Failed to update event");
    }
  };

  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    } catch (err) {
      alert("Failed to update project");
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  const roleStats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === UserRole.ADMIN).length,
      board: users.filter(u => u.role === UserRole.BOARD).length,
      members: users.filter(u => u.role === UserRole.MEMBER).length,
    };
  }, [users]);

  if (loading) return <div className="p-12 text-center font-mono animate-pulse">Accessing Secure Database...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Command Center</h2>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Administrative Override Interface</p>
        </div>
        <div className="flex gap-2">
          {['users', 'events', 'projects', 'challenges'].map((tab) => (
            <Button 
              key={tab}
              variant={activeTab === tab ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab as any)}
              className="uppercase text-[10px] font-black tracking-widest"
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {[
              { label: 'Active Fleet', value: roleStats.total, color: 'text-navy-950 dark:text-white', bg: 'bg-slate-100 dark:bg-navy-800' },
              { label: 'Commanders', value: roleStats.admins, color: 'text-cyan-500', bg: 'bg-cyan-500/10 border border-cyan-500/30' },
              { label: 'Officers', value: roleStats.board, color: 'text-amber-500', bg: 'bg-amber-500/10 border border-amber-500/30' },
              { label: 'Specialists', value: roleStats.members, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border border-indigo-500/30' },
            ].map((stat, i) => (
              <Card key={i} className={`p-4 text-center ${stat.bg} border-navy-950 dark:border-white/10`}>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value.toString().padStart(2, '0')}</p>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden border-none shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-navy-900 transition-colors space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="w-full sm:w-96 flex gap-2">
                  <Input 
                    placeholder="Search members..." 
                    icon={Search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-navy-950 text-white border-b border-white/5">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em]">Member</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em]">Clearance</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em]">Rating</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-navy-900 transition-colors">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-cyan-500/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}`} 
                            alt="" 
                            className="w-8 h-8 rounded-full border border-blue-500"
                          />
                          <div>
                            <p className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-tight">{user.full_name}</p>
                            <p className="text-[9px] text-cyan-600 font-black uppercase tracking-widest">@{user.username}</p>
                            <p className="text-[9px] text-slate-400 lowercase">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={user.role} 
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className="text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1 border border-slate-200 dark:border-slate-700 bg-transparent outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value={UserRole.ADMIN}>Admin</option>
                          <option value={UserRole.BOARD}>Board</option>
                          <option value={UserRole.MEMBER}>Member</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button 
                              key={star} 
                              onClick={() => handleRateUser(user.id, star)}
                              className={`${(user.rating || 0) >= star ? 'text-amber-500' : 'text-slate-300'} hover:scale-110 transition-transform`}
                            >
                              <Star size={12} fill={(user.rating || 0) >= star ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleDeactivate(user.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid md:grid-cols-2 gap-6">
          {events.map(event => (
            <Card key={event.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-black uppercase tracking-tight text-navy-950 dark:text-white">{event.title}</h3>
                <Badge variant="cyan">{event.attendee_count}/{event.max_attendees}</Badge>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-[10px]"
                  onClick={() => {
                    const newTitle = prompt("Enter new title", event.title);
                    if (newTitle) handleUpdateEvent(event.id, { title: newTitle });
                  }}
                >
                  <Edit3 size={12} className="mr-2" /> Edit Title
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-[10px]"
                  onClick={() => {
                    const newDate = prompt("Enter new date (ISO format)", event.date);
                    if (newDate) handleUpdateEvent(event.id, { date: newDate });
                  }}
                >
                  <Clock size={12} className="mr-2" /> Reschedule
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-black uppercase tracking-tight text-navy-950 dark:text-white">{project.title}</h3>
                <Badge variant={project.status === 'active' ? 'cyan' : 'slate'}>{project.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{project.description}</p>
              <div className="flex gap-2">
                <select 
                  className="flex-1 bg-transparent border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 text-[10px] font-black uppercase outline-none"
                  value={project.status}
                  onChange={(e) => handleUpdateProject(project.id, { status: e.target.value as any })}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-[10px]"
                  onClick={() => {
                    const newDesc = prompt("Enter new description", project.description);
                    if (newDesc) handleUpdateProject(project.id, { description: newDesc });
                  }}
                >
                  Update Intel
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" /> Deploy New Challenge
            </h3>
            <form onSubmit={handleAddChallenge} className="grid md:grid-cols-2 gap-4">
              <Input name="title" label="Challenge Title" placeholder="e.g., Quantum Encryption" required />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest ml-2">Difficulty</label>
                <select name="difficulty" className="w-full px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-full bg-white dark:bg-navy-900 text-sm font-mono outline-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <Input name="points" type="number" label="Point Value" placeholder="50" required />
              <Input name="deadline" type="date" label="Deadline" required />
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 font-mono tracking-widest ml-2">Mission Briefing</label>
                <textarea name="description" className="w-full h-24 px-5 py-3 border border-slate-300 dark:border-slate-700 rounded-3xl bg-white dark:bg-navy-900 text-sm font-mono outline-none mt-1.5" placeholder="Describe the challenge parameters..." required />
              </div>
              <Button type="submit" className="md:col-span-2">Broadcast Challenge</Button>
            </form>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            {challenges.map(challenge => (
              <Card key={challenge.id} className="p-4 border-l-4 border-l-cyan-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xs font-black uppercase tracking-tight">{challenge.title}</h4>
                  <Badge variant={challenge.difficulty === 'hard' ? 'red' : challenge.difficulty === 'medium' ? 'gold' : 'cyan'}>
                    {challenge.points} PTS
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 mb-3">{challenge.description}</p>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 uppercase">
                  <span>Due: {challenge.deadline}</span>
                  <span className="text-cyan-600 font-black">{challenge.difficulty}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="p-6 bg-navy-950 dark:bg-black rounded-3xl text-white flex items-center gap-6 shadow-2xl border-l-8 border-cyan-600 glow-cyan">
        <ShieldAlert size={32} className="text-amber-500 shrink-0" />
        <div>
          <h3 className="font-black uppercase tracking-[0.3em] text-cyan-400 text-xs font-mono">Security Protocol Alpha</h3>
          <p className="text-[10px] text-cyan-100 opacity-60 mt-1 font-mono uppercase tracking-widest leading-relaxed">System logs record all administrative operations. Identity deactivation is irreversible without secondary verification.</p>
        </div>
      </div>
    </div>
  );
};

// --- App Root ---
const AppContent = () => {
  const { authState } = useAuth();
  const { isDark } = useTheme();
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="text-center space-y-8">
          <Brain size={64} className="text-cyan-400 animate-pulse mx-auto" />
          <div className="h-1 w-48 bg-navy-900 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-1/2 animate-[loading_2s_infinite_ease-in-out] glow-cyan"></div>
          </div>
          <div className="space-y-2">
            <p className="text-cyan-100 font-black uppercase tracking-[0.4em] text-[10px] opacity-70">Synchronizing Local Nodes</p>
            <p className="text-slate-600 font-mono text-[8px] uppercase tracking-widest">Protocol Version: 2.5.0-STABLE</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={!authState.user ? <LandingPage /> : <Navigate to="/dashboard" />} />
      <Route path="/auth" element={!authState.user ? <AuthPage /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={authState.user ? <AppLayout><DashboardPage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/profile" element={authState.user ? <AppLayout><ProfilePage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/events" element={authState.user ? <AppLayout><EventsPage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/projects" element={authState.user ? <AppLayout><ProjectsPage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/challenges" element={authState.user ? <AppLayout><ChallengesPage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/resources" element={authState.user ? <AppLayout><ResourcesPage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/admin" element={authState.user?.role === UserRole.ADMIN ? <AppLayout><AdminPanelPage /></AppLayout> : <Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });
  useEffect(() => {
    const savedUser = localStorage.getItem('ict_club_user');
    setTimeout(() => {
      if (savedUser) {
        setAuthState({ user: JSON.parse(savedUser), loading: false });
      } else {
        setAuthState({ user: null, loading: false });
      }
    }, 1500);
  }, []);
  const login = (email: string) => {
    const user = MOCK_USERS.find(u => u.email === email) || MOCK_USERS[2];
    localStorage.setItem('ict_club_user', JSON.stringify(user));
    setAuthState({ ...authState, user });
  };
  const logout = () => {
    localStorage.removeItem('ict_club_user');
    setAuthState({ ...authState, user: null });
  };
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (authState.user) {
      try {
        const response = await fetch(`/api/users/${authState.user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to update profile');
        const updatedUser = await response.json();
        localStorage.setItem('ict_club_user', JSON.stringify(updatedUser));
        setAuthState({ ...authState, user: updatedUser });
      } catch (error) {
        console.error("Profile update error:", error);
        alert("Failed to sync profile changes with the mainframe.");
      }
    }
  };
  return (
    <AuthContext.Provider value={{ authState, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

const App = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };
  return (
    <HashRouter>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeContext.Provider>
    </HashRouter>
  );
};

export default App;
