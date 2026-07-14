import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IconBook, IconDownload, IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import Button from '../ui/Button';

export default function ManageBookOrders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    user: '',
    phone: '',
    address: '',
    paymentStatus: 'Completed',
    dispatchStatus: 'Pending Dispatch'
  });

  useEffect(() => {
    fetchOrders();
    fetchUsers();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/offers/book');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching book orders:', error);
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
      await api.put(`/admin/offers/book/${id}`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book order?")) return;
    try {
      await api.delete(`/admin/offers/book/${id}`);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting book order:', error);
      alert('Failed to delete');
    }
  };

  const openAddModal = () => {
    setFormData({
      user: '', phone: '', address: '', paymentStatus: 'Completed', dispatchStatus: 'Pending Dispatch'
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    setFormData({
      user: order.user?._id || order.user || '',
      phone: order.phone || '',
      address: order.address || '',
      paymentStatus: order.paymentStatus || 'Completed',
      dispatchStatus: order.dispatchStatus || 'Pending Dispatch'
    });
    setEditingId(order._id);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.user) return alert("Please select a user");

    try {
      if (editingId) {
        await api.put(`/admin/offers/book/${editingId}`, formData);
      } else {
        await api.post('/admin/offers/book', formData);
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving book order:', error);
      alert('Failed to save');
    }
  };

  const exportCSV = () => {
    const headers = ['Date,User Name,Email,Phone,Address,Payment Status,Dispatch Status'];
    const rows = orders.map(order => 
      `"${new Date(order.createdAt).toLocaleDateString()}","${order.user?.name || 'N/A'}","${order.user?.email || 'N/A'}","${order.phone}","${order.address.replace(/"/g, '""')}","${order.paymentStatus}","${order.dispatchStatus}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "book_orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <IconBook className="text-amber-500" /> Book Orders
          </h2>
          <p className="text-sm text-on-surface-variant">Manage book purchases from premium members</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV} className="bg-surface-variant text-on-surface hover:bg-surface-container">
            <IconDownload size={18} className="mr-2" /> Export CSV
          </Button>
          <Button onClick={openAddModal} className="bg-amber-600 text-white hover:bg-amber-700">
            <IconPlus size={18} className="mr-2" /> Add Order
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-surface border border-outline/10 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider border-b border-outline/10">
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold">User</th>
              <th className="p-4 font-bold">Contact</th>
              <th className="p-4 font-bold">Address</th>
              <th className="p-4 font-bold">Payment</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5 text-sm">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-on-surface-variant">
                  No book orders found.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order._id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 whitespace-nowrap text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-on-surface">{order.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-on-surface-variant">{order.user?.email || 'N/A'}</div>
                  </td>
                  <td className="p-4 text-on-surface-variant whitespace-nowrap">
                    {order.phone}
                  </td>
                  <td className="p-4 text-on-surface-variant max-w-[200px] truncate" title={order.address}>
                    {order.address}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.dispatchStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="bg-surface-variant border-none text-xs font-bold px-3 py-1.5 rounded-lg text-on-surface focus:ring-0 cursor-pointer"
                    >
                      <option value="Pending Dispatch">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => openEditModal(order)} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                      <IconEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(order._id)} className="p-2 text-on-surface-variant hover:text-red-500 transition-colors">
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
              <h3 className="text-xl font-bold text-on-surface">{editingId ? 'Edit Book Order' : 'Add Book Order'}</h3>
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

              <div className="flex flex-col">
                <label className="text-sm font-medium text-on-surface-variant mb-1">Phone</label>
                <input type="text" className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-on-surface-variant mb-1">Address</label>
                <textarea className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-on-surface-variant mb-1">Payment Status</label>
                  <select className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-on-surface-variant mb-1">Dispatch Status</label>
                  <select className="bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50" value={formData.dispatchStatus} onChange={e => setFormData({...formData, dispatchStatus: e.target.value})}>
                    <option value="Pending Dispatch">Pending Dispatch</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
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
