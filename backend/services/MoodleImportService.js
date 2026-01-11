const xml2js = require('xml2js');
const Question = require('../models/Question');

class MoodleImportService {
  /**
   * Parse Moodle XML format and import questions
   * @param {String} xmlContent - The XML content from Moodle file
   * @param {String} examId - The exam ID to associate questions with
   * @returns {Object} Import results with success/failure counts
   */
  async importQuestionsFromXML(xmlContent, examId) {
    try {
      // Try multiple parser configurations to handle different XML formats
      let result;
      
      try {
        // First attempt: Standard Moodle format
        const parser = new xml2js.Parser({ 
          explicitArray: false, 
          ignoreAttrs: false,
          mergeAttrs: false,
          explicitChildren: false
        });
        result = await parser.parseStringPromise(xmlContent);
      } catch (parseError) {
        console.log('⚠️ Standard parse failed, trying alternative format...');
        
        // Second attempt: Alternative format
        const parser2 = new xml2js.Parser({ 
          explicitArray: false, 
          ignoreAttrs: true,
          mergeAttrs: true,
          attrkey: 'attributes'
        });
        result = await parser2.parseStringPromise(xmlContent);
      }
      
      // Handle different root elements
      const questions = result.quiz?.question || result.questions?.question || result.question;
      
      if (!questions) {
        throw new Error('No questions found in XML. Please ensure the XML file is in Moodle format.');
      }
      
      const questionArray = Array.isArray(questions) ? questions : [questions];
      
      console.log(`📊 Found ${questionArray.length} questions in XML`);
      
      const importResults = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
      };

      for (const moodleQuestion of questionArray) {
        try {
          // Skip category questions
          const qType = moodleQuestion.$?.type || moodleQuestion.type || moodleQuestion['@_type'];
          if (qType === 'category') {
            console.log('⏭️ Skipping category question');
            continue;
          }
          
          importResults.total++;
          
          const questionData = this.parseMoodleQuestion(moodleQuestion, examId);
          if (questionData) {
            await Question.create(questionData);
            importResults.success++;
            console.log(`✅ Imported question ${importResults.success}: ${questionData.questionText.substring(0, 50)}...`);
          }
        } catch (error) {
          importResults.failed++;
          const errorMsg = {
            question: moodleQuestion.name?.text || moodleQuestion.questiontext?.text || 'Unknown',
            error: error.message
          };
          importResults.errors.push(errorMsg);
          console.error(`❌ Failed to import question:`, errorMsg);
        }
      }

      return importResults;
    } catch (error) {
      console.error('❌ XML Parse Error:', error.message);
      throw new Error(`Failed to parse XML: ${error.message}`);
    }
  }

  /**
   * Parse individual Moodle question and convert to our format
   * @param {Object} moodleQuestion - Parsed Moodle question object
   * @param {String} examId - The exam ID
   * @returns {Object} Question data in our schema format
   */
  parseMoodleQuestion(moodleQuestion, examId) {
    // Handle different XML attribute formats
    const questionType = moodleQuestion.$?.type || moodleQuestion.type || moodleQuestion['@_type'];
    
    // Skip category questions
    if (questionType === 'category') {
      return null;
    }

    // Validate question type exists
    if (!questionType) {
      throw new Error('Question type is missing or undefined');
    }

    // Extract question text with multiple fallback options
    let questionText = '';
    if (moodleQuestion.questiontext) {
      questionText = this.extractText(moodleQuestion.questiontext);
    } else if (moodleQuestion.text) {
      questionText = this.extractText(moodleQuestion.text);
    } else if (moodleQuestion.name) {
      questionText = this.extractText(moodleQuestion.name);
    }

    // Extract marks/grade with fallbacks
    const marks = parseFloat(moodleQuestion.defaultgrade || moodleQuestion.grade || moodleQuestion.mark || 1);

    let questionData = {
      examId,
      questionText: questionText || 'Question text not found',
      marks
    };

    // Normalize question type to lowercase for comparison
    const normalizedType = questionType.toLowerCase().trim();

    // Handle different question types with aliases
    if (normalizedType.includes('multichoice') || normalizedType.includes('multiple') || normalizedType === 'mcq') {
      questionData = {
        ...questionData,
        ...this.parseMultipleChoice(moodleQuestion)
      };
    } else if (normalizedType.includes('truefalse') || normalizedType.includes('true-false') || normalizedType === 'boolean') {
      questionData = {
        ...questionData,
        ...this.parseTrueFalse(moodleQuestion)
      };
    } else if (normalizedType.includes('shortanswer') || normalizedType.includes('short') || normalizedType === 'text') {
      questionData = {
        ...questionData,
        ...this.parseShortAnswer(moodleQuestion)
      };
    } else if (normalizedType.includes('essay') || normalizedType === 'longtext') {
      questionData = {
        ...questionData,
        ...this.parseShortAnswer(moodleQuestion)
      };
    } else if (normalizedType.includes('matching')) {
      // Convert matching to multiple choice
      questionData = {
        ...questionData,
        ...this.parseMatching(moodleQuestion)
      };
    } else if (normalizedType.includes('numerical')) {
      questionData = {
        ...questionData,
        ...this.parseNumerical(moodleQuestion)
      };
    } else {
      throw new Error(`Unsupported question type: ${questionType}`);
    }

    return questionData;
  }

  /**
   * Parse multiple choice questions
   */
  parseMultipleChoice(moodleQuestion) {
    let answers = moodleQuestion.answer;
    
    // Handle different answer formats
    if (!answers) {
      answers = moodleQuestion.answers?.answer || [];
    }
    
    // Ensure answers is an array
    if (!Array.isArray(answers)) {
      answers = answers ? [answers] : [];
    }

    if (answers.length === 0) {
      throw new Error('No answers found for multiple choice question');
    }
    
    const options = [];
    let correctAnswer = '';

    answers.forEach((answer, index) => {
      const answerText = this.extractText(answer);
      if (answerText) {
        options.push(answerText);
        
        // Check if this is the correct answer (fraction = 100 or grade = 1)
        const fraction = parseFloat(answer.$?.fraction || answer.fraction || answer.$?.grade || answer.grade || 0);
        if (fraction === 100 || fraction === 1) {
          correctAnswer = answerText;
        }
      }
    });

    // If no correct answer found, use first option
    if (!correctAnswer && options.length > 0) {
      correctAnswer = options[0];
    }

    return {
      questionType: 'mcq',
      options,
      correctAnswer
    };
  }

  /**
   * Parse true/false questions
   */
  parseTrueFalse(moodleQuestion) {
    let answers = moodleQuestion.answer;
    
    if (!answers) {
      answers = moodleQuestion.answers?.answer || [];
    }
    
    if (!Array.isArray(answers)) {
      answers = answers ? [answers] : [];
    }
    
    let correctAnswer = 'True';
    
    answers.forEach(answer => {
      const fraction = parseFloat(answer.$?.fraction || answer.fraction || answer.$?.grade || answer.grade || 0);
      if (fraction === 100 || fraction === 1) {
        const answerText = this.extractText(answer);
        correctAnswer = answerText.toLowerCase().includes('true') ? 'True' : 'False';
      }
    });

    return {
      questionType: 'true-false',
      options: ['True', 'False'],
      correctAnswer
    };
  }

  /**
   * Parse short answer questions
   */
  parseShortAnswer(moodleQuestion) {
    let answers = moodleQuestion.answer;
    
    if (!answers) {
      answers = moodleQuestion.answers?.answer || [];
    }
    
    if (!Array.isArray(answers)) {
      answers = answers ? [answers] : [];
    }

    // For short answer, take the first answer with highest fraction as correct
    let correctAnswer = '';
    let highestFraction = -1;

    answers.forEach(answer => {
      const fraction = parseFloat(answer.$?.fraction || answer.fraction || answer.$?.grade || answer.grade || 0);
      if (fraction > highestFraction) {
        highestFraction = fraction;
        correctAnswer = this.extractText(answer);
      }
    });

    // Fallback to first answer if no correct answer found
    if (!correctAnswer && answers.length > 0) {
      correctAnswer = this.extractText(answers[0]);
    }

    return {
      questionType: 'short-answer',
      options: [],
      correctAnswer: correctAnswer || 'Answer not found'
    };
  }

  /**
   * Parse matching questions (convert to multiple choice)
   */
  parseMatching(moodleQuestion) {
    // Matching questions will be converted to multiple choice format
    const subquestions = Array.isArray(moodleQuestion.subquestion) 
      ? moodleQuestion.subquestion 
      : moodleQuestion.subquestion ? [moodleQuestion.subquestion] : [];
    
    if (subquestions.length > 0) {
      const options = subquestions.map(sq => this.extractText(sq.answer || sq));
      const correctAnswer = options[0] || 'Option A';
      
      return {
        questionType: 'mcq',
        options,
        correctAnswer
      };
    }

    return {
      questionType: 'short-answer',
      options: [],
      correctAnswer: 'Match the items'
    };
  }

  /**
   * Parse numerical questions
   */
  parseNumerical(moodleQuestion) {
    let answers = moodleQuestion.answer;
    
    if (!answers) {
      answers = moodleQuestion.answers?.answer || [];
    }
    
    if (!Array.isArray(answers)) {
      answers = answers ? [answers] : [];
    }

    let correctAnswer = '';
    
    answers.forEach(answer => {
      const fraction = parseFloat(answer.$?.fraction || answer.fraction || 100);
      if (fraction === 100 || fraction === 1) {
        correctAnswer = this.extractText(answer) || answer.text || answer._;
      }
    });

    return {
      questionType: 'short-answer',
      options: [],
      correctAnswer: correctAnswer || '0'
    };
  }

  /**
   * Extract text content from Moodle text object
   * Handles both simple text and CDATA text nodes
   */
  extractText(textObject) {
    if (!textObject) return '';
    
    // Handle simple string
    if (typeof textObject === 'string') {
      return this.cleanHtml(textObject);
    }

    // Handle number
    if (typeof textObject === 'number') {
      return textObject.toString();
    }
    
    // Handle text property (most common in Moodle XML)
    if (textObject.text) {
      if (typeof textObject.text === 'string') {
        return this.cleanHtml(textObject.text);
      }
      // Handle CDATA or nested structure
      if (textObject.text._) {
        return this.cleanHtml(textObject.text._);
      }
      if (typeof textObject.text === 'object') {
        return this.cleanHtml(JSON.stringify(textObject.text));
      }
    }

    // Handle direct _ property (CDATA)
    if (textObject._) {
      return this.cleanHtml(textObject._);
    }

    // Handle name property
    if (textObject.name) {
      return this.extractText(textObject.name);
    }

    // Handle answertext property
    if (textObject.answertext) {
      return this.extractText(textObject.answertext);
    }

    // Last resort: stringify the object
    if (typeof textObject === 'object') {
      // Try to find text in common properties
      const textProps = ['value', 'content', 'answer', '#text'];
      for (const prop of textProps) {
        if (textObject[prop]) {
          return this.cleanHtml(textObject[prop].toString());
        }
      }
    }
    
    return '';
  }

  /**
   * Clean HTML tags from text
   * Basic implementation - can be enhanced with a proper HTML parser
   */
  cleanHtml(html) {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

module.exports = new MoodleImportService();
