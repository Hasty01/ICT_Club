
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
  ExternalLink
} from 'lucide-react';

import { UserRole, UserProfile, AuthState } from './types';
import { MOCK_USERS } from './services/mockData';

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
  updateProfile: (updates: Partial<UserProfile>) => void;
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
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base font-semibold'
  };
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-mono transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, icon?: React.ElementType }> = ({ label, icon: Icon, className = '', ...props }) => (
  <div className="w-full space-y-1.5">
    {label && <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon size={16} />
        </div>
      )}
      <input 
        className={`w-full ${Icon ? 'pl-10' : 'px-3'} py-2 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none bg-white dark:bg-navy-900 dark:text-white font-mono text-sm ${className}`}
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
  return <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-widest font-mono ${colors[variant]}`}>{children}</span>;
};

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-navy-900/50 backdrop-blur-md rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/50 transition-all duration-300 ${className}`}>
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
    { label: 'Resources', icon: FileText, path: '/resources' },
    { label: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  if (authState.user.role === UserRole.ADMIN) {
    menuItems.push({ label: 'Admin Panel', icon: Shield, path: '/admin' });
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-navy-950 transition-colors duration-500">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full tech-grid">
          <div className="flex items-center justify-between p-6 h-16 border-b border-slate-100 dark:border-slate-800">
            <Link to="/dashboard" className="flex items-center gap-2 font-black text-xl tracking-tighter text-navy-950 dark:text-white">
              <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center glow-cyan">
                <Brain size={20} className="text-white" />
              </div>
              <span>ICT HUB</span>
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
                  flex items-center gap-3 px-4 py-3 rounded-md transition-all group font-mono text-sm tracking-tight
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
            <div className="flex items-center gap-3 px-3 py-4 mb-4 bg-slate-50 dark:bg-navy-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <img 
                src={authState.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authState.user.full_name)}`} 
                alt="Avatar" 
                className="w-10 h-10 rounded border-2 border-cyan-600"
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

      {/* Main Content */}
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
            <span>ICT HUB</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-200 dark:border-cyan-800 font-mono">
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
            <div className="relative rounded-lg overflow-hidden border-2 border-navy-950 dark:border-white shadow-2xl">
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

      <footer className="py-12 bg-navy-950 text-slate-400 border-t border-slate-800 font-mono text-[10px]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 font-black text-xl text-white tracking-tighter">
            <Brain size={24} className="text-cyan-400" />
            <span>ICT HUB</span>
          </div>
          <div className="flex gap-8 uppercase tracking-widest font-black">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Protocol</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Secure Contact</a>
          </div>
          <p className="opacity-50">© 2024 ICT CLUB CORE REPOSITORY. v2.5.0-STABLE</p>
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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 dark:bg-cyan-950 text-cyan-600 rounded mb-4">
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
  const user = authState.user;

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Section */}
      <section className="bg-navy-950 dark:bg-navy-900 rounded-lg p-8 text-white relative overflow-hidden shadow-2xl border-l-8 border-amber-500 tech-grid">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-sm bg-cyan-900/50 text-cyan-400 text-[10px] font-black uppercase tracking-widest border border-cyan-800 font-mono">
            Status: Connection Stable
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Greetings, Engineer {user.full_name.split(' ')[0]}</h2>
          <p className="text-cyan-100/70 text-base font-mono max-w-2xl">Terminal synchronized. You have 3 pending event approvals and 2 high-priority project tasks assigned.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        {[
          { label: 'Active Events', value: '03', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Node Projects', value: '02', icon: Briefcase, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Registry Count', value: '154', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'System Rank', value: 'B-04', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 group border-b-2 border-b-transparent hover:border-b-cyan-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded ${stat.bg} ${stat.color} glow-cyan`}>
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

  const handleSave = () => {
    updateProfile(profileData as any);
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

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <Card className="mb-8 border-none overflow-hidden shadow-2xl">
        <div className="h-48 bg-gradient-to-r from-navy-950 via-cyan-900 to-blue-950 relative tech-grid border-b border-white/10">
          <div className="absolute -bottom-12 left-8 flex items-end gap-6">
            <div className="relative group">
              <img 
                src={authState.user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authState.user?.full_name || '')}`} 
                alt="Profile" 
                className="w-32 h-32 rounded border-4 border-white dark:border-navy-900 shadow-2xl bg-white"
              />
              <button className="absolute inset-0 bg-navy-950/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                <Settings size={20} />
              </button>
            </div>
          </div>
          <div className="absolute top-4 right-4"><Badge variant="gold">Level 2 Specialist</Badge></div>
        </div>
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-navy-900 transition-colors">
          <div>
            <h2 className="text-3xl font-black text-navy-950 dark:text-white tracking-tighter uppercase font-mono">{authState.user?.full_name}</h2>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-2 font-mono text-xs uppercase tracking-widest font-black">
              <Shield size={16} className="text-cyan-600" />
              <span>Identity Type: <span className="text-amber-500">{authState.user?.role}</span></span>
              <span className="opacity-20">|</span>
              <span>Registry: {authState.user?.joined_at}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant={isEditing ? "outline" : "primary"} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Discard' : 'Edit Profile'}
            </Button>
            {isEditing && <Button variant="secondary" onClick={handleSave}>Verify Changes</Button>}
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
  const [events] = useState([
    { id: 1, title: 'AI Ethics Symposium', date: 'Nov 24, 2024', time: '14:00', loc: 'Node 2C', img: 'https://picsum.photos/seed/ai1/400/200', registered: false },
    { id: 2, title: 'Web3 Core Dev Meet', date: 'Dec 02, 2024', time: '17:30', loc: 'Mainframe', img: 'https://picsum.photos/seed/web3-2/400/200', registered: true },
    { id: 3, title: 'Security Audit Workshop', date: 'Dec 10, 2024', time: '13:00', loc: 'Lab Zero', img: 'https://picsum.photos/seed/sec/400/200', registered: false },
  ]);

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
              <img src={event.img} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
              <div className="absolute inset-0 bg-navy-950/30"></div>
              <div className="absolute top-4 right-4">{event.registered && <Badge variant="gold">Signed</Badge>}</div>
            </div>
            <div className="p-6 space-y-4 bg-white dark:bg-navy-900 transition-colors">
              <h3 className="text-lg font-black text-navy-950 dark:text-white uppercase tracking-tight">{event.title}</h3>
              <div className="space-y-2 text-[10px] text-slate-500 dark:text-slate-400 font-black font-mono uppercase tracking-widest">
                <p className="flex items-center gap-2"><Calendar size={14} className="text-cyan-600" /> {event.date}</p>
                <p className="flex items-center gap-2"><Clock size={14} className="text-cyan-600" /> {event.time} HRS</p>
                <p className="flex items-center gap-2"><Users size={14} className="text-cyan-600" /> {event.loc}</p>
              </div>
              <Button 
                variant={event.registered ? "outline" : "primary"} 
                className="w-full uppercase text-[10px] tracking-widest font-black"
              >
                {event.registered ? 'Terminate Registration' : 'Register Deployment'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AdminPanelPage = () => {
  const { authState } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleDeactivate = (userId: string) => {
    if (window.confirm('Confirm deactivation sequence for this user?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const roleStats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.role === UserRole.ADMIN).length,
      board: users.filter(u => u.role === UserRole.BOARD).length,
      members: users.filter(u => u.role === UserRole.MEMBER).length,
    };
  }, [users]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tighter">Command Center</h2>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em]">User Permission Matrix Control</p>
        </div>
        <Button variant="secondary" className="gap-2">
          <UserPlus size={16} /> Provision User
        </Button>
      </div>

      {/* Admin Stats */}
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
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-navy-900 flex flex-col sm:flex-row gap-4 justify-between items-center transition-colors">
          <div className="w-full sm:w-80">
            <Input 
              placeholder="Filter identity records..." 
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-[10px] uppercase font-black">Export Log</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-navy-950 text-white border-b border-white/5">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em]">Identity Handle</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em]">Clearance</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em]">Registry Date</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-navy-900 transition-colors">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-cyan-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}`} 
                        alt="" 
                        className="w-8 h-8 rounded border border-blue-500 shadow-sm"
                      />
                      <div>
                        <p className="text-xs font-black text-navy-950 dark:text-white uppercase tracking-tight">{user.full_name}</p>
                        <p className="text-[9px] text-slate-400 font-bold tracking-tight lowercase">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={`
                        text-[9px] font-black uppercase tracking-widest rounded-sm px-2 py-1 border border-transparent focus:border-cyan-500 outline-none
                        ${user.role === UserRole.ADMIN ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400' : 
                          user.role === UserRole.BOARD ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}
                      `}
                    >
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.BOARD}>Board</option>
                      <option value={UserRole.MEMBER}>Member</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-slate-500 font-black uppercase">{user.joined_at}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleDeactivate(user.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                    Identity Query Returned Zero Results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="p-6 bg-navy-950 dark:bg-black rounded-lg text-white flex items-center gap-6 shadow-2xl border-l-8 border-cyan-600 glow-cyan">
        <ShieldAlert size={32} className="text-amber-500 shrink-0" />
        <div>
          <h3 className="font-black uppercase tracking-[0.3em] text-cyan-400 text-xs font-mono">Security Protocol Alpha</h3>
          <p className="text-[10px] text-cyan-100 opacity-60 mt-1 font-mono uppercase tracking-widest leading-relaxed">All administrative actions are logged to the global chain. Unauthorized privilege modification will trigger automated system isolation.</p>
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
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={authState.user ? <AppLayout><DashboardPage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/profile" element={authState.user ? <AppLayout><ProfilePage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/events" element={authState.user ? <AppLayout><EventsPage /></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/projects" element={authState.user ? <AppLayout><div className="text-center py-24 text-slate-500 font-black uppercase tracking-widest font-mono text-xs"><Cpu size={48} className="mx-auto mb-4 opacity-20" /> // Projects.Module Loading...</div></AppLayout> : <Navigate to="/auth" />} />
      <Route path="/resources" element={authState.user ? <AppLayout><div className="text-center py-24 text-slate-500 font-black uppercase tracking-widest font-mono text-xs"><FileText size={48} className="mx-auto mb-4 opacity-20" /> // Library.Node Syncing...</div></AppLayout> : <Navigate to="/auth" />} />
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

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (authState.user) {
      const newUser = { ...authState.user, ...updates };
      localStorage.setItem('ict_club_user', JSON.stringify(newUser));
      setAuthState({ ...authState, user: newUser });
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
