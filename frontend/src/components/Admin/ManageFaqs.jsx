import React, { useState, useEffect } from 'react';
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import BlogEditor from './BlogEditor';

export default function ManageFaqs() {
  const { alert, confirm } = useDialog();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: null,
    question: '',
    answer: '',
    page: 'homepage',
    order: 0,
    isActive: true
  });

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await getAllFaqs();
      setFaqs(data);
    } catch (err) {
      alert("Error", err.message || "Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setFormData(faq);
    } else {
      setFormData({
        _id: null,
        question: '',
        answer: '',
        page: 'homepage',
        order: 0,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData._id) {
        await updateFaq(formData._id, formData);
        alert("Success", "FAQ updated successfully");
      } else {
        await createFaq(formData);
        alert("Success", "FAQ created successfully");
      }
      handleCloseModal();
      fetchFaqs();
    } catch (err) {
      alert("Error", err.message || "Failed to save FAQ");
    }
  };

  const handleDelete = async (id) => {
    if (await confirm("Delete FAQ", "Are you sure you want to delete this FAQ?")) {
      try {
        await deleteFaq(id);
        alert("Success", "FAQ deleted successfully");
        fetchFaqs();
      } catch (err) {
        alert("Error", err.message || "Failed to delete FAQ");
      }
    }
  };

  // Removed modules as BlogEditor handles it

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Manage FAQs</h2>
          <p className="text-on-surface-variant text-sm mt-1">Add, edit, or remove FAQs for homepage and pricing page.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <IconPlus size={20} /> Add FAQ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 text-on-surface-variant">
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold">Question</th>
                <th className="py-3 px-4 font-semibold">Page</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map(faq => (
                <tr key={faq._id} className="border-b border-outline-variant/20 hover:bg-surface-variant/30">
                  <td className="py-3 px-4 text-on-surface">{faq.order}</td>
                  <td className="py-3 px-4 text-on-surface font-medium">{faq.question}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-surface-variant text-on-surface text-xs rounded-md capitalize">
                      {faq.page}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {faq.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-semibold px-2 py-1 bg-emerald-500/10 rounded-md">
                        <IconCheck size={14} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-on-surface-variant text-xs font-semibold px-2 py-1 bg-surface-variant rounded-md">
                        <IconX size={14} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleOpenModal(faq)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors mr-2">
                      <IconEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(faq._id)} className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors">
                      <IconTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {faqs.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-on-surface-variant">No FAQs found. Add one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{formData._id ? 'Edit FAQ' : 'Add New FAQ'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Question</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-variant border border-outline/20 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Answer</label>
                <div className="bg-white text-black rounded-lg overflow-hidden">
                  <BlogEditor 
                    content={formData.answer}
                    setContent={(val) => setFormData({...formData, answer: val})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Page</label>
                  <select 
                    className="w-full bg-surface-variant border border-outline/20 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none capitalize"
                    value={formData.page}
                    onChange={(e) => setFormData({...formData, page: e.target.value})}
                  >
                    <option value="homepage">Homepage</option>
                    <option value="pricing">Pricing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Order</label>
                  <input 
                    type="number" 
                    className="w-full bg-surface-variant border border-outline/20 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active (Visible on site)</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-on-surface hover:bg-surface-variant transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors font-semibold">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
