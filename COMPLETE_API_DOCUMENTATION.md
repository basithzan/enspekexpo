# Complete API Documentation for Inspector & Client Management System

## Overview
This is a comprehensive Laravel-based ERP system for managing inspection services, connecting clients with inspectors, and handling the complete inspection workflow. The system supports both web and mobile applications with a robust API.

## Base URL
```
https://erpbeta.enspek.com/api
```

## Authentication
The system uses JWT (JSON Web Token) authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer {your_jwt_token}
```

---

## System Architecture

### Core Components
1. **User Management**: Multi-role system (Admin, Client, Inspector)
2. **Enquiry System**: Request for Inspection (RFI) management
3. **Bidding System**: Inspector bidding on enquiries
4. **Inspection Workflow**: Complete inspection lifecycle
5. **Payment System**: Stripe integration for payments
6. **Video Calling**: Google Meet, Twilio, and Agora integration
7. **Rating & Feedback**: Inspector rating system
8. **File Management**: Document and report handling

### Data Flow
```
Client Request → Enquiry Creation → Inspector Bidding → Award Selection → 
Inspection Execution → Report Submission → Payment → Rating & Feedback
```

---

## API Endpoints

### Authentication Endpoints

#### 1. Client Registration
**POST** `/client-register`

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "company_name": "ABC Company",
    "country_id": 1
}
```

