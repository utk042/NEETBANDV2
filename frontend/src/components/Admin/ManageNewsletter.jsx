import React, { useState, useEffect } from 'react';
import { 
  getNewsletterSubscribers, 
  updateNewsletterSubscriber, 
  deleteNewsletterSubscriber,
  subscribeNewsletter 
} from '../../services/api';
import { 
  IconTrash, 
  IconPencil, 
  IconCheck, 
  IconX, 
  IconDownload, 
  IconSearch, 
  IconPlus 
} from '@tabler/icons-react';

export default function ManageNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editingEmail, setEditingEmail] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await getNewsletterSubscribers();
      setSubscribers(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      setAdding(true);
      await subscribeNewsletter(newEmail);
      setNewEmail('');
      await fetchSubscribers();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add subscriber');
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (sub) => {
    setEditingId(sub._id);
    setEditingEmail(sub.email);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingEmail('');
  };

  const handleSaveEdit = async (id) => {
    if (!editingEmail) return;
    try {
      await updateNewsletterSubscriber(id, editingEmail);
      setEditingId(null);
      setEditingEmail('');
      await fetchSubscribers();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update subscriber');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this email subscription?')) {
      return;
    }
    try {
      await deleteNewsletterSubscriber(id);
      await fetchSubscribers();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete subscriber');
    }
  };

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export functions
  const exportToCSV = () => {
    if (filteredSubscribers.length === 0) return;
    let csvContent = 'Email,Subscribed At\n';
    filteredSubscribers.forEach(sub => {
      const date = new Date(sub.createdAt).toLocaleString();
      csvContent += `"${sub.email}","${date}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToTXT = () => {
    if (filteredSubscribers.length === 0) return;
    let txtContent = '';
    filteredSubscribers.forEach(sub => {
      txtContent += `${sub.email}\n`;
    });
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0,10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-on-surface">Newsletter Subscribers</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 rounded-full">
              {subscribers.length} total
            </span>
          </div>
          <p className="text-on-surface-variant text-sm mt-1">
            View, search, edit, delete, and export registered newsletter emails.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            disabled={filteredSubscribers.length === 0}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <IconDownload size={18} /> Export Excel (CSV)
          </button>
          <button
            onClick={exportToTXT}
            disabled={filteredSubscribers.length === 0}
            className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-variant text-on-surface font-semibold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <IconDownload size={18} /> Export TXT
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Search bar */}
        <div className="md:col-span-6 relative">
          <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input
            type="text"
            placeholder="Search subscriber emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
          />
        </div>

        {/* Add Manual Form */}
        <form onSubmit={handleAddSubscriber} className="md:col-span-6 flex gap-2 w-full">
          <input
            type="email"
            placeholder="Add subscriber email manually..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <IconPlus size={18} /> Add
          </button>
        </form>
      </div>

      {/* Subscribers Table */}
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
            Loading subscribers...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-12 text-center text-on-surface-variant text-sm font-semibold">
            {searchQuery ? 'No subscribers match your search.' : 'No subscribers found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant text-xs uppercase tracking-wider font-bold bg-surface-container-high/50">
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Subscribed At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-on-surface">
                      {editingId === sub._id ? (
                        <input
                          type="email"
                          value={editingEmail}
                          onChange={(e) => setEditingEmail(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-surface border border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-md"
                        />
                      ) : (
                        sub.email
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {new Date(sub.createdAt).toLocaleString(undefined, {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === sub._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(sub._id)}
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20 transition-colors"
                              title="Save"
                            >
                              <IconCheck size={18} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error/20 text-error flex items-center justify-center border border-error/20 transition-colors"
                              title="Cancel"
                            >
                              <IconX size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(sub)}
                              className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center border border-primary/20 transition-colors"
                              title="Edit"
                            >
                              <IconPencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub._id)}
                              className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error/20 text-error flex items-center justify-center border border-error/20 transition-colors"
                              title="Delete"
                            >
                              <IconTrash size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
