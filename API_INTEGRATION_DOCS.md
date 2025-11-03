# API Integration Documentation

## New API Endpoints Implemented

This document details the API endpoints added to the React Native Job Details screen to match the React web version functionality.

---

## Base Configuration

```typescript
Base URL: https://erpbeta.enspek.com/api
Auth: Bearer token (automatically added via apiClient interceptor)
Content-Type: application/json (except for FormData uploads)
```

---

## 1. Upload Inspection Data

**Endpoint:** `POST /upload-inspection-data`

**Purpose:** Upload inspection documents, flash reports, and notes in a single submission

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```typescript
{
  token: string                    // Auth token
  enquiry_log_id: string          // Job/Enquiry ID
  master_log_id: string           // Master log ID from job data
  flash_report?: File             // Inspection report file (optional)
  insp_doc?: File                 // Inspection document file (optional)
  note?: string                   // Report notes (optional)
}
```

**File Object Structure (React Native):**
```typescript
{
  uri: string,           // File URI from DocumentPicker
  type: string,          // MIME type (e.g., "application/pdf")
  name: string          // Filename
}
```

**Response:**
```typescript
{
  success: boolean,
  message: string,
  data?: {
    // Uploaded file details
  }
}
```

**Success Flow:**
1. Submit FormData with files and/or notes
2. Receive success response
3. Show success alert
4. Clear form fields
5. Refresh job details to show new uploads

**Error Handling:**
- Network errors
- File size too large
- Invalid file type
- Missing required fields
- Server errors

**Implementation Location:**
- Function: `handleSubmitInspectionData()`
- File: `app/(stack)/job/[id].tsx`

---

## 2. Delete Inspection Document

**Endpoint:** `POST /delete-inspection-doc`

**Purpose:** Delete a previously uploaded inspection document

**Content-Type:** `application/json`

**Request Body:**
```typescript
{
  token: string,     // Auth token
  id: number        // Document ID to delete
}
```

**Response:**
```typescript
{
  success: boolean,
  message: string
}
```

**Flow:**
1. User taps delete button on uploaded document
2. Show confirmation dialog
3. If confirmed, send delete request
4. Show success/error message
5. Refresh job details to update list

**Implementation Location:**
- Function: `handleDeleteInspectionDoc(docId: number)`
- File: `app/(stack)/job/[id].tsx`

**Note:** Currently implemented but UI button not shown in the uploaded documents list (can be added if needed)

---

## 3. Confirm Proceed

**Endpoint:** `POST /confirm-proceed`

**Purpose:** Confirm inspector wants to proceed with an accepted bid

**Content-Type:** `application/json`

**Request Body:**
```typescript
{
  token: string,     // Auth token
  id: number        // Bid ID (from my_bid.id)
}
```

**Response:**
```typescript
{
  success: boolean,
  message: string,
  data?: {
    // Updated bid details
  }
}
```

**Flow:**
1. Bid status changes to "Accepted"
2. Inspector reviews job details
3. Taps "Confirm to Proceed" button
4. Send confirmation request
5. Update job status
6. Refresh job details

**Implementation Location:**
- Function: `handleConfirmProceed()`
- File: `app/(stack)/job/[id].tsx`

**Note:** This endpoint is implemented but the UI button can be added when needed (similar to React version)

---

## 4. Check-In to Enquiry

**Endpoint:** `POST /check-in-enquiry` (using `useEnquiryCheckIn` hook)

**Purpose:** Log inspector's location check-in at job site

**Content-Type:** `multipart/form-data`

**Request Body (FormData):**
```typescript
{
  token: string,              // Auth token
  enquiry_log_id: string,     // Job ID
  master_log_id: string,      // Master log ID
  address: string,            // Location address
  latitude: string,           // GPS latitude
  longitude: string,          // GPS longitude
  image?: File,               // Check-in photo (iOS)
  imageAndroid?: File,        // Check-in photo (Android)
  note?: string              // Optional check-in note
}
```

**Response:**
```typescript
{
  success: boolean,
  message: string,
  data?: {
    // Check-in details
  }
}
```

**Implementation Location:**
- Function: `handleSubmitCheckIn()`
- Hook: `useEnquiryCheckIn` from `src/api/hooks/useEnquiry.ts`
- File: `app/(stack)/job/[id].tsx`

---

## 5. Get Single Enquiry

**Endpoint:** `POST /get-single-enquiry`

**Purpose:** Fetch complete job details including inspection documents and reports

**Content-Type:** `application/json`

**Request Body:**
```typescript
{
  id: number     // Job/Enquiry ID
}
```

**Response:**
```typescript
{
  success: boolean,
  enquiry: {
    id: number,
    job_title: string,
    status: number,
    // ... other job fields
    master_logs: Array<{
      id: number,
      assignment_instruction: string,  // File path
      flash_note: string,              // Report notes
      // ... other fields
    }>,
    output_docs: Array<{              // Input documents for inspector
      file: string,
      created_at: string,
      // ... other fields
    }>,
    checkIns: Array<{                 // Check-in history
      address: string,
      latitude: number,
      longitude: number,
      created_at: string,
      // ... other fields
    }>
  },
  my_bid: {                           // Inspector's bid details
    id: number,
    amount: number,
    status: number,                   // 1=Pending, 2=Accepted, 3=Rejected, 5=Completed
    currencies: string,
    // ... other fields
  },
  inspection_docs: Array<{            // Uploaded inspection documents
    id: number,
    file: string,
    created_at: string,
    // ... other fields
  }>,
  flash_reports: Array<{              // Uploaded flash reports
    id: number,
    file: string,
    created_at: string,
    // ... other fields
  }>,
  already_bidded: boolean,
  // ... other response fields
}
```

