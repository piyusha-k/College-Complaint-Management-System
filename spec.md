# College Complaint Management System Specification

## Project Overview

Build a full-stack college complaint management system that allows students to submit issues related to classrooms, hostels, labs, Wi-Fi, transportation, sanitation, or infrastructure. The system must let admins review complaints, assign departments, update statuses, and record resolutions while students can track progress from submission until closure.

---

## Core Features

- Student login and registration
- Complaint submission form
- Category selection and priority levels
- Complaint description and issue location
- File/image attachment support
- Complaint status lifecycle tracking
- Complaint history and filtering
- Admin dashboard to view all complaints
- Department and staff assignment
- Admin comments and progress updates
- Search and filter by status, category, priority, and department
- Basic analytics and complaint statistics
- Student complaint detail page
- Resolution and closure records

---

## Suggested Complaint Status Flow

Submitted -> Under Review -> Assigned -> In Progress -> Resolved -> Closed

---

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, Zustand, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Real-time updates: Socket.IO
- Authentication: bcryptjs and JWT
- Deployment: Render for backend, Vercel for frontend

---

## User Roles

### Student
- Register and log in
- Submit complaints
- Upload image or supporting file
- View complaint status and history
- Read resolution details

### Admin
- View all complaints
- Sort and filter by department or status
- Assign complaints to departments/staff
- Update status and add comments
- Mark complaints as resolved or closed
- View dashboard statistics

### Department Staff
- View assigned complaints
- Update progress
- Add comments and resolution notes

---

## Functional Requirements

### Complaint Management
The system must allow users to create a complaint with:
- title
- description
- category
- location
- priority
- attachments
- status
- submittedBy
- assignedTo
- createdAt
- updatedAt

### Status Tracking
Each complaint must move through the defined lifecycle and retain a timeline of updates.

### Dashboard
The admin dashboard should include:
- total complaints
- open complaints
- resolved complaints
- priority summary
- recent complaints
- department-wise counts

### Search and Filters
Users should be able to search by:
- complaint ID
- category
- keyword in description
- status
- priority
- department

---

## Routes and Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Complaints
- GET /api/complaints
- GET /api/complaints/:id
- POST /api/complaints
- PUT /api/complaints/:id
- DELETE /api/complaints/:id

### Admin Operations
- PATCH /api/complaints/:id/status
- PATCH /api/complaints/:id/assign
- POST /api/complaints/:id/comments

### Dashboard
- GET /api/dashboard/stats

---

## Database Collections

- Users
- Complaints
- Comments
- Notifications
- Departments

---

## Frontend Pages

- /login
- /register
- /dashboard
- /complaints
- /complaints/:id
- /admin
- /reports
- /settings

---

## Development Phases

Phase 1: Set up backend and frontend structure
Phase 2: Authentication and user roles
Phase 3: Complaint CRUD and tracking
Phase 4: Admin assignment and status updates
Phase 5: Search, filters, and dashboard analytics
Phase 6: Deployment and production setup

---

## Final Expected Outcome

The final application should let students submit college complaints quickly, track their status clearly, and receive resolution updates. Admins should be able to manage all complaints from one dashboard, assign tasks, and maintain accountability across departments.

