import { Student, AttendanceRecord } from '../types';

export const DUMMY_STUDENTS: Student[] = [
  {
    id: "100000000001",
    name: "Liam Smith",
    fullName: "Liam Smith",
    gradeLevel: "Kindergarten",
    parent: {
      name: "Olivia Smith",
      phone: "(555) 010-0101",
      phone2: "(555) 010-0102",
      email: "olivia.smith@example.com"
    },
    parentName: "Olivia Smith",
    parentPhone: "(555) 010-0101",
    parentPhone2: "(555) 010-0102",
    parentEmail: "olivia.smith@example.com",
    authorizedPickups: [
      "Olivia Smith",
      "James Smith",
      "Emma Miller"
    ],
    authorizedPickupDetails: [
      {
        name: "Olivia Smith",
        relationship: "Mother",
        phone: "(555) 010-0101",
        isPrimary: true
      },
      {
        name: "James Smith",
        relationship: "Father",
        phone: "(555) 010-0102",
        isPrimary: false
      },
      {
        name: "Emma Miller",
        relationship: "Aunt",
        phone: "(555) 010-0103",
        isPrimary: false
      }
    ],
    notes: "Allergic to peanuts",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000002",
    name: "Noah Johnson",
    fullName: "Noah Johnson",
    gradeLevel: "Grade 1",
    parent: {
      name: "Sophia Johnson",
      phone: "(555) 010-0104",
      phone2: "(555) 010-0105",
      email: "sophia.johnson@example.com"
    },
    parentName: "Sophia Johnson",
    parentPhone: "(555) 010-0104",
    parentPhone2: "(555) 010-0105",
    parentEmail: "sophia.johnson@example.com",
    authorizedPickups: [
      "Sophia Johnson",
      "Lucas Johnson",
      "Charlotte Davis"
    ],
    authorizedPickupDetails: [
      {
        name: "Sophia Johnson",
        relationship: "Mother",
        phone: "(555) 010-0104",
        isPrimary: true
      },
      {
        name: "Lucas Johnson",
        relationship: "Father",
        phone: "(555) 010-0105",
        isPrimary: false
      }
    ],
    notes: "",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000003",
    name: "Emma Williams",
    fullName: "Emma Williams",
    gradeLevel: "Grade 2",
    parent: {
      name: "Henry Williams",
      phone: "(555) 010-0107",
      phone2: "(555) 010-0108",
      email: "henry.williams@example.com"
    },
    parentName: "Henry Williams",
    parentPhone: "(555) 010-0107",
    parentPhone2: "(555) 010-0108",
    parentEmail: "henry.williams@example.com",
    authorizedPickups: [
      "Henry Williams",
      "Isabella Williams",
      "Evelyn Taylor"
    ],
    authorizedPickupDetails: [
      {
        name: "Henry Williams",
        relationship: "Father",
        phone: "(555) 010-0107",
        isPrimary: true
      },
      {
        name: "Isabella Williams",
        relationship: "Mother",
        phone: "(555) 010-0108",
        isPrimary: false
      }
    ],
    notes: "Asthma inhaler in office",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000004",
    name: "Oliver Brown",
    fullName: "Oliver Brown",
    gradeLevel: "Grade 3",
    parent: {
      name: "Harper Brown",
      phone: "(555) 010-0110",
      email: "harper.brown@example.com"
    },
    parentName: "Harper Brown",
    parentPhone: "(555) 010-0110",
    parentPhone2: "",
    parentEmail: "harper.brown@example.com",
    authorizedPickups: [
      "Harper Brown",
      "Theodore Brown",
      "Benjamin Brown"
    ],
    authorizedPickupDetails: [
      {
        name: "Harper Brown",
        relationship: "Mother",
        phone: "(555) 010-0110",
        isPrimary: true
      }
    ],
    notes: "",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000005",
    name: "Amelia Jones",
    fullName: "Amelia Jones",
    gradeLevel: "Grade 4",
    parent: {
      name: "Elijah Jones",
      phone: "(555) 010-0113",
      phone2: "(555) 010-0114",
      email: "elijah.jones@example.com"
    },
    parentName: "Elijah Jones",
    parentPhone: "(555) 010-0113",
    parentPhone2: "(555) 010-0114",
    parentEmail: "elijah.jones@example.com",
    authorizedPickups: [
      "Elijah Jones",
      "Camila Jones",
      "Gianna White"
    ],
    authorizedPickupDetails: [
      {
        name: "Elijah Jones",
        relationship: "Father",
        phone: "(555) 010-0113",
        isPrimary: true
      }
    ],
    notes: "",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000006",
    name: "Lucas Garcia",
    fullName: "Lucas Garcia",
    gradeLevel: "Grade 5",
    parent: {
      name: "Mateo Garcia",
      phone: "(555) 010-0116",
      phone2: "(555) 010-0117",
      email: "mateo.garcia@example.com"
    },
    parentName: "Mateo Garcia",
    parentPhone: "(555) 010-0116",
    parentPhone2: "(555) 010-0117",
    parentEmail: "mateo.garcia@example.com",
    authorizedPickups: [
      "Mateo Garcia",
      "Elena Garcia",
      "Carlos Garcia"
    ],
    authorizedPickupDetails: [
      {
        name: "Mateo Garcia",
        relationship: "Father",
        phone: "(555) 010-0116",
        isPrimary: true
      }
    ],
    notes: "",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000007",
    name: "Mia Miller",
    fullName: "Mia Miller",
    gradeLevel: "Grade 6",
    parent: {
      name: "Abigail Miller",
      phone: "(555) 010-0119",
      email: "abigail.miller@example.com"
    },
    parentName: "Abigail Miller",
    parentPhone: "(555) 010-0119",
    parentPhone2: "",
    parentEmail: "abigail.miller@example.com",
    authorizedPickups: [
      "Abigail Miller",
      "David Miller",
      "Grace Clark"
    ],
    authorizedPickupDetails: [
      {
        name: "Abigail Miller",
        relationship: "Mother",
        phone: "(555) 010-0119",
        isPrimary: true
      }
    ],
    notes: "Lactose intolerant",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000008",
    name: "Evelyn Davis",
    fullName: "Evelyn Davis",
    gradeLevel: "Grade 7",
    parent: {
      name: "Alexander Davis",
      phone: "(555) 010-0122",
      phone2: "(555) 010-0123",
      email: "alexander.davis@example.com"
    },
    parentName: "Alexander Davis",
    parentPhone: "(555) 010-0122",
    parentPhone2: "(555) 010-0123",
    parentEmail: "alexander.davis@example.com",
    authorizedPickups: [
      "Alexander Davis",
      "Chloe Davis",
      "Owen Davis"
    ],
    authorizedPickupDetails: [
      {
        name: "Alexander Davis",
        relationship: "Father",
        phone: "(555) 010-0122",
        isPrimary: true
      }
    ],
    notes: "",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000009",
    name: "James Rodriguez",
    fullName: "James Rodriguez",
    gradeLevel: "Grade 8",
    parent: {
      name: "Layla Rodriguez",
      phone: "(555) 010-0125",
      email: "layla.rodriguez@example.com"
    },
    parentName: "Layla Rodriguez",
    parentPhone: "(555) 010-0125",
    parentPhone2: "",
    parentEmail: "layla.rodriguez@example.com",
    authorizedPickups: [
      "Layla Rodriguez",
      "Samuel Rodriguez",
      "Ethan Martinez"
    ],
    authorizedPickupDetails: [
      {
        name: "Layla Rodriguez",
        relationship: "Mother",
        phone: "(555) 010-0125",
        isPrimary: true
      }
    ],
    notes: "",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  },
  {
    id: "100000000010",
    name: "Sophia Martinez",
    fullName: "Sophia Martinez",
    gradeLevel: "Grade 2",
    parent: {
      name: "Daniel Martinez",
      phone: "(555) 010-0128",
      phone2: "(555) 010-0129",
      email: "daniel.martinez@example.com"
    },
    parentName: "Daniel Martinez",
    parentPhone: "(555) 010-0128",
    parentPhone2: "(555) 010-0129",
    parentEmail: "daniel.martinez@example.com",
    authorizedPickups: [
      "Daniel Martinez",
      "Lily Martinez",
      "Jack Wilson"
    ],
    authorizedPickupDetails: [
      {
        name: "Daniel Martinez",
        relationship: "Father",
        phone: "(555) 010-0128",
        isPrimary: true
      }
    ],
    notes: "",
    isActive: true,
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z"
  }
];

export const ALL_STUDENTS: Student[] = DUMMY_STUDENTS;
export const TEN_STUDENTS: Student[] = DUMMY_STUDENTS;
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [];

export function generate10Students(): Student[] {
  return DUMMY_STUDENTS;
}

export function generate150Students(): Student[] {
  return DUMMY_STUDENTS;
}
