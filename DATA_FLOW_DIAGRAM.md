# Data Flow: Client Edit Profile

## Before Fix (Broken Flow)

```
┌─────────────────┐
│   API Login     │
│   Response      │
└────────┬────────┘
         │
         │ { user: { name: null, client_details: { name: "John" } } }
         │
         ▼
┌─────────────────────────┐
│   AuthContext Login     │
│                         │
│  Store: userData.name   │  ❌ Stores null!
│         (= null)        │
└────────┬────────────────┘
         │
         │ user.name = null
         │
         ▼
┌─────────────────────────┐
│  Edit Profile Screen    │
│                         │
│  Read: user.name        │  ❌ Empty string!
│  Show: ""               │
└─────────────────────────┘
```

## After Fix (Working Flow)

```
┌─────────────────────────────────────────┐
│           API Login Response            │
│                                         │
│  { user: {                              │
│      name: null,                        │
│      client_details: {                  │
│        name: "John Doe",                │
│        email: "john@example.com",       │
│        phone: "+1234567890",            │
│        company_name: "Acme Inc",        │
│        ...                              │
│      }                                  │
│    }                                    │
│  }                                      │
└────────────┬────────────────────────────┘
             │
             │ Extract data from nested client_details
             │
             ▼
┌──────────────────────────────────────────┐
│      AuthContext Login (FIXED)           │
│                                          │
│  const clientDetails = userData          │
│         .client_details || {};           │
│                                          │
│  Store to user object:                   │
│    name: userData.name ||                │
│          clientDetails.name ||           │  ✅ "John Doe"
│          ''                              │
│                                          │
│    email: userData.email ||              │
│           clientDetails.email ||         │  ✅ "john@example.com"
│           ''                             │
│                                          │
│    phone: userData.phone ||              │
│           clientDetails.phone ||         │  ✅ "+1234567890"
│           clientDetails.mobile ||        │
│           ''                             │
│                                          │
│  ALSO Store full nested:                 │
│    client_details: userData              │  ✅ Keep original
│                   .client_details        │
└────────────┬─────────────────────────────┘
             │
             │ Store to AsyncStorage
             │
             ▼
┌──────────────────────────────────────────┐
│         AsyncStorage                     │
│                                          │
│  user_data: {                            │
│    id: 123,                              │
│    name: "John Doe",           ← ✅      │
│    email: "john@example.com",  ← ✅      │
│    phone: "+1234567890",       ← ✅      │
│    company_name: "Acme Inc",   ← ✅      │
│    client_details: {           ← ✅      │
│      name: "John Doe",                   │
│      email: "john@example.com",          │
│      ...all other fields                 │
│    }                                     │
│  }                                       │
└────────────┬─────────────────────────────┘
             │
             │ Load on app start
             │
             ▼
┌──────────────────────────────────────────┐
│         AuthContext.user                 │
│                                          │
│  Available in entire app:                │
│    user.name = "John Doe"      ✅        │
│    user.email = "..."          ✅        │
│    user.client_details = {...} ✅        │
└────────────┬─────────────────────────────┘
             │
             │ User opens Edit Profile
             │
             ▼
┌──────────────────────────────────────────┐
│    Edit Profile Screen (FIXED)           │
│                                          │
│  Multiple fallback sources:              │
│                                          │
│  const details = user.client_details ||  │
│                  user.details            │
│                    ?.client_details ||   │
│                  user;                   │
│                                          │
│  name: details.name ||         ✅        │
│        user.name ||                      │
│        ''                                │
│        = "John Doe"                      │
│                                          │
│  phone: details.phone ||       ✅        │
│         details.mobile ||                │
│         user.phone ||                    │
│         user.mobile ||                   │
│         ''                               │
│         = "+1234567890"                  │
│                                          │
│  Display in form fields:       ✅        │
│    Name: [John Doe          ]            │
│    Email: [john@example.com ]            │
│    Phone: [+1234567890      ]            │
│    Company: [Acme Inc       ]            │
│    ...                                   │
└──────────────────────────────────────────┘
```

## Data Priority Chain

Each field tries multiple sources in priority order:

```
name:
  1. client_details.name          (Primary source)
  2. user.name                    (Extracted during login)
  3. ''                           (Default)

email:
  1. client_details.email         (Primary source)
  2. user.email                   (Extracted during login)
  3. ''                           (Default)

phone:
  1. client_details.phone         (Primary source)
  2. client_details.mobile        (Alternative field name)
  3. user.phone                   (Extracted during login)
  4. user.mobile                  (Alternative)
  5. ''                           (Default)

country_id:
  1. client_details.country_id    (Primary source)
  2. client_details.country.id    (Nested object)
  3. user.country_id              (Extracted during login)
  4. user.country.id              (Nested object)
  5. 0                            (Default)
```

## Key Benefits of This Approach

1. **Resilient**: Multiple fallback sources ensure data is found
2. **Fast**: No API call needed - data already in memory
3. **Offline-capable**: Works without internet connection
4. **DRY**: Data extracted once during login, reused everywhere
5. **Debuggable**: Console logs show exactly where data comes from

## Comparison: Client vs Inspector

```
┌───────────────────────────────────────────────────────────┐
│                    Data Loading Strategy                  │
├──────────────────────┬────────────────────────────────────┤
│      CLIENT          │         INSPECTOR                  │
├──────────────────────┼────────────────────────────────────┤
│ ✅ Load from memory  │ 📡 Fetch from API                  │
│ ✅ Instant prefill   │ ⏳ Wait for API response           │
│ ✅ Works offline     │ ❌ Requires internet               │
│ ✅ No API call       │ 🔄 Multiple endpoint tries         │
│ ✅ Data from login   │ 📊 Fetch latest data               │
└──────────────────────┴────────────────────────────────────┘
```

## Update Flow (When User Saves)

```
┌─────────────────────────┐
│  User clicks "Save"     │
└────────┬────────────────┘
         │
         │ FormData with all fields
         │
         ▼
┌─────────────────────────────────┐
│  POST /edit-client-data         │
│                                 │
│  FormData:                      │
│    - name                       │
│    - phone                      │
│    - company_name               │
│    - bio, city, industry, etc.  │
│    - avatar (if changed)        │
└────────┬────────────────────────┘
         │
         │ { success: true }
         │
         ▼
┌─────────────────────────────────┐
│  Update AuthContext             │
│                                 │
│  updateUser({                   │
│    name,                        │
│    phone,                       │
│    company_name,                │
│    country_id,                  │
│    client_details: {            │  ✅ Update nested too
│      ...existing,               │
│      ...newData                 │
│    }                            │
│  })                             │
└────────┬────────────────────────┘
         │
         │ Save to AsyncStorage
         │
         ▼
┌─────────────────────────────────┐
│  AsyncStorage Updated           │
│                                 │
│  Next time Edit Profile opens   │
│  → Shows updated data ✅        │
└─────────────────────────────────┘
```
