import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Calculator,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Users,
  Award,
  Clock,
  BookOpen,
  FileSpreadsheet,
  Upload,
  Layers,
  ChevronRight,
  Info,
  Mail,
  Download
} from 'lucide-react';
import { StudentRecord, ModelType, ActiveView, StudentInput } from '../types';
import { PRESET_SCENARIOS, ScenarioPreset } from '../sampleData';

interface HomePageProps {
  students: StudentRecord[];
  activeModel: ModelType;
  onModelChange: (model: ModelType) => void;
  onNavigate: (view: ActiveView) => void;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onOpenBatchUpload: () => void;
  onOpenInsights: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  students,
  activeModel,
  onModelChange,
  onNavigate,
  onSelectPreset,
  onOpenBatchUpload,
  onOpenInsights,
}) => {
  const totalStudents = students.length;
  const passedStudents = students.filter((s) => s.prediction.passed).length;
  const failedStudents = totalStudents - passedStudents;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0.0';
  const averageScore =
    totalStudents > 0
      ? (students.reduce((acc, curr) => acc + curr.prediction.finalScore, 0) / totalStudents).toFixed(1)
      : '0.0';
  const distinctionStudents = students.filter((s) => s.prediction.finalScore >= 80).length;
  const distinctionRate = totalStudents > 0 ? ((distinctionStudents / totalStudents) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome & Overview Card */}
      <section className="bg-gradient-to-br from-white via-teal-50/30 to-slate-50 rounded-3xl p-6 sm:p-8 lg:p-10 border border-teal-100 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80 mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Student Performance Predictor</span>
            <span className="text-teal-400">•</span>
            <span className="font-mono">Pass Threshold: &gt;50 pts</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Predict Student Scores &amp; Analyze Performance
          </h1>

          <p className="text-sm sm:text-base text-slate-600 mt-3 sm:mt-4 leading-relaxed">
            Predict student final exam scores and pass/fail results based on attendance, weekly study hours, past marks, and daily habits. Calculate individual scores in real time or analyze performance across the whole class.
          </p>

          {/* Primary Quick Navigation Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6 sm:mt-8">
            <button
              type="button"
              id="home-btn-go-predict"
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs hover:shadow-md transition-all group"
            >
              <Calculator className="w-4 h-4" />
              <span>Predict Student Score</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              id="home-btn-go-analysis"
              onClick={() => onNavigate('analysis')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs transition-all group"
            >
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Explore Score Analysis</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              id="home-btn-batch-csv"
              onClick={onOpenBatchUpload}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Batch CSV Import</span>
            </button>
          </div>
        </div>

        {/* Active Engine Callout on Hero */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-teal-600" />
              Primary ML Model:
            </span>
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onModelChange('random_forest')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
                  activeModel === 'random_forest'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Random Forest (R² 0.80)</span>
              </button>
              <button
                type="button"
                onClick={() => onModelChange('linear_regression')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  activeModel === 'linear_regression'
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Linear Reg (R² 0.77)</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenInsights}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
          >
            <span>View training notebook metrics &amp; weights</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3-Step Guided Process Roadmap */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>How InsightEd Works</span>
            <span className="text-xs font-normal text-slate-500">• Complete Academic Evaluation Flow</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div
            onClick={() => onNavigate('home')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Home &amp; Overview</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-colors" />
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Explore cohort health summary, switch active machine learning engines, and select pre-built student scenarios to test.
            </p>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => onNavigate('predict')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              02
            </div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Predict Student Score</span>
              <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Adjust attendance, weekly revision, prior scores, and sleep to compute predicted final scores and determine pass status (&gt;50).
            </p>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => onNavigate('analysis')}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-teal-300 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Score Analysis &amp; Roster</span>
              <BarChart3 className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Deep dive into score distributions, feature attributions, passing ratios, at-risk rosters, and exportable report cards.
            </p>
          </div>
        </div>
      </section>

      {/* Cohort Score Pulse Summary Metrics */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Evaluated Cohort Pulse
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live statistics derived from currently evaluated student records in your active workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('analysis')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
          >
            <span>View Full Cohort Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {/* Card 1: Total Evaluated */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs transition-all">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Total Evaluated</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1.5">
              {totalStudents}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active student roster
            </div>
          </div>

          {/* Card 2: Pass Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-700/50 shadow-2xs transition-all">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Pass Rate (&gt;50)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300 mt-1.5">
              {passRate}%
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-1 font-medium">
              {passedStudents} students passing
            </div>
          </div>

          {/* Card 3: At-Risk */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-700/50 shadow-2xs transition-all">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>At-Risk (&le;50)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-800 dark:text-rose-300 mt-1.5">
              {failedStudents}
            </div>
            <div className="text-xs text-rose-700 dark:text-rose-300/90 mt-1 font-medium">
              Requires academic intervention
            </div>
          </div>

          {/* Card 4: Average Score */}
          <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-700/50 shadow-2xs transition-all">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Average Score</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-900 dark:text-teal-200 mt-1.5">
              {averageScore}
            </div>
            <div className="text-xs text-teal-700 dark:text-teal-300/90 mt-1 font-medium">
              {distinctionRate}% honors (80+)
            </div>
          </div>
        </div>
      </section>

      {/* Preset Scenarios: Quick Test into Predictor */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Quick Student Scenarios</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any benchmark profile to test predictions immediately in the prediction studio.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('predict')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>Custom Predictor</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_SCENARIOS.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                    {preset.badge}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {preset.data.studentId}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{preset.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {preset.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono">
                  <div>Att: <strong>{preset.data.attendanceRate}%</strong></div>
                  <div>Study: <strong>{preset.data.weeklyStudyHours}h</strong></div>
                  <div>Prior: <strong>{preset.data.previousSemesterScore}</strong></div>
                  <div>Sleep: <strong>{preset.data.sleepHoursPerNight}h</strong></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPreset(preset);
                  onNavigate('predict');
                }}
                className="mt-4 w-full py-2 px-3 text-xs font-semibold bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 hover:border-teal-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Load &amp; Predict Score</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-600" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About & Contact Quick Links Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl space-y-1">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600" />
              <span>Model Documentation, Dataset &amp; Contact</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Engineered by <strong>Anish Nath</strong> (Model Building &amp; Web Implementation) &amp; <strong>Tithibrata Biswas</strong> (Data Processing, Analysis &amp; Visualization) — B.Tech in CSE, Kolkata, India. Explore the Random Forest mathematical formulation, feature importance rankings, downloadable benchmark CSV dataset, or reach out directly.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              id="home-btn-goto-about"
              onClick={() => onNavigate('about')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-teal-600" />
              <span>About &amp; Download Dataset</span>
            </button>

            <button
              type="button"
              id="home-btn-goto-contact"
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