**Implementation Location:**
- useQuery hook with key: `["job-details", id]`
- File: `app/(stack)/job/[id].tsx`

**Note:** This is the main query that fetches all job data. It's automatically called when the screen loads and refreshed after any updates.

---

## 6. Bid for Enquiry

**Endpoint:** `POST /bid-for-enquiry`

**Purpose:** Submit a bid for an inspection job

**Content-Type:** `application/json`

**Request Body:**
```typescript
{
  id: number,              // Job ID
  amount: number,          // Bid amount
  dates: string[],         // Available dates (D/M/YYYY format)
  currencies: string,      // Currency code
  amount_type: string     // "daily" | "hourly" | "monthly" | "project"
}
```

**Response:**
```typescript
{
  success: boolean,
  message: string,
  data?: {
    // Bid details
  }
}
```

**Implementation Location:**
- Mutation: `bidMutation`
- Function: `handleSubmitBid()`
- File: `app/(stack)/job/[id].tsx`

---

## Error Response Structure

All endpoints follow this error response format:

```typescript
{
  success: false,
  message: string,        // Error message
  errors?: {             // Validation errors
    field_name: string[]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `401` - Unauthorized (token invalid/expired)
- `422` - Validation error
- `500` - Server error

---

## Authentication

All API requests automatically include the Bearer token via the `apiClient` interceptor:

```typescript
// From src/api/client.ts
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Token Storage:**
- Stored in AsyncStorage as `'auth_token'`
- Retrieved from AuthContext: `user?.auth_token`
- Automatically refreshed on 401 responses

---

## FormData Handling

For file uploads, the `apiClient` automatically removes the `Content-Type` header to let axios set the proper boundary:

```typescript
// Automatic handling in apiClient
if (config.data instanceof FormData) {
  delete config.headers['Content-Type'];
}
```

**React Native FormData File Structure:**
```typescript
// Images from ImagePicker
{
  uri: "file:///path/to/image.jpg",
  type: "image/jpeg",
  name: "photo.jpg"
}

// Documents from DocumentPicker
{
  uri: "file:///path/to/document.pdf",
  type: "application/pdf",  // or mimeType
  name: "document.pdf"
}
```

---

## Query Invalidation

After successful operations, relevant queries are invalidated to refetch fresh data:

```typescript
// After upload
queryClient.invalidateQueries({ queryKey: ["job-details", id] });

// After bid submission
queryClient.invalidateQueries({ queryKey: ["my-bids"] });
queryClient.invalidateQueries({ queryKey: ["nearby-jobs"] });
queryClient.invalidateQueries({ queryKey: ["bid-jobs"] });
```

---

## File URL Construction

Downloaded files need full URLs constructed from relative paths:

```typescript
const openFileOnBrowser = (fileUrl: string) => {
  const fullUrl = fileUrl.startsWith("http")
    ? fileUrl
    : `${WEBSITE_IMAGE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
  Linking.openURL(fullUrl);
};
```

**Constants:**
```typescript
const WEBSITE_IMAGE_URL = "https://erpbeta.enspek.com";
```

---

## Testing API Endpoints

### Using Postman:

1. **Set Base URL:** `https://erpbeta.enspek.com/api`

2. **Add Authorization Header:**
   ```
   Authorization: Bearer YOUR_AUTH_TOKEN
   ```

3. **For File Uploads:**
   - Set body type to `form-data`
   - Add files using the file picker
   - Add other fields as text

4. **For JSON Requests:**
   - Set body type to `raw` with `JSON` selected
   - Include required fields

### Example cURL Commands:

```bash
# Upload Inspection Data
curl -X POST https://erpbeta.enspek.com/api/upload-inspection-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "enquiry_log_id=123" \
  -F "master_log_id=456" \
  -F "flash_report=@/path/to/report.pdf" \
  -F "insp_doc=@/path/to/document.pdf" \
  -F "note=Inspection completed successfully"

# Delete Document
curl -X POST https://erpbeta.enspek.com/api/delete-inspection-doc \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": 789}'

# Confirm Proceed
curl -X POST https://erpbeta.enspek.com/api/confirm-proceed \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": 123}'
```

---

## Migration Notes from React to React Native

### Key Differences:

1. **File Objects:**
   - React: Uses native File API
   - React Native: Uses uri/type/name object structure

2. **FormData:**
   - React: Standard web FormData
   - React Native: Custom FormData with uri-based files

3. **File Picking:**
   - React: `<input type="file">`
   - React Native: `DocumentPicker.getDocumentAsync()`

4. **Notifications:**
   - React: Toast notifications (sonner)
   - React Native: Alert API

5. **Redux vs React Query:**
   - React: Uses Redux for state
   - React Native: Uses React Query for server state

---

## Future Enhancements

Potential API improvements:

1. **Batch Upload:** Upload multiple files in one request
2. **Progress Tracking:** Stream upload progress
3. **File Validation:** Server-side file type/size validation
4. **Thumbnails:** Generate thumbnails for images
5. **Signed URLs:** Temporary secure download links
6. **Compression:** Automatic image compression on upload
7. **Offline Queue:** Queue uploads when offline

---

**Last Updated:** 2025  
**API Version:** 1.0  
**Base URL:** https://erpbeta.enspek.com/api
