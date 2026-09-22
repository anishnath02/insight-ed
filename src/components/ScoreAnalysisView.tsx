import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
  BrainCircuit,
  Calculator,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { StudentRecord, ModelType, ActiveView } from '../types';
import { RosterTable } from './RosterTable';

interface ScoreAnalysisViewProps {
  students: StudentRecord[];
  activeModel: ModelType;
  onModelChange: (model: ModelType) => void;
  onNavigate: (view: ActiveView) => void;
  onSelectStudent: (student: StudentRecord) => void;
  onDeleteStudent: (id: string) => void;
  onOpenReportCard: (student: StudentRecord) => void;
  onExportCsv: () => void;
  onOpenBatchUpload: () => void;
  onOpenInsights: () => void;
  onReevaluateRoster: (model: ModelType) => void;
}

export const ScoreAnalysisView: React.FC<ScoreAnalysisViewProps> = ({
  students,
  activeModel,
  onModelChange,
  onNavigate,
  onSelectStudent,
  onDeleteStudent,
  onOpenReportCard,
  onExportCsv,
  onOpenBatchUpload,
  onOpenInsights,
  onReevaluateRoster,
}) => {
  const total = students.length;
  const passed = students.filter((s) => s.prediction.passed).length;
  const failed = total - passed;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

  const scores = useMemo(() => students.map((s) => s.prediction.finalScore), [students]);
  const avgScore = total > 0 ? (scores.reduce((a, b) => a + b, 0) / total).toFixed(1) : '0.0';

  const sortedScores = useMemo(() => [...scores].sort((a, b) => a - b), [scores]);
  const medianScore =
    total > 0
      ? total % 2 === 0
        ? ((sortedScores[total / 2 - 1] + sortedScores[total / 2]) / 2).toFixed(1)
        : sortedScores[Math.floor(total / 2)].toFixed(1)
      : '0.0';

  // Grade Distribution Counts
  const gradeCounts = useMemo(() => {
    const counts = { 'A+': 0, A: 0, B: 0, C: 0, F: 0 };
    students.forEach((s) => {
      const score = s.prediction.finalScore;
      if (score >= 90) counts['A+']++;
      else if (score >= 80) counts['A']++;
      else if (score >= 70) counts['B']++;
      else if (score >= 50) counts['C']++;
      else counts['F']++;
    });
    return counts;
  }, [students]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Score Analysis Hub */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/60 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
            <span>Cohort Score Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Score Analysis &amp; Student Performance Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Examine score distributions, pass/fail status thresholds (&gt;50 mark), and feature impact across all evaluated candidates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('predict')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-colors"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Predict Another Score</span>
          </button>

          <button
            type="button"
            onClick={onOpenBatchUpload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Batch CSV</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* Analytical KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Cohort Size */}
        <div className="bg-white dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Cohort Size</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1.5">
            {total}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active verified profiles
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-700/50 shadow-2xs transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Pass Rate (&gt;50)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300 mt-1.5">
            {passRate}%
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300/90 mt-1 font-medium">
            {passed} students above threshold
          </div>
        </div>

        {/* At-Risk */}
        <div className="bg-rose-50/70 dark:bg-rose-950/40 p-4 sm:p-5 rounded-2xl border border-rose-200/80 dark:border-rose-700/50 shadow-2xs transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>At-Risk (&le;50)</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-800 dark:text-rose-300 mt-1.5">
            {failed}
          </div>
          <div className="text-xs text-rose-700 dark:text-rose-300/90 mt-1 font-medium">
            Require academic intervention
          </div>
        </div>

        {/* Mean / Median */}
        <div className="bg-teal-50/70 dark:bg-teal-950/40 p-4 sm:p-5 rounded-2xl border border-teal-200/80 dark:border-teal-700/50 shadow-2xs transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
            <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Mean / Median</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-900 dark:text-teal-200 mt-1.5">
            {avgScore} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {medianScore}</span>
          </div>
          <div className="text-xs text-teal-700 dark:text-teal-300/90 mt-1 font-medium">
            Scale 0 - 100 points
          </div>
        </div>
      </div>

      {/* Grade Breakdown & Threshold Analysis Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grade Distribution Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Grade Classification Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard academic tier classification based on predicted scores.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">N={total}</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { grade: 'A+ (90-100)', count: gradeCounts['A+'], color: 'bg-emerald-600', text: 'text-emerald-700', label: 'Distinction' },
              { grade: 'A (80-89)', count: gradeCounts['A'], color: 'bg-emerald-500', text: 'text-emerald-600', label: 'Excellent' },
              { grade: 'B (70-79)', count: gradeCounts['B'], color: 'bg-teal-500', text: 'text-teal-700', label: 'Good' },
              { grade: 'C (50-69)', count: gradeCounts['C'], color: 'bg-amber-500', text: 'text-amber-700', label: 'Pass Threshold' },
              { grade: 'F (<50)', count: gradeCounts['F'], color: 'bg-rose-500', text: 'text-rose-700', label: 'Failing / At Risk' },
            ].map((item) => {
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0.0';
              return (
                <div key={item.grade} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Grade {item.grade}</span>
                    <span className="font-mono text-slate-500">
                      <strong>{item.count}</strong> students ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Passing Threshold Dial & Intervention Needs (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pass/Fail Threshold Analysis (&gt;50)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official academic cutoff: Scores &gt;50 qualify as Passing.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-700">Passed: {passed} ({passRate}%)</span>
              <span className="text-rose-600">Failed: {failed} ({(100 - Number(passRate)).toFixed(1)}%)</span>
            </div>

            {/* Combined Threshold Ratio Bar */}
            <div className="h-3.5 w-full bg-rose-200 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${passRate}%` }}
                title={`Passed: ${passRate}%`}
              />
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
              <strong>Academic Health Note:</strong> Students scoring within the 50–55 range represent borderline passing candidates who benefit most from attendance and revision tutoring interventions.
            </div>
          </div>

          {/* Model Architecture Quick Insight */}
          <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 flex items-start gap-2.5">
            <BrainCircuit className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">
                Evaluation Model: {activeModel === 'random_forest' ? 'Random Forest (R² 0.80)' : 'Linear Regression (R² 0.77)'}
              </div>
              <p className="text-[11px]">
                Scores are determined by the scikit-learn training benchmark. You can switch models anytime to test variations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Student Roster Section */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Evaluated Student Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed records of all evaluated candidates with individual report cards, filtering, and model re-scoring.
            </p>
          </div>
        </div>

        <RosterTable
          students={students}
          activeModel={activeModel}
          onSelectStudent={onSelectStudent}
          onDeleteStudent={onDeleteStudent}
          onOpenReportCard={onOpenReportCard}
          onExportCsv={onExportCsv}
          onReevaluateRoster={onReevaluateRoster}
        />
      </section>
    </div>
  );
};
