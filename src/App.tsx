import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  BrainCircuit,
  TrendingUp,
  RotateCcw,
  BarChart3,
  Lock,
  Globe,
  User,
  UserPlus
} from 'lucide-react';
import { StudentInput, PredictionResult, StudentRecord, ModelType, ActiveView, UserProfile } from './types';
import { predictStudentPerformance } from './mlModel';
import { INITIAL_BENCHMARK_STUDENTS, ScenarioPreset } from './sampleData';
import { Header } from './components/Header';
import { PredictorForm } from './components/PredictorForm';
import { PredictionResultCard } from './components/PredictionResultCard';
import { RosterTable } from './components/RosterTable';
import { HomePage } from './components/HomePage';
import { ScoreAnalysisView } from './components/ScoreAnalysisView';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { ModelInsightsModal } from './components/ModelInsightsModal';
import { BatchUploadModal } from './components/BatchUploadModal';
import { ReportCardModal } from './components/ReportCardModal';
import { AccountProfileModal } from './components/AccountProfileModal';
import { formatDisplayName, saveRegisteredUser } from './utils/authStorage';
import { downloadScoreCardPdf } from './utils/pdfExport';

const STORAGE_KEY = 'student_predictor_roster_v1';

const DEFAULT_INPUT: StudentInput = {
  studentId: 'STU-1002',
  studentName: '',
  attendanceRate: 88.0,
  weeklyStudyHours: 24,
  previousSemesterScore: 78.5,
  sleepHoursPerNight: 7.5,
  extracurricularActivities: 1,
  parentalEducationLevel: 1,
  internetAccessAtHome: 1,
  partTimeJob: 0,
  learningDisability: 0,
};

