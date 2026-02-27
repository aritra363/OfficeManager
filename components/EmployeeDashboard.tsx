
import React from 'react';
import { User, WorkType, WorkRecord, Notification, NotificationType } from '../types';
import { differenceInDays, parseISO } from 'date-fns';

interface Props {
  user: User;
  workTypes: WorkType[];
  records: WorkRecord[];
  onNewEntry: (typeId: string) => void;
}

const EmployeeDashboard: React.FC<Props> = ({ user, workTypes, records, onNewEntry }) => {
  // Transparency: Employees can see all records
  const allRecords = records;
  
  const notifications: Notification[] = React.useMemo(() => {
    const list: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    allRecords.forEach(record => {
      const type = workTypes.find(t => t.id === record.workTypeId);
      if (!type) return;

      const primaryField = type.fields.find(f => f.isPrimary) || type.fields[0];
      const primaryValue = record.data[primaryField.id] || 'Unnamed Record';

      type.fields.forEach(field => {
        if (field.notificationType === NotificationType.NONE || !record.data[field.id]) return;
        
        // Skip if deactivated for this specific entry
        if (record.deactivatedFields?.includes(field.id)) return;

        const targetDate = parseISO(record.data[field.id]);
        targetDate.setHours(0, 0, 0, 0);
        const days = differenceInDays(targetDate, today);

        if (field.notificationType === NotificationType.ALERT) {
          // Alert: show notification from 10 days prior
          if (days <= 10) {
            list.push({
              id: `${record.id}-${field.id}-alert`,
              recordId: record.id,
              workTypeName: type.name,
              primaryValue,
              dateValue: record.data[field.id],
              daysRemaining: days,
              type: days <= 0 ? 'urgent' : 'warning',
              notificationType: NotificationType.ALERT,
              message: `Alert: ${field.label} ${days < 0 ? 'was on' : days === 0 ? 'is TODAY' : `in ${days} days`}`
            });
          }
        } else if (field.notificationType === NotificationType.EXPIRY) {
          // Expiry: 30 days prior
          if (days <= 30) {
            let message = `Expiry: ${field.label} is approaching`;
            let severity: 'info' | 'warning' | 'urgent' = 'info';

            if (days < 0) {
              message = `Expired: ${field.label} has passed!`;
              severity = 'urgent';
            } else if (days === 0) {
              message = `Expiry: ${field.label} expires TODAY!`;
              severity = 'urgent';
            } else if (days <= 15) {
              message = `Expiry: ${field.label} expires in ${days} days`;
              severity = 'warning';
            }

            list.push({
              id: `${record.id}-${field.id}-expiry`,
              recordId: record.id,
              workTypeName: type.name,
              primaryValue,
              dateValue: record.data[field.id],
              daysRemaining: days,
              type: severity,
              notificationType: NotificationType.EXPIRY,
              message
            });
          }
        }
      });
    });
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [allRecords, workTypes]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 text-balance">Welcome back, {user.name}!</h2>
        <p className="text-slate-500">Transparency is key. View all office activities and critical alerts below.</p>
      </header>

      {/* Quick Action */}
      <section className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-2">New Submission</h3>
          <p className="text-indigo-100 mb-6 max-w-md">Start a new entry for professional tax, pan card, or trade licenses by selecting a category below.</p>
          <div className="flex flex-wrap gap-2">
            {workTypes.length === 0 ? (
              <p className="text-sm italic opacity-70">Admin hasn't configured any work types yet.</p>
            ) : (
              workTypes.map(wt => (
                <button 
                  key={wt.id}
                  onClick={() => onNewEntry(wt.id)}
                  className="bg-white text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  {wt.name}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">📋</div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 overflow-hidden">
          <h3 className="text-xl font-bold text-slate-800">Recent Office Activity</h3>
          {allRecords.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              No records submitted yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Work Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Description</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Expiry Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Submitted By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allRecords.slice(0, 10).map(rec => {
                      const wt = workTypes.find(t => t.id === rec.workTypeId);
                      const primary = wt?.fields.find(f => f.isPrimary);
                      const expiryField = wt?.fields.find(f => f.isExpiry) || 
                                         wt?.fields.find(f => f.notificationType === NotificationType.EXPIRY) ||
                                         wt?.fields.find(f => f.notificationType === NotificationType.ALERT) ||
                                         wt?.fields.find(f => f.label.toLowerCase().includes('expiry') && f.type === 'date');
                      const expiryDate = expiryField ? rec.data[expiryField.id] : null;
                      
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-indigo-600">{wt?.name || 'Deleted Type'}</td>
                          <td className="px-6 py-4 text-slate-700">{primary ? rec.data[primary.id] : 'N/A'}</td>
                          <td className="px-6 py-4">
                            {expiryDate ? (
                              <span className="font-bold text-red-600">{expiryDate}</span>
                            ) : (
                              <span className="text-slate-300">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm italic">
                            {rec.employeeId === user.id ? 'You' : 'Team Member'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <span>📅</span>
            <span className="ml-2">Action Required</span>
          </h3>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-slate-100/50 p-6 rounded-2xl text-slate-500 text-center border-2 border-dashed border-slate-200">
                <p>All clear! No upcoming expiries for your accounts.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`p-4 rounded-2xl bg-white border-2 shadow-sm ${
                    notif.type === 'urgent' ? 'border-red-100' : 'border-indigo-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{notif.workTypeName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      notif.daysRemaining < 0 ? 'bg-red-500 text-white' : 
                      notif.daysRemaining === 0 ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
                    }`}>
                      {notif.daysRemaining < 0 ? 'PAST DUE' : notif.daysRemaining === 0 ? 'TODAY' : `${notif.daysRemaining}d`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{notif.primaryValue}</h4>
                  <p className="text-[10px] text-slate-500 italic mb-1">
                    By: {records.find(r => r.id === notif.recordId)?.employeeId === user.id ? 'You' : 'Team Member'}
                  </p>
                  <p className="text-xs font-medium text-indigo-600 mt-1">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Target Date: {notif.dateValue}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
