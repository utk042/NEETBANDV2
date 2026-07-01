// Force HMR 1
import React, { useState, useEffect } from 'react';
import { 
  getCourses, createCourse, updateCourse, deleteCourse,
  getAdminStudents, createAdminStudent, updateAdminStudent, deleteAdminStudent 
} from '../../services/api';
import { IconPlus, IconBook2, IconSettings, IconUsers, IconTrash, IconPencil, IconUserPlus, IconPalette } from '@tabler/icons-react';
import CourseDesigner from './CourseDesigner';

export default function ManageLMS({ subTab = 'courses', user }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', class: '', subject: '', summary: '', order: 0 });
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentFormData, setStudentFormData] = useState({ name: '', email: '', password: '', role: 'student', isPremium: false, membershipPlan: 'none' });
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [designingCourse, setDesigningCourse] = useState(null);

  useEffect(() => {
    if (subTab === 'courses') {
      fetchCourses();
    } else if (subTab === 'students' || subTab === 'admins') {
      fetchStudents();
    }
  }, [subTab]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (designingCourse) {
      params.set('courseId', designingCourse._id);
    } else {
      params.delete('courseId');
    }
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [designingCourse]);

  const fetchCourses = async () => {
    try {
      const data = await getCourses();
      setCourses(data);
      
      const params = new URLSearchParams(window.location.search);
      const courseId = params.get('courseId');
      if (courseId) {
        const found = data.find(c => c._id === courseId);
        if (found) {
          setDesigningCourse(found);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await getAdminStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...studentFormData,
        role: subTab === 'admins' ? studentFormData.role : 'student',
        isPremium: studentFormData.membershipPlan !== 'none'
      };
      await createAdminStudent(payload);
      setStudentFormData({ name: '', email: '', password: '', role: subTab === 'admins' ? 'admin' : 'student', isPremium: false, membershipPlan: 'none' });
      setIsAddStudentModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    
    // Normalize legacy plans to match our new dropdown options
    const normalizedPlan = ['none', 'premium'].includes(student.membershipPlan) 
      ? student.membershipPlan 
      : (student.isPremium || student.membershipPlan !== 'none' ? 'premium' : 'none');

    setStudentFormData({ 
      name: student.name, 
      email: student.email, 
      password: '', // Leave password empty for edit
      role: student.role, 
      isPremium: student.isPremium, 
      membershipPlan: normalizedPlan 
    });
    setIsEditStudentModalOpen(true);
  };

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = { 
        name: studentFormData.name, 
        email: studentFormData.email,
        role: studentFormData.role,
        membershipPlan: studentFormData.membershipPlan,
        isPremium: studentFormData.membershipPlan !== 'none'
      };
      if (studentFormData.password) {
        updateData.password = studentFormData.password;
      }
      // You can add more fields here if your API supports them

      await updateAdminStudent(editingStudent._id, updateData);
      setStudentFormData({ name: '', email: '', password: '', role: 'student', isPremium: false, membershipPlan: 'none' });
      setIsEditStudentModalOpen(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };



  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await deleteAdminStudent(id);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      setFormData({ title: '', class: '', subject: '', summary: '', order: 0 });
      setIsAddCourseModalOpen(false);
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40";
  const labelClass = "text-sm font-bold text-on-surface-variant mb-1.5 ml-1 uppercase tracking-wide text-[11px]";

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setFormData({ title: course.title, class: course.class, subject: course.subject, summary: course.summary || '', order: course.order || 0 });
    setIsEditCourseModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCourse(editingCourse._id, formData);
      setFormData({ title: '', class: '', subject: '', summary: '', order: 0 });
      setIsEditCourseModalOpen(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  if (subTab === 'students' || subTab === 'admins') {
    const isAdminsTab = subTab === 'admins';
    const displayedUsers = isAdminsTab ? students.filter(s => s.role === 'admin' || s.role === 'owner') : students.filter(s => s.role === 'student');

    return (
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">{isAdminsTab ? 'Manage Admins' : 'Registered Students'}</h3>
              <p className="text-on-surface-variant text-sm mt-1">{isAdminsTab ? 'Manage system administrators and owners.' : 'Manage existing student accounts.'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg hidden md:block">
                {displayedUsers.length} {isAdminsTab ? 'Admins' : 'Students'}
              </div>
              <button 
                onClick={() => {
                  setStudentFormData({ name: '', email: '', password: '', role: isAdminsTab ? 'admin' : 'student', isPremium: false, membershipPlan: 'none' });
                  setIsAddStudentModalOpen(true);
                }}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
              >
                <IconUserPlus size={18} stroke={2.5} /> Add {isAdminsTab ? 'Admin' : 'Student'}
              </button>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-variant/30 border-b border-outline-variant/30">
                    <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Name</th>
                    <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Email</th>
                    <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Plan</th>
                    <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Role</th>
                    <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStudents ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-on-surface-variant">Loading...</td>
                    </tr>
                  ) : displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-on-surface-variant">No users found.</td>
                    </tr>
                  ) : (
                    displayedUsers.map(student => (
                      <tr key={student._id} className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
                        <td className="py-4 px-6 font-semibold text-on-surface">{student.name}</td>
                        <td className="py-4 px-6 text-on-surface-variant">{student.email}</td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant">
                            {student.membershipPlan || 'none'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                            student.role === 'owner' ? 'bg-[#ffc107]/20 text-[#ffc107]' : 
                            student.role === 'admin' ? 'bg-purple-500/20 text-purple-500' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {student.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(!isAdminsTab || (user?.role === 'owner' && student._id !== user?._id)) && (
                              <>
                                <button onClick={() => handleEditStudent(student)} className="p-2 rounded-lg bg-surface-variant/50 text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                                  <IconPencil size={18} stroke={2} />
                                </button>
                                <button onClick={() => handleDeleteStudent(student._id)} className="p-2 rounded-lg bg-surface-variant/50 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors" title="Delete">
                                  <IconTrash size={18} stroke={2} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Add Student Modal */}
        {isAddStudentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-on-surface">Add New {isAdminsTab ? 'Admin' : 'Student'}</h3>
                  <p className="text-on-surface-variant text-xs mt-1">Register a new {isAdminsTab ? 'admin' : 'student'} account manually.</p>
                </div>
                <button 
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="add-student-form" onSubmit={handleStudentSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="flex flex-col">
                      <label className={labelClass}>Full Name</label>
                      <input type="text" required placeholder="e.g. John Doe" className={inputClass} value={studentFormData.name} onChange={e => setStudentFormData({...studentFormData, name: e.target.value})} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Email Address</label>
                      <input type="email" required placeholder="e.g. john@example.com" className={inputClass} value={studentFormData.email} onChange={e => setStudentFormData({...studentFormData, email: e.target.value})} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Password</label>
                      <input type="password" required placeholder="Enter password" className={inputClass} value={studentFormData.password} onChange={e => setStudentFormData({...studentFormData, password: e.target.value})} />
                    </div>
                    {isAdminsTab ? (
                      <div className="flex flex-col">
                        <label className={labelClass}>Role</label>
                        <select 
                          className={inputClass}
                          value={studentFormData.role}
                          onChange={e => setStudentFormData({...studentFormData, role: e.target.value})}
                        >
                          <option value="admin">Admin</option>
                          {user?.role === 'owner' && <option value="owner">Owner</option>}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <label className={labelClass}>Membership Plan</label>
                        <select 
                          className={inputClass}
                          value={studentFormData.membershipPlan}
                          onChange={e => setStudentFormData({...studentFormData, membershipPlan: e.target.value})}
                        >
                          <option value="none">Free (None)</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="add-student-form"
                  type="submit" 
                  className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap"
                >
                  <IconUserPlus size={18} stroke={2.5} /> Add Student
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {isEditStudentModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-on-surface">Edit Student</h3>
                  <p className="text-on-surface-variant text-xs mt-1">Update student account details.</p>
                </div>
                <button 
                  onClick={() => { setIsEditStudentModalOpen(false); setEditingStudent(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="edit-student-form" onSubmit={handleEditStudentSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="flex flex-col">
                      <label className={labelClass}>Full Name</label>
                      <input type="text" required placeholder="e.g. John Doe" className={inputClass} value={studentFormData.name} onChange={e => setStudentFormData({...studentFormData, name: e.target.value})} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Email Address</label>
                      <input type="email" required placeholder="e.g. john@example.com" className={inputClass} value={studentFormData.email} onChange={e => setStudentFormData({...studentFormData, email: e.target.value})} />
                    </div>
                    <div className="flex flex-col">
                      <label className={labelClass}>Password (leave blank to keep current)</label>
                      <input type="password" placeholder="Enter new password" className={inputClass} value={studentFormData.password} onChange={e => setStudentFormData({...studentFormData, password: e.target.value})} />
                    </div>
                    {isAdminsTab ? (
                      <div className="flex flex-col">
                        <label className={labelClass}>Role</label>
                        <select 
                          className={inputClass}
                          value={studentFormData.role}
                          onChange={e => setStudentFormData({...studentFormData, role: e.target.value})}
                        >
                          <option value="admin">Admin</option>
                          {user?.role === 'owner' && <option value="owner">Owner</option>}
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <label className={labelClass}>Membership Plan</label>
                        <select 
                          className={inputClass}
                          value={studentFormData.membershipPlan}
                          onChange={e => setStudentFormData({...studentFormData, membershipPlan: e.target.value})}
                        >
                          <option value="none">Free (None)</option>
                          <option value="premium">Premium</option>
                        </select>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
                <button 
                  onClick={() => { setIsEditStudentModalOpen(false); setEditingStudent(null); }}
                  className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button 
                  form="edit-student-form"
                  type="submit" 
                  className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap"
                >
                  <IconPencil size={18} stroke={2.5} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (subTab === 'settings') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <IconSettings size={64} className="text-on-surface-variant/30 mb-4" />
        <h3 className="text-2xl font-bold tracking-tight text-on-surface">LMS Settings</h3>
        <p className="text-on-surface-variant mt-2 max-w-md">Global configuration and platform settings are coming soon.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Existing Courses Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-on-surface">Curriculum</h3>
            <p className="text-on-surface-variant text-sm mt-1">Manage your organized modules.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg hidden md:block">
              {courses.length} Courses
            </div>
            <button 
              onClick={() => setIsAddCourseModalOpen(true)}
              className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              <IconPlus size={18} stroke={2.5} /> Add Course
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-surface-container animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map(ch => (
              <li key={ch._id} className="p-5 border border-outline-variant/30 rounded-2xl flex flex-col bg-surface-container-lowest hover:border-primary/40 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110"></div>
                
                <div className="relative z-10 flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <IconBook2 size={20} stroke={1.5} />
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-[15px] leading-tight mb-1">{ch.title}</p>
                    <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{ch.class} <span className="opacity-50 mx-1">•</span> {ch.subject}</p>
                  </div>
                </div>
                
                <div className="relative z-10 mt-auto pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-on-surface-variant/70 uppercase tracking-wider">
                    ID: {ch._id.slice(-6)}
                  </span>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setDesigningCourse(ch)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                      title="Design Curriculum"
                    >
                      <IconPalette size={15} stroke={2} /> Design
                    </button>
                    <button onClick={() => handleEditCourse(ch)} className="p-2 rounded-lg bg-surface-variant/50 text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                      <IconPencil size={18} stroke={2} />
                    </button>
                    <button onClick={() => handleDeleteCourse(ch._id)} className="p-2 rounded-lg bg-surface-variant/50 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors" title="Delete">
                      <IconTrash size={18} stroke={2} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {courses.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 border border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-lowest">
                <IconBook2 size={48} stroke={1} className="mx-auto text-on-surface-variant/50 mb-3" />
                <h4 className="font-bold text-on-surface">No courses yet</h4>
                <p className="text-sm text-on-surface-variant mt-1">Create your first course above.</p>
              </div>
            )}
          </ul>
        )}
      </section>

      {/* Course Designer Overlay */}
      {designingCourse && (
        <CourseDesigner
          course={designingCourse}
          onClose={() => setDesigningCourse(null)}
          onSaved={(updated) => {
            setCourses(prev => prev.map(c => c._id === updated._id ? updated : c));
            setDesigningCourse(updated);
          }}
        />
      )}

      {/* Add Course Modal */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-on-surface">Add New Course</h3>
                <p className="text-on-surface-variant text-xs mt-1">Create a new module to organize your songs.</p>
              </div>
              <button 
                onClick={() => setIsAddCourseModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="add-course-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Course Title</label>
                    <input type="text" required placeholder="e.g. Introduction to Cells" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Class / Grade</label>
                    <input type="text" required placeholder="e.g. Class 11" className={inputClass} value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Subject</label>
                    <input type="text" required placeholder="e.g. Biology" className={inputClass} value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Summary (Optional)</label>
                    <textarea placeholder="Briefly describe what this course covers..." className={`${inputClass} min-h-[120px] resize-y`} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})}></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setIsAddCourseModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                form="add-course-form"
                type="submit" 
                className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap"
              >
                <IconPlus size={18} stroke={2.5} /> Add Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {isEditCourseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-on-surface">Edit Course</h3>
                <p className="text-on-surface-variant text-xs mt-1">Update the details for this course.</p>
              </div>
              <button 
                onClick={() => { setIsEditCourseModalOpen(false); setEditingCourse(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="edit-course-form" onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Course Title</label>
                    <input type="text" required placeholder="e.g. Introduction to Cells" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Class / Grade</label>
                    <input type="text" required placeholder="e.g. Class 11" className={inputClass} value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Subject</label>
                    <input type="text" required placeholder="e.g. Biology" className={inputClass} value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Summary (Optional)</label>
                    <textarea placeholder="Briefly describe what this course covers..." className={`${inputClass} min-h-[120px] resize-y`} value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})}></textarea>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => { setIsEditCourseModalOpen(false); setEditingCourse(null); }}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                form="edit-course-form"
                type="submit" 
                className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap"
              >
                <IconPencil size={18} stroke={2.5} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
