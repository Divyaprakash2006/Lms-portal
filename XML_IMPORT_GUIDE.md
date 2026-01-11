# XML Import Functionality Documentation

## Overview
The system supports importing questions from Moodle XML format. This allows you to easily migrate questions from Moodle or create questions in XML format and import them.

## Supported Question Types

### 1. Multiple Choice Questions (MCQ)
- Type: `multichoice`
- Supports multiple options
- One correct answer (marked with fraction="100")

### 2. True/False Questions
- Type: `truefalse`
- Two options: True or False
- One correct answer

### 3. Short Answer Questions
- Type: `shortanswer`
- Free text answer
- First answer in XML is considered correct

## XML File Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="multichoice">
    <name>
      <text>Question Name</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[<p>Your question text here</p>]]></text>
    </questiontext>
    <defaultgrade>1</defaultgrade>
    <answer fraction="0" format="plain_text">
      <text>Wrong Answer 1</text>
    </answer>
    <answer fraction="100" format="plain_text">
      <text>Correct Answer</text>
    </answer>
    <answer fraction="0" format="plain_text">
      <text>Wrong Answer 2</text>
    </answer>
  </question>
</quiz>
```

## How to Use

### Backend API Endpoints

#### 1. Import Questions
**POST** `/api/questions/import/:examId`

- Upload XML file with questions
- Questions are saved to database
- Returns import results with success/failure counts

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: xmlFile (file upload)

**Response:**
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

#### 2. Preview Questions
**POST** `/api/questions/import-preview/:examId`

- Preview questions without saving
- Useful for validating XML format
- Returns parsed questions

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 6,
    "questions": [...]
  }
}
```

#### 3. Get Exam Questions
**GET** `/api/exams/:examId/questions`

- Retrieves all questions for an exam
- Returns array of questions

### Frontend Usage

1. **Create an Exam**
   - Navigate to "Create Exam" page
   - Fill in exam details
   - Submit to create exam

2. **Import Questions**
   - Go to "Exams" list
   - Click "View Details" on an exam
   - Click "+ Import XML" button
   - Select your XML file
   - Click "Preview Questions" to review (optional)
   - Click "Import Questions" to save to database

3. **View Questions**
   - After import, questions appear on the exam details page
   - Each question shows:
     - Question text
     - Question type badge
     - Marks
     - Options (for MCQ and True/False)

## Question Schema

Questions are stored in MongoDB with the following schema:

```javascript
{
  examId: ObjectId,        // Reference to exam
  questionText: String,    // The question text
  questionType: String,    // 'mcq', 'true-false', or 'short-answer'
  options: [String],       // Array of options (empty for short-answer)
  correctAnswer: String,   // The correct answer
  marks: Number           // Points for this question
}
```

## Features

### HTML Cleaning
- Automatically removes HTML tags from question text
- Converts HTML entities (&amp;, &lt;, &gt;, etc.)
- Preserves important content

### Error Handling
- Validates XML format
- Skips category questions
- Reports errors for individual questions
- Continues importing valid questions even if some fail

### Import Results
- Total questions found
- Successfully imported count
- Failed imports count
- Detailed error messages for failures

## Testing

A sample XML file is provided: `sample-questions.xml`

This file contains:
- 3 Multiple Choice Questions
- 2 True/False Questions
- 1 Short Answer Question

To test:
1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm start`
3. Create an exam
4. Import the sample XML file
5. View the imported questions

## API Service Methods (Frontend)

```javascript
// Import questions from XML
importQuestionsFromXML(examId, file)

// Preview questions before import
previewQuestionsFromXML(examId, file)

// Get questions for an exam
getExamQuestions(examId)

// Delete a question
deleteQuestion(questionId)
```

## File Structure

### Backend
```
backend/
├── models/
│   ├── Exam.js           # Exam model schema
│   └── Question.js       # Question model schema
├── routes/
│   ├── exam.js          # Exam routes
│   └── question.js      # Question routes including XML import
├── services/
│   └── MoodleImportService.js  # XML parsing logic
└── server.js            # Main server file
```

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   └── ImportQuestions.js  # XML upload component
│   ├── pages/
│   │   ├── ExamDetails.js     # View exam and questions
│   │   └── ExamList.js        # List all exams
│   └── services/
│       └── api.js             # API service methods
```

## Limitations

1. File size limit: 5MB
2. Only XML files accepted
3. Supported question types: multichoice, truefalse, shortanswer
4. Category questions are skipped
5. For short answer questions, only the first answer is used

## Troubleshooting

### Import Fails
- Check XML file format
- Ensure file is valid XML
- Check question types are supported
- Review error messages in response

### Questions Not Showing
- Verify import was successful
- Check browser console for errors
- Ensure correct examId is used
- Refresh the page

### Preview Not Working
- Check file format
- Ensure XML is well-formed
- Check browser console for parsing errors
