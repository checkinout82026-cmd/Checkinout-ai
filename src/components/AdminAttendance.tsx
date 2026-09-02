import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { AttendanceRecord, Student, User } from '../types';
import { parseAttendanceCSV } from '../lib/csvParser';
import { sanitizeCsvCell } from '../lib/utils';
import { format, subDays, startOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Edit3, 
  Trash2, 
  Plus, 
  Search, 
  MessageSquare, 
  X, 
  Calendar, 
  CalendarRange, 
  ArrowRight, 
  Download, 
  Upload,
  FileText,
  Check,
  RotateCcw,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';

export function AdminAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Date range filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activePreset, setActivePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selection state for multi-record operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [parsedImportRecords, setParsedImportRecords] = useState<AttendanceRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [singleDeleteTarget, setSingleDeleteTarget] = useState<{ id: string; name: string; date: string; time: string } | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showPurgeRangeModal, setShowPurgeRangeModal] = useState(false);
  const [showPurgeAllModal, setShowPurgeAllModal] = useState(false);
  const [purgeConfirmationText, setPurgeConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for edit/create
  const [formStudentId, setFormStudentId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formCheckInTime, setFormCheckInTime] = useState('');
  const [formCheckInStaffId, setFormCheckInStaffId] = useState('');
  const [formCheckOutTime, setFormCheckOutTime] = useState('');
  const [formCheckOutStaffId, setFormCheckOutStaffId] = useState('');
  const [formPickupPerson, setFormPickupPerson] = useState('');
  const [formSmsSent, setFormSmsSent] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    const unsubAttendance = db.subscribeAttendance((atts) => {
      setRecords(atts);
    });
    const unsubStudents = db.subscribeStudents((stus) => {
      setStudents(stus);
    });
    const unsubUsers = db.subscribeUsers((uList) => {
      setUsers(uList);
    });

    return () => {
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubStudents === 'function') unsubStudents();
      if (typeof unsubUsers === 'function') unsubUsers();
    };
  }, []);

  // Quick preset setters
  const applyPreset = (preset: 'all' | 'today' | 'yesterday' | 'week' | 'month') => {
    setActivePreset(preset);
    const now = new Date();
    const todayStr = format(now, 'yyyy-MM-dd');

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const yestStr = format(subDays(now, 1), 'yyyy-MM-dd');
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (preset === 'week') {
      const weekAgoStr = format(subDays(now, 7), 'yyyy-MM-dd');
      setStartDate(weekAgoStr);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const monthStartStr = format(startOfMonth(now), 'yyyy-MM-dd');
      setStartDate(monthStartStr);
      setEndDate(todayStr);
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', val: string) => {
    setActivePreset('custom');
    if (type === 'start') {
      setStartDate(val);
    } else {
      setEndDate(val);
    }
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setActivePreset('all');
  };

  // Helper to resolve staff member name
  const getStaffDisplay = (r: AttendanceRecord) => {
    const findUserName = (idOrUsername?: string) => {
      if (!idOrUsername) return '';
      const found = users.find(u => u.id === idOrUsername || u.username === idOrUsername);
      return found?.name || found?.fullName || idOrUsername;
    };

    const inStaff = r.checkInStaffName || findUserName(r.checkInStaffId);
    const outStaff = r.checkOutStaffName || findUserName(r.checkOutStaffId);

    if (r.checkInMethod === 'student_self' && !inStaff && !outStaff) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[#8c8a86] bg-[#f8f6f3] px-2.5 py-1 rounded-lg border border-[#edeae6]">
          Self-Service Kiosk
        </span>
      );
    }

    if (inStaff && outStaff) {
      if (inStaff === outStaff) {
        return (
          <div className="text-xs">
            <span className="font-medium text-[#4a4a48]">{inStaff}</span>
            <span className="block text-[10px] text-[#8c8a86]">In & Out</span>
          </div>
        );
      }
      return (
        <div className="text-xs space-y-0.5">
          <div><span className="text-[10px] text-[#8c8a86] font-bold">IN:</span> <span className="font-medium text-[#4a4a48]">{inStaff}</span></div>
          <div><span className="text-[10px] text-[#8c8a86] font-bold">OUT:</span> <span className="font-medium text-[#4a4a48]">{outStaff}</span></div>
        </div>
      );
    }

    if (inStaff) {
      return (
        <div className="text-xs">
          <span className="font-medium text-[#4a4a48]">{inStaff}</span>
          <span className="block text-[10px] text-[#8c8a86]">Check-in staff</span>
        </div>
      );
    }

    if (outStaff) {
      return (
        <div className="text-xs">
          <span className="font-medium text-[#4a4a48]">{outStaff}</span>
          <span className="block text-[10px] text-[#8c8a86]">Check-out staff</span>
        </div>
      );
    }

    if (r.checkInMethod === 'student_self') {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-[#8c8a86] bg-[#f8f6f3] px-2.5 py-1 rounded-lg border border-[#edeae6]">
          Self-Service Kiosk
        </span>
      );
    }

    return <span className="text-xs text-[#8c8a86]">-</span>;
  };

  const openEditModal = (r: AttendanceRecord) => {
    setEditingRecord(r);
    setFormStudentId(r.studentId);
    setFormDate(r.date);
    setFormCheckInTime(r.checkInTime ? format(new Date(r.checkInTime), 'HH:mm') : '');
    setFormCheckInStaffId(r.checkInStaffId || '');
    setFormCheckOutTime(r.checkOutTime ? format(new Date(r.checkOutTime), 'HH:mm') : '');
    setFormCheckOutStaffId(r.checkOutStaffId || '');
    setFormPickupPerson(r.pickupPerson || r.pickupPersonName || '');
    setFormSmsSent(!!r.smsNotificationSent);
    setFormNotes(r.notes || '');
  };

  const openAddModal = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const nowTime = format(new Date(), 'HH:mm');
    setFormStudentId(students[0]?.id || '100000000001');
    setFormDate(today);
    setFormCheckInTime(nowTime);
    setFormCheckInStaffId(users[0]?.id || '');
    setFormCheckOutTime('');
    setFormCheckOutStaffId('');
    setFormPickupPerson('');
    setFormSmsSent(false);
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleSaveCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const student = students.find(s => s.id === formStudentId);
    const studentName = student ? student.name : (editingRecord.studentName || `Student ${formStudentId}`);

    const inStaff = users.find(u => u.id === formCheckInStaffId || u.username === formCheckInStaffId);
    const outStaff = users.find(u => u.id === formCheckOutStaffId || u.username === formCheckOutStaffId);

    const checkInDateTime = formCheckInTime 
      ? new Date(`${formDate}T${formCheckInTime}:00`).toISOString()
      : null;

    const checkOutDateTime = formCheckOutTime 
      ? new Date(`${formDate}T${formCheckOutTime}:00`).toISOString()
      : null;

    const updated: AttendanceRecord = {
      ...editingRecord,
      studentId: formStudentId,
      studentName,
      date: formDate,
      checkInTime: checkInDateTime,
      checkInStaffId: formCheckInStaffId || null,
      checkInStaffName: inStaff ? inStaff.name : null,
      checkOutTime: checkOutDateTime,
      checkOutStaffId: formCheckOutStaffId || null,
      checkOutStaffName: outStaff ? outStaff.name : null,
      pickupPerson: formPickupPerson || null,
      pickupPersonName: formPickupPerson || null,
      status: checkOutDateTime ? 'checked_out' : 'checked_in',
      smsNotificationSent: formSmsSent,
      notes: formNotes,
      updatedAt: new Date().toISOString()
    };

    await db.saveAttendanceRecord(updated);
    toast.success('Attendance record corrected and synchronized');
    setEditingRecord(null);
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formStudentId);
    if (!student) {
      toast.error('Please enter or select a valid student ID');
      return;
    }

    const inStaff = users.find(u => u.id === formCheckInStaffId || u.username === formCheckInStaffId);
    const outStaff = users.find(u => u.id === formCheckOutStaffId || u.username === formCheckOutStaffId);

    const checkInDateTime = formCheckInTime 
      ? new Date(`${formDate}T${formCheckInTime}:00`).toISOString()
      : new Date().toISOString();

    const checkOutDateTime = formCheckOutTime 
      ? new Date(`${formDate}T${formCheckOutTime}:00`).toISOString()
      : null;

    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      studentId: formStudentId,
      studentName: student.name,
      date: formDate,
      checkInTime: checkInDateTime,
      checkInStaffId: formCheckInStaffId || null,
      checkInStaffName: inStaff ? inStaff.name : null,
      checkInMethod: 'staff_manual',
      checkOutTime: checkOutDateTime,
      checkOutStaffId: formCheckOutStaffId || null,
      checkOutStaffName: outStaff ? outStaff.name : null,
      pickupPerson: formPickupPerson || null,
      pickupPersonName: formPickupPerson || null,
      status: checkOutDateTime ? 'checked_out' : 'checked_in',
      smsNotificationSent: formSmsSent,
      notes: formNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.saveAttendanceRecord(newRecord);
    toast.success(`Attendance logged for ${student.name}`);
    setShowAddModal(false);
  };

  // Single Record Deletion
  const confirmDeleteSingle = (record: AttendanceRecord) => {
    const student = students.find(s => s.id === record.studentId);
    const name = student ? student.name : (record.studentName || `ID ${record.studentId}`);
    const time = record.checkInTime ? format(new Date(record.checkInTime), 'h:mm a') : '-';
    setSingleDeleteTarget({
      id: record.id,
      name,
      date: format(new Date(record.date + 'T12:00:00'), 'MMM d, yyyy'),
      time
    });
  };

  const executeSingleDelete = async () => {
    if (!singleDeleteTarget) return;
    setIsDeleting(true);
    try {
      await db.deleteAttendanceRecord(singleDeleteTarget.id);
      setSelectedIds(prev => prev.filter(id => id !== singleDeleteTarget.id));
      toast.success(`Attendance record for ${singleDeleteTarget.name} deleted`);
      setSingleDeleteTarget(null);
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete attendance record');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Selected Records Deletion
  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      const count = selectedIds.length;
      await db.deleteAttendanceRecords(selectedIds);
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      toast.success(`Successfully deleted ${count} attendance record${count > 1 ? 's' : ''}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete selected records');
    } finally {
      setIsDeleting(false);
    }
  };

  // Purge records matching current date range & search filter
  const executePurgeFiltered = async () => {
    if (filtered.length === 0) return;
    setIsDeleting(true);
    try {
      const idsToPurge = filtered.map(r => r.id);
      await db.deleteAttendanceRecords(idsToPurge);
      setSelectedIds(prev => prev.filter(id => !idsToPurge.includes(id)));
      setShowPurgeRangeModal(false);
      toast.success(`Purged ${idsToPurge.length} attendance record${idsToPurge.length > 1 ? 's' : ''}`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to purge records');
    } finally {
      setIsDeleting(false);
    }
  };

  // Purge all attendance records in database
  const executePurgeAll = async () => {
    if (purgeConfirmationText.trim().toUpperCase() !== 'DELETE ALL') {
      toast.error('Please type "DELETE ALL" to confirm');
      return;
    }
    setIsDeleting(true);
    try {
      await db.clearAllAttendance();
      setSelectedIds([]);
      setShowPurgeAllModal(false);
      setPurgeConfirmationText('');
      toast.success('All attendance records have been purged from database');
    } catch (e) {
      console.error(e);
      toast.error('Failed to clear database');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and sort records descending
  const filtered = records
    .filter(r => {
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    })
    .filter(r => {
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const student = students.find(s => s.id === r.studentId);
      const studentName = (student?.name || r.studentName || '').toLowerCase();
      const staffName = (r.checkInStaffName || r.checkOutStaffName || '').toLowerCase();
      const pickup = (r.pickupPerson || r.pickupPersonName || '').toLowerCase();
      return (
        r.studentId.toLowerCase().includes(query) ||
        studentName.includes(query) ||
        staffName.includes(query) ||
        pickup.includes(query)
      );
    })
    .sort((a, b) => {
      const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return bTime - aTime;
    });

  const totalCheckIns = filtered.length;
  const activeCheckIns = filtered.filter(r => !r.checkOutTime).length;
  const completedCheckOuts = filtered.filter(r => !!r.checkOutTime).length;

  // Selection helpers
  const allFilteredSelected = filtered.length > 0 && filtered.every(r => selectedIds.includes(r.id));
  const someFilteredSelected = filtered.some(r => selectedIds.includes(r.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIdSet = new Set(filtered.map(r => r.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const combined = Array.from(new Set([...selectedIds, ...filtered.map(r => r.id)]));
      setSelectedIds(combined);
    }
  };

  const toggleSelectRecord = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const openImportModal = () => {
    // Default with the user's latest CSV format if empty
    if (!importCsvText) {
      setImportCsvText(`Date,Student ID,Student Name,Check-In Time,Check-In Staff,Check-Out Time,Check-Out Staff,Pickup Person
2026-08-23,"10008","Evelyn Davis","5:28 PM","Adams Rachel","5:28 PM","Adams Rachel","Alexander Davis"
2026-08-23,"10002","Noah Johnson","5:24 PM","Adams Rachel","","",""
2026-08-23,"10001","Liam Smith","1:57 PM","Self-Service Kiosk","1:57 PM","Student Kiosk Terminal","Olivia Smith"
2026-08-23,"10003","Emma Williams","12:24 PM","Self-Service Kiosk","","",""
2026-08-23,"10009","James Rodriguez","12:13 PM","Adams Rachel","12:13 PM","Adams Rachel","Layla Rodriguez"
2026-08-22,"10005","Amelia Jones","7:58 PM","Self-Service Kiosk","","",""
2026-08-22,"10009","James Rodriguez","1:07 PM","Self-Service Kiosk","1:08 PM","Student Kiosk Terminal","Layla Rodriguez"
2026-08-22,"10002","Noah Johnson","12:15 PM","Self-Service Kiosk","","",""
2026-08-22,"10001","Liam Smith","12:15 PM","Self-Service Kiosk","1:11 PM","Student Kiosk Terminal","Olivia Smith"
2026-08-21,"10001","Liam Smith","12:15 PM","Smith Admin","","",""`);
    }
    setShowImportModal(true);
  };

  const handleCsvTextChange = (text: string) => {
    setImportCsvText(text);
    if (text.trim()) {
      const parsed = parseAttendanceCSV(text, students);
      setParsedImportRecords(parsed);
    } else {
      setParsedImportRecords([]);
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

  const handleCommitImport = async () => {
    if (parsedImportRecords.length === 0) {
      const parsed = parseAttendanceCSV(importCsvText, students);
      if (parsed.length === 0) {
        toast.error('No valid attendance records found in CSV');
        return;
      }
      setParsedImportRecords(parsed);
    }

    const recordsToImport = parsedImportRecords.length > 0 ? parsedImportRecords : parseAttendanceCSV(importCsvText, students);
    if (recordsToImport.length === 0) {
      toast.error('No records to import');
      return;
    }

    setIsImporting(true);
    try {
      await db.importAttendanceRecords(recordsToImport);
      toast.success(`Successfully imported ${recordsToImport.length} records into Firebase!`);
      setShowImportModal(false);
      setImportCsvText('');
      setParsedImportRecords([]);
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Failed to import records to Firebase');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCSV = (recordsToExport = filtered) => {
    if (recordsToExport.length === 0) {
      toast.error('No records to export');
      return;
    }
    const headers = ['Date', 'Student ID', 'Student Name', 'Check-In Time', 'Check-In Staff', 'Check-Out Time', 'Check-Out Staff', 'Pickup Person'];
    const rows = recordsToExport.map(r => {
      const student = students.find(s => s.id === r.studentId);
      const sName = student?.name || r.studentName || '';
      const inTime = r.checkInTime ? format(new Date(r.checkInTime), 'h:mm a') : '';
      const outTime = r.checkOutTime ? format(new Date(r.checkOutTime), 'h:mm a') : '';
      
      const findUserName = (idOrUsername?: string | null) => {
        if (!idOrUsername) return '';
        const found = users.find(u => u.id === idOrUsername || u.username === idOrUsername);
        return found?.name || found?.fullName || idOrUsername;
      };

      const inStaff = r.checkInStaffName || findUserName(r.checkInStaffId) || (r.checkInMethod === 'student_self' ? 'Self-Service Kiosk' : '');
      const outStaff = r.checkOutStaffName || findUserName(r.checkOutStaffId) || '';
      const pickup = r.pickupPerson || r.pickupPersonName || '';

      return [
        sanitizeCsvCell(r.date),
        sanitizeCsvCell(r.studentId),
        sanitizeCsvCell(sName),
        sanitizeCsvCell(inTime),
        sanitizeCsvCell(inStaff),
        sanitizeCsvCell(outTime),
        sanitizeCsvCell(outStaff),
        sanitizeCsvCell(pickup)
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kumon_attendance_${startDate || 'all'}_to_${endDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${recordsToExport.length} attendance records exported to CSV!`);
  };

  const exportSelectedOnly = () => {
    const selectedRecords = records.filter(r => selectedIds.includes(r.id));
    handleExportCSV(selectedRecords);
  };

  const getDateRangeLabel = () => {
    if (!startDate && !endDate) return 'All Recorded Dates';
    if (startDate && endDate) {
      if (startDate === endDate) {
        return format(new Date(startDate + 'T12:00:00'), 'MMMM d, yyyy');
      }
      return `${format(new Date(startDate + 'T12:00:00'), 'MMM d, yyyy')} – ${format(new Date(endDate + 'T12:00:00'), 'MMM d, yyyy')}`;
    }
    if (startDate) return `From ${format(new Date(startDate + 'T12:00:00'), 'MMM d, yyyy')}`;
    if (endDate) return `Through ${format(new Date(endDate + 'T12:00:00'), 'MMM d, yyyy')}`;
    return 'Custom Range';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Attendance Records</h1>
          <p className="text-[#8c8a86] mt-1 text-sm">View, filter by date range, search, correct, or manually record student attendance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openImportModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e5e1da] hover:bg-[#f8f6f3] text-[#4a4a48] font-bold rounded-2xl transition-all shadow-sm text-xs cursor-pointer"
            title="Import attendance records from CSV file or text"
          >
            <Upload size={15} className="text-[#5c869e]" />
            Import CSV
          </button>

          <button
            onClick={() => handleExportCSV()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e5e1da] hover:bg-[#f8f6f3] text-[#4a4a48] font-bold rounded-2xl transition-all shadow-sm text-xs cursor-pointer"
            title="Download records for this date range as CSV"
          >
            <Download size={15} className="text-[#5c869e]" />
            Export CSV
          </button>
          
          <button
            onClick={() => setShowPurgeRangeModal(true)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e5e1da] hover:bg-[#fff5f2] text-[#d98466] font-bold rounded-2xl transition-all shadow-sm text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Purge records in current filter"
          >
            <Trash2 size={15} />
            Purge Filtered ({filtered.length})
          </button>

          <button
            onClick={() => {
              setPurgeConfirmationText('');
              setShowPurgeAllModal(true);
            }}
            disabled={records.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#fff1ed] hover:bg-[#ffe5de] text-[#c95d3b] border border-[#f0c2b2] font-bold rounded-2xl transition-all shadow-sm text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Clear all records from database"
          >
            <AlertTriangle size={15} />
            Purge All
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-2xl transition-all shadow-sm text-xs cursor-pointer"
          >
            <Plus size={15} />
            Add Manual Record
          </button>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-white p-5 rounded-[28px] border border-[#e5e1da] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Quick Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold flex items-center gap-1.5 mr-1">
              <CalendarRange size={14} className="text-[#5c869e]" /> Date Range:
            </span>
            <button
              onClick={() => applyPreset('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'all'
                  ? 'bg-[#5c869e] text-white shadow-sm'
                  : 'bg-[#f8f6f3] text-[#6b6965] hover:bg-[#edeae6]'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => applyPreset('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'today'
                  ? 'bg-[#5c869e] text-white shadow-sm'
                  : 'bg-[#f8f6f3] text-[#6b6965] hover:bg-[#edeae6]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => applyPreset('yesterday')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'yesterday'
                  ? 'bg-[#5c869e] text-white shadow-sm'
                  : 'bg-[#f8f6f3] text-[#6b6965] hover:bg-[#edeae6]'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => applyPreset('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'week'
                  ? 'bg-[#5c869e] text-white shadow-sm'
                  : 'bg-[#f8f6f3] text-[#6b6965] hover:bg-[#edeae6]'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => applyPreset('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePreset === 'month'
                  ? 'bg-[#5c869e] text-white shadow-sm'
                  : 'bg-[#f8f6f3] text-[#6b6965] hover:bg-[#edeae6]'
              }`}
            >
              This Month
            </button>
          </div>

          {/* Date Pickers (From / To) */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-[#f8f6f3] px-3 py-1.5 rounded-2xl border border-[#e5e1da]">
              <span className="text-[11px] font-bold text-[#8c8a86]">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleCustomDateChange('start', e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-[#3c3c3b] cursor-pointer"
              />
            </div>

            <ArrowRight size={14} className="text-[#8c8a86] hidden sm:block" />

            <div className="flex items-center gap-1.5 bg-[#f8f6f3] px-3 py-1.5 rounded-2xl border border-[#e5e1da]">
              <span className="text-[11px] font-bold text-[#8c8a86]">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleCustomDateChange('end', e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-[#3c3c3b] cursor-pointer"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={clearDateFilter}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#8c8a86] hover:text-[#3c3c3b] hover:bg-[#edeae6] rounded-xl font-bold transition-colors cursor-pointer"
                title="Reset Date Filter"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Active Range & Stats Pill */}
        <div className="flex items-center justify-between text-xs text-[#6b6965] pt-2 border-t border-[#f2efe9]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#4a4a48]">Viewing:</span>
            <span className="bg-[#5c869e]/10 text-[#4b6573] px-2.5 py-0.5 rounded-full font-bold">
              {getDateRangeLabel()}
            </span>
          </div>
          <span className="text-[#8c8a86]">{filtered.length} record{filtered.length === 1 ? '' : 's'} matching criteria</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#e5e1da] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f8f6f3] flex items-center justify-center text-[#5c869e]">
            <UserCheck size={24} />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#4a4a48]">{totalCheckIns}</div>
            <div className="text-xs text-[#8c8a86] uppercase font-bold tracking-widest">Total in Range</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e5e1da] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5c869e15] flex items-center justify-center text-[#5c869e]">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#5c869e]">{activeCheckIns}</div>
            <div className="text-xs text-[#8c8a86] uppercase font-bold tracking-widest">Currently Checked In</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e5e1da] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d9846615] flex items-center justify-center text-[#d98466]">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-serif font-bold text-[#d98466]">{completedCheckOuts}</div>
            <div className="text-xs text-[#8c8a86] uppercase font-bold tracking-widest">Completed Check-Outs</div>
          </div>
        </div>
      </div>

      {/* Search filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e1da] shadow-sm flex items-center gap-3">
        <Search size={18} className="text-[#8c8a86]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search records in this date range by student name, ID #, staff name, or pickup person..."
          className="w-full bg-transparent outline-none text-sm text-[#3c3c3b]"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-xs text-[#8c8a86] hover:text-[#3c3c3b] font-bold cursor-pointer">
            Clear Search
          </button>
        )}
      </div>

      {/* Selection Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#4a4a48] text-white px-5 py-3.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-bold">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs text-white/80">
              attendance record{selectedIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportSelectedOnly}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Download size={14} />
              Export Selected ({selectedIds.length})
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d98466] hover:bg-[#c95d3b] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Trash2 size={14} />
              Delete Selected ({selectedIds.length})
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-white/70 hover:text-white font-bold transition-colors cursor-pointer"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
              <tr>
                <th className="w-12 px-4 py-5 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-[#8c8a86] hover:text-[#4a4a48] transition-colors cursor-pointer inline-flex items-center justify-center"
                    title={allFilteredSelected ? "Deselect all in view" : "Select all in view"}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare size={17} className="text-[#5c869e]" />
                    ) : someFilteredSelected ? (
                      <div className="w-4 h-4 rounded border-2 border-[#5c869e] bg-[#5c869e]/20 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-[#5c869e]"></div>
                      </div>
                    ) : (
                      <Square size={17} />
                    )}
                  </button>
                </th>
                <th className="px-5 py-5">Date</th>
                <th className="px-5 py-5">Student</th>
                <th className="px-5 py-5">Check-In</th>
                <th className="px-5 py-5">Check-Out</th>
                <th className="px-5 py-5">Staff Member</th>
                <th className="px-5 py-5">Authorized Pickup</th>
                <th className="px-5 py-5">Status</th>
                <th className="px-5 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2efe9] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-8 py-10 text-center text-[#8c8a86]">
                    <Calendar className="mx-auto mb-2 opacity-40" size={28} />
                    <p className="font-semibold text-sm text-[#4a4a48]">No attendance records found</p>
                    <p className="text-xs text-[#8c8a86] mt-0.5">
                      No records matched the selected date range ({getDateRangeLabel()}).
                    </p>
                  </td>
                </tr>
              ) : filtered.map(r => {
                const student = students.find(s => s.id === r.studentId);
                const studentDisplayName = student ? student.name : (r.studentName || `ID: ${r.studentId}`);
                const pickupName = r.pickupPerson || r.pickupPersonName;
                const isSelected = selectedIds.includes(r.id);

                return (
                  <tr 
                    key={r.id} 
                    className={`transition-colors text-[#3c3c3b] ${
                      isSelected ? 'bg-[#f0f6fa]' : 'hover:bg-[#e8f2f8]'
                    }`}
                  >
                    <td className="w-12 px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleSelectRecord(r.id)}
                        className="text-[#8c8a86] hover:text-[#4a4a48] transition-colors cursor-pointer inline-flex items-center justify-center"
                      >
                        {isSelected ? (
                          <CheckSquare size={17} className="text-[#5c869e]" />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-[#8c8a86] font-medium whitespace-nowrap">
                      {format(new Date(r.date + 'T12:00:00'), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4 font-medium">
                      {studentDisplayName}
                      <div className="text-xs text-[#8c8a86] font-mono">ID: {r.studentId}</div>
                    </td>
                    <td className="px-5 py-4 text-[#8c8a86] whitespace-nowrap">
                      {r.checkInTime ? format(new Date(r.checkInTime), 'h:mm a') : '-'}
                    </td>
                    <td className="px-5 py-4 text-[#8c8a86] whitespace-nowrap">
                      {r.checkOutTime ? format(new Date(r.checkOutTime), 'h:mm a') : (
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#5c869e15] text-[#5c869e] border border-[#5c869e30]">
                          Active On-Site
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {getStaffDisplay(r)}
                    </td>
                    <td className="px-5 py-4 text-[#8c8a86]">
                      {pickupName ? (
                        <div>
                          <span className="font-medium text-[#4a4a48]">{pickupName}</span>
                          {(r.smsNotificationSent || r.smsStatus === 'simulated') && (
                            <span className="text-[10px] text-[#5c869e] font-semibold flex items-center gap-1 mt-0.5">
                              <MessageSquare size={10} /> {r.smsNotificationSent ? 'SMS Sent' : 'SMS Simulated'} {r.smsRecipientPhone ? `(${r.smsRecipientPhone})` : ''}
                            </span>
                          )}
                        </div>
                      ) : (
                        (r.smsNotificationSent || r.smsStatus === 'simulated') ? (
                          <span className="text-[10px] text-[#5c869e] font-semibold flex items-center gap-1">
                            <MessageSquare size={10} /> {r.smsNotificationSent ? 'SMS Sent' : 'SMS Simulated'} {r.smsRecipientPhone ? `(${r.smsRecipientPhone})` : ''}
                          </span>
                        ) : '-'
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        r.checkOutTime
                          ? 'bg-[#d9846615] text-[#d98466] border border-[#d9846630]'
                          : 'bg-[#5c869e15] text-[#5c869e] border border-[#5c869e30]'
                      }`}>
                        {r.checkOutTime ? 'Checked Out' : 'Checked In'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-3 whitespace-nowrap">
                      <button 
                        onClick={() => openEditModal(r)}
                        className="inline-flex items-center gap-1 text-[#5c869e] hover:opacity-80 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button 
                        onClick={() => confirmDeleteSingle(r)}
                        className="inline-flex items-center gap-1 text-[#d98466] hover:opacity-80 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Correct Attendance Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-[32px] p-6 sm:p-8 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between border-b border-[#e5e1da] pb-4">
              <div>
                <h2 className="text-xl font-serif font-semibold text-[#4a4a48]">Correct Attendance Record</h2>
                <p className="text-xs text-[#8c8a86] mt-0.5">Admin adjustment for ID #{editingRecord.studentId} • {editingRecord.studentName}</p>
              </div>
              <button onClick={() => setEditingRecord(null)} className="text-[#8c8a86] hover:text-[#4a4a48]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Student ID #</label>
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Time</label>
                  <input
                    type="time"
                    value={formCheckInTime}
                    onChange={e => setFormCheckInTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Staff</label>
                  <select
                    value={formCheckInStaffId}
                    onChange={e => setFormCheckInStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None / Kiosk --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    value={formCheckOutTime}
                    onChange={e => setFormCheckOutTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Staff</label>
                  <select
                    value={formCheckOutStaffId}
                    onChange={e => setFormCheckOutStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Authorized Pickup Person</label>
                <input
                  type="text"
                  value={formPickupPerson}
                  onChange={e => setFormPickupPerson(e.target.value)}
                  placeholder="e.g. Sarah Smith (Mother)"
                  className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formSmsSent"
                  checked={formSmsSent}
                  onChange={e => setFormSmsSent(e.target.checked)}
                  className="rounded text-[#5c869e] focus:ring-[#5c869e]"
                />
                <label htmlFor="formSmsSent" className="text-xs text-[#4a4a48] font-medium">
                  Parent SMS notification marked as dispatched
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e5e1da]">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-xl transition-colors"
                >
                  Save Corrections
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-6 py-3 bg-[#f2efe9] text-[#8c8a86] font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Attendance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-[32px] p-6 sm:p-8 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-6">
            <div className="flex items-center justify-between border-b border-[#e5e1da] pb-4">
              <div>
                <h2 className="text-xl font-serif font-semibold text-[#4a4a48]">Add Manual Attendance Log</h2>
                <p className="text-xs text-[#8c8a86] mt-0.5">Admin manual log for student attendance records</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#8c8a86] hover:text-[#4a4a48]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Select Student</label>
                  <select
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (ID: {s.id})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Time</label>
                  <input
                    type="time"
                    required
                    value={formCheckInTime}
                    onChange={e => setFormCheckInTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-In Staff</label>
                  <select
                    value={formCheckInStaffId}
                    onChange={e => setFormCheckInStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Time (Optional)</label>
                  <input
                    type="time"
                    value={formCheckOutTime}
                    onChange={e => setFormCheckOutTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Check-Out Staff</label>
                  <select
                    value={formCheckOutStaffId}
                    onChange={e => setFormCheckOutStaffId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                  >
                    <option value="">-- None --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold mb-1">Authorized Pickup Person</label>
                <input
                  type="text"
                  value={formPickupPerson}
                  onChange={e => setFormPickupPerson(e.target.value)}
                  placeholder="e.g. Sarah Smith (Mother)"
                  className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#e5e1da]">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-xl transition-colors"
                >
                  Create Attendance Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-[#f2efe9] text-[#8c8a86] font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Single Record Deletion Confirmation Modal */}
      {singleDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-[32px] p-6 sm:p-7 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff1ed] flex-shrink-0 flex items-center justify-center text-[#c95d3b]">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#4a4a48]">Delete Attendance Record?</h3>
                <p className="text-xs text-[#8c8a86]">This action cannot be undone and will permanently remove this entry from the database.</p>
              </div>
            </div>

            <div className="bg-[#fcfaf7] border border-[#e5e1da] p-3.5 rounded-2xl space-y-1.5 text-xs text-[#4a4a48]">
              <div className="flex justify-between">
                <span className="text-[#8c8a86]">Student:</span>
                <span className="font-bold">{singleDeleteTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8a86]">Date:</span>
                <span className="font-semibold">{singleDeleteTarget.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8a86]">Check-In Time:</span>
                <span className="font-semibold">{singleDeleteTarget.time}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executeSingleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-[#d98466] hover:bg-[#c95d3b] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </button>
              <button
                type="button"
                onClick={() => setSingleDeleteTarget(null)}
                disabled={isDeleting}
                className="px-5 py-3 bg-[#f2efe9] text-[#8c8a86] hover:text-[#4a4a48] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bulk Selected Deletion Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-[32px] p-6 sm:p-7 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff1ed] flex-shrink-0 flex items-center justify-center text-[#c95d3b]">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#4a4a48]">Delete {selectedIds.length} Selected Records?</h3>
                <p className="text-xs text-[#8c8a86]">You are about to delete {selectedIds.length} attendance records from the database. This action is irreversible.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executeBulkDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-[#d98466] hover:bg-[#c95d3b] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : `Confirm Delete (${selectedIds.length})`}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isDeleting}
                className="px-5 py-3 bg-[#f2efe9] text-[#8c8a86] hover:text-[#4a4a48] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Purge Filtered Range Confirmation Modal */}
      {showPurgeRangeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-[32px] p-6 sm:p-7 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff1ed] flex-shrink-0 flex items-center justify-center text-[#c95d3b]">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#4a4a48]">Purge Filtered Records?</h3>
                <p className="text-xs text-[#8c8a86]">
                  This will delete all <strong className="text-[#4a4a48]">{filtered.length} records</strong> matching your current filter ({getDateRangeLabel()}).
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#fff1ed]/50 rounded-2xl border border-[#f0c2b2] text-xs text-[#8c8a86]">
              Tip: If you need a backup before deleting, click <strong>Export CSV</strong> first.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executePurgeFiltered}
                disabled={isDeleting}
                className="flex-1 py-3 bg-[#d98466] hover:bg-[#c95d3b] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Purging...' : `Purge ${filtered.length} Records`}
              </button>
              <button
                type="button"
                onClick={() => setShowPurgeRangeModal(false)}
                disabled={isDeleting}
                className="px-5 py-3 bg-[#f2efe9] text-[#8c8a86] hover:text-[#4a4a48] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Purge All Records (Database Reset) Confirmation Modal */}
      {showPurgeAllModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-[32px] p-6 sm:p-7 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#c95d3b] flex-shrink-0 flex items-center justify-center text-white">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#c95d3b]">Purge Entire Attendance Database</h3>
                <p className="text-xs text-[#8c8a86]">
                  This will permanently wipe all <strong className="text-[#4a4a48]">{records.length} records</strong> across all dates.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#8c8a86]">
                Type <span className="font-mono text-[#c95d3b] bg-[#fff1ed] px-1.5 py-0.5 rounded">DELETE ALL</span> to confirm:
              </label>
              <input
                type="text"
                value={purgeConfirmationText}
                onChange={e => setPurgeConfirmationText(e.target.value)}
                placeholder="DELETE ALL"
                className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:border-[#c95d3b]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executePurgeAll}
                disabled={isDeleting || purgeConfirmationText.trim().toUpperCase() !== 'DELETE ALL'}
                className="flex-1 py-3 bg-[#c95d3b] hover:bg-[#a84424] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Purging Database...' : 'Permanently Wipe Database'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPurgeAllModal(false);
                  setPurgeConfirmationText('');
                }}
                disabled={isDeleting}
                className="px-5 py-3 bg-[#f2efe9] text-[#8c8a86] hover:text-[#4a4a48] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 5. Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full rounded-[32px] p-6 sm:p-7 border border-[#e5e1da] shadow-2xl animate-in zoom-in-95 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5c869e]/15 flex items-center justify-center text-[#5c869e]">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#4a4a48]">Import Attendance CSV</h3>
                  <p className="text-xs text-[#8c8a86]">Paste CSV text or upload a .csv file to batch import student check-in/out records into Firebase.</p>
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
                  <span className="text-xs font-semibold text-[#4a4a48]">Upload a CSV file:</span>
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
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#8c8a86] uppercase tracking-wider">
                    Paste CSV Data:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = `Date,Student ID,Student Name,Check-In Time,Check-In Staff,Check-Out Time,Check-Out Staff,Pickup Person
2026-08-23,"10008","Evelyn Davis","5:28 PM","Adams Rachel","5:28 PM","Adams Rachel","Alexander Davis"
2026-08-23,"10002","Noah Johnson","5:24 PM","Adams Rachel","","",""
2026-08-23,"10001","Liam Smith","1:57 PM","Self-Service Kiosk","1:57 PM","Student Kiosk Terminal","Olivia Smith"
2026-08-23,"10003","Emma Williams","12:24 PM","Self-Service Kiosk","","",""
2026-08-23,"10009","James Rodriguez","12:13 PM","Adams Rachel","12:13 PM","Adams Rachel","Layla Rodriguez"
2026-08-22,"10005","Amelia Jones","7:58 PM","Self-Service Kiosk","","",""
2026-08-22,"10009","James Rodriguez","1:07 PM","Self-Service Kiosk","1:08 PM","Student Kiosk Terminal","Layla Rodriguez"
2026-08-22,"10002","Noah Johnson","12:15 PM","Self-Service Kiosk","","",""
2026-08-22,"10001","Liam Smith","12:15 PM","Self-Service Kiosk","1:11 PM","Student Kiosk Terminal","Olivia Smith"
2026-08-21,"10001","Liam Smith","12:15 PM","Smith Admin","","",""`;
                      handleCsvTextChange(sample);
                    }}
                    className="text-[11px] text-[#5c869e] hover:underline font-semibold cursor-pointer"
                  >
                    Load Current Attendance Records (10 rows)
                  </button>
                </div>
                <textarea
                  value={importCsvText}
                  onChange={e => handleCsvTextChange(e.target.value)}
                  rows={6}
                  placeholder="Date,Student ID,Student Name,Check-In Time,Check-In Staff,Check-Out Time,Check-Out Staff,Pickup Person..."
                  className="w-full px-3.5 py-2.5 bg-[#f8f6f3] border border-[#e5e1da] rounded-2xl text-xs font-mono focus:outline-none focus:border-[#5c869e] resize-y"
                />
              </div>

              {/* Preview Section */}
              {parsedImportRecords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4a4a48]">
                      Parsed Preview: <span className="text-[#5c869e]">{parsedImportRecords.length} Records</span> Ready to Import
                    </span>
                    <span className="text-[11px] text-[#8c8a86]">
                      {parsedImportRecords.filter(r => r.status === 'checked_out').length} Checked-Out, {parsedImportRecords.filter(r => r.status === 'checked_in').length} Checked-In
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-[#e5e1da] rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8f6f3] text-[#8c8a86] border-b border-[#e5e1da] sticky top-0">
                        <tr>
                          <th className="py-2 px-3 font-semibold">Date</th>
                          <th className="py-2 px-3 font-semibold">Student ID</th>
                          <th className="py-2 px-3 font-semibold">Student Name</th>
                          <th className="py-2 px-3 font-semibold">Check-In</th>
                          <th className="py-2 px-3 font-semibold">Check-Out</th>
                          <th className="py-2 px-3 font-semibold">Pickup Person</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e5e1da]">
                        {parsedImportRecords.map((pr, idx) => (
                          <tr key={pr.id || idx} className="hover:bg-[#fcfbf9]">
                            <td className="py-2 px-3 text-[#4a4a48] font-mono text-[11px]">{pr.date}</td>
                            <td className="py-2 px-3 font-mono text-[#5c869e] font-semibold text-[11px]">{pr.studentId}</td>
                            <td className="py-2 px-3 text-[#4a4a48] font-medium">{pr.studentName}</td>
                            <td className="py-2 px-3 text-[#5e705b]">
                              {pr.checkInTime ? format(new Date(pr.checkInTime), 'h:mm a') : '-'}
                            </td>
                            <td className="py-2 px-3 text-[#8c8a86]">
                              {pr.checkOutTime ? format(new Date(pr.checkOutTime), 'h:mm a') : '-'}
                            </td>
                            <td className="py-2 px-3 text-[#4a4a48]">
                              {pr.pickupPerson || '-'}
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
                onClick={handleCommitImport}
                disabled={isImporting || parsedImportRecords.length === 0}
                className="flex-1 py-3 bg-[#5c869e] hover:opacity-90 text-white font-bold rounded-xl text-xs transition-opacity cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>Importing Records to Firebase...</>
                ) : (
                  <>
                    <Check size={16} />
                    Import {parsedImportRecords.length} Records into System
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

