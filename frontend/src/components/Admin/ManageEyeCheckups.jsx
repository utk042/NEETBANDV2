import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { IconEye, IconDownload } from '@tabler/icons-react';
import Button from '../ui/Button';

export default function ManageEyeCheckups() {
  const [checkups, setCheckups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCheckups();
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

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/offers/eye-checkup/${id}`, { status });
      fetchCheckups();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
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
        <Button onClick={exportCSV} className="bg-surface-variant text-on-surface hover:bg-surface-container">
          <IconDownload size={18} className="mr-2" /> Export CSV
        </Button>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5 text-sm">
            {checkups.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-on-surface-variant">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
