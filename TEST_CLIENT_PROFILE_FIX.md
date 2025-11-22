# Testing Guide: Client Edit Profile Data Prefilling

## Prerequisites

Before testing, you need to:
1. **Clear app data** to test fresh login
2. Have **client credentials** ready
3. Have **React Native debugger** or **console access** to view logs

## Test Steps

### Step 1: Fresh Login Test

```bash
# Clear AsyncStorage (optional - for clean test)
# In React Native Debugger console:
AsyncStorage.clear()
```

1. **Logout** if currently logged in
2. **Login** as a client user
3. **Watch console logs** for:
   ```
   ✅ Stored to AsyncStorage - user_data with type: client
   ✅ Stored data: { ... }
   ```

4. **Verify in console** that stored data contains:
   ```json
   {
     "name": "John Doe",  // ← Should NOT be empty
     "email": "...",
     "phone": "...",
     "client_details": {
       "name": "John Doe",
       "email": "...",
       // ... other fields
     }
   }
   ```

### Step 2: Edit Profile Screen Test

1. **Navigate** to Profile tab
2. **Tap** "Edit Profile" or similar button to open modal
3. **Watch console logs** for:
   ```
   🔍 Edit Profile - User data: { ... }
   📋 Client details source: { ... }
   📝 Setting form data: { ... }
   📝 Name value: "John Doe"  // ← Should show actual name
   ✅ Form data set for client
   ```

4. **Visually verify** all fields are prefilled:
   - [ ] **Name** field shows user's name
   - [ ] **Email** field shows email (non-editable)
   - [ ] **Phone** field shows phone number
   - [ ] **Company Name** field shows company
   - [ ] **Company Size** field shows size
   - [ ] **City** field shows city
   - [ ] **Industry** field shows industry
   - [ ] **Bio** field shows bio text
   - [ ] **Country** dropdown shows correct country
   - [ ] **Avatar** shows if exists

### Step 3: Country Selection Test

1. **Tap** on Country dropdown
2. **Watch console logs** for:
   ```
   🌍 Looking for country with ID: 1
   ✅ Found country: United States
   🌍 Found country from client_details: United States ID: 1
   ✅ Setting country from client_details: United States
   ```

3. **Verify** the selected country matches the user's stored country

### Step 4: Edit and Save Test

1. **Modify** any field (e.g., change bio text)
2. **Tap** "Save Changes" button
3. **Watch console logs** for:
   ```
   📤 Update response: { success: true, ... }
   ✅ User context updated successfully
   ```

4. **Verify** success alert appears
5. **Close** the modal

### Step 5: Persistence Test

1. **Reopen** Edit Profile modal
2. **Verify** the changes you made are still there
3. **Verify** all other fields are still prefilled

### Step 6: Avatar Upload Test (Optional)

1. **Tap** on avatar/camera icon
2. **Select** an image from gallery
3. **Verify** image preview appears
4. **Save** the profile
5. **Reopen** and verify avatar persists

## Expected Console Output (Successful Flow)

```
Login Phase:
✅ Stored to AsyncStorage - user_data with type: client
✅ Stored data: {
  "id": 123,
  "name": "John Doe",     ← Extracted from client_details
  "email": "...",
  "client_details": {
    "name": "John Doe",   ← Original source
    "email": "...",
    ...
  }
}

Edit Profile Open:
🔍 Edit Profile - User data: { ... }
🔍 User type: client
🔍 User.client_details exists? true
📋 Client details source: { name: "John Doe", ... }
📝 Setting form data: { name: "John Doe", email: "...", ... }
📝 Name value: "John Doe"
✅ Form data set for client
📸 Avatar set: https://erpbeta.enspek.com/uploads/avatar.jpg
🌍 Looking for country with ID: 1
✅ Found country: United States
🌍 Found country from client_details: United States ID: 1
✅ Setting country from client_details: United States

Save Profile:
📤 Update response: { success: true, message: "..." }
✅ User context updated successfully
```

## Troubleshooting

### Issue: Name is still empty

**Check console logs for:**
```
📋 Client details source: { name: null, ... }
```

**Solution:**
- Verify API response contains `client_details.name`
- Check if database has the name stored
- Try re-logging in to fetch fresh data

### Issue: Country not selected

**Check console logs for:**
```
🌍 Looking for country with ID: 0
```

**Solution:**
- Verify `country_id` is stored in `client_details`
- Check if countries list loaded successfully
- Verify country ID matches an actual country

### Issue: Phone shows undefined

**Check console logs for:**
```
📝 Setting form data: { phone: "", ... }
```

**Solution:**
- Check if API returns `phone` or `mobile` field
- Code tries both: `details.phone || details.mobile || user.phone || user.mobile`

### Issue: Fields load but then disappear

**Possible cause:** Multiple useEffect calls overwriting data

**Check:**
- Look for duplicate console logs
- Verify `fetchUserProfile()` is NOT called for clients
- Should see: "⚙️ Setting basic user data for inspector" ONLY for inspectors

## Debug Commands

### View stored user data:
```javascript
// In React Native Debugger console:
AsyncStorage.getItem('user_data').then(data => console.log(JSON.parse(data)))
```

### View current auth token:
```javascript
AsyncStorage.getItem('auth_token').then(token => console.log(token))
```

### Clear all data and restart:
```javascript
AsyncStorage.clear().then(() => console.log('Cleared'))
```

## Success Criteria

✅ **Name field is prefilled** with user's actual name  
✅ **All client fields** are prefilled on modal open  
✅ **No API calls** made for clients (only inspectors fetch from API)  
✅ **Country dropdown** shows correct selection  
✅ **Save works** and updates are persisted  
✅ **Console shows** proper debug logs at each step  

## Notes

- **Clients**: Data loads instantly from stored `client_details` (no API call)
- **Inspectors**: Still fetch from API as before
- **Performance**: Should see immediate prefill, no loading delay for clients
- **Offline**: Should work offline since data is from AsyncStorage

## Test Completion Checklist

After completing all tests above, verify:

- [ ] Fresh login stores name correctly
- [ ] Edit profile shows all fields prefilled
- [ ] Name specifically is filled (not empty)
- [ ] Country dropdown works correctly
- [ ] Save updates work
- [ ] Changes persist on reopen
- [ ] Console logs show expected output
- [ ] No errors in console
