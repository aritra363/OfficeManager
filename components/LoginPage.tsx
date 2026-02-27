
import React, { useState } from 'react';
import { User } from '../types';

interface Props {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<Props> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Invalid username or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-indigo-600 p-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4 backdrop-blur-sm">🏢</div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">OfficeHub Pro</h1>
            <p className="text-indigo-100 text-sm mt-1">Tax & License Management System</p>
          </div>
          
          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Username</label>
                <input 
                  required
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Password</label>
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Sign In to Dashboard
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              {users.length === 0 ? (
                <>
                  <p className="text-xs text-amber-600 font-bold mb-2">⚠️ FIRST TIME SETUP</p>
                  <p className="text-xs text-slate-500 mb-2">No users found in database</p>
                  <p className="text-xs text-slate-400">Please create an admin user in Firebase Console:</p>
                  <ol className="text-xs text-slate-400 mt-3 space-y-1 text-left inline-block">
                    <li>1. Go to Firebase Console</li>
                    <li>2. Select Firestore Database</li>
                    <li>3. Create 'users' collection</li>
                    <li>4. Add document with:</li>
                    <li className="ml-4 font-mono text-[10px]">id: admin-1</li>
                    <li className="ml-4 font-mono text-[10px]">username: admin</li>
                    <li className="ml-4 font-mono text-[10px]">password: admin</li>
                    <li className="ml-4 font-mono text-[10px]">name: Admin User</li>
                    <li className="ml-4 font-mono text-[10px]">role: admin</li>
                  </ol>
                </>
              ) : (
                <p className="text-xs text-slate-400 mt-1 italic">Authorized Personnel Only</p>
              )}
            </div>
          </div>
        </div>
        <p className="text-center mt-8 text-slate-400 text-sm">© 2024 Professional Office Suite • Secure Local Storage</p>
      </div>
    </div>
  );
};

export default LoginPage;
