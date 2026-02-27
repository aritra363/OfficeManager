
import React from 'react';
import { User, UserRole, WorkType } from '../types';

interface LayoutProps {
  user: User;
  workTypes: WorkType[];
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, workTypes, onLogout, children, activeTab, setActiveTab }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'employees', label: 'Manage Employees', icon: '👥' },
        { id: 'work-types', label: 'Setup Work Pages', icon: '🛠️' },
        { id: 'all-records', label: 'Office Records', icon: '📁' },
      ]
    : [
        { id: 'dashboard', label: 'My Dashboard', icon: '🏠' },
        { id: 'my-records', label: 'Office Records', icon: '📁' },
      ];

  const dynamicItems = workTypes.map(wt => ({
    id: `view-records-${wt.id}`,
    label: wt.name,
    icon: '📄'
  }));

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-400">OfficeHub Pro</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{user.role}</p>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">✕</button>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {dynamicItems.length > 0 && (
          <div className="pt-6 pb-2">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Work Entries</p>
            {dynamicItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium truncate text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-4 py-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.username}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-900/50 hover:text-red-200 transition-all text-slate-300"
        >
          <span>🚪</span>
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-30">
          <h1 className="text-lg font-bold text-indigo-600">OfficeHub Pro</h1>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            ☰
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
