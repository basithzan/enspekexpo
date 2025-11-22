# Client Edit Profile - Data Prefilling Fix

## Problem Identified

The React Native `edit-profile.tsx` component was not prefilling client data, specifically the **name field** and other client details were empty even though data exists in the database.

## Root Cause Analysis

### Issue 1: Data Structure Mismatch
The React PWA version accesses data from: `client?.user?.client_details?.name`
The React Native version was looking for: `user.name` (which might be empty)

### Issue 2: Login Data Storage
During login, the API returns client data nested in `client_details` object, but AuthContext was only storing top-level fields like `userData.name`, which might be empty. The actual name is in `userData.client_details.name`.

## Key Differences in Data Structure

**PWA (Redux):**
```javascript
client?.user?.client_details = {
  name, email, phone, mobile, company_name, 
  company_size, city, industry, bio, country_id, 
  country: { id, name }, avatar
}
```

**React Native (AuthContext):**
```javascript
user.client_details = {
  name, email, phone, mobile, company_name, 
  company_size, city, industry, bio, country_id, 
  country: { id, name }, avatar
}
```

## Solution Implemented

### 1. Fixed AuthContext Login to Extract Nested Data

Updated `/src/contexts/AuthContext.tsx` to properly extract client data from `client_details`:

```typescript
// Before: Only stored top-level userData.name (which might be empty)
const userDataToStore = {
  id: userData.id,
  name: userData.name, // ❌ Empty for clients!
  email: userData.email,
  // ...
};

// After: Extract from client_details if available
const clientDetails = userData.client_details || {};
const inspectorDetails = userData.inspector_details || {};

const userDataToStore = {
  id: userData.id,
  name: userData.name || clientDetails.name || inspectorDetails.name || '', // ✅
  email: userData.email || clientDetails.email || inspectorDetails.email || '',
  phone: userData.phone || clientDetails.phone || clientDetails.mobile || '',
  company_name: userData.company_name || clientDetails.company_name || '',
  country_id: userData.country_id || clientDetails.country_id || clientDetails.country?.id || 0,
  // ... and keep the full nested objects
  client_details: userData.client_details,
  inspector_details: userData.inspector_details,
};
```

**Why this matters:**
- API returns client data in `response.data.user.client_details`
- Top-level `userData.name` is often empty/null
- We need to extract and store at both levels for easy access

### 2. Enhanced Edit Profile Data Loading

Updated `/app/(modals)/edit-profile.tsx` to use multiple fallback sources:

```typescript
if (user.type === 'client') {
  // Try multiple possible data sources
  const details = user.client_details || user.details?.client_details || user;
  
  const formattedData = {
    name: details.name || user.name || '', // ✅ Tries both nested and top-level
    email: details.email || user.email || '',
    phone: details.phone || details.mobile || user.phone || user.mobile || '',
    company_name: details.company_name || user.company_name || '',
    company_size: details.company_size || user.company_size || '',
    city: details.city || user.city || '',
    industry: details.industry || user.industry || '',
    bio: details.bio || user.bio || '',
    country_id: details.country_id || 
                (typeof details.country === 'object' ? details.country?.id : 0) || 
                user.country_id || 
                (typeof user.country === 'object' ? user.country?.id : 0) || 0,
  };
  
  setFormData(prev => ({ ...prev, ...formattedData }));
}
```

### 3. Added Comprehensive Debug Logging

Added console logs to trace the entire data flow:
- 🔍 Full user object from context
- 📋 Client details object
- 📝 Formatted form data
- 📝 Name value specifically
- 🌍 Country selection process
- ✅ Success confirmations

### 4. Enhanced Country Selection

## API Response Structure (from PWA)

Based on the React PWA implementation, the client login API returns:

```javascript
{
  success: true,
  user: {
    id: 123,
    name: null,  // ❌ Often empty at top level
    email: "user@example.com",
    auth_token: "...",
    client_details: {  // ✅ Actual data is here
      name: "John Doe",
      email: "user@example.com",
      phone: "+1234567890",
      mobile: "+1234567890",
      company_name: "Acme Inc",
      company_size: "50-100",
      city: "New York",
      industry: "Technology",
      bio: "...",
      country_id: 1,
      country: {
        id: 1,
        name: "United States"
      },
      avatar: "uploads/avatar.jpg"
    }
  }
}
```

## Key Changes Summary

### Files Modified

1. **`/src/contexts/AuthContext.tsx`**
   - Extract name, email, phone, etc. from `client_details` during login
   - Store both top-level (for easy access) and nested (for completeness)
   - Ensures `user.name` is always populated

2. **`/app/(modals)/edit-profile.tsx`**
   - Use multiple fallback sources for each field
   - Try `client_details.name` first, then `user.name`
   - Try `client_details.phone` and `client_details.mobile`
   - Handle country from both `country_id` and `country.id`
   - Added extensive debug logging

### 5. Updated Save Function

```typescript
await updateUser({
  name: formData.name,
  phone: formData.phone,
  company_name: formData.company_name,
  country_id: formData.country_id,
  client_details: {
    ...user?.client_details,
    ...updatedClientDetails,
  },
});
```

### 4. Removed Unnecessary API Call for Clients

**Before:**
- `fetchUserProfile()` was called for both clients and inspectors
- Clients were trying to fetch from AsyncStorage (redundant)

**After:**
- `fetchUserProfile()` is only called for inspectors
- Clients use data directly from `user.client_details` (already in memory from AuthContext)

## Benefits

1. ✅ **Faster Loading**: No API call needed for clients - data loads instantly
2. ✅ **Consistent with Login**: Uses the same data structure stored during login
3. ✅ **Better UX**: Fields are prefilled immediately when the screen opens
4. ✅ **More Reliable**: Doesn't depend on API availability for displaying existing data
5. ✅ **Matches PWA Behavior**: Now works the same way as the React PWA version

## Testing Checklist

- [ ] Client login and verify `client_details` is stored in AsyncStorage
- [ ] Open Edit Profile modal
- [ ] Verify all fields are prefilled:
  - [ ] Name
  - [ ] Email (non-editable)
  - [ ] Phone
  - [ ] Company Name
  - [ ] Company Size
  - [ ] City
  - [ ] Industry
  - [ ] Bio
  - [ ] Country (dropdown shows correct country)
  - [ ] Avatar (if exists)
- [ ] Make changes and save
- [ ] Verify profile updates successfully
- [ ] Reopen Edit Profile and verify changes persist
- [ ] Check console logs for debug information

## Debug Logging

Added comprehensive console logs to trace data flow:
- 🔍 Initial user data
- 📋 Client details found
- ✅ Form data set
- 📸 Avatar set
- 🌍 Country selection process
- 📤 Update response

## Files Modified

1. `/Users/uvaise/Herd/enspekexpo/app/(modals)/edit-profile.tsx`
   - Enhanced data prefilling logic
   - Added client_details support
   - Improved country selection
   - Added debug logging
   - Updated save function to persist full client_details

## Migration Notes

This fix aligns the React Native implementation with the proven React PWA pattern:
- **Data Source**: Use in-memory user context instead of API calls for clients
- **Data Structure**: Access `user.client_details` directly
- **Performance**: Instant loading instead of waiting for API
- **Reliability**: Works offline with cached data
