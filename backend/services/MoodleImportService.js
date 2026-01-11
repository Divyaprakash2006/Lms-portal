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
      const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });
      const result = await parser.parseStringPromise(xmlContent);
      
      const questions = result.quiz.question;
      const questionArray = Array.isArray(questions) ? questions : [questions];
      
      const importResults = {
        total: 0,
        success: 0,
        failed: 0,
        errors: []
      };

      for (const moodleQuestion of questionArray) {
        try {
          // Skip category questions
          if (moodleQuestion.$.type === 'category') {
            continue;
          }
          
          importResults.total++;
          
          const questionData = this.parseMoodleQuestion(moodleQuestion, examId);
          if (questionData) {
            await Question.create(questionData);
            importResults.success++;
          }
        } catch (error) {
          importResults.failed++;
          importResults.errors.push({
            question: moodleQuestion.name?.text || 'Unknown',
            error: error.message
          });
        }
      }

      return importResults;
    } catch (error) {
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
    const questionType = moodleQuestion.$.type;
    
    // Skip category questions
    if (questionType === 'category') {
      return null;
    }

    let questionData = {
      examId,
      questionText: this.extractText(moodleQuestion.questiontext),
      marks: parseFloat(moodleQuestion.defaultgrade) || 1
    };

    switch (questionType) {
      case 'multichoice':
        questionData = {
          ...questionData,
          ...this.parseMultipleChoice(moodleQuestion)
        };
        break;
      
      case 'truefalse':
        questionData = {
          ...questionData,
          ...this.parseTrueFalse(moodleQuestion)
        };
        break;
      
      case 'shortanswer':
      case 'essay':
        questionData = {
          ...questionData,
          ...this.parseShortAnswer(moodleQuestion)
        };
        break;
      
      default:
        throw new Error(`Unsupported question type: ${questionType}`);
    }

    return questionData;
  }

  /**
   * Parse multiple choice questions
   */
  parseMultipleChoice(moodleQuestion) {
    const answers = Array.isArray(moodleQuestion.answer) 
      ? moodleQuestion.answer 
      : [moodleQuestion.answer];
    
    const options = [];
    let correctAnswer = '';

    answers.forEach((answer, index) => {
      const answerText = this.extractText(answer);
      options.push(answerText);
      
      // Check if this is the correct answer (fraction = 100)
      const fraction = parseFloat(answer.$.fraction);
      if (fraction === 100) {
        correctAnswer = answerText;
      }
    });

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
    const answers = Array.isArray(moodleQuestion.answer) 
      ? moodleQuestion.answer 
      : [moodleQuestion.answer];
    
    let correctAnswer = '';
    
    answers.forEach(answer => {
      const fraction = parseFloat(answer.$.fraction);
      if (fraction === 100) {
        correctAnswer = this.extractText(answer);
      }
    });

    return {
      questionType: 'true-false',
      options: ['True', 'False'],
      correctAnswer: correctAnswer.toLowerCase() === 'true' ? 'True' : 'False'
    };
  }

  /**
   * Parse short answer questions
   */
  parseShortAnswer(moodleQuestion) {
    const answers = Array.isArray(moodleQuestion.answer) 
      ? moodleQuestion.answer 
      : [moodleQuestion.answer];
    
    // For short answer, take the first answer as correct
    const correctAnswer = this.extractText(answers[0]);

    return {
      questionType: 'short-answer',
      options: [],
      correctAnswer
    };
  }

  /**
   * Extract text content from Moodle text object
   * Handles both simple text and CDATA text nodes
   */
  extractText(textObject) {
    if (!textObject) return '';
    
    if (typeof textObject === 'string') {
      return this.cleanHtml(textObject);
    }
    
    if (textObject.text) {
      const text = typeof textObject.text === 'string' 
        ? textObject.text 
        : textObject.text._;
      return this.cleanHtml(text || '');
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
