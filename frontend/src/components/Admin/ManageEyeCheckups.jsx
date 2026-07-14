import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IconEye, IconDownload, IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import Button from '../ui/Button';

export default function ManageEyeCheckups() {
  const [checkups, setCheckups] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    user: '',
    name: '',
    email: '',
    phone: '',
    location: '',
    preferredDate: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchCheckups();
    fetchUsers();
  }, []);

  const fetchCheckups = async () => {
    try {
      const res = await api.get('/admin/offers/eye-checkup');
      setCheckups(res.data);
    } catch (error) {
      console.error('Error fetching eye checkups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/students');
      setUsers(res.data.students || res.data); // depending on how students are returned
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/offers/eye-checkup/${id}`, { status });
      fetchCheckups();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this eye checkup request?")) return;
    try {
      await api.delete(`/admin/offers/eye-checkup/${id}`);
      fetchCheckups();
    } catch (error) {
      console.error('Error deleting eye checkup:', error);
      alert('Failed to delete');
    }
  };

  const openAddModal = () => {
    setFormData({
      user: '', name: '', email: '', phone: '', location: '', preferredDate: '', status: 'Pending'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (checkup) => {
    setFormData({
      user: checkup.user?._id || checkup.user || '',
      name: checkup.name || '',
      email: checkup.email || '',
      phone: checkup.phone || '',
      location: checkup.location || '',
      preferredDate: checkup.preferredDate ? new Date(checkup.preferredDate).toISOString().split('T')[0] : '',
      status: checkup.status || 'Pending'
    });
    setEditingId(checkup._id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.user) return alert("Please select a user");

    try {
      if (editingId) {
        await api.put(`/admin/offers/eye-checkup/${editingId}`, formData);
      } else {
        await api.post('/admin/offers/eye-checkup', formData);
      }
      setIsModalOpen(false);
      fetchCheckups();
    } catch (error) {
      console.error('Error saving eye checkup:', error);
      alert('Failed to save');
    }
  };

  const exportCSV = () => {
    const headers = ['Date Requested,Name,Email,Phone,Location,Preferred Date,Status'];
    const rows = checkups.map(c => 
      `"${new Date(c.createdAt).toLocaleDateString()}","${c.name}","${c.email}","${c.phone}","${c.location.replace(/"/g, '""')}","${c.preferredDate ? new Date(c.preferredDate).toLocaleDateString() : 'N/A'}","${c.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "eye_checkups.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-8 text-center">Loading records...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <IconEye className="text-emerald-500" /> Eye Checkup Requests
          </h2>
          <p className="text-sm text-on-surface-variant">Manage free eye checkup requests from premium members</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} className="bg-surface-variant text-on-surface hover:bg-surface-container">
            <IconDownload size={18} className="mr-2" /> Export CSV
          </Button>
          <Button onClick={openAddModal} className="bg-emerald-600 text-white hover:bg-emerald-700">
            <IconPlus size={18} className="mr-2" /> Add Request
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-surface border border-outline/10 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline/10">
              <th className="p-4 font-bold">Requested On</th>
              <th className="p-4 font-bold">Details</th>
              <th className="p-4 font-bold">Location</th>
              <th className="p-4 font-bold">Pref. Date</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5 text-sm">
            {checkups.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant">
                  No eye checkup requests found.
                </td>
              </tr>
            ) : (
              checkups.map(checkup => (
                <tr key={checkup._id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-on-surface-variant">
                    {new Date(checkup.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{checkup.name}</div>
                    <div className="text-xs text-on-surface-variant">{checkup.email}</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">{checkup.phone}</div>
                  </td>
                  <td className="p-4 text-on-surface-variant max-w-[250px] truncate" title={checkup.location}>
                    {checkup.location}
                  </td>
                  <td className="p-4 text-on-surface-variant whitespace-nowrap">
                    {checkup.preferredDate ? new Date(checkup.preferredDate).toLocaleDateString() : 'Flexible'}
                  </td>
                  <td className="p-4">
                    <select
                      value={checkup.status}
                      onChange={(e) => handleStatusChange(checkup._id, e.target.value)}
                      className="bg-surface-variant border-none text-xs font-bold px-3 py-1.5 rounded-lg text-on-surface focus:ring-0 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => openEditModal(checkup)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                      <IconEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(checkup._id)} className="p-2 text-on-surface-variant hover:text-red-500 transition-colors">
                      <IconTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface w-full max-w-xl rounded-2xl border border-outline/10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-outline/10">
              <h3 className="text-xl font-bold text-on-surface">{editingId ? 'Edit Eye Checkup' : 'Add Eye Checkup'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <IconX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-on-surface-variant mb-1">Select User (Required)</label>
                <select 
                  className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={formData.user}
                  onChange={e => setFormData({...formData, user: e.target.value})}
                  required
                >
                  <option value="" disabled>Select a user...</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-on-surface-variant mb-1">Name</label>
                  <input type="text" className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-on-surface-variant mb-1">Email</label>
                  <input type="email" className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-on-surface-variant mb-1">Phone</label>
                  <input type="text" className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-on-surface-variant mb-1">Preferred Date</label>
                  <input type="date" className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.preferredDate} onChange={e => setFormData({...formData, preferredDate: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-on-surface-variant mb-1">Location</label>
                <input type="text" className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-on-surface-variant mb-1">Status</label>
                <select className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" onClick={() => setIsModalOpen(false)} className="bg-surface-container hover:bg-surface-container-high text-on-surface">Cancel</Button>
                <Button type="submit" className="bg-primary text-on-primary hover:bg-primary/90">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