**Response:**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "auth_token": "jwt_token_here",
        "name": "John Doe",
        "email": "john@example.com",
        "roles": ["client"],
        "client_details": {...}
    }
}
```

#### 2. Client Login
**POST** `/client-login`

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### 3. Inspector Registration
**POST** `/inspector-register`

**Request Body:**
```json
{
    "name": "Jane Inspector",
    "email": "jane@example.com",
    "password": "password123",
    "phone": "9876543210",
    "country_id": 1,
    "type": "inspector"
}
```

#### 4. Inspector Login
**POST** `/inspector-login`

#### 5. OTP Verification
**POST** `/send-otp`
**POST** `/verify-otp`
**POST** `/register-user-otp`

---

### Client API Endpoints

#### 1. Get Client Requests
**POST** `/get-client-requests`

**Response:**
```json
{
    "success": true,
    "enquiries": [
        {
            "id": 1,
            "job_title": "Building Inspection",
            "status": "pending",
            "country": {...},
            "created_at": "2024-01-15"
        }
    ]
}
```

#### 2. Request New Inspection
**POST** `/request-new-inspection`

**Request Body:**
```json
{
    "job_name": "Building Inspection",
    "supplier_name": "ABC Construction",
    "supplier_location": "New York",
    "category": "Construction",
    "scope": "Full inspection",
    "commodity": "Building Materials",
    "country": 1,
    "dates": ["2024-01-20", "2024-01-21"],
    "additional_note": "Urgent inspection required"
}
```

#### 3. Edit Inspection
**POST** `/edit-inspection`

#### 4. Upload RFI File
**POST** `/upload-rfi-file`

**Request Body:** (multipart/form-data)
- `rfi_file`: File
- `name`: String

#### 5. Update Client Profile
**POST** `/edit-client-data`

#### 6. Get Client Alerts
**POST** `/get-client-alerts`

---

### Inspector API Endpoints

#### 1. Get Nearby Jobs
**POST** `/get-nearby-jobs`

**Response:**
```json
{
    "success": true,
    "nearby_jobs": [
        {
            "id": 1,
            "job_title": "Building Inspection",
            "country": {...},
            "created_at": "2024-01-15"
        }
    ]
}
```

#### 2. Get My Bids
**POST** `/get-my-bids`

#### 3. View Single Enquiry
**POST** `/get-single-enquiry`

**Request Body:**
```json
{
    "id": 1
}
```

#### 4. Bid for Enquiry
**POST** `/bid-for-enquiry`

**Request Body:**
```json
{
    "id": 1,
    "amount": 500.00,
    "dates": ["2024-01-20", "2024-01-21"],
    "currencies": "USD",
    "amount_type": "fixed"
}
```

#### 5. Proceed Inspection
**POST** `/proceed-inspection`

#### 6. Upload Flash Report
**POST** `/upload-flash-report`

#### 7. Upload Inspection Data
**POST** `/upload-inspection-data`

**Request Body:** (multipart/form-data)
- `flash_report`: File (optional)
- `insp_doc`: File (optional)
- `note`: String (optional)
- `enquiry_log_id`: Integer
- `master_log_id`: Integer

#### 8. Save Check-in
**POST** `/add-enquiry-check-in`

**Request Body:**
```json
{
    "enquiry_log_id": 1,
    "master_log_id": 1,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York",
    "note": "On-site inspection started",
    "image": "base64_encoded_image_or_url"
}
```

#### 9. Update Inspector Profile
**POST** `/update-inspector-profile`

#### 10. Update Inspector Data
**POST** `/update-inspector-data`

---

### Rating & Feedback API Endpoints

#### 1. Rate Inspector
**POST** `/rate-inspector`

**Request Body:**
```json
{
    "inspector_id": 1,
    "rating": 5,
    "review": "Excellent work! Very professional.",
    "enquiry_id": 1
}
```

#### 2. Get Inspector Ratings
**GET** `/inspector-ratings/{inspectorId}`

#### 3. Get Client Profile Ratings
**GET** `/client-profile-ratings`

#### 4. Get Inspector Profile Ratings
**GET** `/inspector-profile-ratings`

#### 5. Get Inspector Reviews
**GET** `/inspector-reviews`

---

### Payment API Endpoints

#### 1. Get Stripe Configuration
**GET** `/stripe-config`

**Response:**
```json
{
    "success": true,
    "stripe_publishable_key": "pk_test_...",
    "currency": "USD"
}
```

#### 2. Create Payment Intent
**POST** `/create-payment-intent`

**Request Body:**
```json
{
    "amount": 100.00,
    "currency": "USD",
    "description": "Payment for inspection services",
    "invoice_id": 1,
    "master_log_id": 1
}
```

#### 3. Confirm Payment
**POST** `/confirm-payment`

#### 4. Get Payment History
**GET** `/payment-history?per_page=15&status=succeeded`

#### 5. Get Payment Details
**GET** `/payment-details/{transactionId}`

#### 6. Get Pending Invoices
**GET** `/pending-invoices`

---

### Video Calling API Endpoints

#### Google Meet Integration

#### 1. Create Instant Call
**POST** `/google-meet/create`

**Request Body:**
```json
{
    "client_id": 1,
    "inspector_id": 2,
    "enquiry_id": 1,
    "title": "Inspection Discussion",
    "duration": 60,
    "description": "Discussion about inspection requirements"
}
```

#### 2. Get Call Participants
**GET** `/google-meet/participants`

#### 3. Join Call
**GET** `/google-meet/{id}/join`

#### 4. End Call
**POST** `/google-meet/{id}/end`

#### 5. Get Active Calls
**GET** `/google-meet/active`

#### 6. Get Enquiry Google Meet
**GET** `/google-meet/enquiry/{enquiryId}`

#### 7. Get User Google Meets
**GET** `/google-meet/user/all`

#### Twilio Video Integration

#### 1. Create Video Call
**POST** `/twilio-video/create`

#### 2. Join Call
**GET** `/twilio-video/{roomSid}/join`

#### 3. End Call
**POST** `/twilio-video/{roomSid}/end`

#### 4. Get User Video Calls
**POST** `/twilio-video/user/all`

#### 5. Get Enquiry Video Call
**GET** `/twilio-video/enquiry/{enquiryId}`

#### Agora Video Integration

#### 1. Create Video Call
**POST** `/agora-video/create`

#### 2. Join Call
**GET** `/agora-video/{channelName}/join`

#### 3. End Call
**POST** `/agora-video/{channelName}/end`

#### 4. Get User Video Calls
**POST** `/agora-video/user/all`

#### 5. Get Enquiry Video Call
**GET** `/agora-video/enquiry/{enquiryId}`

#### 6. Get Room Details
**GET** `/agora-video/room-details/{roomId}`

#### 7. Room Created
**POST** `/agora-video/room-created`

#### 8. Get Joinee Link
**GET** `/agora-video/joinee-link`

---

### Utility Endpoints

#### 1. Get All Countries
**POST** `/get-all-countries`

#### 2. Upload Check-in Photo
**POST** `/upload-check-in-photo`

#### 3. Update Timezone
**POST** `/update-timezone`

#### 4. Send Bulk Push Notification
**GET** `/send-buld-push-new-inspection`

---

## Data Models

### Core Models

#### User Model
```php
{
    "id": "integer",
    "name": "string",
    "email": "string",
    "phone": "string",
    "type": "string (client|inspector|company)",
    "avatar": "string",
    "country_id": "integer",
    "company_name": "string",
    "auth_token": "string",
    "created_at": "datetime"
}
```

#### Enquiry Model
```php
{
    "id": "integer",
    "job_title": "string",
    "client_gp": "integer (user_id)",
    "country_id": "integer",
    "service_type": "string",
    "category": "string",
    "enquiry_scope": "string",
    "commodity": "string",
    "vendor": "string",
    "vendor_location": "string",
    "est_inspection_date": "string",
    "note": "text",
    "status": "integer",
    "is_completed": "boolean",
    "is_inspection_requested": "boolean",
    "created_at": "datetime"
}
```

#### AcceptedInspector Model
```php
{
    "id": "integer",
    "enquiry_id": "integer",
    "inspector_id": "integer",
    "status": "integer (1=pending, 2=accepted, 3=rejected, 4=cancelled, 5=completed, 6=in_progress)",
    "amount": "decimal",
    "availability": "string",
    "currencies": "string",
    "amount_type": "string",
    "created_at": "datetime"
}
```

#### MasterLog Model
```php
{
    "id": "integer",
    "enquiry_id": "integer",
    "gp_client": "integer",
    "inspector_id": "integer",
    "project_name": "string",
    "project_number": "string",
    "gp_ai_no": "string",
    "country": "integer",
    "status": "integer",
    "created_at": "datetime"
}
```

#### FlashReport Model
```php
{
    "id": "integer",
    "user_id": "integer",
    "enquiry_log_id": "integer",
    "master_log_id": "integer",
    "type": "string (flash|doc|output_doc)",
    "file": "string",
    "created_at": "datetime"
}
```

#### InspectorRating Model
```php
{
    "id": "integer",
    "master_log_id": "integer",
    "inspector_id": "integer",
    "client_id": "integer",
    "rating": "integer (1-5)",
    "feedback": "string",
    "is_flagged": "boolean",
    "is_hidden": "boolean",
    "rated_at": "datetime",
    "created_by": "integer"
}
```

#### StripeTransaction Model
```php
{
    "id": "integer",
    "stripe_transaction_id": "string",
    "stripe_payment_intent_id": "string",
    "stripe_charge_id": "string",
    "amount": "decimal",
    "currency": "string",
    "status": "string",
    "payment_method": "string",
    "customer_email": "string",
    "customer_name": "string",
    "description": "string",
    "receipt_url": "string",
    "user_id": "integer",
    "invoice_id": "integer",
    "processed_at": "datetime"
}
```

---

## Authentication Flow

### JWT Token Structure
```json
{
    "iss": "issuer",
    "iat": "issued_at",
    "nbf": "not_before",
    "sub": "subject",
    "jti": "jwt_id"
}
```

### Authentication Process
1. **Registration/Login**: User provides credentials
2. **Token Generation**: JWT token created with user details
3. **Token Storage**: Token stored in user's `auth_token` field
4. **API Requests**: Token included in Authorization header
5. **Token Validation**: Middleware validates token on each request

### Role-Based Access
- **Client**: Can create enquiries, view their requests, rate inspectors
- **Inspector**: Can view nearby jobs, bid on enquiries, upload reports
- **Admin**: Full system access, can create video calls, manage users

---

## Error Handling

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Error Response Format
```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field_name": ["Validation error message"]
    }
}
```

---

## File Upload

### Supported File Types
- Images: JPG, PNG, GIF
- Documents: PDF, DOC, DOCX
- Reports: Any format

### File Storage
- Files stored in `/assets/files/` directory
- Unique filenames generated using timestamp and random string
- File URLs accessible via `url('/assets/files/filename')`

---

## Real-time Features

### WhatsApp Integration
- Automatic notifications for new registrations
- Bid placement notifications
- File upload notifications
- Check-in photo notifications

### Push Notifications
- Bulk push notifications for new jobs
- Real-time alerts for system events

---

## Security Considerations

1. **JWT Authentication**: All API endpoints require valid JWT tokens
2. **HTTPS**: All API calls must be made over HTTPS
3. **Input Validation**: All inputs validated server-side
4. **File Upload Security**: File type and size validation
5. **Rate Limiting**: Consider implementing rate limiting for production

---

## Development Guidelines

### For Expo App Development

#### 1. Authentication Setup
```javascript
// Store JWT token
const storeToken = async (token) => {
    await AsyncStorage.setItem('auth_token', token);
};

// Include token in API requests
const apiCall = async (endpoint, data) => {
    const token = await AsyncStorage.getItem('auth_token');
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
};
```

#### 2. File Upload
```javascript
const uploadFile = async (file, endpoint) => {
    const formData = new FormData();
    formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name
    });
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        },
        body: formData
    });
    
    return response.json();
};
```

#### 3. Real-time Updates
```javascript
// Implement WebSocket or polling for real-time updates
const pollForUpdates = () => {
    setInterval(async () => {
        const updates = await apiCall('/get-updates');
        // Handle updates
    }, 30000); // Poll every 30 seconds
};
```

---

## Testing

### Test Environment
- Use test Stripe keys for payment testing
- Test with various user roles
- Test file upload functionality
- Test video calling features

### Test Data
- Create test users for each role
- Create sample enquiries
- Test complete inspection workflow

---

## Support

For technical support or questions about the API, please contact the development team or refer to the individual API documentation files:
- `INSPECTOR_RATING_API_DOCUMENTATION.md`
- `PAYMENT_API_DOCUMENTATION.md`
- `VIDEO_CALL_INTEGRATION_DOCUMENTATION.md`
