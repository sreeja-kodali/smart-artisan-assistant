import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Hammer, Banknote, Sparkles, BarChart3, Menu, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Dashboard from './pages/Dashboard';
import Production from './pages/Production';
import Earnings from './pages/Earnings';
import Reports from './pages/Reports';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo ? children : <Navigate to="/login" />;
}

function NavItem({ to, icon: Icon, label, active }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-artisan-clay text-white shadow-lg' 
          : 'hover:bg-artisan-olive/10 text-artisan-ink/70'
      }`}
    >
      <Icon size={18} />
      <span className="font-bold text-sm">{label}</span>
    </Link>
  );
}

function Sidebar({ isOpen, setIsOpen, user, logout }) {
  const location = useLocation();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>

      <motion.aside 
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -300 }}
        className="fixed inset-y-0 left-0 w-64 bg-white border-r border-artisan-olive/10 z-50 transform lg:translate-x-0 overflow-y-auto"
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-artisan-clay rounded-xl flex items-center justify-center text-white">
              <Hammer size={24} />
            </div>
            <h1 className="text-xl font-bold font-serif">Artisan</h1>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/production" icon={Hammer} label="Production" active={location.pathname === '/production'} />
            <NavItem to="/earnings" icon={Banknote} label="Earnings" active={location.pathname === '/earnings'} />
            <NavItem to="/reports" icon={BarChart3} label="Reports" active={location.pathname === '/reports'} />
            <NavItem to="/assistant" icon={Sparkles} label="Smart AI" active={location.pathname === '/assistant'} />
          </nav>

          <div className="pt-6 border-t border-artisan-olive/10">
            <div className="mb-4">
               <p className="text-xs text-artisan-ink/40 font-bold uppercase mb-1">Account</p>
               <p className="text-sm font-bold truncate">{user?.name}</p>
            </div>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm text-left">
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    window.location.reload();
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-artisan-cream flex">
              <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={userInfo} logout={logout} />
              
              <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
                <header className="sticky top-0 bg-artisan-cream/80 backdrop-blur-md border-b border-artisan-olive/10 px-6 py-4 flex items-center justify-between z-30 lg:hidden">
                  <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-artisan-olive/5 rounded-lg"><Menu size={24} /></button>
                  <h1 className="text-lg font-serif font-bold">Artisan Assistant</h1>
                  <div className="w-10" />
                </header>

                <div className="p-6 lg:p-10 flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/production" element={<Production />} />
                    <Route path="/earnings" element={<Earnings />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/assistant" element={<AIAssistant />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
