
import React, { useState } from 'react';

interface SafeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName: string;
  entityType: string;
}

const SafeDeleteModal: React.FC<SafeDeleteModalProps> = ({ isOpen, onClose, onConfirm, entityName, entityType }) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const isMatched = inputValue === entityName;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mb-6">⚠️</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Confirm Deletion</h3>
          <p className="text-slate-500 mb-6 leading-relaxed">
            You are about to delete this <strong>{entityType}</strong>. This action is irreversible. 
            To proceed, please type the name below:
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Verify Name</label>
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={entityName}
                className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-500 focus:ring-0 outline-none font-semibold transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-8 py-6 flex flex-col sm:flex-row-reverse gap-3">
          <button
            onClick={onConfirm}
            disabled={!isMatched}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
              isMatched 
                ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Permanently Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeDeleteModal;
