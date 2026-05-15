import React, { useState, useEffect } from 'react';
import { Plus, Package, Trash2, Edit2, Search, Filter, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function Production() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newEntry, setNewEntry] = useState({ item: '', quantity: 1, materials: '', materialCost: '', notes: '' });

  useEffect(() => {
    api.get('/production').then(res => setEntries(res.data || []));
  }, []);

  useEffect(() => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(e => 
        new Date(e.date).toISOString().split('T')[0] === filterDate
      );
    }

    // Sort
    if (sortBy === 'date-newest') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-oldest') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'item') {
      filtered.sort((a, b) => a.item.localeCompare(b.item));
    } else if (sortBy === 'quantity') {
      filtered.sort((a, b) => b.quantity - a.quantity);
    }

    setFilteredEntries(filtered);
  }, [entries, searchTerm, filterDate, sortBy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      item: newEntry.item,
      quantity: parseInt(newEntry.quantity, 10) || 1,
      materials: newEntry.materials.split(',').map(m => m.trim()).filter(m => m),
      materialCost: parseFloat(newEntry.materialCost) || 0,
      notes: newEntry.notes || ''
    };

    try {
      if (editingId) {
        const { data } = await api.put(`/production/${editingId}`, payload);
        setEntries(entries.map(entry => entry._id === editingId ? data : entry));
        setEditingId(null);
      } else {
        const { data } = await api.post('/production', payload);
        setEntries([data, ...entries]);
      }
      setIsModalOpen(false);
      setNewEntry({ item: '', quantity: 1, materials: '', materialCost: '', notes: '' });
    } catch (err) {
      alert('Failed to save entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setNewEntry({
      item: entry.item,
      quantity: entry.quantity,
      materials: (entry.materials || []).join(', '),
      materialCost: entry.materialCost?.toString() || '',
      notes: entry.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/production/${id}`);
      setEntries(entries.filter(entry => entry._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  const handleOpenModal = () => {
    setEditingId(null);
    setNewEntry({ item: '', quantity: 1, materials: '', materialCost: '', notes: '' });
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setSortBy('date');
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Production Tracking</h2>
          <p className="text-artisan-ink/60 text-sm">Keep a record of everything you create.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-artisan-clay text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:brightness-110 transition-all"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-artisan-ink/40" />
            <input
              type="text"
              placeholder="Search item or notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-artisan-olive/10 rounded-xl px-12 py-3 text-sm outline-none focus:border-artisan-clay"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-artisan-ink/40" />
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="bg-white border border-artisan-olive/10 rounded-xl px-12 py-3 text-sm outline-none focus:border-artisan-clay"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-artisan-clay"
            >
              <option value="date">Newest First</option>
              <option value="date-oldest">Oldest First</option>
              <option value="item">By Item</option>
              <option value="quantity">By Quantity</option>
            </select>
          </div>
        </div>
        {(searchTerm || filterDate) && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-artisan-clay hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-artisan-olive/10 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-artisan-cream/30 border-b border-artisan-olive/10">
            <tr>
              <th className="px-6 py-4 font-serif text-lg">Item</th>
              <th className="px-6 py-4 font-serif text-lg">Qty</th>
              <th className="px-6 py-4 font-serif text-lg">Date</th>
              <th className="px-6 py-4 font-serif text-lg">Materials</th>
              <th className="px-6 py-4 font-serif text-lg">Material Cost</th>
              <th className="px-6 py-4 font-serif text-lg">Notes</th>
              <th className="px-6 py-4 font-serif text-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-artisan-olive/5">
            {filteredEntries.map((entry) => (
              <tr key={entry._id} className="hover:bg-artisan-cream/20 transition-colors">
                <td className="px-6 py-4 font-medium">{entry.item}</td>
                <td className="px-6 py-4">
                  <span className="bg-artisan-olive/10 px-2 py-1 rounded text-xs font-bold">{entry.quantity}</span>
                </td>
                <td className="px-6 py-4 text-sm text-artisan-ink/60">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(entry.materials || []).map((m, i) => (
                      <span key={i} className="text-[10px] uppercase tracking-wider bg-artisan-cream px-2 py-0.5 rounded border border-artisan-olive/10 text-artisan-ink/60">
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-artisan-ink/60">
                  ₹{(entry.materialCost || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-artisan-ink/60 max-w-xs truncate">
                  {entry.notes ? entry.notes : 'No notes added'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 hover:bg-artisan-cream rounded-lg transition-colors text-artisan-clay"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(entry._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredEntries.length === 0 && (
          <div className="p-20 text-center text-artisan-ink/40">
            <Package size={48} className="mx-auto mb-4 opacity-10" />
            <p>{searchTerm || filterDate ? 'No entries match your filters.' : 'No production entries yet. Start by adding your first creation!'}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-artisan-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm p-8 rounded-3xl shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-xl font-bold">Delete Entry?</h3>
              </div>
              <p className="text-artisan-ink/60 mb-6">This action cannot be undone. Are you sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-artisan-olive/10 font-bold hover:bg-artisan-cream/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-artisan-ink/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-artisan-cream w-full max-w-md p-8 rounded-3xl shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-6">{editingId ? 'Edit Entry' : 'New Production Entry'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Item Name</label>
                  <input 
                    required
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                    placeholder="e.g. Ceramic Vase"
                    value={newEntry.item}
                    onChange={e => setNewEntry({...newEntry, item: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Quantity</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                    value={newEntry.quantity}
                    onChange={e => setNewEntry({...newEntry, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Materials (comma separated)</label>
                  <input 
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                    placeholder="Clay, Glaze, Paint"
                    value={newEntry.materials}
                    onChange={e => setNewEntry({...newEntry, materials: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Material Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay"
                    placeholder="0"
                    value={newEntry.materialCost}
                    onChange={e => setNewEntry({...newEntry, materialCost: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 ml-1">Notes</label>
                  <textarea
                    className="w-full bg-white border border-artisan-olive/10 rounded-xl px-4 py-3 outline-none focus:border-artisan-clay text-sm"
                    placeholder="Add any notes..."
                    rows="3"
                    value={newEntry.notes}
                    onChange={e => setNewEntry({...newEntry, notes: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full bg-artisan-clay text-white py-4 rounded-2xl font-bold shadow-lg mt-4">
                  {editingId ? 'Update Entry' : 'Save Entry'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
