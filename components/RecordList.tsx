
import React, { useState } from 'react';
import { WorkType, WorkRecord, User, UserRole, NotificationType } from '../types';
import { firebaseService } from '../firebaseService';
import SafeDeleteModal from './SafeDeleteModal';
import { toast } from 'react-hot-toast';

interface Props {
  records: WorkRecord[];
  workTypes: WorkType[];
  users: User[];
  currentUser: User;
  onUpdate: (records: WorkRecord[]) => void;
  onEdit: (record: WorkRecord) => void;
  onNew?: (typeId: string) => void;
  initialFilter?: string;
}

const RecordList: React.FC<Props> = ({ records, workTypes, users, currentUser, onUpdate, onEdit, onNew, initialFilter }) => {
  const [filterType, setFilterType] = useState<string>(initialFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<WorkRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with initialFilter if it changes externally (e.g. sidebar click)
  React.useEffect(() => {
    if (initialFilter) {
      setFilterType(initialFilter);
    }
  }, [initialFilter]);
  
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const selectedType = workTypes.find(t => t.id === filterType);
  
  const searchableFields = selectedType?.fields.filter(f => f.isSearchable) || [];
  const searchPlaceholder = searchableFields.length > 0 
    ? `Search by ${searchableFields.map(f => f.label).join(', ')}...` 
    : 'Search records...';

  const filteredRecords = records.filter(rec => {
    const isCorrectType = filterType === 'all' || rec.workTypeId === filterType;
    if (!isCorrectType) return false;

    if (!searchQuery) return true;

    const type = workTypes.find(t => t.id === rec.workTypeId);
    if (!type) return false;

    const query = searchQuery.toLowerCase();
    
    // If a specific type is selected, search only in marked searchable fields
    if (selectedType) {
      return searchableFields.some(f => {
        const val = rec.data[f.id];
        return val && String(val).toLowerCase().includes(query);
      });
    }

    // If "All" is selected, search in primary fields of all types
    const primaryField = type.fields.find(f => f.isPrimary) || type.fields[0];
    const val = rec.data[primaryField.id];
    return val && String(val).toLowerCase().includes(query);
  });

  const getPrimaryValue = (rec: WorkRecord) => {
    const type = workTypes.find(t => t.id === rec.workTypeId);
    const primaryField = type?.fields.find(f => f.isPrimary) || type?.fields[0];
    return primaryField ? rec.data[primaryField.id] : 'N/A';
  };

  const handleDeactivate = async (record: WorkRecord, fieldId: string) => {
    const currentDeactivated = record.deactivatedFields || [];
    const isDeactivated = currentDeactivated.includes(fieldId);
    
    const updatedDeactivated = isDeactivated 
      ? currentDeactivated.filter(id => id !== fieldId)
      : [...currentDeactivated, fieldId];

    const updatedRecord = { ...record, deactivatedFields: updatedDeactivated };
    setIsLoading(true);
    try {
      await firebaseService.saveWorkRecord(updatedRecord);
      toast.success(isDeactivated ? 'Notification re-enabled ✅' : 'Notification disabled 🔇');
    } catch (error) {
      toast.error('Failed to update notification');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      setIsLoading(true);
      try {
        await firebaseService.deleteWorkRecord(deleteTarget.id);
        toast.success('Record deleted successfully! 🗑️');
        setDeleteTarget(null);
      } catch (error) {
        toast.error('Failed to delete record');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Office Records</h2>
          <p className="text-slate-500 text-sm">View and manage office task history.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {onNew && filterType !== 'all' && (
            <button 
              onClick={() => onNew(filterType)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all whitespace-nowrap"
            >
              + Add New
            </button>
          )}
          <select 
            value={filterType}
            onChange={e => {
              setFilterType(e.target.value);
              setSearchQuery('');
            }}
            className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="all">All Work Categories</option>
            {workTypes.map(wt => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {filterType === 'all' ? (
                  <>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Record Title</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Expiry Date</th>
                  </>
                ) : (
                  selectedType?.fields.map(f => (
                    <th key={f.id} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {f.label}
                    </th>
                  ))
                )}
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted By</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Logged</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-16 text-center text-slate-400 italic">
                    <div className="text-4xl mb-4">📂</div>
                    <p>No records found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map(rec => {
                  const type = workTypes.find(t => t.id === rec.workTypeId);
                  const emp = users.find(u => u.id === rec.employeeId);
                  
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors group">
                      {filterType === 'all' ? (
                        <>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100">
                              {type?.name || 'Deleted Type'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {getPrimaryValue(rec)}
                          </td>
                          <td className="px-6 py-4">
                            {(() => {
                              const expiryField = type?.fields.find(f => f.isExpiry) || 
                                                 type?.fields.find(f => f.label.toLowerCase().includes('expiry') && f.type === 'date');
                              const expiryDate = expiryField ? rec.data[expiryField.id] : null;
                              return expiryDate ? (
                                <span className="font-bold text-red-600">{expiryDate}</span>
                              ) : (
                                <span className="text-slate-300">N/A</span>
                              );
                            })()}
                          </td>
                        </>
                      ) : (
                        selectedType?.fields.map(f => (
                          <td key={f.id} className="px-6 py-4">
                            {f.type === 'checkbox' ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${rec.data[f.id] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                {rec.data[f.id] ? 'Yes' : 'No'}
                              </span>
                            ) : (f.isExpiry || f.notificationType === NotificationType.ALERT || f.notificationType === NotificationType.EXPIRY) ? (
                              <span className="font-bold text-red-600">{rec.data[f.id] || 'N/A'}</span>
                            ) : (
                              <span className={f.isPrimary ? 'font-bold text-slate-800' : 'text-slate-600'}>
                                {rec.data[f.id] || 'N/A'}
                              </span>
                            )}
                          </td>
                        ))
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {emp?.name.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-600 font-medium">
                            {emp?.id === currentUser.id ? 'You' : (emp?.name || 'Unknown')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isAdmin && (
                            <>
                              {type?.fields.filter(f => f.notificationType !== NotificationType.NONE).map(field => {
                                const isDeactivated = rec.deactivatedFields?.includes(field.id);
                                return (
                                  <button
                                    key={field.id}
                                    onClick={() => handleDeactivate(rec, field.id)}
                                    className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border transition-all ${
                                      isDeactivated 
                                        ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                        : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                    }`}
                                    title={isDeactivated ? 'Re-activate Notification' : 'Deactivate Notification'}
                                  >
                                    {isDeactivated ? 'OFF' : 'ON'}: {field.label}
                                  </button>
                                );
                              })}
                              <button 
                                onClick={() => onEdit(rec)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Record"
                              >
                                ✏️
                              </button>
                              <button 
                                onClick={() => setDeleteTarget(rec)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Record"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                          <button className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 px-2">View</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <SafeDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          entityName={getPrimaryValue(deleteTarget)}
          entityType="Record Entry"
        />
      )}
    </div>
  );
};

export default RecordList;
