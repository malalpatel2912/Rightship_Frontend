# Rightships API Documentation

## Base URL
```
http://localhost:7800
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid JWT token in the Authorization header.

### Authentication Flow

1. Send OTP
2. Verify OTP
3. Login to get JWT token
4. Use JWT token for subsequent requests

### Authentication Endpoints

#### Send OTP
```http
POST /otp/send_otp
Content-Type: application/json

{
    "mobile_no": "9876543210",  // or
    "email": "user@example.com"
}
```

#### Verify OTP
```http
POST /otp/verify_otp
Content-Type: application/json

{
    "mobile_no": "9876543210",  // or
    "email": "user@example.com",
    "otp": "123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
    "mobile_no": "9876543210",  // or
    "email": "user@example.com",
    "otp": "123456",
    "user_type": "company_team"  // or "employee"
}
```

#### Verify Token
```http
GET /auth/verify-token
Authorization: Bearer <jwt_token>
```

#### Refresh Token
```http
POST /auth/refresh-token
Authorization: Bearer <jwt_token>
```

## Company Endpoints

### Company Team Management

#### Get All Team Members
```http
POST /company/team/get
Authorization: Bearer <jwt_token>
Content-Type: application/json

{}
```

#### Add Team Member
```http
POST /company/team/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "first_name": "John Doe",
    "email": "john.doe@example.com",
    "mobile_no": "9876543210",
    "status": "active",
    "role": "Employee"
}
```

#### Add Admin Member
```http
POST /company/team/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "name": "Admin User",
    "email": "admin@company.com",
    "mobile_no": "9876543210",
    "status": "active",
    "role": "admin",
    "company_id": "company_id"
}
```

#### Edit Team Member
```http
POST /company/team/edit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "team_id": "67c54dd118c0e1144883d6a4",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobile_no": "9876543210",
    "status": "active",
    "role": "Employee"
}
```

#### Delete Team Member
```http
POST /company/team/delete
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "team_id": "67c54dd118c0e1144883d6a4"
}
```

### Job Application Management

#### Create Job Application
```http
POST /company/application/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "title": "Software Engineer",
    "description": "Job description...",
    "requirements": ["requirement1", "requirement2"],
    "company_id": "company_id"
}
```

#### Edit Job Application
```http
POST /company/application/edit
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "application_id": "application_id",
    "title": "Updated Title",
    "description": "Updated description..."
}
```

#### Delete Job Application
```http
POST /company/application/delete
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
    "application_id": "application_id"
}
```

#### Get Job Applications
```http
POST /company/application/get
Content-Type: application/json

{
    "page": 1,
    "limit": 10
}
```

## Employee Endpoints

### Job Application Management

#### View Job Application
```http
POST /employee/job-application/viewed/<application_id>
Content-Type: application/json
```

#### Save Job Application
```http
POST /employee/job-application/job/saved/<application_id>
Authorization: Bearer <jwt_token>
```

#### Apply for Job
```http
POST /employee/job-application/job/apply/<application_id>
Authorization: Bearer <jwt_token>
```

#### Get Job Applications
```http
GET /employee/job-application/job-applications
Content-Type: application/json

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- search: Search term for filtering by:
  - company_name: Company name
  - rank: Job rank/position
  - ships: Ship type or name
- sort_by: Field to sort by (optional)
- sort_order: "asc" or "desc" (optional)

Example:
GET /employee/job-application/job-applications?page=1&limit=10&search=engineer&sort_by=created_date&sort_order=desc
```

## Subscription Endpoints

### Subscription Plan Management

#### Create Subscription Plan
```http
POST /subscription/plans
Content-Type: application/json

{
    "plan_name": "Basic Plan",
    "can_add_user": 5,
    "can_view_profile_per_week": 100,
    "resume_download_per_week": 50,
    "plan_category": "monthly",  // "daily", "monthly", or "annual"
    "duration": 1,  // Duration in days/months based on category
    "company_list_placement": true,
    "is_active": true
}
```

#### Update Subscription
```http
PUT /subscription/update
Content-Type: application/json

{
    "subscription_id": "subscription_id",
    "status": "approved",
    "end_date": "2024-12-31"
}
```

#### Get Subscription
```http
GET /subscription/get
Content-Type: application/json

Query Parameters:
- company_id: Company ID
```

#### Check Subscription Limits
```http
POST /subscription/check-limits
Content-Type: application/json

{
    "company_id": "company_id",
    "limit_type": "team"  // "team", "view", or "download"
}
```

## Response Codes

- 200: Success
- 201: Created
- 300: Already exists
- 400: Bad Request (missing or invalid parameters)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Notes

1. All timestamps are in UTC
2. JWT tokens expire after 24 hours
3. Most endpoints require authentication except for:
   - OTP endpoints
   - Public job application viewing
   - Email verification
4. File uploads are supported for various file types including: png, jpg, jpeg, gif, pdf, doc, docx, xls, xlsx
5. The API uses MongoDB as the database
6. Rate limiting and subscription checks are implemented for certain operations 