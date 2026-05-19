
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context';
import { Wrench, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useData();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
          
          {/* Left Side - Brand */}
          <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 w-1/2 p-12 text-white text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-10 mix-blend-overlay"></div>
             <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                   <Wrench className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Servis Takip <span className="text-blue-200">PRO</span></h1>
                <p className="text-blue-100 mb-8">Profesyonel Teknik Servis Yönetim Çözümleri</p>
                <div className="text-sm text-blue-200/60 mt-auto">
                   &copy; 2025 CetTech Teknoloji A.Ş.
                </div>
             </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
             <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-800">Giriş Yap</h2>
                <p className="text-slate-500">Hesabınıza erişmek için bilgilerinizi giriniz.</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Kullanıcı Adı</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                         type="text" 
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                         placeholder="kullaniciadi"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Şifre</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input 
                         type="password" 
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                         placeholder="••••••••"
                      />
                   </div>
                </div>
                
                {error && <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-blue-200 transition-all transform active:scale-95">
                   Giriş Yap <ArrowRight className="w-4 h-4" />
                </button>
             </form>
             
             <div className="mt-8 text-center text-xs text-slate-400">
                <p>Demo Giriş Bilgileri:</p>
                <div className="flex justify-center gap-4 mt-2">
                   <span>Admin: <code className="bg-slate-100 px-1 rounded text-slate-600">admin</code></span>
                   <span>Teknisyen: <code className="bg-slate-100 px-1 rounded text-slate-600">ali.tek</code></span>
                </div>
                <div className="mt-1">Şifre: Herhangi bir değer (boş olamaz)</div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default Login;