export default function App() {
  // Theme state: light vs dark (persisted to localStorage, with prefers-color-scheme fallback)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('insighted_theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  // Active View State: 'home' | 'predict' | 'analysis'
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Primary model state: persisted in localStorage (Random Forest default)
  const [activeModel, setActiveModel] = useState<ModelType>(() => {
    try {
      const saved = localStorage.getItem('insighted_active_model');
      if (saved === 'random_forest' || saved === 'linear_regression') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read model from localStorage', e);
    }
    return 'random_forest';
  });

  // Roster state with localStorage persistence
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If cached roster has failing students, keep it; otherwise upgrade with updated benchmark list containing failed students
          const hasFailed = parsed.some((s: StudentRecord) => !s.prediction.passed);
          if (hasFailed) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved students roster', e);
    }
    return INITIAL_BENCHMARK_STUDENTS;
  });

  // Current Form Input State
  const [currentInput, setCurrentInput] = useState<StudentInput>(DEFAULT_INPUT);

  // Real-time synchronization flag (defaults to false so prediction is only shown after submission)
  const [isRealtime, setIsRealtime] = useState<boolean>(false);

  // Submitted student record (null until user explicitly submits all parameters)
  const [submittedRecord, setSubmittedRecord] = useState<StudentRecord | null>(null);

  // Calculated prediction for the active input using primary model
  const currentPrediction = useMemo(() => {
    return predictStudentPerformance(currentInput, activeModel);
  }, [currentInput, activeModel]);

  // If real-time sync is enabled and result is already submitted, keep submittedRecord synchronized
  useEffect(() => {
    if (isRealtime && submittedRecord) {
      setSubmittedRecord((prev) =>
        prev
          ? {
              ...currentInput,
              id: prev.id,
              prediction: predictStudentPerformance(currentInput, activeModel),
              createdAt: prev.createdAt,
            }
          : null
      );
    }
  }, [currentInput, activeModel, isRealtime]);

  // Current User Account State (persisted to localStorage)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('insighted_current_user');
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If stored name is raw email id like "nathanish6", auto-clean to human name
          const cleanName = formatDisplayName(parsed.name, parsed.email);
          if (cleanName !== parsed.name) {
            parsed.name = cleanName;
            try {
              localStorage.setItem('insighted_current_user', JSON.stringify(parsed));
            } catch (e) {
              console.warn(e);
            }
          }
          saveRegisteredUser(parsed);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read user profile from localStorage', e);
    }
    return null;
  });

  // Modals state
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [reportCardStudent, setReportCardStudent] = useState<StudentRecord | null>(null);

  // User notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handlers for Account and Profile management
  const handleSaveUser = useCallback((user: UserProfile) => {
    const cleanUser: UserProfile = {
      ...user,
      name: (user.name || '').trim() || formatDisplayName(user.name, user.email),
    };
    setCurrentUser(cleanUser);
    saveRegisteredUser(cleanUser);
    try {
      localStorage.setItem('insighted_current_user', JSON.stringify(cleanUser));
    } catch (e) {
      console.warn('Failed to save user profile', e);
    }
  }, []);

  // When a user signs in or creates an account: persist, close modal, and open Home page
  const handleAuthSuccess = useCallback((user: UserProfile) => {
    const cleanUser: UserProfile = {
      ...user,
      name: (user.name || '').trim() || formatDisplayName(user.name, user.email),
    };
    setCurrentUser(cleanUser);
    saveRegisteredUser(cleanUser);
    try {
      localStorage.setItem('insighted_current_user', JSON.stringify(cleanUser));
    } catch (e) {
      console.warn('Failed to save user profile', e);
    }
    setActiveView('home');
    setIsAccountModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // When a user signs out: clear storage, close modal, and open Home page
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('insighted_current_user');
    } catch (e) {
      console.warn('Failed to remove user profile', e);
    }
    setActiveView('home');
    setIsAccountModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Persist students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [students]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Sync dark mode class to HTML element and localStorage
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('insighted_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('insighted_theme', 'light');
      }
    } catch (e) {
      console.warn('Could not persist theme preference', e);
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      showToast(next ? 'Dark mode enabled' : 'Light mode enabled');
      return next;
    });
  }, [showToast]);

  // Handler to change active model anytime from anywhere in the UI
  const handleModelChange = useCallback((newModel: ModelType) => {
    setActiveModel(newModel);
    try {
      localStorage.setItem('insighted_active_model', newModel);
    } catch (e) {
      console.warn('Could not save active model preference', e);
    }
    setSubmittedRecord((prev) =>
      prev
        ? {
            ...prev,
            prediction: predictStudentPerformance(prev, newModel),
          }
        : null
    );
    showToast(`Active evaluation model: ${newModel === 'random_forest' ? 'Random Forest (R² 0.80, Depth=5)' : 'Linear Regression (R² 0.77, OLS)'}`);
  }, [showToast]);

  // Handler to re-evaluate entire roster with selected model
  const handleReevaluateRoster = useCallback((targetModel: ModelType = activeModel) => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        prediction: predictStudentPerformance(student, targetModel),
      }))
    );
    showToast(`Re-evaluated all ${students.length} students with ${targetModel === 'random_forest' ? 'Random Forest' : 'Linear Regression'}.`);
  }, [activeModel, students.length, showToast]);

  // Form submission: save student to roster and show result
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentInput.studentName.trim() || !currentInput.studentId.trim()) {
      showToast('Please enter both student name and ID before submitting.');
      return;
    }

    const prediction = predictStudentPerformance(currentInput, activeModel);

    // Check if student already exists in roster (by studentId)
    const existingIndex = students.findIndex((s) => s.studentId === currentInput.studentId);

    const newRecord: StudentRecord = {
      ...currentInput,
      id: existingIndex >= 0 ? students[existingIndex].id : `stu-${Date.now()}`,
      prediction,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const updated = [...students];
      updated[existingIndex] = newRecord;
      setStudents(updated);
      showToast(`Updated prediction for ${newRecord.studentName} (${newRecord.studentId})`);
    } else {
      setStudents([newRecord, ...students]);
      showToast(`Saved ${newRecord.studentName} to roster: ${prediction.status.toUpperCase()} (${prediction.finalScore} pts)`);
    }

    // Display prediction result card now that all parameters have been submitted
    setSubmittedRecord(newRecord);

    // Trigger celebration confetti if passing with distinction
    if (prediction.finalScore >= 80) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0D9488', '#14B8A6', '#10B981', '#059669', '#34D399'],
      });
    }
  };

  // Reset form to defaults and dismiss result card
  const handleResetForm = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCurrentInput({
      ...DEFAULT_INPUT,
      studentId: `STU-${randomNum}`,
      studentName: '',
    });
    setSubmittedRecord(null);
    showToast('Form reset to standard baseline defaults.');
  };

  // Select student from roster to inspect/re-edit
  const handleSelectStudent = (student: StudentRecord) => {
    setCurrentInput({
      studentId: student.studentId,
      studentName: student.studentName,
      attendanceRate: student.attendanceRate,
      weeklyStudyHours: student.weeklyStudyHours,
      previousSemesterScore: student.previousSemesterScore,
      sleepHoursPerNight: student.sleepHoursPerNight,
      extracurricularActivities: student.extracurricularActivities,
      parentalEducationLevel: student.parentalEducationLevel,
      internetAccessAtHome: student.internetAccessAtHome,
      partTimeJob: student.partTimeJob,
      learningDisability: student.learningDisability,
    });
    setSubmittedRecord(student);
    setActiveView('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded ${student.studentName} (${student.studentId}) into Prediction Studio.`);
  };

  // Load a preset scenario and jump to predict view
  const handleSelectPreset = (preset: ScenarioPreset) => {
    setCurrentInput(preset.data);
    setActiveView('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Loaded preset scenario: "${preset.name}".`);
  };

  // Delete student from roster
  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents(students.filter((s) => s.id !== id));
    if (target) {
      showToast(`Deleted record for ${target.studentName}.`);
    }
  };

  // Reset to original notebook benchmark students
  const handleResetBenchmark = () => {
    if (window.confirm('Reset all student records back to the original notebook benchmark dataset?')) {
      setStudents(INITIAL_BENCHMARK_STUDENTS);
      showToast('Reset roster to 10 authentic notebook benchmark student records (including passing and at-risk students).');
    }
  };

  // Batch import
  const handleBatchImport = (newRecords: StudentRecord[]) => {
    setStudents([...newRecords, ...students]);
    showToast(`Successfully added ${newRecords.length} student predictions to roster!`);
  };

  // Export roster to CSV
  const handleExportCsv = () => {
    if (students.length === 0) {
      showToast('Roster is empty. Add students before exporting.');
      return;
    }

    const headers = [
      'student_id',
      'student_name',
      'attendance_rate',
      'weekly_study_hours',
      'previous_semester_score',
      'sleep_hours_per_night',
      'extracurricular_activities',
      'parental_education_level',
      'internet_access_at_home',
      'part_time_job',
      'learning_disability',
      'predicted_final_score',
      'status',
      'passed_flag',
      'grade',
      'evaluated_at',
    ];

    const rows = students.map((s) => [
      `"${s.studentId}"`,
      `"${s.studentName}"`,
      s.attendanceRate,
      s.weeklyStudyHours,
      s.previousSemesterScore,
      s.sleepHoursPerNight,
      s.extracurricularActivities,
      s.parentalEducationLevel,
      s.internetAccessAtHome,
      s.partTimeJob,
      s.learningDisability,
      s.prediction.finalScore,
      `"${s.prediction.status}"`,
      s.prediction.passed ? 1 : 0,
      `"${s.prediction.grade}"`,
      `"${s.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `student_predictions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${students.length} student records to CSV.`);
  };

  return (
    <div className="min-h-screen bg-[#f3f7f5] dark:bg-[#0d131a] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-950 dark:selection:text-teal-300 transition-colors duration-200">
      {/* Top Fixed Header with Model Switcher and View Navigation */}
      <Header
        students={students}
        activeModel={activeModel}
        activeView={activeView}
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onViewChange={setActiveView}
        onModelChange={handleModelChange}
        onLogout={handleLogout}
        onOpenInsights={() => setIsInsightsOpen(true)}
        onOpenBatchUpload={() => setIsBatchUploadOpen(true)}
        onExportCsv={handleExportCsv}
        onResetBenchmark={handleResetBenchmark}
      />

      {/* Temporary Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: HOME PAGE */}
        {activeView === 'home' && (
          <HomePage
            students={students}
            activeModel={activeModel}
            onModelChange={handleModelChange}
            onNavigate={setActiveView}
            onSelectPreset={handleSelectPreset}
            onOpenBatchUpload={() => setIsBatchUploadOpen(true)}
            onOpenInsights={() => setIsInsightsOpen(true)}
          />
        )}

        {/* VIEW 2: PREDICT THE SCORE OPTION */}
        {activeView === 'predict' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Context Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('home')}
                    className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                  >
                    Home
                  </button>
                  <span>/</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">Predict Student Score</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Student Performance Prediction Studio
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Adjust student inputs or load realistic profiles to predict final scores with pass threshold (&gt;50).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors shadow-2xs ${
                      currentUser.shareDataPublicly
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200/90 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                        : 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 border-teal-200/90 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-900/40'
                    }`}
                    title="Click to view profile & change data privacy"
                  >
                    {currentUser.shareDataPublicly ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Data: Public (Everyone)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        <span>Data: Private (Only You)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAccountModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-xs hover:shadow-md transition-all border border-teal-500/30"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-white" />
                    <span>Create Account</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-goto-analysis"
                  onClick={() => setActiveView('analysis')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-900 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200/90 dark:border-teal-800/60 rounded-xl shadow-2xs transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Explore Score Analysis</span>
                </button>
              </div>
            </div>

            {/* Model Control Banner: Change model anytime from UI */}
            <section
              id="model-control-bar"
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    activeModel === 'random_forest'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-800 text-white shadow-xs'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Active Model
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        activeModel === 'random_forest'
                          ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {activeModel === 'random_forest'
                        ? 'Random Forest Regressor (Primary • Depth=5)'
                        : 'Linear Regression (OLS Baseline)'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Test R²: <strong>{activeModel === 'random_forest' ? '0.7973' : '0.7702'}</strong> • Test MSE: <strong>{activeModel === 'random_forest' ? '50.45' : '57.20'}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeModel === 'random_forest'
                      ? 'Non-linear decision tree ensemble capturing compounding synergies between study hours and attendance.'
                      : 'Standard parametric linear model with direct feature coefficient weights.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    id="bar-btn-model-rf"
                    onClick={() => handleModelChange('random_forest')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeModel === 'random_forest'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                    title="Switch UI to Random Forest Regressor"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Random Forest</span>
                  </button>
                  <button
                    type="button"
                    id="bar-btn-model-lr"
                    onClick={() => handleModelChange('linear_regression')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeModel === 'linear_regression'
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                    title="Switch UI to Linear Regression"
                  >
                    <span>Linear Regression</span>
                  </button>
                </div>

                <button
                  type="button"
                  id="bar-btn-rescore-roster"
                  onClick={() => handleReevaluateRoster(activeModel)}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-teal-100 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/60 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Apply this model to re-score all students in the roster"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Apply to Roster</span>
                </button>
              </div>
            </section>

            {/* Core Prediction Studio Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <PredictorForm
                  input={currentInput}
                  onChange={setCurrentInput}
                  onSubmit={handleFormSubmit}
                  onReset={handleResetForm}
                  isRealtime={isRealtime}
                  onToggleRealtime={() => setIsRealtime(!isRealtime)}
                  activeModel={activeModel}
                  onModelChange={handleModelChange}
                  onViewAnalysis={() => setActiveView('analysis')}
                />
              </div>

              {/* Right Column: Prediction Result Card (Only shown once parameters are submitted) */}
              <div className="lg:col-span-5 sticky top-20 space-y-4">
                {submittedRecord ? (
                  <PredictionResultCard
                    input={submittedRecord}
                    result={submittedRecord.prediction}
                    activeModel={activeModel}
                    onModelChange={handleModelChange}
                    onViewAnalysis={() => setActiveView('analysis')}
                    onClose={() => {
                      setSubmittedRecord(null);
                      showToast('Closed evaluation card.');
                    }}
                    onDownloadScoreCard={() => {
                      showToast(`Downloading official Score Card for ${submittedRecord.studentName || 'Student'}...`);
                      downloadScoreCardPdf(submittedRecord);
                    }}
                  />
                ) : (
                  <div
                    id="card-awaiting-parameters"
                    className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 space-y-5 text-center shadow-2xs"
                  >
                    <div className="w-13 h-13 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Awaiting Parameter Submission
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Complete candidate parameters on the left and click <strong className="text-teal-700 dark:text-teal-400 font-semibold">Predict Score</strong> to calculate the evaluation and generate the downloadable score card.
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-left text-xs space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Required Core Parameters:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>Student Name &amp; ID</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>Attendance Rate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>Weekly Study Hours</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>Prior Semester Score</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-fill-sample-candidate"
                      onClick={() => {
                        const randomNum = Math.floor(1000 + Math.random() * 9000);
                        setCurrentInput({
                          ...DEFAULT_INPUT,
                          studentId: `STU-${randomNum}`,
                          studentName: 'Maya Patel',
                        });
                        showToast('Sample candidate data populated. Click "Predict Score" to submit!');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-900 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/60 rounded-xl transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Fill Sample Candidate</span>
                    </button>
                  </div>
                )}

                {/* Quick Helper Explainer */}
                <div className="bg-white rounded-xl p-4 border border-teal-100 shadow-2xs text-xs text-slate-500 space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <BrainCircuit className="w-4 h-4 text-teal-600" />
                    <span>Active Model: {activeModel === 'random_forest' ? 'Random Forest Regressor (depth=5)' : 'Linear Regression (OLS)'}</span>
                  </div>
                  <p>
                    InsightEd evaluates students using <strong>{activeModel === 'random_forest' ? 'Random Forest (Test R² 0.7973, MSE 50.45)' : 'Linear Regression (Test R² 0.7702, MSE 57.20)'}</strong>. You can switch models anytime from the navigation header, the model bar, the student input form, or the live result card. If the predicted final score is <strong>greater than 50</strong>, the student is classified as <strong>Passed</strong>; otherwise, the status displays as <strong>Failed</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SCORE ANALYSIS */}
        {activeView === 'analysis' && (
          <ScoreAnalysisView
            students={students}
            activeModel={activeModel}
            onModelChange={handleModelChange}
            onNavigate={setActiveView}
            onSelectStudent={handleSelectStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenReportCard={(student) => setReportCardStudent(student)}
            onExportCsv={handleExportCsv}
            onOpenBatchUpload={() => setIsBatchUploadOpen(true)}
            onOpenInsights={() => setIsInsightsOpen(true)}
            onReevaluateRoster={handleReevaluateRoster}
          />
        )}

        {/* VIEW 4: ABOUT PAGE (MODEL INFO & DATASET DOWNLOAD) */}
        {activeView === 'about' && (
          <AboutPage
            activeModel={activeModel}
            onModelChange={handleModelChange}
            onNavigate={setActiveView}
          />
        )}

        {/* VIEW 5: CONTACT US */}
        {activeView === 'contact' && (
          <ContactPage
            onNavigate={setActiveView}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Brand Name */}
          <div className="flex items-center gap-2 text-center md:text-left">
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
              InsightEd
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400 text-xs">
              Student Performance Predictor
            </span>
          </div>

          {/* Middle: Copyright Link / Line */}
          <div className="text-center text-slate-500 dark:text-slate-400 text-xs">
            © {new Date().getFullYear()}{' '}
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              InsightEd
            </button>
            . All rights reserved.
          </div>

          {/* Right: Navigation Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('predict');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              Predict Score
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              About &amp; Dataset
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              Contact Us
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('analysis');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              Analysis
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ModelInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />

      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onImportStudents={handleBatchImport}
        activeModel={activeModel}
      />

      <ReportCardModal
        student={reportCardStudent}
        isOpen={!!reportCardStudent}
        onClose={() => setReportCardStudent(null)}
      />

      <AccountProfileModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={handleSaveUser}
        onLogout={handleLogout}
        onAuthSuccess={handleAuthSuccess}
        showToast={showToast}
      />
    </div>
  );
}
