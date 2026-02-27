
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { firebaseService } from '../firebaseService';
import SafeDeleteModal from './SafeDeleteModal';
import { toast } from 'react-hot-toast';

interface Props {
  users: User[];
  onUpdate: (users: User[]) => void;
}

const EmployeeManager: React.FC<Props> = ({ users, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: ''
  });

  const employees = users.filter(u => u.role === UserRole.EMPLOYEE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        const updatedUser: User = {
          ...users.find(u => u.id === editingId)!,
          ...formData
        };
        await firebaseService.saveUser(updatedUser);
        toast.success('Employee updated successfully! ✅');
      } else {
        const newUser: User = {
          id: `user-${Date.now()}`,
          ...formData,
          role: UserRole.EMPLOYEE,
          createdAt: Date.now()
        };
        await firebaseService.saveUser(newUser);
        toast.success('Employee created successfully! ✅');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save employee');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      password: user.password,
      name: user.name
    });
    setEditingId(user.id);
    setIsAdding(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      setIsLoading(true);
      try {
        await firebaseService.deleteUser(deleteTarget.id);
        toast.success('Employee deleted successfully! 🗑️');
        setDeleteTarget(null);
      } catch (error) {
        toast.error('Failed to delete employee');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Employee Management</h2>
          <p className="text-slate-500 text-sm">Create and manage access for your office staff.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100"
          >
            <span>➕</span>
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Employee Details' : 'Create New Staff Account'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Full Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Username</label>
              <input 
                required
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                placeholder="johndoe123"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Password</label>
              <input 
                required
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3 mt-4">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-slate-500 hover:text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
              >
                {editingId ? 'Update Employee' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Login ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Created</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No staff members have been added yet.</td>
              </tr>
            ) : (
              employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{emp.username}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-medium">{new Date(emp.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEdit(emp)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Details"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(emp)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Access"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <SafeDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          entityName={deleteTarget.name}
          entityType="Employee"
        />
      )}
    </div>
  );
};

export default EmployeeManager;
