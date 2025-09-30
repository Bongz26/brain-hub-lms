import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../Layout/Layout';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  grade: number;
  totalQuestions: number;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  completions: number;
}

export const InteractiveQuiz: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (activeQuiz && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeQuiz && timeLeft === 0 && !showResults) {
      submitQuiz();
    }
  }, [timeLeft, activeQuiz]);

  const loadQuizzes = () => {
    const mockQuizzes: Quiz[] = [
      {
        id: '1',
        title: 'Algebra Basics Quiz',
        subject: 'Mathematics',
        grade: 10,
        totalQuestions: 10,
        duration: 15,
        difficulty: 'easy',
        completions: 45,
        questions: [
          {
            id: 'q1',
            question: 'What is 2x + 4 = 10? Solve for x.',
            options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
            correctAnswer: 1,
            explanation: 'Subtract 4 from both sides: 2x = 6, then divide by 2: x = 3'
          },
          {
            id: 'q2',
            question: 'Simplify: 3(x + 2) - 2x',
            options: ['x + 6', 'x + 2', '5x + 6', '3x + 2'],
            correctAnswer: 0,
            explanation: 'Distribute: 3x + 6 - 2x = x + 6'
          },
          {
            id: 'q3',
            question: 'What is the slope of the line y = 2x + 5?',
            options: ['2', '5', '2x', '7'],
            correctAnswer: 0,
            explanation: 'In y = mx + b, m is the slope. So the slope is 2.'
          }
        ]
      },
      {
        id: '2',
        title: 'Physical Sciences - Chemistry',
        subject: 'Physical Sciences',
        grade: 11,
        totalQuestions: 8,
        duration: 12,
        difficulty: 'medium',
        completions: 32,
        questions: [
          {
            id: 'q1',
            question: 'What is the chemical symbol for water?',
            options: ['H2O', 'CO2', 'O2', 'H2O2'],
            correctAnswer: 0,
            explanation: 'Water is composed of 2 hydrogen atoms and 1 oxygen atom: H2O'
          },
          {
            id: 'q2',
            question: 'Which of these is a noble gas?',
            options: ['Oxygen', 'Nitrogen', 'Helium', 'Hydrogen'],
            correctAnswer: 2,
            explanation: 'Helium is a noble gas found in Group 18 of the periodic table'
          }
        ]
      },
      {
        id: '3',
        title: 'English Grammar Test',
        subject: 'English',
        grade: 9,
        totalQuestions: 12,
        duration: 20,
        difficulty: 'medium',
        completions: 67,
        questions: [
          {
            id: 'q1',
            question: 'Which sentence is grammatically correct?',
            options: [
              'He don\'t like apples',
              'He doesn\'t like apples',
              'He don\'t likes apples',
              'He doesn\'t likes apples'
            ],
            correctAnswer: 1,
            explanation: 'For third person singular (he/she/it), we use "doesn\'t", not "don\'t"'
          }
        ]
      }
    ];

    setQuizzes(mockQuizzes);
    setLoading(false);
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setShowResults(false);
    setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (activeQuiz && currentQuestion < activeQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) correct++;
    });
    return Math.round((correct / activeQuiz.questions.length) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  // Quiz Taking View
  if (activeQuiz && !showResults) {
    const question = activeQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / activeQuiz.questions.length) * 100;

    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Quiz Header */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{activeQuiz.title}</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time Remaining</p>
                  <p className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Question {currentQuestion + 1} of {activeQuiz.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h3>
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedAnswers[currentQuestion] === idx
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === idx
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-400'
                      }`}>
                        {selectedAnswers[currentQuestion] === idx && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                {currentQuestion < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={submitQuiz}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg font-medium"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Results View
  if (activeQuiz && showResults) {
    const score = calculateScore();
    const correctCount = activeQuiz.questions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length;

    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {/* Results Card */}
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-8 text-center mb-8">
              <div className={`text-8xl mb-4 ${score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}`}>
                {score >= 80 ? '🎉' : score >= 60 ? '👍' : '📚'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 mb-6">Here are your results:</p>
              
              <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-6">
                <p className="text-6xl font-bold mb-2">{score}%</p>
                <p className="text-xl">{correctCount} out of {activeQuiz.questions.length} correct</p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setShowResults(false);
                  }}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back to Quizzes
                </button>
                <button
                  onClick={() => startQuiz(activeQuiz)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Retake Quiz
                </button>
              </div>
            </div>

            {/* Answer Review */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Review Your Answers</h3>
              {activeQuiz.questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                const userAnswer = selectedAnswers[idx];

                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-lg shadow-md border-l-4 p-6 ${
                      isCorrect ? 'border-green-600' : 'border-red-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Question {idx + 1}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{q.question}</p>
                    <div className="space-y-2 mb-4">
                      {q.options.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-3 rounded border ${
                            optIdx === q.correctAnswer
                              ? 'border-green-600 bg-green-50'
                              : optIdx === userAnswer && !isCorrect
                              ? 'border-red-600 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <span className="font-medium">{option}</span>
                          {optIdx === q.correctAnswer && <span className="ml-2 text-green-600">✓ Correct Answer</span>}
                          {optIdx === userAnswer && !isCorrect && <span className="ml-2 text-red-600">✗ Your Answer</span>}
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 rounded p-4">
                      <p className="text-sm text-gray-700">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz Selection View
  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Interactive Quizzes</h1>
          <p className="text-gray-600">Test your knowledge and track your progress</p>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Quiz Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{quiz.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty.toUpperCase()}
                  </span>
                </div>
                <p className="text-blue-100">{quiz.subject} • Grade {quiz.grade}</p>
              </div>

              {/* Quiz Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Questions</p>
                    <p className="font-medium text-gray-900">{quiz.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{quiz.duration} min</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>✓ {quiz.completions} students completed</p>
                </div>

                <button
                  onClick={() => startQuiz(quiz)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">How Quizzes Help You Learn</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">🎯</div>
              <h4 className="font-semibold text-gray-900">Practice</h4>
              <p className="text-sm text-gray-600">Reinforce concepts</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900">Track Progress</h4>
              <p className="text-sm text-gray-600">See improvement</p>
            </div>
            <div>
              <div className="text-4xl mb-2">💡</div>
              <h4 className="font-semibold text-gray-900">Learn from Mistakes</h4>
              <p className="text-sm text-gray-600">Detailed explanations</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🏆</div>
              <h4 className="font-semibold text-gray-900">Achieve Goals</h4>
              <p className="text-sm text-gray-600">Build confidence</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InteractiveQuiz;
