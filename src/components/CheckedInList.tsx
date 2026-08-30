import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { AttendanceRecord, Student } from '../types';
import { format } from 'date-fns';
import { UserCheck, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export function CheckedInList() {
  const [checkedIn, setCheckedIn] = useState<{ record: AttendanceRecord, student: Student }[]>([]);
  const [sortBy, setSortBy] = useState<'time' | 'name'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    let records: AttendanceRecord[] = db.getAttendance();
    let students: Student[] = db.getStudents();

    const updateList = () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const list = records
        .filter(r => r.date === today && r.checkInTime !== null && !r.checkOutTime)
        .map(r => {
          const student = students.find(s => s.id === r.studentId);
          return {
            record: r,
            student: student || {
              id: r.studentId,
              name: r.studentName || `Student ${r.studentId}`,
              parent: { name: 'Guardian', phone: 'N/A' },
              authorizedPickups: []
            }
          };
        });
      setCheckedIn(list);
    };

    updateList();

    const unsubAttendance = db.subscribeAttendance((atts) => {
      records = atts;
      updateList();
    });

    const unsubStudents = db.subscribeStudents((stus) => {
      students = stus;
      updateList();
    });

    return () => {
      if (typeof unsubAttendance === 'function') unsubAttendance();
      if (typeof unsubStudents === 'function') unsubStudents();
    };
  }, []);

  const toggleSort = (field: 'time' | 'name') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedList = [...checkedIn].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = (a.student.name || a.student.fullName || '').trim();
      const nameB = (b.student.name || b.student.fullName || '').trim();
      const comp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
      return sortOrder === 'asc' ? comp : -comp;
    } else {
      const timeA = a.record.checkInTime ? new Date(a.record.checkInTime).getTime() : 0;
      const timeB = b.record.checkInTime ? new Date(b.record.checkInTime).getTime() : 0;
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#4a4a48]">Currently Checked-In</h1>
          <p className="text-[#8c8a86] mt-1 text-sm">Live roster of all students currently on premises.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#5c869e15] text-[#5c869e] border border-[#5c869e30] rounded-2xl font-bold text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5c869e] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5c869e]"></span>
          </span>
          {checkedIn.length} Active {checkedIn.length === 1 ? 'Student' : 'Students'}
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-[#e5e1da] shadow-sm overflow-hidden">
        {checkedIn.length === 0 ? (
          <div className="p-12 text-center text-[#8c8a86]">
            <div className="w-12 h-12 bg-[#f8f6f3] rounded-full flex items-center justify-center mx-auto mb-3 text-[#8c8a86]">
              <UserCheck size={24} />
            </div>
            <p className="font-medium text-base text-[#4a4a48]">No students are currently checked in.</p>
            <p className="text-xs text-[#8c8a86] mt-1">Check-in scans will update this list automatically in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#fcfaf7] text-[10px] uppercase tracking-widest text-[#8c8a86] font-bold border-b border-[#f2efe9]">
                <tr>
                  <th className="px-8 py-5">Student ID</th>
                  <th 
                    className="px-8 py-5 cursor-pointer select-none hover:text-[#3c3c3b] transition-colors"
                    onClick={() => toggleSort('name')}
                    title="Click to sort alphabetically by First Name"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Student Name</span>
                      {sortBy === 'name' ? (
                        <span className="inline-flex items-center gap-1 text-[#3c3c3b] font-extrabold bg-[#f2efe9] px-2 py-0.5 rounded text-[10px]">
                          {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
                          {sortOrder === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                        </span>
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-8 py-5 cursor-pointer select-none hover:text-[#3c3c3b] transition-colors"
                    onClick={() => toggleSort('time')}
                    title="Click to sort by Check-In Time"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Check-In Time</span>
                      {sortBy === 'time' ? (
                        <span className="inline-flex items-center gap-1 text-[#3c3c3b] font-extrabold bg-[#f2efe9] px-2 py-0.5 rounded text-[10px]">
                          {sortOrder === 'asc' ? 'Earliest' : 'Latest'}
                          {sortOrder === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                        </span>
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </div>
                  </th>
                  <th className="px-8 py-5">Parent / Contact</th>
                  <th className="px-8 py-5">Authorized Pickups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2efe9]">
                {sortedList.map((item) => {
                  return (
                    <tr key={item.record.id} className="hover:bg-[#fcfaf7] transition-colors text-sm text-[#3c3c3b]">
                      <td className="px-8 py-4 text-[#8c8a86] font-mono font-semibold">{item.student.id}</td>
                      <td className="px-8 py-4">
                        <div className="font-semibold text-sm text-[#1e293b]">
                          {item.student.name || item.student.fullName}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-[#8c8a86]">
                        <span className="w-2 h-2 rounded-full bg-[#5c869e] inline-block mr-2"></span>
                        {item.record.checkInTime ? format(new Date(item.record.checkInTime), 'h:mm a') : 'N/A'}
                      </td>
                      <td className="px-8 py-4">
                        {item.student.parent?.name || item.student.parentName}
                        <span className="block text-xs text-[#8c8a86] mt-0.5">{item.student.parent?.phone || item.student.parentPhone}</span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="max-w-xs truncate text-xs text-[#8c8a86]">
                          {item.student.authorizedPickups?.length > 0 ? item.student.authorizedPickups.join(', ') : '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
