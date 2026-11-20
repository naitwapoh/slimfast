import React, { useState, useEffect } from 'react';
import { Users, Plus, ShieldCheck, UserCheck, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { db, auth, app } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BmsStaff = () => {
  const { t } = useLanguage();
  const { isOwner, userProfile, currentUser } = useAuth();

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

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    // 1. Listen to staff in users collection
    const unsubStaff = onSnapshot(collection(db, 'users'), (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
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
        performedBy: userProfile?.name || currentUser?.email || 'Owner',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      alert('Error updating staff status: ' + err.message);
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    if (!isOwner || !formData.email || !formData.password || !db) return;
    setCreateLoading(true);
    setErrorMsg('');

    try {
      // Create a secondary app instance to avoid logging out the current owner session!
      const secondaryApp = initializeApp(app.options, `WorkerCreation_${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      
      const cred = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
      
      const newStaffDoc = {
        uid: cred.user.uid,
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        role: formData.role,
        isActive: true,
        createdBy: userProfile?.name || currentUser?.email || 'Owner',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', cred.user.uid), newStaffDoc);

      await addDoc(collection(db, 'audit_logs'), {
        action: `Created new ${formData.role} account for ${formData.name} (${formData.email})`,
        performedBy: userProfile?.name || currentUser?.email || 'Owner',
        timestamp: new Date().toISOString()
      });

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
            {t('bms.staff.subtitle')}
          </p>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('bms.staff.createWorker')}</span>
          </button>
        )}
      </div>

      {/* Staff Members List */}
      <div className="bg-white rounded-3xl border border-brand-leaf/25 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-leaf/20 bg-brand-surface flex items-center justify-between">
          <h3 className="text-sm font-bold font-serif text-brand-forest">
            Authorized Personnel ({staffList.length})
          </h3>
        </div>

        {staffList.length === 0 ? (
          <div className="p-10 text-center text-xs text-brand-muted">
            {t('bms.staff.emptyStaff')}
          </div>
        ) : (
          <div className="divide-y divide-brand-leaf/10">
            {staffList.map((member) => (
              <div key={member.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-surface/40 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-surface flex items-center justify-center text-brand-forest border border-brand-leaf/20 font-bold">
                    {(member.name || member.email || 'S')[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-charcoal">
                      {member.name || 'Staff Member'}
                    </h4>
                    <p className="text-xs text-brand-muted mt-0.5">{member.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-surface text-brand-forest border border-brand-leaf/20">
                        {member.role === 'owner' ? t('bms.roleOwner') : t('bms.roleWorker')}
                      </span>
                      <span className={`text-[10px] font-bold ${member.isActive !== false ? 'text-emerald-700' : 'text-red-600'}`}>
                        {member.isActive !== false ? t('bms.staff.statusActive') : t('bms.staff.statusInactive')}
                      </span>
                    </div>
                  </div>
                </div>

                {isOwner && member.uid !== currentUser?.uid && (
                  <button
                    type="button"
                    onClick={() => handleToggleStaffStatus(member)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      member.isActive !== false
                        ? 'border-red-200 text-red-700 hover:bg-red-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {member.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
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

      {/* Add Worker Modal */}
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
              {t('bms.staff.createWorker')}
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
                  {t('bms.staff.workerName')} *
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
                  {t('bms.staff.workerEmail')} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="bakari@slimfast.co.tz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.staff.temporaryPassword')} *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs bg-brand-surface/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">
                  {t('bms.staff.assignRole')} *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-brand-leaf/30 text-xs font-bold bg-brand-surface/40"
                >
                  <option value="worker">{t('bms.staff.roleWorker')}</option>
                  <option value="owner">{t('bms.staff.roleOwner')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-brand-charcoal"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold shadow-md"
                >
                  {createLoading ? t('loading') : 'Register Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

