# AI Job Portal Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register
- **POST** `/api/auth/register`
- Body: `{ name, email, password, role (optional) }`
- Returns: Token, refreshToken, user data

### Login
- **POST** `/api/auth/login`
- Body: `{ email, password }`
- Returns: Token, refreshToken, user data

### Refresh Token
- **POST** `/api/auth/refresh-token`
- Body: `{ refreshToken }`
- Returns: New token and refreshToken

### Logout
- **POST** `/api/auth/logout`
- Requires: Authentication

### Forgot Password
- **POST** `/api/auth/forgot-password`
- Body: `{ email }`

### Reset Password
- **PUT** `/api/auth/reset-password/:token`
- Body: `{ password }`

### Get Current User
- **GET** `/api/auth/me`
- Requires: Authentication

### Update Profile
- **PUT** `/api/auth/profile`
- Requires: Authentication
- Body: `{ name, phone, location, bio, skills, experience, education }`
- Supports: Avatar upload

## Job Endpoints

### Get All Jobs
- **GET** `/api/jobs`
- Query params: `page`, `limit`, `search`, `location`, `jobType`, `experience`

### Get Job by ID
- **GET** `/api/jobs/:id`

### Create Job
- **POST** `/api/jobs`
- Requires: Authentication (Recruiter/Admin)
- Body: `{ title, description, requirements, responsibilities, skills, location, jobType, salary, experience, company }`

### Update Job
- **PUT** `/api/jobs/:id`
- Requires: Authentication (Recruiter/Admin)

### Delete Job
- **DELETE** `/api/jobs/:id`
- Requires: Authentication (Recruiter/Admin)

### Get My Jobs
- **GET** `/api/jobs/my-jobs`
- Requires: Authentication (Recruiter)

### Get Job Stats
- **GET** `/api/jobs/stats`
- Requires: Authentication (Recruiter)

## Application Endpoints

### Apply for Job
- **POST** `/api/applications/apply`
- Requires: Authentication (Candidate)
- Body: `{ jobId, coverLetter }`
- Supports: Resume upload

### Get My Applications
- **GET** `/api/applications/my-applications`
- Requires: Authentication (Candidate)

### Get Job Applications
- **GET** `/api/applications/job/:jobId`
- Requires: Authentication (Recruiter)

### Update Application Status
- **PUT** `/api/applications/:id/status`
- Requires: Authentication (Recruiter)
- Body: `{ status }`

### Save Job
- **POST** `/api/applications/save`
- Requires: Authentication (Candidate)
- Body: `{ jobId }`

### Unsave Job
- **DELETE** `/api/applications/save/:jobId`
- Requires: Authentication (Candidate)

### Get Saved Jobs
- **GET** `/api/applications/saved`
- Requires: Authentication (Candidate)

### Upload Resume
- **POST** `/api/applications/upload-resume`
- Requires: Authentication (Candidate)
- Supports: Resume upload

### Analyze Resume
- **POST** `/api/applications/analyze-resume`
- Requires: Authentication (Candidate)
- Body: `{ jobId (optional) }`

## Recruiter Endpoints

### Create Recruiter Profile
- **POST** `/api/recruiter/profile`
- Requires: Authentication (Recruiter)
- Body: `{ company }`

### Get Recruiter Profile
- **GET** `/api/recruiter/profile`
- Requires: Authentication (Recruiter)

### Update Recruiter Profile
- **PUT** `/api/recruiter/profile`
- Requires: Authentication (Recruiter)
- Supports: Company logo upload

### Get Recruiter Dashboard
- **GET** `/api/recruiter/dashboard`
- Requires: Authentication (Recruiter)

## Admin Endpoints

### Get Admin Dashboard
- **GET** `/api/admin/dashboard`
- Requires: Authentication (Admin)

### Get All Users
- **GET** `/api/admin/users`
- Requires: Authentication (Admin)
- Query params: `page`, `limit`, `role`, `search`

### Update User Status
- **PUT** `/api/admin/users/:id/status`
- Requires: Authentication (Admin)
- Body: `{ isActive }`

### Get All Jobs
- **GET** `/api/admin/jobs`
- Requires: Authentication (Admin)
- Query params: `page`, `limit`, `status`

### Delete Job (Admin)
- **DELETE** `/api/admin/jobs/:id`
- Requires: Authentication (Admin)

### Get All Recruiters
- **GET** `/api/admin/recruiters`
- Requires: Authentication (Admin)

### Verify Recruiter
- **PUT** `/api/admin/recruiters/:id/verify`
- Requires: Authentication (Admin)

## Notification Endpoints

### Get Notifications
- **GET** `/api/notifications`
- Requires: Authentication
- Query params: `page`, `limit`

### Mark Notification as Read
- **PUT** `/api/notifications/:id/read`
- Requires: Authentication

### Mark All Notifications as Read
- **PUT** `/api/notifications/read-all`
- Requires: Authentication

### Delete Notification
- **DELETE** `/api/notifications/:id`
- Requires: Authentication

## User Roles
- **candidate**: Can apply for jobs, save jobs, upload resume, analyze resume
- **recruiter**: Can post jobs, manage applications, view applicants
- **admin**: Can manage users, jobs, recruiters, view analytics

## Error Responses
All endpoints return:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Validation errors if applicable
}
```

## Success Responses
Most endpoints return:
```json
{
  "success": true,
  "message": "Success message",
  "data": {} // Response data
}
```
