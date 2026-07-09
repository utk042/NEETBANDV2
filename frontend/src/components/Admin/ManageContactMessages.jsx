import React, { useState, useEffect } from 'react';
import { getContactMessages, markContactMessageRead, deleteContactMessage } from '../../services/api';
import { IconMail, IconMailOpened, IconTrash, IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { useDialog } from '../../contexts/DialogContext';

export default function ManageContactMessages() {
  const { confirm, toast } = useDialog();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markContactMessageRead(id);
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, isRead: true } : msg
      ));
      toast.success("Message marked as read");
    } catch (err) {
      console.error('Error marking as read:', err);
      toast.error("Failed to mark message as read: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!await confirm("Delete Message", "Are you sure you want to delete this message?")) return;
    try {
      await deleteContactMessage(id);
      setMessages(messages.filter(msg => msg._id !== id));
      toast.success("Message deleted successfully");
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error("Failed to delete message: " + err.message);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-[24px] md:text-[28px] font-bold text-on-surface tracking-tight mb-1">Contact Messages</h2>
          <p className="text-on-surface-variant text-[14px] md:text-[15px]">View and manage inquiries from the contact form.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3 text-error">
          <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email, or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-variant border-none rounded-xl text-on-surface focus:ring-2 focus:ring-primary/50 font-body-md transition-shadow"
          />
        </div>
      </div>

      <div className="bg-surface border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-variant/30 text-on-surface-variant font-label-md text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Sender</th>
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold w-1/3">Message</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">Loading messages...</td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">No messages found.</td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg._id} className={`group transition-colors ${!msg.isRead ? 'bg-primary/5' : 'hover:bg-surface-variant/30'}`}>
                    <td className="p-4">
                      {msg.isRead ? (
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-medium">
                          <IconMailOpened size={16} /> Read
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                          <IconMail size={16} /> New
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-on-surface whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-bold text-on-surface">{msg.name}</div>
                      <div className="text-on-surface-variant text-xs">{msg.email}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-on-surface">
                      {msg.subject}
                    </td>
                    <td className="p-4 text-sm text-on-surface-variant max-w-[250px] truncate">
                      {msg.message}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(msg._id)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Mark as Read"
                          >
                            <IconMailOpened size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                          title="Delete Message"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
