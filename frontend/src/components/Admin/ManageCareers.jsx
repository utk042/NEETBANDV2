import React, { useState, useEffect } from 'react';
import {
  getAdminJobPositions,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  getJobApplications,
  updateJobApplicationStatus,
  deleteJobApplication
} from '../../services/api';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconBriefcase,
  IconUsers,
  IconExternalLink,
  IconCheck,
  IconX,
  IconEye,
  IconAlertCircle,
  IconMapPin,
  IconCreditCard,
  IconLoader2
} from '@tabler/icons-react';
import { useDialog } from '../../contexts/DialogContext';

export default function ManageCareers() {
  const { confirm, toast } = useDialog();
  const [activeSubTab, setActiveSubTab] = useState('positions'); // 'positions' | 'applications'
  
  // Positions State
  const [positions, setPositions] = useState([]);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [positionForm, setPositionForm] = useState({
    title: '',
    jobType: 'FULL-TIME',
    location: '',
    experience: '',
    salary: '',
    description: '',
    status: 'active',
    order: 0
  });

  // Applications State
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [selectedJobFilter, setSelectedJobFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppDetail, setSelectedAppDetail] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchPositions();
    fetchApplications();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const data = await getAdminJobPositions();
      setPositions(data || []);
    } catch (err) {
      toast.error('Failed to fetch job positions: ' + err.message);
    } finally {
      setLoadingPositions(false);
    }
  };

  const fetchApplications = async (jobId = selectedJobFilter) => {
    try {
      setLoadingApplications(true);
      const data = await getJobApplications(jobId);
      setApplications(data || []);
    } catch (err) {
      toast.error('Failed to fetch applications: ' + err.message);
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleFilterByJob = (jobId) => {
    setSelectedJobFilter(jobId);
    fetchApplications(jobId);
  };

  // --- POSITION CRUD ---
  const handleOpenCreatePosition = () => {
    setEditingPosition(null);
    setPositionForm({
      title: '',
      jobType: 'FULL-TIME',
      location: '',
      experience: '',
      salary: '',
      description: '',
      status: 'active',
      order: 0
    });
    setIsPositionModalOpen(true);
  };

  const handleOpenEditPosition = (pos) => {
    setEditingPosition(pos);
    setPositionForm({
      title: pos.title,
      jobType: pos.jobType || 'FULL-TIME',
      location: pos.location,
      experience: pos.experience,
      salary: pos.salary,
      description: pos.description,
      status: pos.status || 'active',
      order: pos.order || 0
    });
    setIsPositionModalOpen(true);
  };

  const handleSavePosition = async (e) => {
    e.preventDefault();
    try {
      if (editingPosition) {
        await updateJobPosition(editingPosition._id, positionForm);
        toast.success('Job position updated successfully');
      } else {
        await createJobPosition(positionForm);
        toast.success('Job position created successfully');
      }
      setIsPositionModalOpen(false);
      fetchPositions();
    } catch (err) {
      toast.error('Failed to save position: ' + err.message);
    }
  };

  const handleTogglePositionStatus = async (pos) => {
    const newStatus = pos.status === 'active' ? 'inactive' : 'active';
    try {
      await updateJobPosition(pos._id, { status: newStatus });
      toast.success(`Position marked as ${newStatus}`);
      fetchPositions();
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const handleDeletePos = async (id, title) => {
    if (!await confirm('Delete Position', `Are you sure you want to delete "${title}"? This will also remove associated candidate applications.`)) return;
    try {
      await deleteJobPosition(id);
      toast.success('Position deleted successfully');
      fetchPositions();
      fetchApplications();
    } catch (err) {
      toast.error('Failed to delete position: ' + err.message);
    }
  };

  // --- APPLICATION ACTIONS ---
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateJobApplicationStatus(appId, { status: newStatus });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      toast.success('Application status updated to ' + newStatus);
    } catch (err) {
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedAppDetail) return;
    try {
      await updateJobApplicationStatus(selectedAppDetail._id, { notes: adminNotes });
      setApplications(prev => prev.map(a => a._id === selectedAppDetail._id ? { ...a, notes: adminNotes } : a));
      setSelectedAppDetail(prev => prev ? { ...prev, notes: adminNotes } : null);
      toast.success('Admin notes saved');
    } catch (err) {
      toast.error('Failed to save notes: ' + err.message);
    }
  };

  const handleDeleteApp = async (id, name) => {
    if (!await confirm('Delete Application', `Are you sure you want to delete application from "${name}"?`)) return;
    try {
      await deleteJobApplication(id);
      toast.success('Application deleted successfully');
      setApplications(prev => prev.filter(a => a._id !== id));
      if (selectedAppDetail?._id === id) setSelectedAppDetail(null);
      fetchPositions();
    } catch (err) {
      toast.error('Failed to delete application: ' + err.message);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'hired':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'shortlisted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'reviewed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2.5">
            <IconBriefcase className="text-primary" size={28} />
            <span>Careers & Job Management</span>
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage open job listings and review candidate applications.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 bg-surface-variant/50 p-1.5 rounded-xl border border-outline-variant/30">
          <button
            onClick={() => setActiveSubTab('positions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'positions'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <IconBriefcase size={16} />
            <span>Positions ({positions.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'applications'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <IconUsers size={16} />
            <span>Applications ({applications.length})</span>
          </button>
        </div>
      </div>

      {/* POSITIONS TAB */}
      {activeSubTab === 'positions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-on-surface">Job Positions</h3>
            <button
              onClick={handleOpenCreatePosition}
              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-sm"
            >
              <IconPlus size={18} />
              <span>Create New Position</span>
            </button>
          </div>

          {loadingPositions ? (
            <div className="flex justify-center items-center py-16 text-on-surface-variant gap-3">
              <IconLoader2 className="animate-spin text-primary" size={28} />
              <span>Loading positions...</span>
            </div>
          ) : positions.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-outline-variant/30">
              <IconBriefcase size={48} className="mx-auto text-on-surface-variant/40 mb-3" />
              <h4 className="font-bold text-on-surface text-base mb-1">No Open Positions Created</h4>
              <p className="text-on-surface-variant text-xs mb-4">Click below to create your first job listing.</p>
              <button
                onClick={handleOpenCreatePosition}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <IconPlus size={16} /> Create Position
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positions.map((pos) => (
                <div
                  key={pos._id}
                  className="bg-surface border border-outline-variant/30 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative group hover:border-outline-variant/60 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-on-surface text-base leading-snug">{pos.title}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        pos.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {pos.status}
                      </span>
                    </div>

                    <p className="text-on-surface-variant text-xs line-clamp-2 mb-4 leading-relaxed">
                      {pos.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant mb-4 bg-surface-variant/30 p-3 rounded-xl">
                      <div><strong className="text-on-surface">Type:</strong> {pos.jobType}</div>
                      <div><strong className="text-on-surface">Location:</strong> {pos.location}</div>
                      <div><strong className="text-on-surface">Experience:</strong> {pos.experience}</div>
                      <div><strong className="text-on-surface">Salary:</strong> {pos.salary}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
                    <button
                      onClick={() => {
                        handleFilterByJob(pos._id);
                        setActiveSubTab('applications');
                      }}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <IconUsers size={16} />
                      <span>{pos.applicantCount || 0} Applicants</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePositionStatus(pos)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          pos.status === 'active'
                            ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {pos.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleOpenEditPosition(pos)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
                        title="Edit position"
                      >
                        <IconPencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePos(pos._id, pos.title)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete position"
                      >
                        <IconTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeSubTab === 'applications' && (
        <div className="space-y-6">
          {/* Controls: Filter by Position & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select
                value={selectedJobFilter}
                onChange={(e) => handleFilterByJob(e.target.value)}
                className="bg-surface border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="">All Job Positions</option>
                {positions.map(p => (
                  <option key={p._id} value={p._id}>{p.title}</option>
                ))}
              </select>

              {selectedJobFilter && (
                <button
                  onClick={() => handleFilterByJob('')}
                  className="text-xs text-on-surface-variant hover:text-primary underline cursor-pointer"
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="relative">
              <IconSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
              <input
                type="text"
                placeholder="Search candidate name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 bg-surface border border-outline-variant/40 rounded-xl pl-10 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {loadingApplications ? (
            <div className="flex justify-center items-center py-16 text-on-surface-variant gap-3">
              <IconLoader2 className="animate-spin text-primary" size={28} />
              <span>Loading candidate applications...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-surface rounded-2xl p-12 text-center border border-outline-variant/30">
              <IconUsers size={48} className="mx-auto text-on-surface-variant/40 mb-3" />
              <h4 className="font-bold text-on-surface text-base mb-1">No Applications Found</h4>
              <p className="text-on-surface-variant text-xs">
                {selectedJobFilter ? 'No candidates have applied for this specific position yet.' : 'No candidates have submitted job applications.'}
              </p>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-variant/40 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-outline-variant/30">
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Applied Job</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Resume Link</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Applied Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 text-xs">
                    {filteredApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-surface-variant/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-on-surface">
                          {app.fullName}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant max-w-[200px] truncate" title={app.jobTitle}>
                          {app.jobTitle}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant">
                          <div>{app.email}</div>
                          <div className="text-[11px] text-on-surface-variant/70">{app.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <span>Open Resume</span>
                            <IconExternalLink size={14} />
                          </a>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app._id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg font-bold border text-[11px] cursor-pointer focus:outline-none ${getStatusBadge(app.status)}`}
                          >
                            <option value="pending" className="bg-surface text-on-surface">Pending</option>
                            <option value="reviewed" className="bg-surface text-on-surface">Reviewed</option>
                            <option value="shortlisted" className="bg-surface text-on-surface">Shortlisted</option>
                            <option value="rejected" className="bg-surface text-on-surface">Rejected</option>
                            <option value="hired" className="bg-surface text-on-surface">Hired</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant/70 text-[11px]">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAppDetail(app);
                                setAdminNotes(app.notes || '');
                              }}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors cursor-pointer"
                              title="View Application Details"
                            >
                              <IconEye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteApp(app._id, app.fullName)}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete Application"
                            >
                              <IconTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* POSITION CREATION / EDIT MODAL */}
      {isPositionModalOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface text-on-surface border border-outline-variant/40 rounded-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setIsPositionModalOpen(false)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-variant/50"
            >
              <IconX size={22} />
            </button>

            <h3 className="font-bold text-xl text-on-surface mb-6">
              {editingPosition ? 'Edit Job Position' : 'Create New Job Position'}
            </h3>

            <form onSubmit={handleSavePosition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={positionForm.title}
                  onChange={(e) => setPositionForm({ ...positionForm, title: e.target.value })}
                  placeholder="e.g. Video Editor Job in Kanpur | Reels & Social Media"
                  className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Job Type
                  </label>
                  <select
                    value={positionForm.jobType}
                    onChange={(e) => setPositionForm({ ...positionForm, jobType: e.target.value })}
                    className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="FULL-TIME">FULL-TIME</option>
                    <option value="PART-TIME">PART-TIME</option>
                    <option value="INTERNSHIP">INTERNSHIP</option>
                    <option value="CONTRACT">CONTRACT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    value={positionForm.status}
                    onChange={(e) => setPositionForm({ ...positionForm, status: e.target.value })}
                    className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="active">Active (Visible on Careers)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={positionForm.location}
                    onChange={(e) => setPositionForm({ ...positionForm, location: e.target.value })}
                    placeholder="e.g. Kanpur (Work from Office)"
                    className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                    Experience Requirement *
                  </label>
                  <input
                    type="text"
                    required
                    value={positionForm.experience}
                    onChange={(e) => setPositionForm({ ...positionForm, experience: e.target.value })}
                    placeholder="e.g. 1-2 Years (Freshers can apply)"
                    className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Salary / Compensation *
                </label>
                <input
                  type="text"
                  required
                  value={positionForm.salary}
                  onChange={(e) => setPositionForm({ ...positionForm, salary: e.target.value })}
                  placeholder="e.g. ₹10,000 - ₹25,000 + Incentives"
                  className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">
                  Role Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={positionForm.description}
                  onChange={(e) => setPositionForm({ ...positionForm, description: e.target.value })}
                  placeholder="Write a clear job description..."
                  className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setIsPositionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:opacity-90 cursor-pointer"
                >
                  {editingPosition ? 'Save Changes' : 'Create Position'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION DETAIL MODAL */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface text-on-surface border border-outline-variant/40 rounded-2xl p-6 md:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedAppDetail(null)}
              className="absolute top-5 right-5 text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-variant/50"
            >
              <IconX size={22} />
            </button>

            <h3 className="font-bold text-xl text-on-surface mb-1">
              Application: {selectedAppDetail.fullName}
            </h3>
            <p className="text-xs text-primary font-semibold mb-6">
              Applied for {selectedAppDetail.jobTitle}
            </p>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-surface-container/60 p-4 rounded-xl border border-outline-variant/30">
                <div>
                  <span className="text-on-surface-variant/70 block mb-0.5">Email</span>
                  <span className="font-semibold text-on-surface">{selectedAppDetail.email}</span>
                </div>
                <div>
                  <span className="text-on-surface-variant/70 block mb-0.5">Phone</span>
                  <span className="font-semibold text-on-surface">{selectedAppDetail.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-on-surface-variant/70 block mb-1 font-semibold uppercase tracking-wider">
                  Resume / Portfolio Link
                </span>
                <a
                  href={selectedAppDetail.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold bg-primary/10 px-3 py-2 rounded-lg border border-primary/20"
                >
                  <span>{selectedAppDetail.resumeUrl}</span>
                  <IconExternalLink size={14} />
                </a>
              </div>

              <div>
                <span className="text-on-surface-variant/70 block mb-1 font-semibold uppercase tracking-wider">
                  Cover Letter
                </span>
                <div className="bg-surface-container/60 p-4 rounded-xl border border-outline-variant/30 whitespace-pre-wrap text-on-surface leading-relaxed">
                  {selectedAppDetail.coverLetter || 'No cover letter provided.'}
                </div>
              </div>

              <div>
                <label className="block text-on-surface-variant/70 mb-1 font-semibold uppercase tracking-wider">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about candidate interview, rating, etc..."
                  className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary resize-y"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveNotes}
                    className="px-3.5 py-1.5 bg-surface-variant hover:bg-outline-variant/40 text-on-surface text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
