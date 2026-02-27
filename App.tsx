
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, WorkType, WorkRecord } from './types';
import { Storage } from './storage';
import { firebaseService } from './firebaseService';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import EmployeeManager from './components/EmployeeManager';
import WorkTypeBuilder from './components/WorkTypeBuilder';
import EmployeeDashboard from './components/EmployeeDashboard';
import WorkEntryForm from './components/WorkEntryForm';
import RecordList from './components/RecordList';
import { Toaster, toast } from 'react-hot-toast';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  const [users, setUsers] = useState<User[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [records, setRecords] = useState<WorkRecord[]>([]);

  const isRemoteUpdate = useRef(false);
  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Initialize Firebase and set up real-time listeners
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        
        // Initialize Firebase
        console.log('🔧 Initializing Firebase...');
        await firebaseService.initialize();
        console.log('✅ Firebase initialized successfully');

        // Set up real-time listeners
        console.log('👂 Setting up real-time listeners...');
        const userUnsubscribe = firebaseService.subscribeToUsers((updatedUsers) => {
          console.log('👥 Users updated:', updatedUsers);
          setUsers(updatedUsers);
          if (!isRemoteUpdate.current) {
            toast.success('Team updated', { icon: '👥' });
          }
        });

        const workTypesUnsubscribe = firebaseService.subscribeToWorkTypes((updatedTypes) => {
          console.log('🛠️ Work types updated:', updatedTypes);
          setWorkTypes(updatedTypes);
          if (!isRemoteUpdate.current) {
            toast.success('Work categories updated', { icon: '🛠️' });
          }
        });

        const recordsUnsubscribe = firebaseService.subscribeToWorkRecords((updatedRecords) => {
          console.log('📁 Records updated:', updatedRecords);
          setRecords(updatedRecords);
          if (!isRemoteUpdate.current) {
            toast.success('New activity recorded', { icon: '📁' });
          }
        });

        unsubscribesRef.current = [userUnsubscribe, workTypesUnsubscribe, recordsUnsubscribe];
        console.log('✅ All listeners set up successfully');
        setLoading(false);
        setError(null);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to initialize app:', error);
        setError(errorMsg);
        setLoading(false);
        toast.error(`Failed to connect to database: ${errorMsg}`);
      }
    };

    initializeApp();

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribesRef.current.forEach(unsub => unsub());
    };
  }, []);

  // Handle Work Selection/Editing
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | null>(null);
  const [editingRecord, setEditingRecord] = useState<WorkRecord | null>(null);

  // Intercept tab changes for dynamic entries
  useEffect(() => {
    if (activeTab.startsWith('work-entry-')) {
      const typeId = activeTab.replace('work-entry-', '');
      const type = workTypes.find(t => t.id === typeId);
      if (type) {
        setSelectedWorkType(type);
        setEditingRecord(null);
      }
    } else if (activeTab.startsWith('view-records-')) {
      const typeId = activeTab.replace('view-records-', '');
      const type = workTypes.find(t => t.id === typeId);
      if (type) {
        setSelectedWorkType(type);
      }
    }
  }, [activeTab, workTypes]);

  const handleLogin = (u: User) => {
    setUser(u);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedWorkType(null);
    setEditingRecord(null);
  };

  const handleNewEntryFromDashboard = (typeId: string) => {
    setActiveTab(`work-entry-${typeId}`);
  };

  const handleAdminEditRecord = (record: WorkRecord) => {
    const type = workTypes.find(t => t.id === record.workTypeId);
    if (type) {
      setEditingRecord(record);
      setSelectedWorkType(type);
      setActiveTab('edit-record-form');
    }
  };

  const renderContent = () => {
    if (user.role === UserRole.ADMIN) {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard users={users} workTypes={workTypes} records={records} />;
        case 'employees':
          return <EmployeeManager users={users} onUpdate={setUsers} />;
        case 'work-types':
          return <WorkTypeBuilder workTypes={workTypes} onUpdate={setWorkTypes} />;
        case 'all-records':
          return (
            <RecordList 
              records={records} 
              workTypes={workTypes} 
              users={users} 
              currentUser={user} 
              onUpdate={setRecords}
              onEdit={handleAdminEditRecord}
            />
          );
        case 'edit-record-form':
          if (!selectedWorkType || !editingRecord) {
            setActiveTab('all-records');
            return null;
          }
          return (
            <WorkEntryForm 
              workType={selectedWorkType} 
              user={user} 
              initialData={editingRecord.data}
              onSave={async (recData) => {
                try {
                  const updatedRecord = { ...editingRecord, data: recData, lastUpdated: Date.now() };
                  await firebaseService.saveWorkRecord(updatedRecord);
                  toast.success('Record updated successfully! ✅');
                  setActiveTab('all-records');
                  setSelectedWorkType(null);
                  setEditingRecord(null);
                } catch (error) {
                  toast.error('Failed to update record');
                  console.error('Error updating record:', error);
                }
              }}
              onCancel={() => {
                setActiveTab('all-records');
                setSelectedWorkType(null);
                setEditingRecord(null);
              }}
            />
          );
        default:
          return <AdminDashboard users={users} workTypes={workTypes} records={records} />;
      }
    } else {
      // Employee Logic
      if (activeTab.startsWith('work-entry-') && selectedWorkType) {
        return (
          <WorkEntryForm 
            workType={selectedWorkType} 
            user={user} 
            onSave={async (recData) => {
              try {
                const newRec: WorkRecord = {
                  id: `record-${Date.now()}`,
                  workTypeId: selectedWorkType.id,
                  employeeId: user.id,
                  data: recData,
                  createdAt: Date.now(),
                  lastUpdated: Date.now()
                };
                await firebaseService.saveWorkRecord(newRec);
                toast.success('Entry submitted successfully! ✅');
                setActiveTab(`view-records-${selectedWorkType.id}`);
                setSelectedWorkType(null);
              } catch (error) {
                toast.error('Failed to submit entry');
                console.error('Error saving record:', error);
              }
            }}
            onCancel={() => {
              setActiveTab(`view-records-${selectedWorkType.id}`);
              setSelectedWorkType(null);
            }}
          />
        );
      }

      if (activeTab.startsWith('view-records-') && selectedWorkType) {
        return (
          <RecordList 
            records={records} 
            workTypes={workTypes} 
            users={users} 
            currentUser={user} 
            onUpdate={setRecords}
            onEdit={() => {}}
            onNew={handleNewEntryFromDashboard}
            initialFilter={selectedWorkType.id}
          />
        );
      }

      switch (activeTab) {
        case 'dashboard':
          return (
            <EmployeeDashboard 
              user={user} 
              workTypes={workTypes} 
              records={records} 
              onNewEntry={handleNewEntryFromDashboard} 
            />
          );
        case 'my-records':
          return (
            <RecordList 
              records={records} 
              workTypes={workTypes} 
              users={users} 
              currentUser={user} 
              onUpdate={setRecords}
              onEdit={() => {}} 
              onNew={handleNewEntryFromDashboard}
            />
          );
        default:
          return <EmployeeDashboard user={user} workTypes={workTypes} records={records} onNewEntry={handleNewEntryFromDashboard} />;
      }
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-slate-900 flex items-center justify-center">
        <Toaster position="top-right" />
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-6 animate-bounce backdrop-blur-sm">
            🏢
          </div>
          <h1 className="text-3xl font-black text-white mb-2">OfficeHub Pro</h1>
          <p className="text-indigo-100 mb-8">Initializing your office management system...</p>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-slate-900 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-400/20 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-6 backdrop-blur-sm">
            ❌
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Connection Error</h1>
          <p className="text-red-100 mb-4">{error}</p>
          <p className="text-red-200 text-sm mb-6">Please check:</p>
          <ul className="text-red-200 text-sm text-left space-y-2 mb-8">
            <li>✓ Firebase credentials in .env.local</li>
            <li>✓ Internet connection</li>
            <li>✓ Firebase project is active</li>
            <li>✓ Browser console for more details</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-red-600 font-bold px-6 py-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // No user - show login
  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage users={users} onLogin={handleLogin} />
      </>
    );
  }

  // User logged in - show app
  return (
    <>
      <Toaster position="top-right" />
      <Layout 
        user={user} 
        workTypes={workTypes}
        onLogout={handleLogout} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      >
        {renderContent()}
      </Layout>
    </>
  );
};

export default App;
