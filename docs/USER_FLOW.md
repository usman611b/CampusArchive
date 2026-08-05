# CampusArchive: User Flow & Workflows Specification

---

## 1. Student Exam Preparation Flow (Academic Explorer)

```text
[ Home Dashboard ]
       │ Click "Academics" on Sidebar
       ▼
[ Academic Explorer Landing ]
       │ Select Department: "Computer Science"
       ▼
[ Programs View ]
       │ Select Degree Program: "BS Computer Science"
       ▼
[ Semesters View ]
       │ Select Term: "Semester 4"
       ▼
[ Semester Courses ]
       │ Click Course Card: "CS-201 Data Structures & Algorithms"
       ▼
[ Course Hub ]
       ├── [ Overview ]
       ├── [ Notes ] ──────> Filter by Chapter / Topic
       ├── [ Past Papers ] ──> Filter by Midterm 2024 / Final 2023
       └── [ Discussion ] ──> Ask questions or view verified solutions
```

---

## 2. 7-Step Guided Upload Wizard Flow

```text
[ Click "+ Upload Resource" ]
       │
       ├── Step 1: Select Department    (e.g., Computer Science)
       ├── Step 2: Select Program       (e.g., BS Computer Science)
       ├── Step 3: Select Semester      (e.g., Semester 4)
       ├── Step 4: Select Course        (e.g., Data Structures)
       ├── Step 5: Select Category      (e.g., Past Papers / Lecture Notes)
       ├── Step 6: Upload Attachment    (Direct S3 Pre-Signed Upload PUT)
       └── Step 7: Fill Metadata        (Title, Description, Teacher, Academic Year, Tags)
       │
[ Submit for Moderation ] ──> Status: PENDING ──> Admin Approval ──> Published on Course Hub
```
