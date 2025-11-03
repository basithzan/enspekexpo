# Feature Guide: New Inspector Functions in Job Details Screen

## 🎯 Overview

This guide explains the new features added to the Job Details screen (`app/(stack)/job/[id].tsx`) for inspectors who have accepted bids.

---

## 📋 New Features

### 1. **Download Assignment Instructions** 📥

**When Available:** After your bid is accepted and the client uploads assignment instructions.

**How to Use:**
1. Navigate to the job details page
2. Scroll to the "Download Assignment Instructions" section
3. Tap the red download button
4. The assignment instruction document opens in your browser

**What It Does:**
- Downloads the client's assignment instructions file
- Opens PDFs, images, or documents in your default browser
- Required reading before starting the inspection

---

### 2. **Upload Inspection Documents** 📤

**When Available:** After assignment instructions are provided.

**How to Use:**

#### A. Upload Inspection Document:
1. Scroll to "Upload Inspection Data" section
2. Tap "Choose Inspection Document"
3. Select file from your device (images, PDFs, Word docs supported)
4. Selected file name appears below button
5. To remove: tap the trash icon

#### B. Upload Inspection Report:
1. In the same section, find "Inspection Report"
2. Tap "Choose Inspection Report"
3. Select your flash report file
4. File name appears below
5. To remove: tap the trash icon

#### C. Add Report Note:
1. Scroll to "Report Note" field
2. Type your inspection notes
3. Can be multiple lines

#### D. Submit:
1. After adding files/notes, tap "SUBMIT INSPECTION"
2. Wait for success message
3. Files appear in "Uploaded" sections below

**Important Notes:**
- You can upload documents or reports or both
- You can also just add a note without files
- At least one field (document, report, or note) is required
- Button changes to "UPDATE INSPECTION" if you've already uploaded before

---

### 3. **View Uploaded Documents** 📄

**Where:** Two sections show your uploads:
- "Uploaded Inspection Documents"
- "Uploaded Inspection Reports"

**Features:**
- See all your uploaded files
- View upload date for each file
- Download any previous upload
- Empty state message if no uploads yet

**How to Download:**
1. Find the document in the list
2. Tap the blue "Download" button
3. File opens in your browser

---

### 4. **View Inspection Notes** 📝

**Where:** "Inspection Report Notes" section at the bottom

**What It Shows:**
- Read-only view of inspection notes
- Shows notes from the master log
- Displays "Notes not added" if empty

---

### 5. **Confirm to Proceed** ✅

**When Available:** Immediately after your bid is accepted (before starting work).

**How to Use:**
1. When bid is accepted, look for "Confirm to Proceed" button
2. Tap the red button
3. Confirms you're ready to start the job
4. Can only be done once per job

---

## 📱 User Interface Locations

### Top Sections (For Accepted Bids):
```
├── Download Assignment Instructions (NEW)
├── Input Documents (existing)
├── Video Conferencing (existing)
└── Check-ins (existing)
```

### Middle Sections (Upload Area):
```
├── Upload Inspection Data (NEW)
│   ├── Inspection Document picker
│   ├── Inspection Report picker
│   ├── Report Note input
│   └── Submit/Update button
```

### Bottom Sections (View Uploads):
```
├── Uploaded Inspection Documents (NEW)
├── Uploaded Inspection Reports (NEW)
└── Inspection Report Notes (NEW)
```

---

## 💡 Tips & Best Practices

### File Selection:
✅ **Supported file types:**
- Images: JPG, PNG, etc.
- PDFs
- Word documents (.doc, .docx)

✅ **Best practices:**
- Name files clearly before uploading
- Take clear photos if uploading images
- Keep file sizes reasonable (under 10MB recommended)
- Review files before uploading

### Upload Process:
1. **Always download assignment instructions first**
2. Complete the inspection as per instructions
3. Prepare your documents and reports
4. Upload inspection document (photos, evidence)
5. Upload flash report (your findings)
6. Add detailed notes
7. Submit all together

### Notes:
- Be detailed in your report notes
- Include any issues or concerns
- Document any deviations from plan
- Note weather/environmental conditions
- Record any client communications

---

## 🚨 Troubleshooting

### **File Won't Upload?**
- Check file size (very large files may fail)
- Ensure you have internet connection
- Try a different file format
- Check file isn't corrupted

### **Download Button Not Working?**
- Ensure you have internet connection
- Check browser permissions
- Try again after a few seconds
- Contact support if persists

### **Can't See Upload Sections?**
- These only appear for **accepted bids**
- Assignment instructions must be uploaded by client first
- Check your bid status at top of screen

### **Submit Button Disabled?**
- Must select at least one: document, report, or note
- Check that files are properly selected
- Look for file names appearing below picker buttons

---

## 📞 Need Help?

If you encounter issues:
1. Check your internet connection
2. Try refreshing the page
3. Log out and log back in
4. Contact support with job ID and error details

---

## 🔄 Workflow Summary

### Complete Inspection Workflow:
1. ✅ Receive bid acceptance notification
2. ✅ Open job details
3. ✅ Tap "Confirm to Proceed" (if available)
4. ✅ Download assignment instructions
5. ✅ Review instructions carefully
6. ✅ Perform on-site inspection
7. ✅ Use "Check-in" feature when arriving
8. ✅ Complete inspection as per instructions
9. ✅ Prepare inspection documents
10. ✅ Write flash report
11. ✅ Upload both documents + notes
12. ✅ Review uploaded files
13. ✅ Wait for client review

---

## 🎨 Visual Reference

### Upload Section Layout:
```
┌─────────────────────────────────────┐
│ Upload Inspection Data              │
├─────────────────────────────────────┤
│ Inspection Document                 │
│ [file.pdf]                [🗑️]     │
│ [Choose Inspection Document]        │
├─────────────────────────────────────┤
│ Inspection Report                   │
│ [report.pdf]              [🗑️]     │
│ [Choose Inspection Report]          │
├─────────────────────────────────────┤
│ Report Note                         │
│ ┌─────────────────────────────────┐ │
│ │ Enter report note...            │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│     [SUBMIT INSPECTION]             │
└─────────────────────────────────────┘
```

### Uploaded Documents Display:
```
┌─────────────────────────────────────┐
│ Uploaded Inspection Documents       │
├─────────────────────────────────────┤
│ 1) Document                         │
│ Upload Date: Jan 15, 2025           │
│                        [Download] 📥 │
├─────────────────────────────────────┤
│ 2) Document                         │
│ Upload Date: Jan 16, 2025           │
│                        [Download] 📥 │
└─────────────────────────────────────┘
```

---

## ✨ Key Benefits

- **Streamlined workflow** - Upload everything in one place
- **Track history** - See all your uploads with dates
- **Easy access** - Download any file anytime
- **Clear communication** - Add notes to clarify findings
- **Professional** - Organized document management

---

**Version:** 1.0  
**Last Updated:** 2025  
**For:** Inspector Mobile App (React Native)
