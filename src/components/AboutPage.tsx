import React, { useState } from 'react';
import {
  BrainCircuit,
  Download,
  FileSpreadsheet,
  FileCode,
  Layers,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Sliders,
  Database,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BookOpen,
  Users,
  GraduationCap,
  MapPin,
  Mail,
  Copy,
  Check,
  BarChart3,
  Moon,
  Wifi,
  WifiOff,
  Briefcase,
  Clock,
  Activity,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Lightbulb,
  Flame
} from 'lucide-react';
import { ModelType, ActiveView, StudentRecord } from '../types';
import { INITIAL_BENCHMARK_STUDENTS } from '../sampleData';

interface AboutPageProps {
  activeModel: ModelType;
  onModelChange: (model: ModelType) => void;
  onNavigate: (view: ActiveView) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  activeModel,
  onModelChange,
  onNavigate,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [activeEdaTab, setActiveEdaTab] = useState<'all' | 'cohorts' | 'tiers' | 'sleep' | 'environment'>('all');
  const [benchmarkFilter, setBenchmarkFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const filteredBenchmarkStudents = React.useMemo(() => {
    if (benchmarkFilter === 'passed') return INITIAL_BENCHMARK_STUDENTS.filter((s) => s.prediction.passed);
    if (benchmarkFilter === 'failed') return INITIAL_BENCHMARK_STUDENTS.filter((s) => !s.prediction.passed);
    return INITIAL_BENCHMARK_STUDENTS;
  }, [benchmarkFilter]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleDownloadCsv = () => {
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
      'final_score',
      'passed'
    ];

    const rows = INITIAL_BENCHMARK_STUDENTS.map((s) => [
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
      s.prediction.passed ? 1 : 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'student_performance_dataset_benchmark.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('student_performance_dataset_benchmark.csv downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadModelJson = () => {
    const modelSpecs = {
      model_family: 'ensemble_tree_regression',
      primary_model: {
        name: 'Random Forest Regressor',
        framework: 'scikit-learn 1.4.1',
        hyperparameters: {
          n_estimators: 10,
          max_depth: 5,
          min_samples_split: 4,
          min_samples_leaf: 2,
          random_state: 42
        },
        evaluation_metrics: {
          test_r2: 0.7973,
          test_mse: 50.45,
          train_r2: 0.8845,
          train_mse: 28.12
        },
        pass_threshold: 50.0,
        feature_importance: {
          attendance_rate: 0.354,
          previous_semester_score: 0.261,
          weekly_study_hours: 0.208,
          sleep_hours_per_night: 0.076,
          parental_education_level: 0.045,
          extracurricular_activities: 0.024,
          internet_access_at_home: 0.018,
          learning_disability_accommodation: 0.010,
          part_time_job: 0.004
        }
      },
      baseline_model: {
        name: 'Linear Regression (OLS)',
        framework: 'scikit-learn 1.4.1',
        intercept: 14.85,
        coefficients: {
          attendance_rate: 0.285,
          weekly_study_hours: 0.442,
          previous_semester_score: 0.320,
          sleep_hours_per_night: 0.850,
          extracurricular_activities: 1.60,
          parental_education_level: 1.10,
          internet_access_at_home: 1.25,
          part_time_job: -1.75,
          learning_disability: -2.10
        },
        evaluation_metrics: {
          test_r2: 0.7702,
          test_mse: 57.20
        }
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(modelSpecs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'insighted_model_specifications.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess('insighted_model_specifications.json downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  const handleDownloadPythonScript = () => {
    const pythonCode = `"""
InsightEd - Student Performance Prediction Training Pipeline
Models: Random Forest Regressor (Primary) vs. Linear Regression
Dataset: Student Academic Records with Pass Threshold (>50)
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# 1. Load Dataset
df = pd.read_csv('student_performance_dataset_benchmark.csv')

feature_cols = [
    'attendance_rate',
    'weekly_study_hours',
    'previous_semester_score',
    'sleep_hours_per_night',
    'extracurricular_activities',
    'parental_education_level',
    'internet_access_at_home',
    'part_time_job',
    'learning_disability'
]

X = df[feature_cols]
y = df['final_score']

# 2. Train/Test Split (80/20)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 3. Train Primary Model: Random Forest Regressor
rf = RandomForestRegressor(
    n_estimators=10,
    max_depth=5,
    min_samples_split=4,
    random_state=42
)
rf.fit(X_train, y_train)

y_pred_rf = rf.predict(X_test)
print(f"Random Forest Test R2: {r2_score(y_test, y_pred_rf):.4f}")
print(f"Random Forest Test MSE: {mean_squared_error(y_test, y_pred_rf):.2f}")

# 4. Train Baseline Model: Linear Regression
lr = LinearRegression()
lr.fit(X_train, y_train)

y_pred_lr = lr.predict(X_test)
print(f"Linear Regression Test R2: {r2_score(y_test, y_pred_lr):.4f}")
print(f"Linear Regression Test MSE: {mean_squared_error(y_test, y_pred_lr):.2f}")

# 5. Pass/Fail Threshold Classification (>50)
passed_rf = y_pred_rf > 50.0
print(f"Random Forest Test Cohort Pass Rate: {passed_rf.mean() * 100:.1f}%")
`;

    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'train_student_predictor.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess('train_student_predictor.py downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-full border border-teal-200/80 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            <span>Methodology, Dataset &amp; Machine Learning Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            About InsightEd
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            InsightEd is an academic decision-support platform designed to predict final student examination scores and classify students at risk of failure (score &le; 50). It utilizes a non-linear <strong>Random Forest Regressor</strong> as its primary model to model complex interactions across academic habits and socio-environmental factors.
          </p>
        </div>

        {/* Download Success Notification */}
        {downloadSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </section>

      {/* Dataset Download Section */}
      <section id="dataset-download" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Dataset &amp; Artifact Downloads
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Download the clean benchmark training data, model parameter weights, and reproducible Python scikit-learn code.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              id="btn-download-dataset-csv"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download CSV Dataset</span>
            </button>
            <button
              type="button"
              id="btn-download-model-json"
              onClick={handleDownloadModelJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Model Specs (JSON)</span>
            </button>
            <button
              type="button"
              id="btn-download-python-code"
              onClick={handleDownloadPythonScript}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <FileCode className="w-4 h-4 text-slate-500" />
              <span>Python Script (.py)</span>
            </button>
          </div>
        </div>

        {/* Dataset Schema Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dataset Scope</span>
            <div className="text-lg font-bold text-slate-900 font-mono">1,000+ Records</div>
            <p className="text-xs text-slate-500">
              Cleaned, normalized student records reflecting diverse attendance, study dedication, and home background conditions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Variable</span>
            <div className="text-lg font-bold text-teal-800 font-mono">final_score (0-100)</div>
            <p className="text-xs text-slate-500">
              Continuous score target with binary threshold classification (<code>passed = final_score &gt; 50</code>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Feature Count</span>
            <div className="text-lg font-bold text-slate-900 font-mono">9 Predictor Variables</div>
            <p className="text-xs text-slate-500">
              3 academic factors, 2 lifestyle variables, and 4 socio-demographic indicators.
            </p>
          </div>
        </div>

        {/* Benchmark Sample Preview with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Benchmark Sample Preview ({filteredBenchmarkStudents.length} Students Shown)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Authentic student evaluation cohort containing both passing (Score &gt; 50) and failing (Score &le; 50) profiles.
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setBenchmarkFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                benchmarkFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({INITIAL_BENCHMARK_STUDENTS.length})
            </button>
            <button
              type="button"
              onClick={() => setBenchmarkFilter('passed')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                benchmarkFilter === 'passed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              Passed ({INITIAL_BENCHMARK_STUDENTS.filter((s) => s.prediction.passed).length})
            </button>
            <button
              type="button"
              onClick={() => setBenchmarkFilter('failed')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                benchmarkFilter === 'failed'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400'
              }`}
            >
              Failed / At Risk ({INITIAL_BENCHMARK_STUDENTS.filter((s) => !s.prediction.passed).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Attendance</th>
                <th className="py-2.5 px-3">Study Hrs/Wk</th>
                <th className="py-2.5 px-3">Prior Score</th>
                <th className="py-2.5 px-3">Sleep</th>
                <th className="py-2.5 px-3">Pred. Score</th>
                <th className="py-2.5 px-3">Status (&gt;50)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-mono">
              {filteredBenchmarkStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{s.studentId}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <span>{s.studentName}</span>
                      {!s.prediction.passed && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-sans">
                          At Risk
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3">{s.attendanceRate}%</td>
                  <td className="py-2 px-3">{s.weeklyStudyHours}h</td>
                  <td className="py-2 px-3">{s.previousSemesterScore} pts</td>
                  <td className="py-2 px-3">{s.sleepHoursPerNight}h</td>
                  <td className={`py-2 px-3 font-bold ${
                    s.prediction.passed
                      ? 'text-teal-700 dark:text-teal-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {s.prediction.finalScore}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                      s.prediction.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/50'
                    }`}>
                      {s.prediction.passed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>PASSED</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          <span>FAILED</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Model Specifications & Comparison */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Random Forest (Primary) */}
        <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
          activeModel === 'random_forest'
            ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20'
            : 'bg-white border-slate-200/80 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                  Primary Model
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Random Forest Regressor
                </h3>
              </div>
            </div>
            {activeModel === 'random_forest' ? (
              <span className="px-2.5 py-1 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-full">
                Active in App
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onModelChange('random_forest')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline"
              >
                Set as Active
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <p>
              An ensemble learning method constructing <strong>10 orthogonal decision trees</strong> (max depth = 5). It averages tree outputs to mitigate variance and model non-linear academic compounding effects.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 font-mono space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Test Coefficient R²:</span>
                <span className="font-bold text-teal-800">0.7973 (~80% variance explained)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Test Mean Squared Error (MSE):</span>
                <span className="font-bold text-slate-800">50.45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Tree Depth:</span>
                <span className="font-bold text-slate-800">5 levels</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimators:</span>
                <span className="font-bold text-slate-800">10 trees</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-semibold text-slate-800 block mb-1">Key Strengths:</span>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Captures sharp non-linear drops when attendance falls &lt;70%</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Models diminishing returns on excessive study hours without sleep</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Linear Regression (Baseline) */}
        <div className={`p-6 sm:p-7 rounded-3xl border transition-all ${
          activeModel === 'linear_regression'
            ? 'bg-white border-slate-800 shadow-md ring-2 ring-slate-800/20'
            : 'bg-white border-slate-200/80 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Baseline Model
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Linear Regression (OLS)
                </h3>
              </div>
            </div>
            {activeModel === 'linear_regression' ? (
              <span className="px-2.5 py-1 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 rounded-full">
                Active in App
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onModelChange('linear_regression')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
              >
                Set as Active
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <p>
              Standard Ordinary Least Squares parametric model that fits a global linear hyperplane across all input attributes with explicit per-unit additive coefficients.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 font-mono space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Test Coefficient R²:</span>
                <span className="font-bold text-slate-800">0.7702 (~77% variance explained)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Test Mean Squared Error (MSE):</span>
                <span className="font-bold text-slate-800">57.20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Formula Intercept:</span>
                <span className="font-bold text-slate-800">+14.85 pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Optimization:</span>
                <span className="font-bold text-slate-800">Least Squares Closed Form</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-semibold text-slate-800 block mb-1">Key Strengths:</span>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>100% transparent coefficient attribution (+0.44 pts per study hr)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Fast, predictable mathematical extrapolation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Importance & Weights Matrix */}
      <section className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Feature Importance &amp; Sensitivity Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scikit-Learn feature importances calculated using Mean Decrease in Impurity (Gini/MSE) across the Random Forest trees:
            </p>
          </div>

          {/* Thermal Impact Scale Legend */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-[11px] shrink-0 self-start sm:self-auto">
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Minimal Impact</span>
            <div
              className="w-20 h-2 rounded-full shadow-2xs"
              style={{
                background: 'linear-gradient(to right, #6366f1, #06b6d4, #10b981, #eab308, #f97316, #e11d48)'
              }}
              title="Minimal Impact (Indigo/Cyan) to Critical Impact (Crimson Red)"
            />
            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
              <span>Critical Impact</span>
              <Flame className="w-3 h-3 text-rose-500" />
            </span>
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {[
            {
              name: 'Class Attendance Rate',
              key: 'attendanceRate',
              weight: 35.4,
              impact: 'Primary driver: Regular attendance anchors course comprehension',
              impactLevel: 'Critical Impact',
              barGradient: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-500',
              weightColor: 'text-rose-600 dark:text-rose-400',
              badgeStyle: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
              glow: 'shadow-rose-500/20',
            },
            {
              name: 'Previous Semester Score',
              key: 'previousSemesterScore',
              weight: 26.1,
              impact: 'Foundational academic momentum and prior subject mastery',
              impactLevel: 'High Impact',
              barGradient: 'bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500',
              weightColor: 'text-orange-600 dark:text-orange-400',
              badgeStyle: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
              glow: 'shadow-orange-500/20',
            },
            {
              name: 'Weekly Self-Study Hours',
              key: 'weeklyStudyHours',
              weight: 20.8,
              impact: 'Consistent practice outside lecture hours',
              impactLevel: 'High Impact',
              barGradient: 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400',
              weightColor: 'text-amber-600 dark:text-amber-400',
              badgeStyle: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
              glow: 'shadow-amber-500/20',
            },
            {
              name: 'Nightly Sleep Duration',
              key: 'sleepHoursPerNight',
              weight: 7.6,
              impact: 'Cognitive restoration; sub-6hr sleep creates severe fatigue penalties',
              impactLevel: 'Moderate Impact',
              barGradient: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-lime-500',
              weightColor: 'text-yellow-700 dark:text-yellow-400',
              badgeStyle: 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/60',
              glow: 'shadow-yellow-500/20',
            },
            {
              name: 'Parental Education Level',
              key: 'parentalEducationLevel',
              weight: 4.5,
              impact: 'Academic scaffolding and home learning support system',
              impactLevel: 'Moderate Impact',
              barGradient: 'bg-gradient-to-r from-lime-500 to-emerald-500',
              weightColor: 'text-lime-700 dark:text-lime-400',
              badgeStyle: 'bg-lime-50 dark:bg-lime-950/60 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800/60',
              glow: 'shadow-lime-500/20',
            },
            {
              name: 'Extracurricular Activities',
              key: 'extracurricularActivities',
              weight: 2.4,
              impact: 'Engagement balance, social enrichment, and campus integration',
              impactLevel: 'Low Impact',
              barGradient: 'bg-gradient-to-r from-emerald-500 to-teal-400',
              weightColor: 'text-emerald-700 dark:text-emerald-400',
              badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
              glow: 'shadow-emerald-500/20',
            },
            {
              name: 'Internet Access at Home',
              key: 'internetAccessAtHome',
              weight: 1.8,
              impact: 'Digital access to lecture slides, research materials, and quizzes',
              impactLevel: 'Low Impact',
              barGradient: 'bg-gradient-to-r from-teal-500 to-cyan-400',
              weightColor: 'text-teal-700 dark:text-teal-400',
              badgeStyle: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/60',
              glow: 'shadow-teal-500/20',
            },
            {
              name: 'Learning Support Accommodation',
              key: 'learningDisability',
              weight: 1.0,
              impact: 'Institutional accommodations counteracting learning barriers',
              impactLevel: 'Minimal Impact',
              barGradient: 'bg-gradient-to-r from-cyan-500 to-sky-400',
              weightColor: 'text-cyan-700 dark:text-cyan-400',
              badgeStyle: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60',
              glow: 'shadow-cyan-500/20',
            },
            {
              name: 'Part-Time Job Burden',
              key: 'partTimeJob',
              weight: 0.4,
              impact: 'Time competing with exam review and assignment completion',
              impactLevel: 'Minimal Impact',
              barGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500',
              weightColor: 'text-indigo-700 dark:text-indigo-400',
              badgeStyle: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60',
              glow: 'shadow-indigo-500/20',
            },
          ].map((item) => (
            <div key={item.key} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${item.badgeStyle}`}>
                    {item.impactLevel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono font-bold text-xs ${item.weightColor}`}>
                    {item.weight}% weight
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 shadow-2xs ${item.barGradient}`}
                  style={{ width: `${Math.max(item.weight * 2.3, 3)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.impact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Empirical Dataset Analysis & Key Statistical Insights (from EDA Notebook) */}
      <section id="empirical-eda-analysis" className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Empirical Dataset Analysis &amp; Key Statistical Findings
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Exploratory Data Analysis (EDA) conducted across the 885 validated student records (cleaned from the 1,001 entry benchmark cohort), highlighting pivotal behavioural patterns, non-linear correlations, and grade drivers.
            </p>
          </div>

          {/* Quick Dataset Scope Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700">
              885 Cleaned Records
            </span>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800/60">
              58.0% Passed (513)
            </span>
            <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-full text-xs font-semibold border border-rose-200/80 dark:border-rose-800/60">
              42.0% Failed (372)
            </span>
          </div>
        </div>

        {/* Tab Navigation Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto">
          {[
            { id: 'all', label: 'All Key Findings', icon: Activity },
            { id: 'cohorts', label: 'Pass vs. Fail Drivers', icon: TrendingUp },
            { id: 'tiers', label: 'Factor Progression Tiers', icon: BarChart3 },
            { id: 'sleep', label: 'Sleep Sweet Spot', icon: Moon },
            { id: 'environment', label: 'Lifestyle & Environment', icon: Wifi },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeEdaTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveEdaTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- SECTION 1: PASS VS FAIL COHORT DISCREPANCY --- */}
        {(activeEdaTab === 'all' || activeEdaTab === 'cohorts') && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>1. Cohort Performance Discrepancy (Pass vs. Fail Drivers)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Comparative performance benchmarks between passing students (513) and failing students (372).
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200/80 dark:border-teal-800/60">
                Δ +24.4 Pts Score Gap
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Final Score */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Final Exam Score</span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    +24.4 pts
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Passed: 72.7</span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">Failed: 48.3</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: '72.7%' }} />
                    <div className="h-full bg-rose-400 opacity-60" style={{ width: '48.3%' }} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Conclusion:</strong> Students who passed achieve an average final score of 72.7, whereas failed students average 48.3, creating a stark 24.4-point performance divide.
                </p>
              </div>

              {/* Metric 2: Attendance Rate */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Class Attendance</span>
                  <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100/60 dark:bg-teal-950/80 px-1.5 py-0.5 rounded">
                    +15.0%
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-teal-700 dark:text-teal-400 font-bold">Passed: 81.8%</span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">Failed: 66.8%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: '81.8%' }} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Conclusion:</strong> Passing students average 81.8% attendance compared to 66.8% for failed students. Consistent attendance is the decisive prerequisite for course passing.
                </p>
              </div>

              {/* Metric 3: Weekly Study Hours */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Weekly Study Hours</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                    +6.8 hrs
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-amber-700 dark:text-amber-400 font-bold">Passed: 22.5h</span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">Failed: 15.7h</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(22.5 / 39) * 100}%` }} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Conclusion:</strong> Passing candidates dedicate 22.5 hours per week to independent study versus 15.7 hours for failing candidates—nearly an extra hour every single day.
                </p>
              </div>

              {/* Metric 4: Previous Semester Score */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prior Semester Marks</span>
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/80 px-1.5 py-0.5 rounded">
                    +10.8 pts
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-blue-700 dark:text-blue-400 font-bold">Passed: 73.9</span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">Failed: 63.1</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '73.9%' }} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Conclusion:</strong> Passing candidates entered with an average prior score of 73.9 versus 63.1 for failing students, providing a 10.8-point foundational knowledge cushion.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION 2: CATEGORICAL PROGRESSION TIERS --- */}
        {(activeEdaTab === 'all' || activeEdaTab === 'tiers') && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>2. Categorical Factor Progression Tiers (Step-Function Gains)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Segmentation of continuous variables into discrete performance tiers highlights strictly monotonic increases in final scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier 1: Attendance Tiers */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Attendance Tiers</span>
                  <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-md font-semibold">
                    +20.3 pts Range
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Low (&lt;65%)</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">51.6 avg</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '51.6%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Medium (65–80%)</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">60.5 avg (+8.9)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '60.5%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">High (&gt;80%)</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">71.9 avg (+11.4)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '71.9%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Finding:</strong> Progressing from the &lt;65% tier to the &gt;80% attendance tier elevates student final marks by more than 20 full points.
                </p>
              </div>

              {/* Tier 2: Weekly Study Tiers */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Study Hours Tiers</span>
                  <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-md font-semibold">
                    +15.4 pts Range
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Low (0–13 hrs/wk)</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">55.4 avg</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '55.4%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Medium (14–26 hrs/wk)</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">63.2 avg (+7.8)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '63.2%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">High (27+ hrs/wk)</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">70.8 avg (+7.6)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70.8%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Finding:</strong> Each 13-hour weekly threshold increase contributes ~7.7 points to expected academic score, rewarding dedicated revision habits.
                </p>
              </div>

              {/* Tier 3: Previous Score Tiers */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Prior Semester Tiers</span>
                  <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/70 px-2 py-0.5 rounded-md font-semibold">
                    +14.9 pts Range
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Low (&lt;60 marks)</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">55.1 avg</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '55.1%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">Medium (60–75 marks)</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">62.5 avg (+7.4)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '62.5%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">High (&gt;75 marks)</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">70.0 avg (+7.5)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70.0%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Finding:</strong> Prior academic grounding is highly stable and predictive, establishing an expected score floor above 70 for high-performing candidates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION 3: SLEEP DURATION NON-LINEAR SWEET SPOT --- */}
        {(activeEdaTab === 'all' || activeEdaTab === 'sleep') && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>3. Sleep Duration Non-Linear Curve (The 7–8 Hour Sweet Spot)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Analysis reveals an inverted U-curve relationship between nightly rest hours and student final score.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200/80 dark:border-teal-800/60 self-start sm:self-auto">
                Optimal Peak: 8.0h (64.9 pts)
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              {/* Discrete Hour Distribution Columns */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {[
                  { hours: '4 hrs', score: 58.7, status: 'Severe Deficit', color: 'bg-rose-500', peak: false },
                  { hours: '5 hrs', score: 61.2, status: 'Fatigue Risk', color: 'bg-amber-500', peak: false },
                  { hours: '6 hrs', score: 62.0, status: 'Sub-Optimal', color: 'bg-teal-500', peak: false },
                  { hours: '7 hrs', score: 63.8, status: 'Effective', color: 'bg-teal-600', peak: false },
                  { hours: '8 hrs', score: 64.9, status: 'Optimal Peak', color: 'bg-emerald-600', peak: true },
                  { hours: '9 hrs', score: 61.5, status: 'Decline', color: 'bg-amber-500', peak: false },
                  { hours: '10 hrs', score: 59.8, status: 'Oversleeping', color: 'bg-rose-500', peak: false },
                ].map((item) => (
                  <div
                    key={item.hours}
                    className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                      item.peak
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80 shadow-xs ring-1 ring-emerald-400/40'
                        : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      {item.hours}
                    </div>
                    <div className="space-y-1">
                      <div className={`text-base font-mono font-bold ${item.peak ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                        {item.score}
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${(item.score / 70) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-[9px] font-semibold uppercase tracking-tight ${item.peak ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="text-slate-900 dark:text-white">Notebook Empirical Takeaway:</strong> <em>"Too little (&lt;6h) and too much (&gt;9h) sleep negatively affect final score. 7–8 hours of nightly sleep is the perfect sweet spot for memory consolidation and sustained daytime cognitive focus."</em>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION 4: LIFESTYLE & ENVIRONMENTAL FACTORS --- */}
        {(activeEdaTab === 'all' || activeEdaTab === 'environment') && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>4. Lifestyle, Environmental &amp; Distraction Dynamics</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Investigating non-academic constraints: home internet availability, employment time burdens, extracurricular balance, and accommodations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Insight 1: Internet Access Paradox */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Internet Access Paradox</span>
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">No Home Internet (0):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">65.8 avg score</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">Has Home Internet (1):</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">62.0 avg score</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Study Hours: 22.8h vs 19.3h</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Finding:</strong> Students without home internet access averaged +3.8 higher scores and +3.5h more weekly study time, attributable to reduced social media distraction.
                </p>
              </div>

              {/* Insight 2: Part-time Job Burden */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Part-Time Employment</span>
                  <Briefcase className="w-4 h-4 text-rose-500" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">No Job (0):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">64.2 avg score</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">Has Job (1):</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">58.3 avg score</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-rose-600 font-mono font-semibold">
                    <span>Penalty: -5.9 points</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Finding:</strong> Employed students experience a ~6-point penalty as shift hours directly compete with exam review and assignment completion.
                </p>
              </div>

              {/* Insight 3: Extracurriculars */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Extracurricular Balance</span>
                  <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">Active (1):</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">62.7 avg score</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">None (0):</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">62.1 avg score</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Difference: +0.6 pt (Neutral)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Finding:</strong> Extracurricular activities impose zero negative penalty on final grades, confirming that healthy campus involvement supports mental balance.
                </p>
              </div>

              {/* Insight 4: Learning Accommodations */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">Learning Accommodations</span>
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">With Support (1):</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">63.4 avg score</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600 dark:text-slate-400">Standard Track (0):</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">62.3 avg score</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-teal-600 font-mono font-semibold">
                    <span>Gap Neutralized</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong>Notebook Finding:</strong> Institutional accommodations (extended test time, software) successfully bridge the achievement gap, keeping performance on par.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* About the Developers */}
      <section id="about-developers" className="bg-white dark:bg-slate-800/40 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                About the Developers
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Engineered and maintained by computer science and engineering researchers specializing in applied machine learning, educational analytics, and web technologies.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-700/50 rounded-full text-xs font-semibold self-start sm:self-auto">
            Core Engineering Team
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Developer 1: Anish Nath */}
          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-700/70 shadow-2xs flex flex-col justify-between space-y-4 hover:border-teal-400 dark:hover:border-teal-500/70 transition-all group">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0 tracking-tight ring-2 ring-teal-500/20">
                  AN
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Anish Nath
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-700/60 rounded-md">
                      Model Building &amp; Web Implementation
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>B.Tech in CSE</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>Kolkata, India</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Specialized in <strong className="text-slate-800 dark:text-slate-100 font-semibold">Model Building &amp; Web Implementation</strong> — including Scikit-Learn Random Forest Regressor training, hyperparameter optimization, real-time prediction engine, and interactive frontend architecture.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="font-semibold select-all">nathanish6@gmail.com</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="copy-email-anish"
                  onClick={() => handleCopyEmail('nathanish6@gmail.com')}
                  title="Copy email address"
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedEmail === 'nathanish6@gmail.com' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-sans">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href="mailto:nathanish6@gmail.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* Developer 2: Tithibrata Biswas */}
          <div className="p-6 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-700/70 shadow-2xs flex flex-col justify-between space-y-4 hover:border-teal-400 dark:hover:border-teal-500/70 transition-all group">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0 tracking-tight ring-2 ring-slate-500/20">
                  TB
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      Tithibrata Biswas
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200/80 dark:border-teal-700/60 rounded-md">
                      Data Processing, Analysis &amp; Visualization
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>B.Tech in CSE</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>Kolkata, India</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Specialized in <strong className="text-slate-800 dark:text-slate-100 font-semibold">Data Processing, Analysis &amp; Visualization</strong> — including student dataset cleaning and normalization, exploratory feature correlation, academic data visualization charts, pass/fail threshold modeling, and statistical cohort evaluation.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <span className="font-semibold select-all">tithibrata123@gmail.com</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  id="copy-email-tithibrata"
                  onClick={() => handleCopyEmail('tithibrata123@gmail.com')}
                  title="Copy email address"
                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedEmail === 'tithibrata123@gmail.com' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium font-sans">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href="mailto:tithibrata123@gmail.com"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 dark:bg-teal-600 hover:bg-slate-900 dark:hover:bg-teal-700 active:bg-slate-950 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Passing Threshold & Ethics Statement */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Academic Threshold &amp; Decision Support Policy
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Pass/Fail Benchmark (&gt;50 Points)</span>
            </h4>
            <p>
              Students with a predicted final score exceeding 50.0 are designated as <strong>Passed</strong>. Scores equal to or lower than 50.0 trigger an <strong>At-Risk / Failed</strong> classification. Letter grades range from <strong>A+ (90-100)</strong> to <strong>F (&le;50)</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>Ethical Intervention Guidelines</span>
            </h4>
            <p>
              InsightEd is designed to empower educators, counselors, and students with formative early warnings. Predictions should serve as a trigger for tailored support (such as tutoring or schedule adjustments) rather than punitive judgment.
            </p>
          </div>
        </div>

        {/* CTA to Predict Score */}
        <div className="pt-4 flex items-center justify-between flex-wrap gap-3 border-t border-slate-100">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Ready to test student predictions?</h4>
            <p className="text-[11px] text-slate-500">Run the live Random Forest model on custom student profiles.</p>
          </div>
          <button
            type="button"
            id="about-cta-predict"
            onClick={() => onNavigate('predict')}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
          >
            <span>Launch Prediction Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
