# Quick Start Guide - XML Import Feature

## 🚀 Getting Started

### Prerequisites
- MongoDB running on localhost:27017
- Node.js and npm installed
- Backend and Frontend packages installed

### Start the Application

#### Terminal 1 - Backend
```bash
cd backend
npm start
```
Server will run on http://localhost:5000

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Application will open at http://localhost:3000

## 📝 Step-by-Step Usage

### 1. Create an Exam

1. Register/Login to the system
2. Navigate to **"Create Exam"** from the navbar
3. Fill in the exam details:
   - Title (e.g., "JavaScript Basics")
   - Description
   - Subject (e.g., "Computer Science")
   - Duration in minutes (e.g., 60)
   - Total Marks (e.g., 10)
   - Passing Marks (e.g., 5)
   - Start Time
   - End Time
4. Click **"Create Exam"**

### 2. Import Questions from XML

1. Go to **"Exams"** page
2. Find your exam and click **"View Details"**
3. Click the **"+ Import XML"** button
4. Click **"Choose File"** and select `sample-questions.xml` (or your own XML file)
5. (Optional) Click **"Preview Questions"** to see what will be imported
6. Click **"Import Questions"** to save them to the database
7. Wait for the success message showing how many questions were imported

### 3. View Imported Questions

After import, questions will automatically appear on the exam details page showing:
- Question number and text
- Question type badge (mcq, true-false, short-answer)
- Marks
- Options (for MCQ and True/False questions)

## 📄 XML File Format

Use the provided `sample-questions.xml` as a template. Here's the basic structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="multichoice">
    <name>
      <text>Question Name</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[<p>What is 2+2?</p>]]></text>
    </questiontext>
    <defaultgrade>1</defaultgrade>
    <answer fraction="0" format="plain_text">
      <text>3</text>
    </answer>
    <answer fraction="100" format="plain_text">
      <text>4</text>
    </answer>
    <answer fraction="0" format="plain_text">
      <text>5</text>
    </answer>
  </question>
</quiz>
```

### Important Notes:
- `fraction="100"` marks the correct answer
- `defaultgrade` sets the question marks
- Supported types: `multichoice`, `truefalse`, `shortanswer`
- HTML in question text is automatically cleaned

## ✅ Verify Everything Works

### Backend Check
```bash
curl http://localhost:5000/
```
Should return:
```json
{
  "message": "Online Examination System API",
  "status": "Running",
  "version": "1.0.0"
}
```

### Database Check
```bash
# In MongoDB shell or Compass
use examination_system
db.questions.find().pretty()
```

## 🎯 Sample Questions Included

The `sample-questions.xml` file contains:
1. **JavaScript Data Types** (MCQ, 1 mark)
2. **JavaScript Hoisting** (True/False, 1 mark)
3. **React Hooks** (MCQ, 2 marks)
4. **HTTP Methods** (Short Answer, 1 mark)
5. **Database Normalization** (MCQ, 2 marks)
6. **REST API** (True/False, 1 mark)

Total: 6 questions, 8 marks

## 🔧 Troubleshooting

### Error: "Failed to parse XML"
- Check XML file is well-formed
- Ensure proper encoding (UTF-8)
- Validate XML structure

### Questions Not Showing
- Refresh the page
- Check browser console (F12)
- Verify import was successful
- Check correct examId is used

### Import Button Disabled
- Make sure you selected an XML file
- Only .xml files are accepted
- Check file size is under 5MB

### Server Connection Error
- Ensure backend is running on port 5000
- Check MongoDB is running
- Verify no firewall blocking connections

## 🌐 API Endpoints Reference

### Import Questions
```bash
POST http://localhost:5000/api/questions/import/:examId
Content-Type: multipart/form-data
Body: xmlFile=<your-file.xml>
```

### Preview Questions
```bash
POST http://localhost:5000/api/questions/import-preview/:examId
Content-Type: multipart/form-data
Body: xmlFile=<your-file.xml>
```

### Get Questions
```bash
GET http://localhost:5000/api/exams/:examId/questions
```

## 📊 Expected Response Format

### Successful Import
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "total": 6,
    "success": 6,
    "failed": 0,
    "errors": []
  }
}
```

### With Errors
```json
{
  "success": true,
  "message": "Import completed",
  "data": {
    "total": 6,
    "success": 5,
    "failed": 1,
    "errors": [
      {
        "question": "Invalid Question",
        "error": "Unsupported question type: essay"
      }
    ]
  }
}
```

## 📚 Additional Resources

- Full documentation: `XML_IMPORT_GUIDE.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Sample XML file: `sample-questions.xml`

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ File upload shows selected filename in green
2. ✅ Preview shows questions with proper formatting
3. ✅ Import shows success message with count
4. ✅ Questions appear immediately on the exam details page
5. ✅ Question types, marks, and options display correctly

## 💡 Tips

- Start with the sample XML file to test
- Use Preview before Import to catch errors
- Import results show detailed error messages
- Category questions in XML are automatically skipped
- HTML tags are automatically removed from question text
- Each import adds to existing questions (doesn't replace)

---

Need help? Check the console logs in both backend and frontend terminals for detailed error messages.
