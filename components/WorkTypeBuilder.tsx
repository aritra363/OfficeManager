
import React, { useState } from 'react';
import { WorkType, FieldDefinition, FieldType, NotificationType } from '../types';
import { firebaseService } from '../firebaseService';
import { suggestFieldsForWorkType } from '../geminiService';
import SafeDeleteModal from './SafeDeleteModal';
import { toast } from 'react-hot-toast';

interface Props {
  workTypes: WorkType[];
  onUpdate: (types: WorkType[]) => void;
}

const WorkTypeBuilder: React.FC<Props> = ({ workTypes, onUpdate }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkType | null>(null);
  
  const [typeName, setTypeName] = useState('');
  const [typeDesc, setTypeDesc] = useState('');
  const [fields, setFields] = useState<FieldDefinition[]>([]);

  const handleAddField = () => {
    const newField: FieldDefinition = {
      id: `field-${Date.now()}`,
      label: '',
      type: FieldType.TEXT,
      required: true,
      notificationType: NotificationType.NONE,
      isExpiry: false,
      isSearchable: false,
      isPrimary: fields.length === 0
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (id: string, updates: Partial<FieldDefinition>) => {
    if (updates.notificationType !== undefined) {
      updates.isExpiry = updates.notificationType === NotificationType.EXPIRY;
    }
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleAISuggest = async () => {
    if (!typeName) return alert("Please enter a name first!");
    setLoadingAI(true);
    const suggested = await suggestFieldsForWorkType(typeName);
    if (suggested && suggested.length > 0) {
      const mapped = suggested.map((s: any, idx: number) => ({
        id: `field-ai-${idx}-${Date.now()}`,
        label: s.label,
        type: s.type as FieldType,
        required: s.required,
        notificationType: s.isExpiry ? NotificationType.EXPIRY : NotificationType.NONE,
        isExpiry: !!s.isExpiry,
        isSearchable: !!s.isPrimary,
        isPrimary: s.isPrimary
      }));
      setFields(mapped);
    }
    setLoadingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }

    setIsLoading(true);
    try {
      const newType: WorkType = {
        id: editingId || `worktype-${Date.now()}`,
        name: typeName,
        description: typeDesc,
        fields: fields,
        createdAt: Date.now()
      };

      if (editingId) {
        await firebaseService.saveWorkType(newType);
        toast.success('Work type updated successfully! ✅');
      } else {
        await firebaseService.saveWorkType(newType);
        toast.success('Work type created successfully! ✅');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save work type');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type: WorkType) => {
    setTypeName(type.name);
    setTypeDesc(type.description);
    setFields(type.fields);
    setEditingId(type.id);
    setIsCreating(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      setIsLoading(true);
      try {
        await firebaseService.deleteWorkType(deleteTarget.id);
        toast.success('Work type deleted successfully! 🗑️');
        setDeleteTarget(null);
      } catch (error) {
        toast.error('Failed to delete work type');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setTypeName('');
    setTypeDesc('');
    setFields([]);
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Work Page Setup</h2>
          <p className="text-slate-500 text-sm">Design custom forms and data structures for office tasks.</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-indigo-100 transition-all"
          >
            <span>✨</span>
            <span>Create New Layout</span>
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Layout Structure' : 'New Dynamic Layout Builder'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Layout Name</label>
                <div className="flex space-x-2">
                  <input 
                    required
                    value={typeName}
                    onChange={e => setTypeName(e.target.value)}
                    className="flex-1 px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-lg transition-all"
                    placeholder="e.g., Professional Tax Registration"
                  />
                  <button 
                    type="button"
                    onClick={handleAISuggest}
                    disabled={loadingAI}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-black text-[10px] uppercase hover:bg-indigo-100 disabled:opacity-50 flex flex-col items-center justify-center min-w-[110px]"
                  >
                    {loadingAI ? 'AI thinking...' : '🤖 Use Gemini AI'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                <textarea 
                  value={typeDesc}
                  onChange={e => setTypeDesc(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-indigo-500 focus:bg-white outline-none h-24 font-medium transition-all"
                  placeholder="What is this form for?"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 overflow-y-auto max-h-[500px] shadow-inner">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Fields & Validation</h4>
                <button 
                  type="button" 
                  onClick={handleAddField}
                  className="text-[10px] font-black uppercase bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm hover:border-indigo-300 transition-all"
                >
                  + Manual Field
                </button>
              </div>

              <div className="space-y-4">
                {fields.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-2xl">
                    No fields added yet.
                  </div>
                )}
                {fields.map((field, idx) => (
                  <div key={field.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group animate-in fade-in duration-200">
                    <button 
                      onClick={() => handleRemoveField(field.id)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <input 
                          value={field.label}
                          onChange={e => handleUpdateField(field.id, { label: e.target.value })}
                          className="w-full text-sm font-bold border-b-2 border-transparent focus:border-indigo-400 outline-none pb-1"
                          placeholder="Field Label"
                        />
                      </div>
                      <select 
                        value={field.type}
                        onChange={e => handleUpdateField(field.id, { type: e.target.value as FieldType })}
                        className="text-xs font-bold bg-slate-50 border-none rounded-lg outline-none cursor-pointer"
                      >
                        {Object.values(FieldType).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                      </select>
                    </div>

                    {field.type === FieldType.SELECT && (
                      <div className="mb-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dropdown Options (comma separated)</label>
                        <input 
                          value={field.options?.join(', ') || ''}
                          onChange={e => handleUpdateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}

                    <div className="space-y-4 mb-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notification Logic</label>
                        <select 
                          value={field.notificationType}
                          onChange={e => handleUpdateField(field.id, { 
                            notificationType: e.target.value as NotificationType
                          })}
                          className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded border-none outline-none cursor-pointer"
                        >
                          {Object.values(NotificationType).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-[10px] font-black text-slate-400 tracking-widest">
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-600 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={field.required} 
                          onChange={e => handleUpdateField(field.id, { required: e.target.checked })}
                          className="w-3 h-3 rounded"
                        />
                        <span>REQUIRED</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-indigo-600 hover:text-indigo-700 transition-colors">
                        <input 
                          type="radio" 
                          name="primary-field"
                          checked={field.isPrimary} 
                          onChange={() => {
                            setFields(fields.map(f => ({ ...f, isPrimary: f.id === field.id, isSearchable: f.id === field.id ? true : f.isSearchable })));
                          }}
                          className="w-3 h-3"
                        />
                        <span>RECORD TITLE</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer hover:text-slate-600 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={field.isSearchable} 
                          onChange={e => handleUpdateField(field.id, { isSearchable: e.target.checked })}
                          className="w-3 h-3 rounded"
                        />
                        <span>SEARCHABLE</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
            <button onClick={resetForm} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700">Cancel</button>
            <button 
              onClick={handleSubmit}
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all"
            >
              {editingId ? 'Update Layout' : 'Publish Work Page'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workTypes.map(type => (
          <div key={type.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl text-2xl font-bold shadow-inner">
                  📄
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(type)} className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors">✏️</button>
                  <button onClick={() => setDeleteTarget(type)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">🗑️</button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800">{type.name}</h3>
              <p className="text-slate-500 text-sm mt-2 line-clamp-2 h-10 font-medium leading-relaxed">{type.description || 'Professional office service form.'}</p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{type.fields.length} Active Fields</span>
              <span className="text-[10px] font-bold text-slate-300">Created {new Date(type.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {workTypes.length === 0 && !isCreating && (
          <div className="col-span-full py-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-slate-400 animate-pulse">
            <div className="text-6xl mb-4 opacity-20">🏗️</div>
            <p className="text-xl font-bold">No custom work pages setup yet.</p>
            <button onClick={() => setIsCreating(true)} className="mt-4 text-indigo-600 font-bold hover:underline decoration-2 underline-offset-8 transition-all">Start Designing Your Office Layouts</button>
          </div>
        )}
      </div>

      {deleteTarget && (
        <SafeDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          entityName={deleteTarget.name}
          entityType="Work Page Structure"
        />
      )}
    </div>
  );
};

export default WorkTypeBuilder;
