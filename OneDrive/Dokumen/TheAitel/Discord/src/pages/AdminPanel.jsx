import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAllUsers, updateUserRole, updateUserStatus, deleteUser, preCreateUser } from '../services/userService';
import { Shield, User, ChevronLeft, Loader2, CheckCircle2, Trash2, Ban, UserCheck, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  'admin',
  'prompt-engineer',
  'developer',
  'business-development-executive',
  'unassigned'
];

const STATUSES = ['active', 'blocked'];

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    displayName: '',
    email: '',
    role: 'unassigned'
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await preCreateUser(newEmployee);
      showSuccess('Employee pre-authorized');
      setShowAddForm(false);
      setNewEmployee({ displayName: '', email: '', role: 'unassigned' });
      await loadUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showSuccess('Role updated');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    try {
      await updateUserStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      showSuccess('Status updated');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setUpdatingId(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      showSuccess('User deleted');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (loading && users.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-discord-chat">
        <Loader2 className="w-12 h-12 animate-spin text-discord-accent" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-transparent flex flex-col overflow-hidden relative">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/40 backdrop-blur-xl shadow-lg shrink-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-white/10 text-discord-muted hover:text-white transition-all hover:-translate-x-1"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-discord-accent/20 p-1.5 rounded-lg border border-discord-accent/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Shield className="w-6 h-6 text-discord-accent" />
            </div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight uppercase">Executive Control</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          {successMsg && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-bold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 animate-in fade-in slide-in-from-right-4">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-discord-accent hover:bg-discord-accent/80 text-white px-5 py-2.5 rounded-xl font-extrabold transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] active:scale-95 hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Team', count: users.length, icon: User, color: 'from-blue-500/20 to-transparent', textColor: 'text-blue-400' },
              { label: 'Active Now', count: users.filter(u => u.status !== 'blocked').length, icon: UserCheck, color: 'from-green-500/20 to-transparent', textColor: 'text-green-400' },
              { label: 'Restricted', count: users.filter(u => u.status === 'blocked').length, icon: Ban, color: 'from-red-500/20 to-transparent', textColor: 'text-red-400' },
            ].map((stat, i) => (
              <div key={i} className={`bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-30`}></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-discord-muted uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-3xl font-black ${stat.textColor}`}>{stat.count}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-black/40 border border-white/5 ${stat.textColor}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Employee Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <div className="bg-[#0A0B14]/90 backdrop-blur-3xl w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-discord-accent/10 to-transparent">
                  <h2 className="text-xl font-black text-white flex items-center gap-3">
                    <UserPlus className="text-discord-accent" />
                    REGISTER NEW MEMBER
                  </h2>
                  <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/10 rounded-full text-discord-muted hover:text-white transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleAddEmployee} className="p-8 space-y-6">
                  <div>
                    <label className="block text-xs font-black text-discord-muted uppercase mb-2 tracking-widest">Full Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-discord-accent transition-all focus:bg-black/60 shadow-inner"
                      placeholder="e.g. John Doe"
                      value={newEmployee.displayName}
                      onChange={(e) => setNewEmployee({...newEmployee, displayName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-discord-muted uppercase mb-2 tracking-widest">Email Identity</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-discord-accent transition-all focus:bg-black/60 shadow-inner"
                      placeholder="name@theaitel.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-discord-muted uppercase mb-2 tracking-widest">Access Role</label>
                    <select 
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-discord-accent transition-all cursor-pointer focus:bg-black/60 shadow-inner appearance-none"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r} className="bg-[#0A0B14]">{r.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-4 rounded-xl font-black text-discord-muted hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-4 bg-discord-accent hover:bg-discord-accent/80 text-white rounded-xl font-black transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,240,255,0.3)] uppercase tracking-widest text-sm"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Authorize'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* User List Table */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/5 relative">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-black text-discord-muted uppercase tracking-widest text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-discord-accent" />
                Active Directory
              </h3>
              <span className="text-xs text-discord-muted bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {users.length} Users Found
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/40 text-discord-muted text-[10px] uppercase tracking-[0.2em]">
                    <th className="px-8 py-5 font-black">Identity</th>
                    <th className="px-8 py-5 font-black">Authentication</th>
                    <th className="px-8 py-5 font-black">Permission Level</th>
                    <th className="px-8 py-5 font-black">Account Status</th>
                    <th className="px-8 py-5 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => {
                    const isPrimaryAdmin = u.email === 'ramsiva97465@gmail.com';
                    return (
                      <tr key={u.id} className="hover:bg-discord-accent/[0.03] transition-all group animate-in fade-in slide-in-from-bottom-2">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="relative group/avatar">
                              <div className="absolute -inset-1 bg-gradient-to-tr from-discord-accent to-purple-500 rounded-full opacity-0 group-hover/avatar:opacity-100 blur transition-opacity"></div>
                              <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center overflow-hidden relative border border-white/10 group-hover:border-discord-accent/50 transition-all">
                                {u.photoURL ? (
                                  <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-7 h-7 text-discord-muted group-hover:text-discord-accent transition-colors" />
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="font-black text-white block text-sm tracking-tight">{u.displayName || 'Unnamed Entity'}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-discord-muted uppercase font-bold tracking-tighter opacity-70">UID: {u.id.substring(0, 8)}...</span>
                                {u.isPreAuthorized && <span className="bg-yellow-500/10 text-yellow-500 text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/20 font-black uppercase">Pending</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-discord-muted group-hover:text-white transition-colors">{u.email}</span>
                            <span className="text-[9px] text-discord-muted/50 uppercase font-black">Authorized Email</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="relative group/select">
                            <select 
                              className="bg-black/40 text-discord-accent text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-2 outline-none border border-discord-accent/20 focus:border-discord-accent focus:ring-1 focus:ring-discord-accent transition-all cursor-pointer w-full appearance-none hover:bg-black/60"
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              disabled={updatingId === u.id || isPrimaryAdmin}
                            >
                              {ROLES.map(r => (
                                <option key={r} value={r} className="bg-[#0A0B14]">{r.toUpperCase()}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <select 
                              className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-2 outline-none border transition-all cursor-pointer w-32 appearance-none ${
                                u.status === 'blocked' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                              }`}
                              value={u.status || 'active'}
                              onChange={(e) => handleStatusChange(u.id, e.target.value)}
                              disabled={updatingId === u.id || isPrimaryAdmin}
                            >
                              {STATUSES.map(s => (
                                <option key={s} value={s} className="bg-[#0A0B14]">{s.toUpperCase()}</option>
                              ))}
                            </select>
                            {u.status === 'blocked' ? <Ban className="w-4 h-4 text-red-500 animate-pulse" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {updatingId === u.id ? (
                              <Loader2 className="w-6 h-6 animate-spin text-discord-accent" />
                            ) : (
                              !isPrimaryAdmin && (
                                <button 
                                  onClick={() => handleDelete(u.id)}
                                  className="p-3 text-discord-muted hover:text-red-500 transition-all rounded-xl hover:bg-red-500/10 active:scale-90 border border-transparent hover:border-red-500/20"
                                  title="Terminte User Access"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Footer shadow glow */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
