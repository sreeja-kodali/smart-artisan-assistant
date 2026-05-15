import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('userInfo')) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-artisan-cream flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-artisan-olive/10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-artisan-clay rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
            <Hammer size={32} />
          </div>
          <h1 className="text-3xl font-bold font-serif">Welcome Back</h1>
          <p className="text-artisan-ink/60">Log in to manage your workshop</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-1 ml-1">Email Address</label>
            <input 
              required
              type="email"
              className="w-full bg-artisan-cream/50 border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 ml-1">Password</label>
            <input 
              required
              type="password"
              className="w-full bg-artisan-cream/50 border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-artisan-clay text-white py-4 rounded-2xl font-bold shadow-lg mt-4 hover:brightness-110 transition-all">
            Log In
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-artisan-ink/60">
          New here? <Link to="/register" className="text-artisan-clay font-bold underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
