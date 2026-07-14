import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IconBook, IconDownload } from '@tabler/icons-react';
import Button from '../ui/Button';

export default function ManageBookOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
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

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/offers/book/${id}`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
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
        <Button onClick={exportCSV} className="bg-surface-variant text-on-surface hover:bg-surface-container">
          <IconDownload size={18} className="mr-2" /> Export CSV
        </Button>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5 text-sm">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-on-surface-variant">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
