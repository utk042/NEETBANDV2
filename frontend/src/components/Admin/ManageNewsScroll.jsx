import React, { useState, useEffect } from 'react';
import { getNewsScrollSettings, updateNewsScrollSettings } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { 
  IconPlus, 
  IconTrash, 
  IconRefresh, 
  IconDeviceFloppy, 
  IconEye, 
  IconEyeOff, 
  IconAlertTriangle, 
  IconCheck 
} from '@tabler/icons-react';

export default function ManageNewsScroll() {
  const { confirm, toast } = useDialog();
  const [enabled, setEnabled] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const maxItems = 5;
  const maxCharLimit = 80;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getNewsScrollSettings();
      setEnabled(data.enabled);
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      showMsg('error', 'Failed to fetch settings from server.');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleAddItem = () => {
    if (items.length >= maxItems) {
      showMsg('error', `Maximum limit of ${maxItems} news items reached.`);
      return;
    }
    setItems([...items, '']);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleItemChange = (index, value) => {
    if (value.length > maxCharLimit) return; // Prevent inputting beyond hard limit
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Filter out empty items
    const filteredItems = items.map(item => item.trim()).filter(item => item !== '');
    if (filteredItems.length === 0 && enabled) {
      showMsg('error', 'Please add at least one news item if news scroll is enabled.');
      return;
    }

    // Check item lengths
    for (let item of filteredItems) {
      if (item.length > maxCharLimit) {
        showMsg('error', `Each news item must be ${maxCharLimit} characters or less.`);
        return;
      }
    }

    setSaving(true);
    try {
      const data = await updateNewsScrollSettings({
        enabled,
        items: filteredItems
      });
      setEnabled(data.enabled);
      setItems(data.items || []);
      showMsg('success', 'News scroller settings saved and updated for all users.');
    } catch (err) {
      console.error(err);
      showMsg('error', err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">News Scroller Settings</h2>
          <p className="text-on-surface-variant text-sm mt-1">Configure the global scrolling announcement banner</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
          enabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-outline/10 text-on-surface-variant border border-outline/20'
        }`}>
          {enabled ? (
            <>
              <IconEye size={14} /> Active
            </>
          ) : (
            <>
              <IconEyeOff size={14} /> Inactive
            </>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 border animate-in fade-in duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-error/10 text-error border-error/20'
        }`}>
          {message.type === 'success' ? <IconCheck size={20} className="shrink-0" /> : <IconAlertTriangle size={20} className="shrink-0" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Toggle Switch */}
        <div className="bg-surface-container/50 border border-outline-variant/20 rounded-2xl p-5 md:p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[15px] font-bold text-on-surface">Enable Global News Scroll</label>
              <p className="text-xs text-on-surface-variant max-w-[450px]">
                Toggle whether the scrolling announcement marquee displays at the top of the header for all users.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                enabled ? 'bg-primary' : 'bg-outline-variant'
              }`}
              aria-label="Toggle News Scroll Enabled State"
            >
              <div className={`bg-surface w-4.5 h-4.5 rounded-full shadow-md transition-transform duration-300 ${
                enabled ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-surface-container/50 border border-outline-variant/20 rounded-2xl p-5 md:p-6 transition-colors duration-300 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <h3 className="font-bold text-on-surface">Announcement Items</h3>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={items.length >= maxItems}
              className="text-xs font-bold text-primary hover:text-primary-fixed border border-primary/20 hover:border-primary/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconPlus size={16} /> Add Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant/60 text-sm italic">
              No announcement items added yet. Click "Add Item" to start.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const count = item.length;
                const progressColor = count > 75 
                  ? 'text-error font-bold' 
                  : count > 60 
                    ? 'text-amber-500' 
                    : 'text-on-surface-variant/60';

                return (
                  <div key={index} className="flex gap-3 items-start animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex-1 space-y-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleItemChange(index, e.target.value)}
                          placeholder={`Announcement Item #${index + 1}`}
                          className="w-full pl-4 pr-16 py-3 rounded-xl border border-outline-variant/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40 text-sm"
                        />
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${progressColor}`}>
                          {count}/{maxCharLimit}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-3 text-error hover:bg-error/10 rounded-xl transition-colors border border-transparent hover:border-error/20"
                      title="Remove Announcement"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-xs text-on-surface-variant flex items-center gap-1.5 pt-2">
            <IconAlertTriangle size={14} className="text-amber-500 shrink-0" />
            <span>To keep the scroller smooth, limit items to {maxItems} and each item to {maxCharLimit} characters.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 font-bold px-6 py-3.5 bg-primary text-on-primary rounded-xl hover:bg-primary-fixed hover:text-on-primary-fixed shadow-md shadow-primary/10 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-on-primary/20 border-t-on-primary"></div>
            ) : (
              <>
                <IconDeviceFloppy size={20} /> Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
