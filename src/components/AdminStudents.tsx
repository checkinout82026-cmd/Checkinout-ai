import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Student } from '../types';
import { parseStudentCSV } from '../lib/csvParser';
import { formatPhoneNumber, sanitizeCsvCell } from '../lib/utils';
import toast from 'react-hot-toast';
import { Sparkles, Hash, Search, Upload, Download, FileText, X, Check, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditing, setIsEditing] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'id'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // CSV Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentPhone2, setParentPhone2] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [pickups, setPickups] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Initial sync and real-time subscription to Firebase Firestore
    const unsubscribe = db.subscribeStudents((updated) => {
      setStudents(updated);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const generate12DigitNumeric = () => {
    // Generate a 12-digit numeric ID (does not have to contain alphabet)
    let newId = '';
    do {
      const prefix = '1';
      let randomDigits = '';
      for (let i = 0; i < 11; i++) {
        randomDigits += Math.floor(Math.random() * 10).toString();
      }
      newId = prefix + randomDigits;
    } while (students.some(s => s.id === newId));
    setId(newId);
    toast.success('Generated 12-digit numeric ID', { icon: '🔢' });
  };

  const generate12CharAlphaNumeric = () => {
    // Generate a 12-character alphanumeric ID
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let newId = '';
    do {
      newId = '';
      for (let i = 0; i < 12; i++) {
        newId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (students.some(s => s.id === newId));
    setId(newId);
    toast.success('Generated 12-character alphanumeric ID', { icon: '✨' });
  };

  const handleCsvTextChange = (text: string) => {
    setImportCsvText(text);
    if (text.trim()) {
      const parsed = parseStudentCSV(text);
      setParsedStudents(parsed);
    } else {
      setParsedStudents([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleCsvTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitStudentImport = async () => {
    const toImport = parsedStudents.length > 0 ? parsedStudents : parseStudentCSV(importCsvText);
    if (toImport.length === 0) {
      toast.error('No valid student records found');
      return;
    }
    setIsImporting(true);
    try {
      await db.saveStudents(toImport);
      toast.success(`Successfully saved ${toImport.length} students to Firebase!`);
      setShowImportModal(false);
      setImportCsvText('');
      setParsedStudents([]);
    } catch (err) {
      console.error('Error importing students', err);
      toast.error('Failed to import students to Firebase');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportStudentsCSV = () => {
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }
    const headers = ['Student ID', 'Student Name', 'Grade Level', 'Parent Name', 'Primary Phone', 'Secondary Phone', 'Parent Email', 'Authorized Pickups', 'Notes'];
    const rows = students.map(s => {
      return [
        sanitizeCsvCell(s.id),
        sanitizeCsvCell(s.name),
        sanitizeCsvCell(s.gradeLevel || ''),
        sanitizeCsvCell(s.parent?.name || s.parentName || ''),
        sanitizeCsvCell(s.parent?.phone || s.parentPhone || ''),
        sanitizeCsvCell(s.parent?.phone2 || s.parentPhone2 || ''),
        sanitizeCsvCell(s.parent?.email || s.parentEmail || ''),
        sanitizeCsvCell((s.authorizedPickups || []).join('; ')),
        sanitizeCsvCell(s.notes || '')
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${students.length} students exported to CSV!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authorizedPickups = pickups.split(',').map(s => s.trim()).filter(s => s !== '');
    
    let finalId = id.trim();
    if (!finalId) {
      // Auto-generate if empty
      finalId = '1' + Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
    }

    const studentData: Student = {
      id: finalId,
      name: name.trim(),
      fullName: name.trim(),
      parent: { 
        name: parentName.trim(), 
        phone: parentPhone.trim(), 
        phone2: parentPhone2.trim() || undefined,
        email: parentEmail.trim() 
      },
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentPhone2: parentPhone2.trim() || undefined,
      parentEmail: parentEmail.trim(),
      authorizedPickups,
      authorizedPickupDetails: authorizedPickups.map(p => ({
        name: p,
        relationship: 'Authorized Pickup',
        phone: parentPhone.trim(),
        isPrimary: false
      })),
      notes: notes.trim(),
      isActive: true,
      createdAt: isEditing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isEditing) {
      await db.saveStudent(studentData);
      toast.success('Student updated in Firebase');
    } else {
      if (students.find(s => s.id === finalId)) {
        toast.error('Student ID already exists');
        return;
      }
      await db.saveStudent(studentData);
      toast.success('Student added to Firebase');
    }
    
    resetForm();
  };

  const editStudent = (student: Student) => {
    setIsEditing(student);
    setId(student.id);
    setName(student.name);
    setParentName(student.parent.name || student.parentName || '');
    setParentPhone(student.parent.phone || student.parentPhone || '');
    setParentPhone2(student.parent.phone2 || student.parentPhone2 || '');
    setParentEmail(student.parent.email || student.parentEmail || '');
    setPickups(student.authorizedPickups.join(', '));
    setNotes(student.notes || '');
  };

  const deleteStudent = async (studentId: string) => {
    if (confirm('Are you sure you want to delete this student from the database?')) {
      await db.deleteStudent(studentId);
      toast.success('Student deleted from Firebase');
    }
  };

  const resetForm = () => {
    setIsEditing(null);
    setId('');
    setName('');
    setParentName('');
    setParentPhone('');
    setParentPhone2('');
    setParentEmail('');
    setPickups('');
    setNotes('');
  };

  const toggleSort = (field: 'name' | 'id') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredStudents = [...students]
    .filter(s => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        s.name.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term) ||
        (s.parent?.phone && s.parent.phone.includes(term)) ||
        (s.parent?.phone2 && s.parent.phone2.includes(term)) ||
        (s.parent?.name && s.parent.name.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        const nameA = (a.name || a.fullName || '').trim();
        const nameB = (b.name || b.fullName || '').trim();
        const comparison = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Manage Students</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#5c869e]/15 text-[#5e705b] rounded-full">
              {students.length} Students
            </span>
          </div>
          <p className="text-[#8c8a86] mt-1 text-sm">Add, edit, or remove student records with real-time Firebase synchronization.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (!importCsvText) {
                setImportCsvText(`Student ID,Student Name,Grade Level,Parent Name,Parent Phone,Parent Email,Authorized Pickups,Notes
"100000000001","Liam Smith","Kindergarten","Olivia Smith","(555) 010-0101","olivia.smith@example.com","Olivia Smith, James Smith, Emma Miller","Allergic to peanuts"
"100000000002","Noah Johnson","Grade 1","Sophia Johnson","(555) 010-0104","sophia.johnson@example.com","Sophia Johnson, Lucas Johnson, Charlotte Davis",""
"100000000003","Emma Williams","Grade 2","Henry Williams","(555) 010-0107","henry.williams@example.com","Henry Williams, Isabella Williams, Evelyn Taylor","Asthma inhaler in office"
"100000000004","Oliver Brown","Grade 3","Harper Brown","(555) 010-0110","harper.brown@example.com","Harper Brown, Theodore Brown, Benjamin Brown",""
"100000000005","Amelia Jones","Grade 4","Elijah Jones","(555) 010-0113","elijah.jones@example.com","Elijah Jones, Camila Jones, Gianna White",""
"100000000006","Lucas Garcia","Grade 5","Mateo Garcia","(555) 010-0116","mateo.garcia@example.com","Mateo Garcia, Elena Garcia, Carlos Garcia",""
"100000000007","Mia Miller","Grade 6","Abigail Miller","(555) 010-0119","abigail.miller@example.com","Abigail Miller, David Miller, Grace Clark","Lactose intolerant"
"100000000008","Evelyn Davis","Grade 7","Alexander Davis","(555) 010-0122","alexander.davis@example.com","Alexander Davis, Chloe Davis, Owen Davis",""
"100000000009","James Rodriguez","Grade 8","Layla Rodriguez","(555) 010-0125","layla.rodriguez@example.com","Layla Rodriguez, Samuel Rodriguez, Ethan Martinez",""
"100000000010","Sophia Martinez","Grade 2","Daniel Martinez","(555) 010-0128","daniel.martinez@example.com","Daniel Martinez, Lily Martinez, Jack Wilson",""`);
              }
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e5e1da] hover:bg-[#f8f6f3] text-[#4a4a48] font-bold rounded-2xl transition-all shadow-sm text-xs cursor-pointer"
          >
            <Upload size={14} className="text-[#5c869e]" />
            Import Student CSV
          </button>

          <button
            type="button"
            onClick={handleExportStudentsCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e5e1da] hover:bg-[#f8f6f3] text-[#4a4a48] font-bold rounded-2xl transition-all shadow-sm text-xs cursor-pointer"
          >
            <Download size={14} className="text-[#5c869e]" />
            Export Roster CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-[#e5e1da] shadow-sm">
        <h2 className="text-lg font-serif font-semibold mb-4 text-[#4a4a48]">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold">
                Student ID # (12-Digit Alphanumeric or Numeric)
              </label>
              {!isEditing && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={generate12DigitNumeric}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5c869e] hover:underline cursor-pointer"
                    title="Generate 12-digit number (e.g. 100000000021)"
                  >
                    <Hash size={12} />
                    12 Digits
                  </button>
                  <span className="text-[#e5e1da]">|</span>
                  <button
                    type="button"
                    onClick={generate12CharAlphaNumeric}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5c869e] hover:underline cursor-pointer"
                    title="Generate 12-char alphanumeric (e.g. KM8291048291)"
                  >
                    <Sparkles size={12} />
                    Alphanumeric
                  </button>
                </div>
              )}
            </div>
            <input 
              type="text" 
              required 
              value={id} 
              onChange={e => setId(e.target.value)} 
              disabled={!!isEditing} 
              maxLength={20}
              placeholder="e.g. 100000000004 or KM8291048291"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] disabled:opacity-50 text-[#3c3c3b] font-mono" 
            />
            <p className="text-[11px] text-[#8c8a86] mt-1">
              Supports 12-digit numeric IDs (does not have to contain letters) or alphanumeric codes.
            </p>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Student Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Liam Parker"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Parent / Guardian Name</label>
            <input 
              type="text" 
              required 
              value={parentName} 
              onChange={e => setParentName(e.target.value)} 
              placeholder="e.g. Robert Parker"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]" 
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Primary Phone (for SMS)</label>
            <input 
              type="text" 
              required 
              value={parentPhone} 
              onChange={e => setParentPhone(formatPhoneNumber(e.target.value))} 
              placeholder="(614) - 555- 0000"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]" 
            />
            <p className="text-[11px] text-[#8c8a86] mt-1">Dashes not needed — just type 10 digits</p>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">2nd Phone Number (Optional)</label>
            <input 
              type="text" 
              value={parentPhone2} 
              onChange={e => setParentPhone2(formatPhoneNumber(e.target.value))} 
              placeholder="(614) - 555- 0000 (Optional 2nd contact)"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]" 
            />
            <p className="text-[11px] text-[#8c8a86] mt-1">Dashes not needed — just type 10 digits</p>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Parent Email</label>
            <input 
              type="email" 
              value={parentEmail} 
              onChange={e => setParentEmail(e.target.value)} 
              placeholder="e.g. robert.p@example.com"
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]" 
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-2">Authorized Pickups (comma separated)</label>
            <input 
              type="text" 
              value={pickups} 
              onChange={e => setPickups(e.target.value)} 
              placeholder="e.g. Robert Parker, Elena Parker (Grandmother), Mark Davis (Uncle)" 
              className="w-full px-4 py-3 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]" 
            />
          </div>
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button 
              type="submit" 
              className="px-6 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-2xl transition-colors cursor-pointer"
            >
              {isEditing ? 'Update Student' : 'Add Student'}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-6 py-3 bg-[#f2efe9] hover:bg-[#edeae6] text-[#8c8a86] font-bold rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#f2efe9] flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-serif font-semibold text-[#4a4a48] text-base">Student Roster</h3>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c8a86]" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by 12-digit ID, name, phone..."
              className="w-full pl-9 pr-4 py-2 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#5c869e] text-[#3c3c3b]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
              <tr>
                <th 
                  className="px-8 py-5 cursor-pointer select-none hover:text-[#3c3c3b] transition-colors"
                  onClick={() => toggleSort('id')}
                  title="Click to sort by Student ID"
                >
                  <div className="flex items-center gap-1.5">
                    <span>12-Digit ID</span>
                    {sortField === 'id' ? (
                      sortDirection === 'asc' ? <ArrowUp size={13} className="text-[#0099DD]" /> : <ArrowDown size={13} className="text-[#0099DD]" />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-8 py-5 cursor-pointer select-none hover:text-[#3c3c3b] transition-colors"
                  onClick={() => toggleSort('name')}
                  title="Click to sort alphabetically by First Name"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Name</span>
                    {sortField === 'name' ? (
                      <span className="inline-flex items-center gap-1 text-[#3c3c3b] font-extrabold bg-[#f2efe9] px-2 py-0.5 rounded text-[10px]">
                        {sortDirection === 'asc' ? 'A → Z' : 'Z → A'}
                        {sortDirection === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                      </span>
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </div>
                </th>
                <th className="px-8 py-5">Parent & Contact</th>
                <th className="px-8 py-5">Authorized Pickups</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9] text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-[#8c8a86]">
                    {searchTerm ? 'No student records match your search query.' : 'No student records found in database.'}
                  </td>
                </tr>
              ) : filteredStudents.map(s => {
                return (
                  <tr key={s.id} className="hover:bg-[#fcfaf7] transition-colors text-[#3c3c3b]">
                    <td className="px-8 py-4 text-[#4a4a48] font-mono font-semibold text-xs tracking-wider">{s.id}</td>
                    <td className="px-8 py-4">
                      <div className="font-semibold text-sm text-[#1e293b]">
                        {s.name || s.fullName}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      {s.parent.name}
                      <div className="text-xs text-[#8c8a86] mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span>Primary: {s.parent.phone}</span>
                        {(s.parent.phone2 || s.parentPhone2) && (
                          <span className="px-1.5 py-0.5 bg-[#5c869e15] text-[#5c869e] rounded text-[11px] font-medium">
                            2nd: {s.parent.phone2 || s.parentPhone2}
                          </span>
                        )}
                      </div>
                      {s.parent.email && <div className="text-xs text-[#a8a6a1]">{s.parent.email}</div>}
                    </td>
                    <td className="px-8 py-4">
                      <div className="max-w-xs truncate text-xs" title={s.authorizedPickups.join(', ')}>
                        {s.authorizedPickups.length > 0 ? s.authorizedPickups.join(', ') : '-'}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right space-x-4">
                      <button onClick={() => editStudent(s)} className="text-[#5c869e] hover:opacity-80 font-bold uppercase tracking-wider text-[10px] cursor-pointer">Edit</button>
                      <button onClick={() => deleteStudent(s.id)} className="text-[#d98466] hover:opacity-80 font-bold uppercase tracking-wider text-[10px] cursor-pointer">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Import Student CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-[32px] p-6 sm:p-7 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5c869e]/15 flex items-center justify-center text-[#5c869e]">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#4a4a48]">Import Students Roster CSV</h3>
                  <p className="text-xs text-[#8c8a86]">Batch import students with custom IDs, parent contacts, and authorized pickups into Firebase.</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 text-[#8c8a86] hover:text-[#4a4a48] rounded-xl hover:bg-[#f8f6f3] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* File upload option */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#f8f6f3] rounded-2xl border border-[#e5e1da]">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#5c869e]" />
                  <span className="text-xs font-semibold text-[#4a4a48]">Upload a Student CSV:</span>
                </div>
                <label className="px-3.5 py-1.5 bg-white border border-[#e5e1da] text-[#4a4a48] text-xs font-bold rounded-xl cursor-pointer hover:bg-[#edeae6] transition-colors shadow-sm inline-flex items-center gap-1.5">
                  <Upload size={13} />
                  Choose .csv File
                  <input
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Textarea for pasting */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#8c8a86] uppercase tracking-wider block">
                  Paste Student CSV Data:
                </label>
                <textarea
                  value={importCsvText}
                  onChange={e => handleCsvTextChange(e.target.value)}
                  rows={6}
                  placeholder="Student ID,Student Name,Grade Level,Parent Name,Parent Phone,Parent Email,Authorized Pickups,Notes..."
                  className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl text-xs font-mono focus:outline-none focus:border-[#5c869e] resize-y"
                />
              </div>

              {/* Preview Section */}
              {parsedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4a4a48]">
                      Parsed Preview: <span className="text-[#5c869e]">{parsedStudents.length} Students</span>
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-[#e5e1da] rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8f6f3] text-[#8c8a86] border-b border-[#e5e1da] sticky top-0">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Student ID</th>
                          <th className="py-2 px-3 font-semibold">Student Name</th>
                          <th className="py-2 px-3 font-semibold">Parent & Phone</th>
                          <th className="py-2 px-3 font-semibold">Authorized Pickups</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e1da]">
                        {parsedStudents.map((st, idx) => (
                          <tr key={st.id || idx} className="hover:bg-[#fcfbf9]">
                            <td className="py-2 px-3 font-mono text-[#5c869e] font-semibold text-[11px]">{st.id}</td>
                            <td className="py-2 px-3 text-[#4a4a48] font-medium">{st.name}</td>
                            <td className="py-2 px-3 text-[#4a4a48]">
                              {st.parent?.name} ({st.parent?.phone})
                            </td>
                            <td className="py-2 px-3 text-[#8c8a86] truncate max-w-[200px]">
                              {(st.authorizedPickups || []).join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-[#e5e1da]">
              <button
                type="button"
                onClick={handleCommitStudentImport}
                disabled={isImporting || parsedStudents.length === 0}
                className="flex-1 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-xl text-xs transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>Saving Students to Firebase...</>
                ) : (
                  <>
                    <Check size={16} />
                    Import {parsedStudents.length} Students into System
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
                className="px-5 py-3 bg-[#f2efe9] text-[#8c8a86] hover:text-[#4a4a48] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
