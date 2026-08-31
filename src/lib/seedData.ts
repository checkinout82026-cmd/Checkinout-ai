import { Student, AttendanceRecord } from '../types';

export const ACTUAL_STUDENTS: Student[] = [
  {
    "id": "8402450947294",
    "name": "Aadhya Cartik",
    "fullName": "Aadhya Cartik",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Cartik Seshan",
      "phone": "(614) - 404- 9115",
      "phone2": "",
      "email": ""
    },
    "parentName": "Cartik Seshan",
    "parentPhone": "(614) - 404- 9115",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Cartik Seshan"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Cartik Seshan",
        "relationship": "Father",
        "phone": "(614) - 404- 9115",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 404- 9115",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650351877",
    "name": "Aanshi Patel",
    "fullName": "Aanshi Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Vaibhavi Patel",
      "phone": "(331) - 200- 9646",
      "phone2": "(380) - 219- 7648",
      "email": ""
    },
    "parentName": "Vaibhavi Patel",
    "parentPhone": "(331) - 200- 9646",
    "parentPhone2": "(380) - 219- 7648",
    "parentEmail": "",
    "authorizedPickups": [
      "Vaibhavi Patel",
      "Dhaval Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Vaibhavi Patel",
        "relationship": "Mother",
        "phone": "(331) - 200- 9646",
        "isPrimary": true
      },
      {
        "name": "Dhaval Patel",
        "relationship": "Father",
        "phone": "(380) - 219- 7648",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (380) - 219- 7648",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550816551",
    "name": "Aaron Cheung",
    "fullName": "Aaron Cheung",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Michael Cheung",
      "phone": "(650) - 996- 9508",
      "phone2": "",
      "email": ""
    },
    "parentName": "Michael Cheung",
    "parentPhone": "(650) - 996- 9508",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Michael Cheung"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Michael Cheung",
        "relationship": "Father",
        "phone": "(650) - 996- 9508",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (650) - 996- 9508",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402351091485",
    "name": "Aatika Ahmad",
    "fullName": "Aatika Ahmad",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Aatika Ahmad Guardian",
      "phone": "(614) - 377- 2616",
      "phone2": "",
      "email": ""
    },
    "parentName": "Aatika Ahmad Guardian",
    "parentPhone": "(614) - 377- 2616",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Aatika Ahmad Guardian"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Aatika Ahmad Guardian",
        "relationship": "Primary Guardian",
        "phone": "(614) - 377- 2616",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 377- 2616",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650473036",
    "name": "Abdallah Qalinle",
    "fullName": "Abdallah Qalinle",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Rodo Ahmed",
      "phone": "(614) - 206- 2343",
      "phone2": "(952) - 688- 3268",
      "email": ""
    },
    "parentName": "Rodo Ahmed",
    "parentPhone": "(614) - 206- 2343",
    "parentPhone2": "(952) - 688- 3268",
    "parentEmail": "",
    "authorizedPickups": [
      "Rodo Ahmed",
      "Omar Qalinle"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Rodo Ahmed",
        "relationship": "Mother",
        "phone": "(614) - 206- 2343",
        "isPrimary": true
      },
      {
        "name": "Omar Qalinle",
        "relationship": "Father",
        "phone": "(952) - 688- 3268",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (952) - 688- 3268",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550816520",
    "name": "Adam Bahader",
    "fullName": "Adam Bahader",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Balsam Alhwaidi",
      "phone": "(419) - 322- 6926",
      "phone2": "(419) - 322- 6100",
      "email": ""
    },
    "parentName": "Balsam Alhwaidi",
    "parentPhone": "(419) - 322- 6926",
    "parentPhone2": "(419) - 322- 6100",
    "parentEmail": "",
    "authorizedPickups": [
      "Balsam Alhwaidi",
      "Ghaith Bahader"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Balsam Alhwaidi",
        "relationship": "Mother",
        "phone": "(419) - 322- 6926",
        "isPrimary": true
      },
      {
        "name": "Ghaith Bahader",
        "relationship": "Father",
        "phone": "(419) - 322- 6100",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (419) - 322- 6926",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402251231769",
    "name": "Agaran Karthik",
    "fullName": "Agaran Karthik",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Arishma Parvathy Ammal Thanu",
      "phone": "(419) - 378- 9316",
      "phone2": "(419) - 378- 9316",
      "email": ""
    },
    "parentName": "Arishma Parvathy Ammal Thanu",
    "parentPhone": "(419) - 378- 9316",
    "parentPhone2": "(419) - 378- 9316",
    "parentEmail": "",
    "authorizedPickups": [
      "Arishma Parvathy Ammal Thanu",
      "Karthik Nathan"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Arishma Parvathy Ammal Thanu",
        "relationship": "Mother",
        "phone": "(419) - 378- 9316",
        "isPrimary": true
      },
      {
        "name": "Karthik Nathan",
        "relationship": "Father",
        "phone": "(419) - 378- 9316",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (419) - 378- 9316",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402551080005",
    "name": "Aidan Rowlands",
    "fullName": "Aidan Rowlands",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Jayani Parana Liyange",
      "phone": "(614) - 439- 0237",
      "phone2": "",
      "email": ""
    },
    "parentName": "Jayani Parana Liyange",
    "parentPhone": "(614) - 439- 0237",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Jayani Parana Liyange"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Jayani Parana Liyange",
        "relationship": "Mother",
        "phone": "(614) - 439- 0237",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 439- 0237",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450135714",
    "name": "Aisha Yadav",
    "fullName": "Aisha Yadav",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Nilam Yadav",
      "phone": "(385) - 216- 8394",
      "phone2": "(801) - 368- 0979",
      "email": ""
    },
    "parentName": "Nilam Yadav",
    "parentPhone": "(385) - 216- 8394",
    "parentPhone2": "(801) - 368- 0979",
    "parentEmail": "",
    "authorizedPickups": [
      "Nilam Yadav",
      "Bidhyananda Yadav"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Nilam Yadav",
        "relationship": "Mother",
        "phone": "(385) - 216- 8394",
        "isPrimary": true
      },
      {
        "name": "Bidhyananda Yadav",
        "relationship": "Father",
        "phone": "(801) - 368- 0979",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (801) - 368- 0979",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650247934",
    "name": "Aniruddh Mukherjee",
    "fullName": "Aniruddh Mukherjee",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Subhra Mukherjee",
      "phone": "(781) - 666- 9272",
      "phone2": "",
      "email": ""
    },
    "parentName": "Subhra Mukherjee",
    "parentPhone": "(781) - 666- 9272",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Subhra Mukherjee"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Subhra Mukherjee",
        "relationship": "Mother",
        "phone": "(781) - 666- 9272",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (781) - 666- 9272",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550537050",
    "name": "Anvik Vistarakula",
    "fullName": "Anvik Vistarakula",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Niharika Vistarakula",
      "phone": "(734) - 355- 7748",
      "phone2": "",
      "email": ""
    },
    "parentName": "Niharika Vistarakula",
    "parentPhone": "(734) - 355- 7748",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Niharika Vistarakula"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Niharika Vistarakula",
        "relationship": "Mother",
        "phone": "(734) - 355- 7748",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (734) - 355- 7748",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350754190",
    "name": "Arjun Bobade",
    "fullName": "Arjun Bobade",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Ravindra Bobade",
      "phone": "(925) - 216- 1300",
      "phone2": "",
      "email": ""
    },
    "parentName": "Ravindra Bobade",
    "parentPhone": "(925) - 216- 1300",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Ravindra Bobade"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Ravindra Bobade",
        "relationship": "Father",
        "phone": "(925) - 216- 1300",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (925) - 216- 1300",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650648618",
    "name": "Arjun Brajpuriya",
    "fullName": "Arjun Brajpuriya",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Shilpi Brajpuriya",
      "phone": "(614) - 615- 3264",
      "phone2": "",
      "email": ""
    },
    "parentName": "Shilpi Brajpuriya",
    "parentPhone": "(614) - 615- 3264",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Shilpi Brajpuriya"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Shilpi Brajpuriya",
        "relationship": "Mother",
        "phone": "(614) - 615- 3264",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 615- 3264",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401950385230",
    "name": "Artin Azad",
    "fullName": "Artin Azad",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Fariba Salehi",
      "phone": "(480) - 455- 9791",
      "phone2": "(480) - 455- 8090",
      "email": ""
    },
    "parentName": "Fariba Salehi",
    "parentPhone": "(480) - 455- 9791",
    "parentPhone2": "(480) - 455- 8090",
    "parentEmail": "",
    "authorizedPickups": [
      "Fariba Salehi",
      "Parviz Azad"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Fariba Salehi",
        "relationship": "Mother",
        "phone": "(480) - 455- 9791",
        "isPrimary": true
      },
      {
        "name": "Parviz Azad",
        "relationship": "Father",
        "phone": "(480) - 455- 8090",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (480) - 455- 9791",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550389017",
    "name": "Arya Shelat",
    "fullName": "Arya Shelat",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Chirag Shelat",
      "phone": "(614) - 806- 1015",
      "phone2": "",
      "email": ""
    },
    "parentName": "Chirag Shelat",
    "parentPhone": "(614) - 806- 1015",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Chirag Shelat"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Chirag Shelat",
        "relationship": "Father",
        "phone": "(614) - 806- 1015",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 446- 0364",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450947300",
    "name": "Aryam Zindah",
    "fullName": "Aryam Zindah",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Sabrih Younus",
      "phone": "(614) - 270- 0793",
      "phone2": "(614) - 270- 1199",
      "email": ""
    },
    "parentName": "Sabrih Younus",
    "parentPhone": "(614) - 270- 0793",
    "parentPhone2": "(614) - 270- 1199",
    "parentEmail": "",
    "authorizedPickups": [
      "Sabrih Younus",
      "Wisam Zindah"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Sabrih Younus",
        "relationship": "Mother",
        "phone": "(614) - 270- 0793",
        "isPrimary": true
      },
      {
        "name": "Wisam Zindah",
        "relationship": "Father",
        "phone": "(614) - 270- 1199",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 270- 0793",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350525554",
    "name": "Aryaman Patel",
    "fullName": "Aryaman Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Mayuri Patel",
      "phone": "(614) - 674- 7568",
      "phone2": "(614) - 674- 7568",
      "email": ""
    },
    "parentName": "Mayuri Patel",
    "parentPhone": "(614) - 674- 7568",
    "parentPhone2": "(614) - 674- 7568",
    "parentEmail": "",
    "authorizedPickups": [
      "Mayuri Patel",
      "Vasantkumar Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Mayuri Patel",
        "relationship": "Mother",
        "phone": "(614) - 674- 7568",
        "isPrimary": true
      },
      {
        "name": "Vasantkumar Patel",
        "relationship": "Father",
        "phone": "(614) - 674- 7568",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 674- 7568",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650457067",
    "name": "Aseel Zindah",
    "fullName": "Aseel Zindah",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Sabriah Younus",
      "phone": "(614) - 270- 1199",
      "phone2": "(614) - 270- 1199",
      "email": ""
    },
    "parentName": "Sabriah Younus",
    "parentPhone": "(614) - 270- 1199",
    "parentPhone2": "(614) - 270- 1199",
    "parentEmail": "",
    "authorizedPickups": [
      "Sabriah Younus",
      "Wisam Zindah"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Sabriah Younus",
        "relationship": "Mother",
        "phone": "(614) - 270- 1199",
        "isPrimary": true
      },
      {
        "name": "Wisam Zindah",
        "relationship": "Father",
        "phone": "(614) - 270- 1199",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 270- 0793",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650409523",
    "name": "Austin Maurer",
    "fullName": "Austin Maurer",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Lindsey Stewart",
      "phone": "(330) - 697- 6446",
      "phone2": "",
      "email": ""
    },
    "parentName": "Lindsey Stewart",
    "parentPhone": "(330) - 697- 6446",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Lindsey Stewart"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Lindsey Stewart",
        "relationship": "Mother",
        "phone": "(330) - 697- 6446",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (330) - 697- 6446",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650655838",
    "name": "Benas Bereket",
    "fullName": "Benas Bereket",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hagos Yeabyo",
      "phone": "(220) - 228- 4323",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hagos Yeabyo",
    "parentPhone": "(220) - 228- 4323",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hagos Yeabyo"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hagos Yeabyo",
        "relationship": "Father",
        "phone": "(220) - 228- 4323",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (220) - 228- 4323",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402250799390",
    "name": "Benjamin Palacios",
    "fullName": "Benjamin Palacios",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Margaret Palacios",
      "phone": "(843) - 532- 3556",
      "phone2": "(843) - 532- 3556",
      "email": ""
    },
    "parentName": "Margaret Palacios",
    "parentPhone": "(843) - 532- 3556",
    "parentPhone2": "(843) - 532- 3556",
    "parentEmail": "",
    "authorizedPickups": [
      "Margaret Palacios",
      "Denny Palacios"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Margaret Palacios",
        "relationship": "Mother",
        "phone": "(843) - 532- 3556",
        "isPrimary": true
      },
      {
        "name": "Denny Palacios",
        "relationship": "Father",
        "phone": "(843) - 532- 3556",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (843) - 532- 3556",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650280320",
    "name": "Beyneor Bereket",
    "fullName": "Beyneor Bereket",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hagos Bereket",
      "phone": "(220) - 238- 2955",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hagos Bereket",
    "parentPhone": "(220) - 238- 2955",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hagos Bereket"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hagos Bereket",
        "relationship": "Father",
        "phone": "(220) - 238- 2955",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (220) - 228- 4323",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350137429",
    "name": "Blaire Saul",
    "fullName": "Blaire Saul",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Emily Saul",
      "phone": "(850) - 246- 1356",
      "phone2": "(614) - 264- 8466",
      "email": ""
    },
    "parentName": "Emily Saul",
    "parentPhone": "(850) - 246- 1356",
    "parentPhone2": "(614) - 264- 8466",
    "parentEmail": "",
    "authorizedPickups": [
      "Emily Saul",
      "Frank Saul"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Emily Saul",
        "relationship": "Mother",
        "phone": "(850) - 246- 1356",
        "isPrimary": true
      },
      {
        "name": "Frank Saul",
        "relationship": "Father",
        "phone": "(614) - 264- 8466",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (850) - 246- 1356",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650320026",
    "name": "Brayden Abrams",
    "fullName": "Brayden Abrams",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Shannon Abrams",
      "phone": "(614) - 905- 2425",
      "phone2": "",
      "email": ""
    },
    "parentName": "Shannon Abrams",
    "parentPhone": "(614) - 905- 2425",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Shannon Abrams"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Shannon Abrams",
        "relationship": "Mother",
        "phone": "(614) - 905- 2425",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 905- 2425",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550259815",
    "name": "Camila Sanchez Cruz",
    "fullName": "Camila Sanchez Cruz",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Maricela Garcia",
      "phone": "(614) - 717- 5034",
      "phone2": "",
      "email": ""
    },
    "parentName": "Maricela Garcia",
    "parentPhone": "(614) - 717- 5034",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Maricela Garcia"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Maricela Garcia",
        "relationship": "Mother",
        "phone": "(614) - 717- 5034",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 717- 5034",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350024811",
    "name": "Capri Mendieta",
    "fullName": "Capri Mendieta",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Christina Mendieta",
      "phone": "(614) - 226- 4333",
      "phone2": "(614) - 226- 4333",
      "email": ""
    },
    "parentName": "Christina Mendieta",
    "parentPhone": "(614) - 226- 4333",
    "parentPhone2": "(614) - 226- 4333",
    "parentEmail": "",
    "authorizedPickups": [
      "Christina Mendieta",
      "Edgar Mendieta"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Christina Mendieta",
        "relationship": "Mother",
        "phone": "(614) - 226- 4333",
        "isPrimary": true
      },
      {
        "name": "Edgar Mendieta",
        "relationship": "Father",
        "phone": "(614) - 226- 4333",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 226- 4333",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550816544",
    "name": "Catarina Aleto Kavalioy",
    "fullName": "Catarina Aleto Kavalioy",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Fernanda Aleto",
      "phone": "(614) - 370- 0344",
      "phone2": "(614) - 971- 1618",
      "email": ""
    },
    "parentName": "Fernanda Aleto",
    "parentPhone": "(614) - 370- 0344",
    "parentPhone2": "(614) - 971- 1618",
    "parentEmail": "",
    "authorizedPickups": [
      "Fernanda Aleto",
      "Siarhei Kavalioy"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Fernanda Aleto",
        "relationship": "Mother",
        "phone": "(614) - 370- 0344",
        "isPrimary": true
      },
      {
        "name": "Siarhei Kavalioy",
        "relationship": "Father",
        "phone": "(614) - 971- 1618",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 370- 0344",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402250458570",
    "name": "Darshi Patel",
    "fullName": "Darshi Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Chaitali Patel",
      "phone": "(614) - 619- 7886",
      "phone2": "(614) - 619- 7887",
      "email": ""
    },
    "parentName": "Chaitali Patel",
    "parentPhone": "(614) - 619- 7886",
    "parentPhone2": "(614) - 619- 7887",
    "parentEmail": "",
    "authorizedPickups": [
      "Chaitali Patel",
      "Ruchir Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Chaitali Patel",
        "relationship": "Mother",
        "phone": "(614) - 619- 7886",
        "isPrimary": true
      },
      {
        "name": "Ruchir Patel",
        "relationship": "Father",
        "phone": "(614) - 619- 7887",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 619- 7887",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550121631",
    "name": "Dhruv Pandit",
    "fullName": "Dhruv Pandit",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Heena Pandit",
      "phone": "(380) - 799- 2444",
      "phone2": "",
      "email": ""
    },
    "parentName": "Heena Pandit",
    "parentPhone": "(380) - 799- 2444",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Heena Pandit"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Heena Pandit",
        "relationship": "Father",
        "phone": "(380) - 799- 2444",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (380) - 799- 2444",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350969983",
    "name": "Dhruvansh Sharma",
    "fullName": "Dhruvansh Sharma",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Bhavana Sharma",
      "phone": "(404) - 384- 6214",
      "phone2": "",
      "email": ""
    },
    "parentName": "Bhavana Sharma",
    "parentPhone": "(404) - 384- 6214",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Bhavana Sharma"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Bhavana Sharma",
        "relationship": "Mother",
        "phone": "(404) - 384- 6214",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (404) - 384- 5801",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350525530",
    "name": "Dia Shyam",
    "fullName": "Dia Shyam",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Shyam Joseph",
      "phone": "(248) - 558- 0204",
      "phone2": "",
      "email": ""
    },
    "parentName": "Shyam Joseph",
    "parentPhone": "(248) - 558- 0204",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Shyam Joseph"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Shyam Joseph",
        "relationship": "Father",
        "phone": "(248) - 558- 0204",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (248) - 558- 0204",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402451128753",
    "name": "Dirgha Raval",
    "fullName": "Dirgha Raval",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Nishant Raval",
      "phone": "(380) - 257- 4158",
      "phone2": "",
      "email": ""
    },
    "parentName": "Nishant Raval",
    "parentPhone": "(380) - 257- 4158",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Nishant Raval"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Nishant Raval",
        "relationship": "Father",
        "phone": "(380) - 257- 4158",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 359- 6696",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402250543979",
    "name": "Divya Patel",
    "fullName": "Divya Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Suyogi Patel",
      "phone": "(614) - 736- 4455",
      "phone2": "(614) - 736- 4444",
      "email": ""
    },
    "parentName": "Suyogi Patel",
    "parentPhone": "(614) - 736- 4455",
    "parentPhone2": "(614) - 736- 4444",
    "parentEmail": "",
    "authorizedPickups": [
      "Suyogi Patel",
      "Amrish Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Suyogi Patel",
        "relationship": "Mother",
        "phone": "(614) - 736- 4455",
        "isPrimary": true
      },
      {
        "name": "Amrish Patel",
        "relationship": "Father",
        "phone": "(614) - 736- 4444",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 736- 4444",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550618261",
    "name": "Diyan Patel",
    "fullName": "Diyan Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Nehal Patel",
      "phone": "(614) - 390- 5479",
      "phone2": "",
      "email": ""
    },
    "parentName": "Nehal Patel",
    "parentPhone": "(614) - 390- 5479",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Nehal Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Nehal Patel",
        "relationship": "Mother",
        "phone": "(614) - 390- 5479",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 477- 4061",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650279911",
    "name": "Efrim Bereket",
    "fullName": "Efrim Bereket",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hagos Bereket",
      "phone": "(220) - 238- 2955",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hagos Bereket",
    "parentPhone": "(220) - 238- 2955",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hagos Bereket"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hagos Bereket",
        "relationship": "Father",
        "phone": "(220) - 238- 2955",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (220) - 238- 4323",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550259839",
    "name": "Emma Palacios",
    "fullName": "Emma Palacios",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Denny Palacios",
      "phone": "(843) - 532- 3556",
      "phone2": "",
      "email": ""
    },
    "parentName": "Denny Palacios",
    "parentPhone": "(843) - 532- 3556",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Denny Palacios"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Denny Palacios",
        "relationship": "Father",
        "phone": "(843) - 532- 3556",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (843) - 532- 3556",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401950870910",
    "name": "Emma Dopkiss",
    "fullName": "Emma Dopkiss",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Jessica Dopkiss",
      "phone": "(614) - 371- 5605",
      "phone2": "(614) - 446- 1184",
      "email": ""
    },
    "parentName": "Jessica Dopkiss",
    "parentPhone": "(614) - 371- 5605",
    "parentPhone2": "(614) - 446- 1184",
    "parentEmail": "",
    "authorizedPickups": [
      "Jessica Dopkiss",
      "Matthew Dopkiss"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Jessica Dopkiss",
        "relationship": "Mother",
        "phone": "(614) - 371- 5605",
        "isPrimary": true
      },
      {
        "name": "Matthew Dopkiss",
        "relationship": "Father",
        "phone": "(614) - 446- 1184",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 371- 5605",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650280450",
    "name": "Eva Patel",
    "fullName": "Eva Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Bhumikaben Patel",
      "phone": "(734) - 353- 8969",
      "phone2": "(734) - 353- 6354",
      "email": ""
    },
    "parentName": "Bhumikaben Patel",
    "parentPhone": "(734) - 353- 8969",
    "parentPhone2": "(734) - 353- 6354",
    "parentEmail": "",
    "authorizedPickups": [
      "Bhumikaben Patel",
      "Keyurbhai Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Bhumikaben Patel",
        "relationship": "Mother",
        "phone": "(734) - 353- 8969",
        "isPrimary": true
      },
      {
        "name": "Keyurbhai Patel",
        "relationship": "Father",
        "phone": "(734) - 353- 6354",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (734) - 353- 8969",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350401940",
    "name": "Evanpreet Nagra",
    "fullName": "Evanpreet Nagra",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Sandeep Nagra",
      "phone": "(614) - 822- 5119",
      "phone2": "",
      "email": ""
    },
    "parentName": "Sandeep Nagra",
    "parentPhone": "(614) - 822- 5119",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Sandeep Nagra"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Sandeep Nagra",
        "relationship": "Mother",
        "phone": "(614) - 822- 5119",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 822- 5119",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350970019",
    "name": "Gurkaran Singh",
    "fullName": "Gurkaran Singh",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Gurwinder Joia",
      "phone": "(614) - 822- 5119",
      "phone2": "",
      "email": ""
    },
    "parentName": "Gurwinder Joia",
    "parentPhone": "(614) - 822- 5119",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Gurwinder Joia"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Gurwinder Joia",
        "relationship": "Father",
        "phone": "(614) - 822- 5119",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 822- 5119",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450027866",
    "name": "Hayden Maurer",
    "fullName": "Hayden Maurer",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Lindsey Maurer",
      "phone": "(330) - 697- 6446",
      "phone2": "(216) - 978- 4050",
      "email": ""
    },
    "parentName": "Lindsey Maurer",
    "parentPhone": "(330) - 697- 6446",
    "parentPhone2": "(216) - 978- 4050",
    "parentEmail": "",
    "authorizedPickups": [
      "Lindsey Maurer",
      "Craig Maurer"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Lindsey Maurer",
        "relationship": "Mother",
        "phone": "(330) - 697- 6446",
        "isPrimary": true
      },
      {
        "name": "Craig Maurer",
        "relationship": "Father",
        "phone": "(216) - 978- 4050",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (330) - 697- 6446",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650659188",
    "name": "Henus Bereket",
    "fullName": "Henus Bereket",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hagos Yeabyo",
      "phone": "(220) - 228- 4323",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hagos Yeabyo",
    "parentPhone": "(220) - 228- 4323",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hagos Yeabyo"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hagos Yeabyo",
        "relationship": "Mother",
        "phone": "(220) - 228- 4323",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (220) - 228- 4323",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402251016779",
    "name": "Hit Patel",
    "fullName": "Hit Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Pinkal Patel",
      "phone": "(624) - 973- 4408",
      "phone2": "(614) - 401- 1860",
      "email": ""
    },
    "parentName": "Pinkal Patel",
    "parentPhone": "(624) - 973- 4408",
    "parentPhone2": "(614) - 401- 1860",
    "parentEmail": "",
    "authorizedPickups": [
      "Pinkal Patel",
      "Amish Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Pinkal Patel",
        "relationship": "Mother",
        "phone": "(624) - 973- 4408",
        "isPrimary": true
      },
      {
        "name": "Amish Patel",
        "relationship": "Father",
        "phone": "(614) - 401- 1860",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 401- 1860",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402551132568",
    "name": "Isabella Rodriguez",
    "fullName": "Isabella Rodriguez",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Krystal Rodriguez",
      "phone": "(347) - 738- 8029",
      "phone2": "",
      "email": ""
    },
    "parentName": "Krystal Rodriguez",
    "parentPhone": "(347) - 738- 8029",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Krystal Rodriguez"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Krystal Rodriguez",
        "relationship": "Mother",
        "phone": "(347) - 738- 8029",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (347) - 738- 8029",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402150026633",
    "name": "Jack Palacios",
    "fullName": "Jack Palacios",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Margaret Palacios",
      "phone": "(843) - 532- 3556",
      "phone2": "(843) - 532- 3556",
      "email": ""
    },
    "parentName": "Margaret Palacios",
    "parentPhone": "(843) - 532- 3556",
    "parentPhone2": "(843) - 532- 3556",
    "parentEmail": "",
    "authorizedPickups": [
      "Margaret Palacios",
      "Denny Palacios"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Margaret Palacios",
        "relationship": "Mother",
        "phone": "(843) - 532- 3556",
        "isPrimary": true
      },
      {
        "name": "Denny Palacios",
        "relationship": "Father",
        "phone": "(843) - 532- 3556",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (843) - 532- 3556",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450947331",
    "name": "James Dopkiss",
    "fullName": "James Dopkiss",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Jessica Dopkiss",
      "phone": "(614) - 371- 5605",
      "phone2": "(614) - 446- 1184",
      "email": ""
    },
    "parentName": "Jessica Dopkiss",
    "parentPhone": "(614) - 371- 5605",
    "parentPhone2": "(614) - 446- 1184",
    "parentEmail": "",
    "authorizedPickups": [
      "Jessica Dopkiss",
      "Matthew Dopkiss"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Jessica Dopkiss",
        "relationship": "Mother",
        "phone": "(614) - 371- 5605",
        "isPrimary": true
      },
      {
        "name": "Matthew Dopkiss",
        "relationship": "Father",
        "phone": "(614) - 446- 1184",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 371- 5605",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650540226",
    "name": "Jhostin Cartagena",
    "fullName": "Jhostin Cartagena",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Sandra Molina",
      "phone": "(614) - 787- 4681",
      "phone2": "",
      "email": ""
    },
    "parentName": "Sandra Molina",
    "parentPhone": "(614) - 787- 4681",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Sandra Molina"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Sandra Molina",
        "relationship": "Mother",
        "phone": "(614) - 787- 4681",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 787- 4681",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350401964",
    "name": "Joseph Solomon",
    "fullName": "Joseph Solomon",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Kaldoon Solomon",
      "phone": "(614) - 717- 8777",
      "phone2": "",
      "email": ""
    },
    "parentName": "Kaldoon Solomon",
    "parentPhone": "(614) - 717- 8777",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Kaldoon Solomon"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Kaldoon Solomon",
        "relationship": "Father",
        "phone": "(614) - 717- 8777",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 717- 8777",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402351091492",
    "name": "Jude Bahader",
    "fullName": "Jude Bahader",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Balsam Alhwaidi",
      "phone": "(141) - 932- 2692",
      "phone2": "(141) - 932- 2692",
      "email": ""
    },
    "parentName": "Balsam Alhwaidi",
    "parentPhone": "(141) - 932- 2692",
    "parentPhone2": "(141) - 932- 2692",
    "parentEmail": "",
    "authorizedPickups": [
      "Balsam Alhwaidi",
      "Ghaith Bahader"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Balsam Alhwaidi",
        "relationship": "Mother",
        "phone": "(141) - 932- 2692",
        "isPrimary": true
      },
      {
        "name": "Ghaith Bahader",
        "relationship": "Father",
        "phone": "(141) - 932- 2692",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (141) - 932- 2692",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402451057244",
    "name": "Jwalin Desai",
    "fullName": "Jwalin Desai",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Deval Desai",
      "phone": "(614) - 615- 0612",
      "phone2": "",
      "email": ""
    },
    "parentName": "Deval Desai",
    "parentPhone": "(614) - 615- 0612",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Deval Desai"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Deval Desai",
        "relationship": "Father",
        "phone": "(614) - 615- 0612",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 615- 0612",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450300341",
    "name": "Kaleab Tesfaye",
    "fullName": "Kaleab Tesfaye",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hana Haile",
      "phone": "(443) - 743- 8888",
      "phone2": "(443) - 743- 8505",
      "email": ""
    },
    "parentName": "Hana Haile",
    "parentPhone": "(443) - 743- 8888",
    "parentPhone2": "(443) - 743- 8505",
    "parentEmail": "",
    "authorizedPickups": [
      "Hana Haile",
      "Tesfaye Bati"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hana Haile",
        "relationship": "Mother",
        "phone": "(443) - 743- 8888",
        "isPrimary": true
      },
      {
        "name": "Tesfaye Bati",
        "relationship": "Father",
        "phone": "(443) - 743- 8505",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (443) - 743- 8888",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402451057268",
    "name": "Katara Theodoris",
    "fullName": "Katara Theodoris",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "George Theodoris",
      "phone": "(239) - 826- 2059",
      "phone2": "",
      "email": ""
    },
    "parentName": "George Theodoris",
    "parentPhone": "(239) - 826- 2059",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "George Theodoris"
    ],
    "authorizedPickupDetails": [
      {
        "name": "George Theodoris",
        "relationship": "Father",
        "phone": "(239) - 826- 2059",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (239) - 826- 2059",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450111688",
    "name": "Katherine Short",
    "fullName": "Katherine Short",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Alice Short",
      "phone": "(614) - 507- 3115",
      "phone2": "(614) - 716- 9522",
      "email": ""
    },
    "parentName": "Alice Short",
    "parentPhone": "(614) - 507- 3115",
    "parentPhone2": "(614) - 716- 9522",
    "parentEmail": "",
    "authorizedPickups": [
      "Alice Short",
      "Theron Short"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Alice Short",
        "relationship": "Mother",
        "phone": "(614) - 507- 3115",
        "isPrimary": true
      },
      {
        "name": "Theron Short",
        "relationship": "Father",
        "phone": "(614) - 716- 9522",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 507- 3115",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402250528150",
    "name": "Keerthana Prabhu",
    "fullName": "Keerthana Prabhu",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Suma Prabhu",
      "phone": "(347) - 633- 6073",
      "phone2": "(347) - 633- 6073",
      "email": ""
    },
    "parentName": "Suma Prabhu",
    "parentPhone": "(347) - 633- 6073",
    "parentPhone2": "(347) - 633- 6073",
    "parentEmail": "",
    "authorizedPickups": [
      "Suma Prabhu",
      "Yogeesh Prabhu"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Suma Prabhu",
        "relationship": "Mother",
        "phone": "(347) - 633- 6073",
        "isPrimary": true
      },
      {
        "name": "Yogeesh Prabhu",
        "relationship": "Father",
        "phone": "(347) - 633- 6073",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (347) - 633- 6073",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402050583359",
    "name": "Krisha Patel",
    "fullName": "Krisha Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Megha Patel",
      "phone": "(614) - 437- 2299",
      "phone2": "(614) - 437- 2299",
      "email": ""
    },
    "parentName": "Megha Patel",
    "parentPhone": "(614) - 437- 2299",
    "parentPhone2": "(614) - 437- 2299",
    "parentEmail": "",
    "authorizedPickups": [
      "Megha Patel",
      "Ashvin Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Megha Patel",
        "relationship": "Mother",
        "phone": "(614) - 437- 2299",
        "isPrimary": true
      },
      {
        "name": "Ashvin Patel",
        "relationship": "Father",
        "phone": "(614) - 437- 2299",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 437- 2299",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450947324",
    "name": "Kushagr Tolani",
    "fullName": "Kushagr Tolani",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Palak Tolani",
      "phone": "(412) - 587- 3651",
      "phone2": "(412) - 636- 3320",
      "email": ""
    },
    "parentName": "Palak Tolani",
    "parentPhone": "(412) - 587- 3651",
    "parentPhone2": "(412) - 636- 3320",
    "parentEmail": "",
    "authorizedPickups": [
      "Palak Tolani",
      "Kamlesh Tolani"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Palak Tolani",
        "relationship": "Mother",
        "phone": "(412) - 587- 3651",
        "isPrimary": true
      },
      {
        "name": "Kamlesh Tolani",
        "relationship": "Father",
        "phone": "(412) - 636- 3320",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (412) - 587- 3651",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450947287",
    "name": "Lennon Corona Buell",
    "fullName": "Lennon Corona Buell",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Jessica Hazelbaker-buell",
      "phone": "(614) - 937- 7198",
      "phone2": "(951) - 385- 1939",
      "email": ""
    },
    "parentName": "Jessica Hazelbaker-buell",
    "parentPhone": "(614) - 937- 7198",
    "parentPhone2": "(951) - 385- 1939",
    "parentEmail": "",
    "authorizedPickups": [
      "Jessica Hazelbaker-buell",
      "Jorge Corona"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Jessica Hazelbaker-buell",
        "relationship": "Mother",
        "phone": "(614) - 937- 7198",
        "isPrimary": true
      },
      {
        "name": "Jorge Corona",
        "relationship": "Father",
        "phone": "(951) - 385- 1939",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 937- 7198",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650354069",
    "name": "Lochlan Mendieta",
    "fullName": "Lochlan Mendieta",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Edgar Mendieta",
      "phone": "(614) - 226- 4333",
      "phone2": "",
      "email": ""
    },
    "parentName": "Edgar Mendieta",
    "parentPhone": "(614) - 226- 4333",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Edgar Mendieta"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Edgar Mendieta",
        "relationship": "Father",
        "phone": "(614) - 226- 4333",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 226- 4333",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650115073",
    "name": "Lucy Murnane",
    "fullName": "Lucy Murnane",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Linda Murnane",
      "phone": "(614) - 519- 9319",
      "phone2": "",
      "email": ""
    },
    "parentName": "Linda Murnane",
    "parentPhone": "(614) - 519- 9319",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Linda Murnane"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Linda Murnane",
        "relationship": "Mother",
        "phone": "(614) - 519- 9319",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 519- 9319",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550259808",
    "name": "Mahavirsinh Chavada",
    "fullName": "Mahavirsinh Chavada",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Monika Chavada",
      "phone": "(614) - 812- 9475",
      "phone2": "(773) - 754- 6580",
      "email": ""
    },
    "parentName": "Monika Chavada",
    "parentPhone": "(614) - 812- 9475",
    "parentPhone2": "(773) - 754- 6580",
    "parentEmail": "",
    "authorizedPickups": [
      "Monika Chavada",
      "Chhatrasinh A Chavada"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Monika Chavada",
        "relationship": "Mother",
        "phone": "(614) - 812- 9475",
        "isPrimary": true
      },
      {
        "name": "Chhatrasinh A Chavada",
        "relationship": "Father",
        "phone": "(773) - 754- 6580",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (773) - 754- 6580",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450507054",
    "name": "Malak Mohamed",
    "fullName": "Malak Mohamed",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Samiya Mohamed",
      "phone": "(614) - 638- 0283",
      "phone2": "(614) - 638- 0283",
      "email": ""
    },
    "parentName": "Samiya Mohamed",
    "parentPhone": "(614) - 638- 0283",
    "parentPhone2": "(614) - 638- 0283",
    "parentEmail": "",
    "authorizedPickups": [
      "Samiya Mohamed",
      "Hussein Mohamed"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Samiya Mohamed",
        "relationship": "Mother",
        "phone": "(614) - 638- 0283",
        "isPrimary": true
      },
      {
        "name": "Hussein Mohamed",
        "relationship": "Father",
        "phone": "(614) - 638- 0283",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 638- 0283",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350618447",
    "name": "Mealat Tesfaye",
    "fullName": "Mealat Tesfaye",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hana Haile",
      "phone": "(443) - 743- 8888",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hana Haile",
    "parentPhone": "(443) - 743- 8888",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hana Haile"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hana Haile",
        "relationship": "Mother",
        "phone": "(443) - 743- 8888",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (443) - 743- 8888",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450594931",
    "name": "Mira Shalabi",
    "fullName": "Mira Shalabi",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Ghadeer Abuyassen",
      "phone": "(614) - 390- 7468",
      "phone2": "(614) - 972- 3995",
      "email": ""
    },
    "parentName": "Ghadeer Abuyassen",
    "parentPhone": "(614) - 390- 7468",
    "parentPhone2": "(614) - 972- 3995",
    "parentEmail": "",
    "authorizedPickups": [
      "Ghadeer Abuyassen",
      "Ahmad Shalabi"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Ghadeer Abuyassen",
        "relationship": "Mother",
        "phone": "(614) - 390- 7468",
        "isPrimary": true
      },
      {
        "name": "Ahmad Shalabi",
        "relationship": "Father",
        "phone": "(614) - 972- 3995",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 390- 7468",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650473074",
    "name": "Mohamed Qalinle",
    "fullName": "Mohamed Qalinle",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Rodo Ahmed",
      "phone": "(614) - 206- 2343",
      "phone2": "(952) - 688- 3268",
      "email": ""
    },
    "parentName": "Rodo Ahmed",
    "parentPhone": "(614) - 206- 2343",
    "parentPhone2": "(952) - 688- 3268",
    "parentEmail": "",
    "authorizedPickups": [
      "Rodo Ahmed",
      "Omar Qalinle"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Rodo Ahmed",
        "relationship": "Mother",
        "phone": "(614) - 206- 2343",
        "isPrimary": true
      },
      {
        "name": "Omar Qalinle",
        "relationship": "Father",
        "phone": "(952) - 688- 3268",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (952) - 688- 3268",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402151007846",
    "name": "Mohammed Shalabi",
    "fullName": "Mohammed Shalabi",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Ghadeer Abuyassen",
      "phone": "(614) - 390- 7468",
      "phone2": "(614) - 390- 7468",
      "email": ""
    },
    "parentName": "Ghadeer Abuyassen",
    "parentPhone": "(614) - 390- 7468",
    "parentPhone2": "(614) - 390- 7468",
    "parentEmail": "",
    "authorizedPickups": [
      "Ghadeer Abuyassen",
      "Ahmed Shalabi"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Ghadeer Abuyassen",
        "relationship": "Mother",
        "phone": "(614) - 390- 7468",
        "isPrimary": true
      },
      {
        "name": "Ahmed Shalabi",
        "relationship": "Father",
        "phone": "(614) - 390- 7468",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 390- 7468",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450947355",
    "name": "Mohammed Mimi",
    "fullName": "Mohammed Mimi",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Abdalmageed Mimi",
      "phone": "(347) - 907- 2394",
      "phone2": "",
      "email": ""
    },
    "parentName": "Abdalmageed Mimi",
    "parentPhone": "(347) - 907- 2394",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Abdalmageed Mimi"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Abdalmageed Mimi",
        "relationship": "Father",
        "phone": "(347) - 907- 2394",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (347) - 907- 2394",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650441899",
    "name": "Mustafa Al Rubaye",
    "fullName": "Mustafa Al Rubaye",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hiba Al Rubaye",
      "phone": "(919) - 798- 5777",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hiba Al Rubaye",
    "parentPhone": "(919) - 798- 5777",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hiba Al Rubaye"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hiba Al Rubaye",
        "relationship": "Mother",
        "phone": "(919) - 798- 5777",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (919) - 798- 5777",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401750405381",
    "name": "Niranjana Paru Rajeev",
    "fullName": "Niranjana Paru Rajeev",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Nithya Rajeev",
      "phone": "(651) - 210- 6239",
      "phone2": "(651) - 400- 1535",
      "email": ""
    },
    "parentName": "Nithya Rajeev",
    "parentPhone": "(651) - 210- 6239",
    "parentPhone2": "(651) - 400- 1535",
    "parentEmail": "",
    "authorizedPickups": [
      "Nithya Rajeev",
      "Rajeev Kumar"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Nithya Rajeev",
        "relationship": "Mother",
        "phone": "(651) - 210- 6239",
        "isPrimary": true
      },
      {
        "name": "Rajeev Kumar",
        "relationship": "Father",
        "phone": "(651) - 400- 1535",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (651) - 210- 6239",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402150600499",
    "name": "Nirmaan Patel",
    "fullName": "Nirmaan Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hiral Patel",
      "phone": "(614) - 619- 9991",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hiral Patel",
    "parentPhone": "(614) - 619- 9991",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hiral Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hiral Patel",
        "relationship": "Mother",
        "phone": "(614) - 619- 9991",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 619- 9991",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402250458594",
    "name": "Nirmani Patel",
    "fullName": "Nirmani Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Suyogi Patel",
      "phone": "(614) - 736- 4455",
      "phone2": "(614) - 736- 4444",
      "email": ""
    },
    "parentName": "Suyogi Patel",
    "parentPhone": "(614) - 736- 4455",
    "parentPhone2": "(614) - 736- 4444",
    "parentEmail": "",
    "authorizedPickups": [
      "Suyogi Patel",
      "Amrish Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Suyogi Patel",
        "relationship": "Mother",
        "phone": "(614) - 736- 4455",
        "isPrimary": true
      },
      {
        "name": "Amrish Patel",
        "relationship": "Father",
        "phone": "(614) - 736- 4444",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 736- 4444",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650552847",
    "name": "Oscar Cartagena",
    "fullName": "Oscar Cartagena",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Sandra Molina",
      "phone": "(614) - 787- 4681",
      "phone2": "",
      "email": ""
    },
    "parentName": "Sandra Molina",
    "parentPhone": "(614) - 787- 4681",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Sandra Molina"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Sandra Molina",
        "relationship": "Mother",
        "phone": "(614) - 787- 4681",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 787- 4681",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650050206",
    "name": "Owen Stein-fuchs",
    "fullName": "Owen Stein-fuchs",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Shiloh Stein",
      "phone": "(435) - 659- 6308",
      "phone2": "",
      "email": ""
    },
    "parentName": "Shiloh Stein",
    "parentPhone": "(435) - 659- 6308",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Shiloh Stein"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Shiloh Stein",
        "relationship": "Mother",
        "phone": "(435) - 659- 6308",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (435) - 659- 6308",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401950302817",
    "name": "Pankti Patel",
    "fullName": "Pankti Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Jinalben Patel",
      "phone": "(614) - 747- 3337",
      "phone2": "(614) - 598- 8175",
      "email": ""
    },
    "parentName": "Jinalben Patel",
    "parentPhone": "(614) - 747- 3337",
    "parentPhone2": "(614) - 598- 8175",
    "parentEmail": "",
    "authorizedPickups": [
      "Jinalben Patel",
      "Ghansham Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Jinalben Patel",
        "relationship": "Mother",
        "phone": "(614) - 747- 3337",
        "isPrimary": true
      },
      {
        "name": "Ghansham Patel",
        "relationship": "Father",
        "phone": "(614) - 598- 8175",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 747- 3337",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401750505579",
    "name": "Panthi Patel",
    "fullName": "Panthi Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Megha Patel",
      "phone": "(614) - 906- 5363",
      "phone2": "(614) - 437- 2299",
      "email": ""
    },
    "parentName": "Megha Patel",
    "parentPhone": "(614) - 906- 5363",
    "parentPhone2": "(614) - 437- 2299",
    "parentEmail": "",
    "authorizedPickups": [
      "Megha Patel",
      "Ashvin Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Megha Patel",
        "relationship": "Mother",
        "phone": "(614) - 906- 5363",
        "isPrimary": true
      },
      {
        "name": "Ashvin Patel",
        "relationship": "Father",
        "phone": "(614) - 437- 2299",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 437- 2299",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650542305",
    "name": "Pharell Mwangi",
    "fullName": "Pharell Mwangi",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Caroline Mulama",
      "phone": "(843) - 468- 1012",
      "phone2": "",
      "email": ""
    },
    "parentName": "Caroline Mulama",
    "parentPhone": "(843) - 468- 1012",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Caroline Mulama"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Caroline Mulama",
        "relationship": "Mother",
        "phone": "(843) - 468- 1012",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (843) - 468- 1012",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450218691",
    "name": "Pranav Arumugam",
    "fullName": "Pranav Arumugam",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hemalatha Arumugam",
      "phone": "(419) - 491- 4161",
      "phone2": "(949) - 614- 9543",
      "email": ""
    },
    "parentName": "Hemalatha Arumugam",
    "parentPhone": "(419) - 491- 4161",
    "parentPhone2": "(949) - 614- 9543",
    "parentEmail": "",
    "authorizedPickups": [
      "Hemalatha Arumugam",
      "Arumugam Jayabalan"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hemalatha Arumugam",
        "relationship": "Mother",
        "phone": "(419) - 491- 4161",
        "isPrimary": true
      },
      {
        "name": "Arumugam Jayabalan",
        "relationship": "Father",
        "phone": "(949) - 614- 9543",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (419) - 491- 4161",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450300389",
    "name": "Purajit Madhan Mohan",
    "fullName": "Purajit Madhan Mohan",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Prabavathi Chellan",
      "phone": "(317) - 935- 6393",
      "phone2": "(317) - 749- 5002",
      "email": ""
    },
    "parentName": "Prabavathi Chellan",
    "parentPhone": "(317) - 935- 6393",
    "parentPhone2": "(317) - 749- 5002",
    "parentEmail": "",
    "authorizedPickups": [
      "Prabavathi Chellan",
      "Madhan Mohan Venu Gopal"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Prabavathi Chellan",
        "relationship": "Mother",
        "phone": "(317) - 935- 6393",
        "isPrimary": true
      },
      {
        "name": "Madhan Mohan Venu Gopal",
        "relationship": "Father",
        "phone": "(317) - 749- 5002",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (317) - 935- 6393",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402050385403",
    "name": "Rahi Patel",
    "fullName": "Rahi Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Prikantiben Patel",
      "phone": "(614) - 306- 9427",
      "phone2": "(614) - 401- 1803",
      "email": ""
    },
    "parentName": "Prikantiben Patel",
    "parentPhone": "(614) - 306- 9427",
    "parentPhone2": "(614) - 401- 1803",
    "parentEmail": "",
    "authorizedPickups": [
      "Prikantiben Patel",
      "Nimeshbhai Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Prikantiben Patel",
        "relationship": "Mother",
        "phone": "(614) - 306- 9427",
        "isPrimary": true
      },
      {
        "name": "Nimeshbhai Patel",
        "relationship": "Father",
        "phone": "(614) - 401- 1803",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 306- 9427",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350525585",
    "name": "Rithvik Vinayak",
    "fullName": "Rithvik Vinayak",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Soundarya Gowtham",
      "phone": "(774) - 262- 6417",
      "phone2": "",
      "email": ""
    },
    "parentName": "Soundarya Gowtham",
    "parentPhone": "(774) - 262- 6417",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Soundarya Gowtham"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Soundarya Gowtham",
        "relationship": "Mother",
        "phone": "(774) - 262- 6417",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (774) - 262- 6417",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550259853",
    "name": "Sadhvi Puthenpurackal Prathep",
    "fullName": "Sadhvi Puthenpurackal Prathep",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Pratheep Puthenpurackal Sudhakaran",
      "phone": "(248) - 826- 3432",
      "phone2": "",
      "email": ""
    },
    "parentName": "Pratheep Puthenpurackal Sudhakaran",
    "parentPhone": "(248) - 826- 3432",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Pratheep Puthenpurackal Sudhakaran"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Pratheep Puthenpurackal Sudhakaran",
        "relationship": "Father",
        "phone": "(248) - 826- 3432",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (248) - 826- 3432",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401850864385",
    "name": "Sai Pranav Murugesan",
    "fullName": "Sai Pranav Murugesan",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Vanjeswari Vanjiappan",
      "phone": "(860) - 534- 1779",
      "phone2": "",
      "email": ""
    },
    "parentName": "Vanjeswari Vanjiappan",
    "parentPhone": "(860) - 534- 1779",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Vanjeswari Vanjiappan"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Vanjeswari Vanjiappan",
        "relationship": "Mother",
        "phone": "(860) - 534- 1779",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (860) - 534- 1779",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550618216",
    "name": "Sara Boumerdassi",
    "fullName": "Sara Boumerdassi",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Radia Nairi",
      "phone": "(614) - 316- 8266",
      "phone2": "",
      "email": ""
    },
    "parentName": "Radia Nairi",
    "parentPhone": "(614) - 316- 8266",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Radia Nairi"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Radia Nairi",
        "relationship": "Mother",
        "phone": "(614) - 316- 8266",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 316- 8266",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450027880",
    "name": "Shayan Hariprasad",
    "fullName": "Shayan Hariprasad",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Hariprasad Avalur Palanisamy",
      "phone": "(317) - 652- 1282",
      "phone2": "",
      "email": ""
    },
    "parentName": "Hariprasad Avalur Palanisamy",
    "parentPhone": "(317) - 652- 1282",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Hariprasad Avalur Palanisamy"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Hariprasad Avalur Palanisamy",
        "relationship": "Father",
        "phone": "(317) - 652- 1282",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (317) - 652- 1282",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450947348",
    "name": "Shrikar Voruganti",
    "fullName": "Shrikar Voruganti",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Kiran Voruganti",
      "phone": "(614) - 632- 2822",
      "phone2": "",
      "email": ""
    },
    "parentName": "Kiran Voruganti",
    "parentPhone": "(614) - 632- 2822",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Kiran Voruganti"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Kiran Voruganti",
        "relationship": "Father",
        "phone": "(614) - 632- 2822",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 632- 2822",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401650534112",
    "name": "Shrish Karthikeyan",
    "fullName": "Shrish Karthikeyan",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Gayathri Karthikeyan",
      "phone": "(614) - 787- 0003",
      "phone2": "",
      "email": ""
    },
    "parentName": "Gayathri Karthikeyan",
    "parentPhone": "(614) - 787- 0003",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Gayathri Karthikeyan"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Gayathri Karthikeyan",
        "relationship": "Mother",
        "phone": "(614) - 787- 0003",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 934- 7108",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450507061",
    "name": "Siya Patel",
    "fullName": "Siya Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Ami Patel",
      "phone": "(614) - 535- 7953",
      "phone2": "",
      "email": ""
    },
    "parentName": "Ami Patel",
    "parentPhone": "(614) - 535- 7953",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Ami Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Ami Patel",
        "relationship": "Mother",
        "phone": "(614) - 535- 7953",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 535- 7953",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450507108",
    "name": "Sophia Ahmed",
    "fullName": "Sophia Ahmed",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Amira Said",
      "phone": "(614) - 515- 7846",
      "phone2": "",
      "email": ""
    },
    "parentName": "Amira Said",
    "parentPhone": "(614) - 515- 7846",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Amira Said"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Amira Said",
        "relationship": "Mother",
        "phone": "(614) - 515- 7846",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 515- 7846",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450507085",
    "name": "Swara Patel",
    "fullName": "Swara Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Dhruvini Patel",
      "phone": "(614) - 767- 9137",
      "phone2": "(330) - 318- 0043",
      "email": ""
    },
    "parentName": "Dhruvini Patel",
    "parentPhone": "(614) - 767- 9137",
    "parentPhone2": "(330) - 318- 0043",
    "parentEmail": "",
    "authorizedPickups": [
      "Dhruvini Patel",
      "Tarpit Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Dhruvini Patel",
        "relationship": "Mother",
        "phone": "(614) - 767- 9137",
        "isPrimary": true
      },
      {
        "name": "Tarpit Patel",
        "relationship": "Father",
        "phone": "(330) - 318- 0043",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 767- 9137",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650472992",
    "name": "Tamemah Qalinle",
    "fullName": "Tamemah Qalinle",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Rodo Ahmed",
      "phone": "(614) - 206- 2343",
      "phone2": "(952) - 688- 3268",
      "email": ""
    },
    "parentName": "Rodo Ahmed",
    "parentPhone": "(614) - 206- 2343",
    "parentPhone2": "(952) - 688- 3268",
    "parentEmail": "",
    "authorizedPickups": [
      "Rodo Ahmed",
      "Omar Qalinle"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Rodo Ahmed",
        "relationship": "Mother",
        "phone": "(614) - 206- 2343",
        "isPrimary": true
      },
      {
        "name": "Omar Qalinle",
        "relationship": "Father",
        "phone": "(952) - 688- 3268",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (952) - 688- 3268",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402250799536",
    "name": "Tashi Phanitluechachai",
    "fullName": "Tashi Phanitluechachai",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Buttree Kirachaiwanich",
      "phone": "(740) - 953- 8005",
      "phone2": "",
      "email": ""
    },
    "parentName": "Buttree Kirachaiwanich",
    "parentPhone": "(740) - 953- 8005",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Buttree Kirachaiwanich"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Buttree Kirachaiwanich",
        "relationship": "Mother",
        "phone": "(740) - 953- 8005",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (740) - 953- 8005",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350618416",
    "name": "Tyler Theodoris",
    "fullName": "Tyler Theodoris",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "George Theodoris",
      "phone": "(239) - 826- 2059",
      "phone2": "",
      "email": ""
    },
    "parentName": "George Theodoris",
    "parentPhone": "(239) - 826- 2059",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "George Theodoris"
    ],
    "authorizedPickupDetails": [
      {
        "name": "George Theodoris",
        "relationship": "Father",
        "phone": "(239) - 826- 2059",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (239) - 826- 2059",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8401750611812",
    "name": "Veer Patel",
    "fullName": "Veer Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Jinal Patel",
      "phone": "(614) - 747- 3337",
      "phone2": "(614) - 747- 3337",
      "email": ""
    },
    "parentName": "Jinal Patel",
    "parentPhone": "(614) - 747- 3337",
    "parentPhone2": "(614) - 747- 3337",
    "parentEmail": "",
    "authorizedPickups": [
      "Jinal Patel",
      "Grhanshyambhai Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Jinal Patel",
        "relationship": "Mother",
        "phone": "(614) - 747- 3337",
        "isPrimary": true
      },
      {
        "name": "Grhanshyambhai Patel",
        "relationship": "Father",
        "phone": "(614) - 747- 3337",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 747- 3337",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402050136814",
    "name": "Victoria Mendieta",
    "fullName": "Victoria Mendieta",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Christina Mendieta",
      "phone": "(614) - 226- 4333",
      "phone2": "(614) - 226- 4333",
      "email": ""
    },
    "parentName": "Christina Mendieta",
    "parentPhone": "(614) - 226- 4333",
    "parentPhone2": "(614) - 226- 4333",
    "parentEmail": "",
    "authorizedPickups": [
      "Christina Mendieta",
      "Edgar Mendieta"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Christina Mendieta",
        "relationship": "Mother",
        "phone": "(614) - 226- 4333",
        "isPrimary": true
      },
      {
        "name": "Edgar Mendieta",
        "relationship": "Father",
        "phone": "(614) - 226- 4333",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 226- 4333",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402150345093",
    "name": "Vihaan Hariprasad",
    "fullName": "Vihaan Hariprasad",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Gomathi Jawahar",
      "phone": "(614) - 597- 7773",
      "phone2": "(317) - 652- 1282",
      "email": ""
    },
    "parentName": "Gomathi Jawahar",
    "parentPhone": "(614) - 597- 7773",
    "parentPhone2": "(317) - 652- 1282",
    "parentEmail": "",
    "authorizedPickups": [
      "Gomathi Jawahar",
      "Hariprasad Avalur Palanisamy"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Gomathi Jawahar",
        "relationship": "Mother",
        "phone": "(614) - 597- 7773",
        "isPrimary": true
      },
      {
        "name": "Hariprasad Avalur Palanisamy",
        "relationship": "Father",
        "phone": "(317) - 652- 1282",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (317) - 652- 1282",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402050022131",
    "name": "Viraj Sagar Patel",
    "fullName": "Viraj Sagar Patel",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Simran Patel",
      "phone": "(478) - 731- 9532",
      "phone2": "(478) - 731- 9532",
      "email": ""
    },
    "parentName": "Simran Patel",
    "parentPhone": "(478) - 731- 9532",
    "parentPhone2": "(478) - 731- 9532",
    "parentEmail": "",
    "authorizedPickups": [
      "Simran Patel",
      "Sagar Patel"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Simran Patel",
        "relationship": "Mother",
        "phone": "(478) - 731- 9532",
        "isPrimary": true
      },
      {
        "name": "Sagar Patel",
        "relationship": "Father",
        "phone": "(478) - 731- 9532",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (478) - 731- 9532",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402350137412",
    "name": "William Dopkiss",
    "fullName": "William Dopkiss",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Jessica Dopkiss",
      "phone": "(614) - 371- 5605",
      "phone2": "(614) - 446- 1184",
      "email": ""
    },
    "parentName": "Jessica Dopkiss",
    "parentPhone": "(614) - 371- 5605",
    "parentPhone2": "(614) - 446- 1184",
    "parentEmail": "",
    "authorizedPickups": [
      "Jessica Dopkiss",
      "Matthew Dopkiss"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Jessica Dopkiss",
        "relationship": "Mother",
        "phone": "(614) - 371- 5605",
        "isPrimary": true
      },
      {
        "name": "Matthew Dopkiss",
        "relationship": "Father",
        "phone": "(614) - 446- 1184",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 371- 5605",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650050305",
    "name": "Wyatt Stein-fuchs",
    "fullName": "Wyatt Stein-fuchs",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Shiloh Stein",
      "phone": "(435) - 659- 6308",
      "phone2": "",
      "email": ""
    },
    "parentName": "Shiloh Stein",
    "parentPhone": "(435) - 659- 6308",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Shiloh Stein"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Shiloh Stein",
        "relationship": "Mother",
        "phone": "(435) - 659- 6308",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (435) - 659- 6308",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402550814113",
    "name": "Yaathra Suganth",
    "fullName": "Yaathra Suganth",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Suganth Rajendran",
      "phone": "(614) - 707- 8590",
      "phone2": "",
      "email": ""
    },
    "parentName": "Suganth Rajendran",
    "parentPhone": "(614) - 707- 8590",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "Suganth Rajendran"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Suganth Rajendran",
        "relationship": "Father",
        "phone": "(614) - 707- 8590",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (614) - 707- 8590",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450947386",
    "name": "Yousef Zindah",
    "fullName": "Yousef Zindah",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Sabriah Younus",
      "phone": "(614) - 270- 0793",
      "phone2": "(614) - 270- 0793",
      "email": ""
    },
    "parentName": "Sabriah Younus",
    "parentPhone": "(614) - 270- 0793",
    "parentPhone2": "(614) - 270- 0793",
    "parentEmail": "",
    "authorizedPickups": [
      "Sabriah Younus",
      "Wisam Zindah"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Sabriah Younus",
        "relationship": "Mother",
        "phone": "(614) - 270- 0793",
        "isPrimary": true
      },
      {
        "name": "Wisam Zindah",
        "relationship": "Father",
        "phone": "(614) - 270- 0793",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 270- 0793",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402150603346",
    "name": "Zachary Khalifa",
    "fullName": "Zachary Khalifa",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Nimo Abdi",
      "phone": "(614) - 805- 2681",
      "phone2": "(734) - 904- 3458",
      "email": ""
    },
    "parentName": "Nimo Abdi",
    "parentPhone": "(614) - 805- 2681",
    "parentPhone2": "(734) - 904- 3458",
    "parentEmail": "",
    "authorizedPickups": [
      "Nimo Abdi",
      "Muhammad Khalifa"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Nimo Abdi",
        "relationship": "Mother",
        "phone": "(614) - 805- 2681",
        "isPrimary": true
      },
      {
        "name": "Muhammad Khalifa",
        "relationship": "Father",
        "phone": "(734) - 904- 3458",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 805- 2681",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402450507047",
    "name": "Zane Theodoris",
    "fullName": "Zane Theodoris",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "George Theodoris",
      "phone": "(239) - 826- 2059",
      "phone2": "",
      "email": ""
    },
    "parentName": "George Theodoris",
    "parentPhone": "(239) - 826- 2059",
    "parentPhone2": "",
    "parentEmail": "",
    "authorizedPickups": [
      "George Theodoris"
    ],
    "authorizedPickupDetails": [
      {
        "name": "George Theodoris",
        "relationship": "Father",
        "phone": "(239) - 826- 2059",
        "isPrimary": true
      }
    ],
    "notes": "Home Phone: (239) - 826- 2059",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  },
  {
    "id": "8402650468100",
    "name": "Zubaida Qalinle",
    "fullName": "Zubaida Qalinle",
    "gradeLevel": "Kumon Student",
    "parent": {
      "name": "Rodo Ahmed",
      "phone": "(614) - 206- 2343",
      "phone2": "(952) - 688- 3268",
      "email": ""
    },
    "parentName": "Rodo Ahmed",
    "parentPhone": "(614) - 206- 2343",
    "parentPhone2": "(952) - 688- 3268",
    "parentEmail": "",
    "authorizedPickups": [
      "Rodo Ahmed",
      "Omar Qalinle"
    ],
    "authorizedPickupDetails": [
      {
        "name": "Rodo Ahmed",
        "relationship": "Mother",
        "phone": "(614) - 206- 2343",
        "isPrimary": true
      },
      {
        "name": "Omar Qalinle",
        "relationship": "Father",
        "phone": "(952) - 688- 3268",
        "isPrimary": false
      }
    ],
    "notes": "Home Phone: (614) - 787- 5383",
    "isActive": true,
    "createdAt": "2026-08-01T08:00:00.000Z",
    "updatedAt": "2026-08-01T08:00:00.000Z"
  }
];

export const DUMMY_STUDENTS: Student[] = ACTUAL_STUDENTS;
export const TEN_STUDENTS: Student[] = ACTUAL_STUDENTS;
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: "att-1",
    studentId: "8402450947294",
    studentName: "Aadhya Cartik",
    date: "2026-08-29",
    checkInTime: "2026-08-29T15:30:00.000Z",
    checkOutTime: "2026-08-29T16:15:00.000Z",
    checkInMethod: "student_self",
    checkInStaffName: "Self-Service Kiosk",
    checkOutStaffName: "Student Kiosk Terminal",
    pickupPerson: "Cartik Seshan",
    pickupPersonName: "Cartik Seshan",
    status: "checked_out",
    smsNotificationSent: true,
    createdAt: "2026-08-29T15:30:00.000Z",
    updatedAt: "2026-08-29T16:15:00.000Z"
  }
];
export const DUMMY_ATTENDANCE: AttendanceRecord[] = INITIAL_ATTENDANCE_RECORDS;
export const generate10Students = (): Student[] => ACTUAL_STUDENTS;
