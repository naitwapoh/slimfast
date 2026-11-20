import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, Trash2, X, Clock, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BmsStaff = () => {
  const { t } = useLanguage();
  const { isOwner, userProfile } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // 1. Listen to staff in users collection
    const unsubStaff = onSnapshot(collection(db, 'users'), (snap) => {
      const list = [];
      snap.forEach(d => {
        if (d.id !== 'master-admin') {
          list.push({ id: d.id, ...d.data() });
        }
      });
      setStaffList(list);
      setLoading(false);
    });

    // 2. Listen to audit logs
    const unsubAudit = onSnapshot(collection(db, 'audit_logs'), (snap) => {
      const logs = [];
      snap.forEach(d => logs.push({ id: d.id, ...d.data() }));
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAuditLogs(logs);
    });

    return () => {
      unsubStaff();
      unsubAudit();
    };
  }, []);

  const handleToggleStaffStatus = async (staffMember) => {
    if (!isOwner || !db) return;
    const newStatus = staffMember.isActive === false ? true : false;
    try {
      await updateDoc(doc(db, 'users', staffMember.id), {
        isActive: newStatus
      });

      await addDoc(collection(db, 'audit_logs'), {
        action: `${newStatus ? 'Activated' : 'Deactivated'} staff account for ${staffMember.name || staffMember.email}`,
        performedBy: 'admin',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      alert('Error updating staff status: ' + err.message);
    }
  };

  const handleDeleteStaff = async (staffMember) => {
    if (!isOwner || !db) return;
    if (!window.confirm(`Are you sure you want to remove worker account for ${staffMember.name}?`)) return;
    try {
      await deleteDoc(doc(db, 'users', staffMember.id));
      await addDoc(collection(db, 'audit_logs'), {
        action: `Removed staff account: ${staffMember.name}`,
        performedBy: 'admin',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      alert('Error deleting staff: ' + err.message);
    }
  };

  // Admin registers worker and assigns them password
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!isOwner || !formData.name || !formData.password || !db) return;
    setCreateLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const workerId = 'worker_' + Date.now();
      const newStaffDoc = {
        name: formData.name.trim(),
        email: (formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@slimfast.co.tz`).trim(),
        password: formData.password.trim(),
        role: formData.role || 'worker',
        isActive: true,
        createdBy: 'admin',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', workerId), newStaffDoc);

      await addDoc(collection(db, 'audit_logs'), {
        action: `Admin registered worker: ${newStaffDoc.name} (Role: ${newStaffDoc.role})`,
        performedBy: 'admin',
        timestamp: new Date().toISOString()
      });

      setSuccessMsg(`Worker account for "${newStaffDoc.name}" registered successfully with assigned password!`);
      setFormData({ name: '', email: '', password: '', role: 'worker' });
      setModalOpen(false);
    } catch (err) {
      console.error('Error creating worker:', err);
      setErrorMsg(err.message || 'Error creating account.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-serif text-brand-forest">
            {t('bms.staff.title')}
          </h2>
          <p className="text-xs text-brand-charcoal/70 mt-1">
            Admin registers workers and assigns them their passwords.
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Worker</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Identity Card */}
      <div className="bg-brand-forest text-white p-5 rounded-2xl flex items-center justify-between border border-brand-leaf/30 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-brand-leaf border border-white/20 font-black">
            A
          </div>
          <div>
            <h4 className="text-sm font-bold">Admin (Business Owner)</h4>
            <p className="text-xs text-white/70">Master Administrator: name: <code className="font-mono font-bold text-brand-leaf">admin</code></p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-brand-leaf text-white text-[10px] font-black uppercase">
          Master Authority
        </span>
      </div>

      {/* Staff Members List */}
      <div className="bg-white rounded-3xl border border-brand-leaf/25 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-leaf/20 bg-brand-surface flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-brand-forest">
            Registered Shop Workers ({staffList.length})
          </h3>
          <span className="text-xs text-brand-muted">Credentials issued by Admin</span>
        </div>

        {staffList.length === 0 ? (
          <div className="p-10 text-center text-xs text-brand-muted">
            No shop workers registered yet. Click "+ Register New Worker" to create worker logins.
          </div>
        ) : (
          <div className="divide-y divide-brand-leaf/10">
            {staffList.map((member) => (
              <div key={member.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-surface/40 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center text-brand-forest border border-brand-leaf/20 font-bold">
                    {(member.name || 'W')[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-charcoal">
                      {member.name}
                    </h4>
                    <p className="text-xs text-brand-muted mt-0.5">
                      Username/Email: <strong className="text-brand-charcoal">{member.email || member.name}</strong> • Password: <code className="font-mono bg-brand-surface px-1.5 py-0.5 rounded border border-brand-leaf/20">{member.password || '••••••'}</code>
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-surface text-brand-forest border border-brand-leaf/20">
                        {member.role === 'owner' ? 'Owner' : 'Shop Worker'}
                      </span>
                      <span className={`text-[10px] font-bold ${member.isActive !== false ? 'text-emerald-700' : 'text-red-600'}`}>
                        {member.isActive !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStaffStatus(member)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        member.isActive !== false
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {member.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStaff(member)}
                      className="p-1.5 rounded-lg text-brand-muted hover:text-red-600 transition-colors"
                      title="Delete worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log / Employee Activity Trail */}
      <div className="bg-white rounded-3xl border border-brand-leaf/25 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-leaf" />
          <h3 className="text-sm font-bold font-serif text-brand-forest">
            {t('bms.staff.auditLogTitle')}
          </h3>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-muted">
            {t('bms.staff.auditEmpty')}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-3 bg-brand-surface/60 rounded-xl border border-brand-leaf/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <div>
                  <span className="font-semibold text-brand-charcoal">{log.action}</span>
                  <span className="text-brand-muted ml-2">by <strong>{log.performedBy}</strong></span>
                </div>
                <span className="text-[10px] text-brand-muted font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Register Worker Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-brand-leaf/30 p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-surface text-brand-charcoal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-serif text-brand-forest">
              Register Worker & Assign Password
            </h3>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  Worker Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bakari Mwinyi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  Worker Login Username / Email (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. bakari (will default to name if empty)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  Assign Password *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-brand-muted" />
                  <input
                    type="text"
                    required
                    placeholder="Enter password for this worker"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40 font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-brand-muted mt-1 block">
                  Give this password to the worker so they can log into the POS & Order Fulfillment desk.
                </span>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-brand-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold shadow-md"
                >
                  {createLoading ? 'Registering...' : 'Register Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
