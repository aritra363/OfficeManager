
import React from 'react';
import { User, WorkType, WorkRecord, Notification, NotificationType } from '../types';
import { differenceInDays, parseISO } from 'date-fns';

interface Props {
  users: User[];
  workTypes: WorkType[];
  records: WorkRecord[];
}

const AdminDashboard: React.FC<Props> = ({ users, workTypes, records }) => {
  const notifications: Notification[] = React.useMemo(() => {
    const list: Notification[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    records.forEach(record => {
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

        // Logic for admin overview
        const show = (field.notificationType === NotificationType.ALERT && days <= 10) || 
                     (field.notificationType === NotificationType.EXPIRY && days <= 30);

        if (show) {
          list.push({
            id: `${record.id}-${field.id}-admin`,
            recordId: record.id,
            workTypeName: type.name,
            primaryValue,
            dateValue: record.data[field.id],
            daysRemaining: days,
            type: days < 0 ? 'urgent' : days <= 7 ? 'warning' : 'info',
            notificationType: field.notificationType,
            message: `${field.label}: ${days < 0 ? 'Expired' : days === 0 ? 'Today' : days + ' days left'}`
          });
        }
      });
    });
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [records, workTypes]);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Admin Command Center</h2>
        <p className="text-slate-500">Overview of office activities and critical deadlines.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Team Members</p>
          <p className="text-3xl font-bold mt-1">{users.length - 1}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Work Types</p>
          <p className="text-3xl font-bold mt-1">{workTypes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Total Records</p>
          <p className="text-3xl font-bold mt-1">{records.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium">Critical Deadlines</p>
          <p className="text-3xl font-bold mt-1 text-red-600">{notifications.filter(n => n.daysRemaining <= 7).length}</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800">Alerts & Expiries</h3>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase">Next 30 Days</span>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-slate-500">No urgent deadlines or upcoming expiries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-4 rounded-xl border-l-4 shadow-sm bg-white flex flex-col justify-between ${
                  notif.type === 'urgent' ? 'border-red-500' : 
                  notif.type === 'warning' ? 'border-amber-500' : 'border-indigo-500'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{notif.workTypeName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      notif.daysRemaining < 0 ? 'bg-red-100 text-red-700' : 
                      notif.daysRemaining <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {notif.daysRemaining < 0 ? 'EXPIRED' : `${notif.daysRemaining} days left`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 line-clamp-1">{notif.primaryValue}</h4>
                  <p className="text-xs font-medium text-indigo-600 mt-1">{notif.message}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Target Date: {notif.dateValue}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
