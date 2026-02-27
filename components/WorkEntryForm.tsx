
import React, { useState, useEffect } from 'react';
import { WorkType, WorkRecord, User, FieldType, NotificationType } from '../types';
import { differenceInDays, parseISO } from 'date-fns';

interface Props {
  workType: WorkType;
  user: User;
  initialData?: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  onCancel: () => void;
}

const WorkEntryForm: React.FC<Props> = ({ workType, user, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});

  // Reset form when workType or initialData changes
  useEffect(() => {
    setFormData(initialData || {});
  }, [workType.id, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-10 border-b border-slate-100 bg-slate-50/80">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2 block">Service Submission Form</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{workType.name}</h2>
            <p className="text-slate-500 mt-2 font-medium max-w-2xl">{workType.description || 'Fill out the details below to log this office activity.'}</p>
          </div>
          <div className="text-right">
             <span className="text-xs font-bold text-slate-400">Logger: {user.name}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {workType.fields.map(field => (
            <div key={field.id} className={field.type === FieldType.CHECKBOX ? 'flex items-center space-x-4 pt-4' : 'space-y-2'}>
              {field.type !== FieldType.CHECKBOX && (
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                  {field.notificationType !== NotificationType.NONE && (
                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-black ${
                      field.notificationType === NotificationType.EXPIRY ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {field.notificationType.toUpperCase()} TRACK
                    </span>
                  )}
                </label>
              )}

              {field.type === FieldType.TEXT && (
                <input 
                  required={field.required}
                  type="text"
                  value={formData[field.id] || ''}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all shadow-sm"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}

              {field.type === FieldType.TEXTAREA && (
                <textarea 
                  required={field.required}
                  value={formData[field.id] || ''}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all shadow-sm min-h-[120px]"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}

              {field.type === FieldType.NUMBER && (
                <input 
                  required={field.required}
                  type="number"
                  value={formData[field.id] || ''}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all shadow-sm"
                />
              )}

              {field.type === FieldType.DATE && (
                <div className="space-y-2">
                  <input 
                    required={field.required}
                    type="date"
                    value={formData[field.id] || ''}
                    onChange={e => handleFieldChange(field.id, e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all shadow-sm"
                  />
                  {field.notificationType === NotificationType.EXPIRY && formData[field.id] && (
                    <p className="text-[10px] font-bold text-amber-600 ml-2 animate-in fade-in slide-in-from-left-2">
                      {(() => {
                        const days = differenceInDays(parseISO(formData[field.id]), new Date());
                        if (days < 0) return '⚠️ Already expired!';
                        if (days === 0) return '⚠️ Expires TODAY!';
                        return `⏳ Expires in ${days} days`;
                      })()}
                    </p>
                  )}
                </div>
              )}

              {field.type === FieldType.SELECT && (
                <select 
                  required={field.required}
                  value={formData[field.id] || ''}
                  onChange={e => handleFieldChange(field.id, e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all shadow-sm cursor-pointer appearance-none"
                >
                  <option value="">Select an option</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}

              {field.type === FieldType.CHECKBOX && (
                <>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData[field.id] || false}
                      onChange={e => handleFieldChange(field.id, e.target.checked)}
                      className="w-6 h-6 rounded-lg text-indigo-600 border-2 border-slate-200 focus:ring-indigo-500 transition-all cursor-pointer"
                    />
                  </div>
                  <label className="text-sm font-bold text-slate-700 cursor-pointer">{field.label}</label>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-6 pt-10 mt-6 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-4 font-bold text-slate-400 hover:text-slate-700 transition-all uppercase tracking-widest text-xs"
          >
            Cancel Entry
          </button>
          <button 
            type="submit"
            className="px-14 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            {initialData ? 'Apply Changes' : 'Submit Final Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkEntryForm;
