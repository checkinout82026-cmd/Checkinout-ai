import { Student, AttendanceRecord } from '../types';

export const SYNTHETIC_STUDENTS: Student[] = [
  {
    id: "10001",
    name: "Alex Morgan",
    fullName: "Alex Morgan",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Sarah Morgan",
      phone: "555-0102",
      phone2: "555-0103",
      email: "sarah.morgan@example.com"
    },
    parentName: "Sarah Morgan",
    parentPhone: "555-0102",
    parentPhone2: "555-0103",
    parentEmail: "sarah.morgan@example.com",
    authorizedPickups: ["Sarah Morgan", "David Morgan"],
    authorizedPickupDetails: [
      {
        name: "Sarah Morgan",
        relationship: "Mother",
        phone: "555-0102",
        isPrimary: true
      },
      {
        name: "David Morgan",
        relationship: "Father",
        phone: "555-0103",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0101",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10002",
    name: "Emma Johnson",
    fullName: "Emma Johnson",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Laura Johnson",
      phone: "555-0112",
      phone2: "555-0113",
      email: "laura.johnson@example.com"
    },
    parentName: "Laura Johnson",
    parentPhone: "555-0112",
    parentPhone2: "555-0113",
    parentEmail: "laura.johnson@example.com",
    authorizedPickups: ["Laura Johnson", "Robert Johnson"],
    authorizedPickupDetails: [
      {
        name: "Laura Johnson",
        relationship: "Mother",
        phone: "555-0112",
        isPrimary: true
      },
      {
        name: "Robert Johnson",
        relationship: "Father",
        phone: "555-0113",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0111",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10003",
    name: "Liam Davis",
    fullName: "Liam Davis",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Jennifer Davis",
      phone: "555-0122",
      phone2: "555-0123",
      email: "jennifer.davis@example.com"
    },
    parentName: "Jennifer Davis",
    parentPhone: "555-0122",
    parentPhone2: "555-0123",
    parentEmail: "jennifer.davis@example.com",
    authorizedPickups: ["Jennifer Davis", "Michael Davis"],
    authorizedPickupDetails: [
      {
        name: "Jennifer Davis",
        relationship: "Mother",
        phone: "555-0122",
        isPrimary: true
      },
      {
        name: "Michael Davis",
        relationship: "Father",
        phone: "555-0123",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0121",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10004",
    name: "Sophia Martinez",
    fullName: "Sophia Martinez",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Elena Martinez",
      phone: "555-0132",
      phone2: "555-0133",
      email: "elena.martinez@example.com"
    },
    parentName: "Elena Martinez",
    parentPhone: "555-0132",
    parentPhone2: "555-0133",
    parentEmail: "elena.martinez@example.com",
    authorizedPickups: ["Elena Martinez", "Carlos Martinez"],
    authorizedPickupDetails: [
      {
        name: "Elena Martinez",
        relationship: "Mother",
        phone: "555-0132",
        isPrimary: true
      },
      {
        name: "Carlos Martinez",
        relationship: "Father",
        phone: "555-0133",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0131",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10005",
    name: "Noah Wilson",
    fullName: "Noah Wilson",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Emily Wilson",
      phone: "555-0142",
      phone2: "555-0143",
      email: "emily.wilson@example.com"
    },
    parentName: "Emily Wilson",
    parentPhone: "555-0142",
    parentPhone2: "555-0143",
    parentEmail: "emily.wilson@example.com",
    authorizedPickups: ["Emily Wilson", "James Wilson"],
    authorizedPickupDetails: [
      {
        name: "Emily Wilson",
        relationship: "Mother",
        phone: "555-0142",
        isPrimary: true
      },
      {
        name: "James Wilson",
        relationship: "Father",
        phone: "555-0143",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0141",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10006",
    name: "Olivia Brown",
    fullName: "Olivia Brown",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Jessica Brown",
      phone: "555-0152",
      phone2: "555-0153",
      email: "jessica.brown@example.com"
    },
    parentName: "Jessica Brown",
    parentPhone: "555-0152",
    parentPhone2: "555-0153",
    parentEmail: "jessica.brown@example.com",
    authorizedPickups: ["Jessica Brown", "William Brown"],
    authorizedPickupDetails: [
      {
        name: "Jessica Brown",
        relationship: "Mother",
        phone: "555-0152",
        isPrimary: true
      },
      {
        name: "William Brown",
        relationship: "Father",
        phone: "555-0153",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0151",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10007",
    name: "Ethan Taylor",
    fullName: "Ethan Taylor",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Amanda Taylor",
      phone: "555-0162",
      phone2: "555-0163",
      email: "amanda.taylor@example.com"
    },
    parentName: "Amanda Taylor",
    parentPhone: "555-0162",
    parentPhone2: "555-0163",
    parentEmail: "amanda.taylor@example.com",
    authorizedPickups: ["Amanda Taylor", "Richard Taylor"],
    authorizedPickupDetails: [
      {
        name: "Amanda Taylor",
        relationship: "Mother",
        phone: "555-0162",
        isPrimary: true
      },
      {
        name: "Richard Taylor",
        relationship: "Father",
        phone: "555-0163",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0161",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10008",
    name: "Ava Anderson",
    fullName: "Ava Anderson",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Megan Anderson",
      phone: "555-0172",
      phone2: "555-0173",
      email: "megan.anderson@example.com"
    },
    parentName: "Megan Anderson",
    parentPhone: "555-0172",
    parentPhone2: "555-0173",
    parentEmail: "megan.anderson@example.com",
    authorizedPickups: ["Megan Anderson", "Joseph Anderson"],
    authorizedPickupDetails: [
      {
        name: "Megan Anderson",
        relationship: "Mother",
        phone: "555-0172",
        isPrimary: true
      },
      {
        name: "Joseph Anderson",
        relationship: "Father",
        phone: "555-0173",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0171",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10009",
    name: "Mason Thomas",
    fullName: "Mason Thomas",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Rachel Thomas",
      phone: "555-0182",
      phone2: "555-0183",
      email: "rachel.thomas@example.com"
    },
    parentName: "Rachel Thomas",
    parentPhone: "555-0182",
    parentPhone2: "555-0183",
    parentEmail: "rachel.thomas@example.com",
    authorizedPickups: ["Rachel Thomas", "Charles Thomas"],
    authorizedPickupDetails: [
      {
        name: "Rachel Thomas",
        relationship: "Mother",
        phone: "555-0182",
        isPrimary: true
      },
      {
        name: "Charles Thomas",
        relationship: "Father",
        phone: "555-0183",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0181",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  },
  {
    id: "10010",
    name: "Isabella Jackson",
    fullName: "Isabella Jackson",
    gradeLevel: "Kumon Student",
    parent: {
      name: "Ashley Jackson",
      phone: "555-0192",
      phone2: "555-0193",
      email: "ashley.jackson@example.com"
    },
    parentName: "Ashley Jackson",
    parentPhone: "555-0192",
    parentPhone2: "555-0193",
    parentEmail: "ashley.jackson@example.com",
    authorizedPickups: ["Ashley Jackson", "Daniel Jackson"],
    authorizedPickupDetails: [
      {
        name: "Ashley Jackson",
        relationship: "Mother",
        phone: "555-0192",
        isPrimary: true
      },
      {
        name: "Daniel Jackson",
        relationship: "Father",
        phone: "555-0193",
        isPrimary: false
      }
    ],
    notes: "Home Phone: 555-0191",
    isActive: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    updatedAt: "2026-08-01T08:00:00.000Z"
  }
];

export const ACTUAL_STUDENTS: Student[] = SYNTHETIC_STUDENTS;
export const DUMMY_STUDENTS: Student[] = SYNTHETIC_STUDENTS;
export const TEN_STUDENTS: Student[] = SYNTHETIC_STUDENTS;

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: "att-1",
    studentId: "10001",
    studentName: "Alex Morgan",
    date: "2026-08-29",
    checkInTime: "2026-08-29T15:30:00.000Z",
    checkOutTime: "2026-08-29T16:15:00.000Z",
    checkInMethod: "student_self",
    checkInStaffName: "Self-Service Kiosk",
    checkOutStaffName: "Student Kiosk Terminal",
    pickupPerson: "Sarah Morgan",
    pickupPersonName: "Sarah Morgan",
    status: "checked_out",
    smsNotificationSent: true,
    createdAt: "2026-08-29T15:30:00.000Z",
    updatedAt: "2026-08-29T16:15:00.000Z"
  }
];

export const DUMMY_ATTENDANCE: AttendanceRecord[] = INITIAL_ATTENDANCE_RECORDS;
export const generate10Students = (): Student[] => SYNTHETIC_STUDENTS;
