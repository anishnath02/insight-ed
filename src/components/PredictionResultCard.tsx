import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Info,
  Layers,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ChevronRight,
  Download,
  X
} from 'lucide-react';
import { StudentInput, PredictionResult, ModelType } from '../types';
import { predictWithRandomForest, predictWithLinearRegression } from '../mlModel';
import { downloadScoreCardPdf } from '../utils/pdfExport';

// Thermal heat gradient mapping for the overall score bar (heat high for higher bars, lower heat for lower bars)
const getScoreHeatGradient = (score: number) => {
  if (score >= 80) return 'bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 shadow-xs shadow-rose-500/25';
  if (score >= 65) return 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 shadow-xs shadow-orange-500/20';
  if (score >= 50) return 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-xs shadow-emerald-500/20';
  if (score >= 35) return 'bg-gradient-to-r from-cyan-500 via-sky-400 to-teal-400 shadow-xs shadow-cyan-500/20';
  return 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 shadow-xs shadow-blue-500/20';
};

// Factor-level thermal heat gradient styling matching the About section heat scale (no text badge)
const getFactorHeatStyle = (featureKey: string) => {
  switch (featureKey) {
    case 'attendanceRate':
      return {
        barGradient: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-500',
        textColor: 'text-rose-600 dark:text-rose-400',
        iconColor: 'text-rose-600 dark:text-rose-400',
      };
    case 'previousSemesterScore':
      return {
        barGradient: 'bg-gradient-to-r from-orange-600 via-rose-500 to-amber-500',
        textColor: 'text-orange-600 dark:text-orange-400',
        iconColor: 'text-orange-600 dark:text-orange-400',
      };
    case 'weeklyStudyHours':
      return {
        barGradient: 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400',
        textColor: 'text-amber-600 dark:text-amber-400',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    case 'sleepHoursPerNight':
      return {
        barGradient: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-lime-500',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
      };
    case 'parentalEducationLevel':
      return {
        barGradient: 'bg-gradient-to-r from-lime-500 to-emerald-500',
        textColor: 'text-lime-700 dark:text-lime-400',
        iconColor: 'text-lime-600 dark:text-lime-400',
      };
    case 'extracurricularActivities':
      return {
        barGradient: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        textColor: 'text-emerald-700 dark:text-emerald-400',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'internetAccessAtHome':
      return {
        barGradient: 'bg-gradient-to-r from-teal-500 to-cyan-400',
        textColor: 'text-teal-700 dark:text-teal-400',
        iconColor: 'text-teal-600 dark:text-teal-400',
      };
    case 'learningDisability':
      return {
        barGradient: 'bg-gradient-to-r from-cyan-500 to-sky-400',
        textColor: 'text-cyan-700 dark:text-cyan-400',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
      };
    case 'partTimeJob':
    default:
      return {
        barGradient: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500',
        textColor: 'text-indigo-700 dark:text-indigo-400',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
      };
  }
};

interface PredictionResultCardProps {
  input: StudentInput;
  result: PredictionResult;
  activeModel?: ModelType;
  onModelChange?: (model: ModelType) => void;
  onOpenReportCard?: () => void;
  onViewAnalysis?: () => void;
  onClose?: () => void;
  onDownloadScoreCard?: () => void;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  input,
  result,
  activeModel = 'random_forest',
  onModelChange,
  onOpenReportCard: _onOpenReportCard,
  onViewAnalysis,
  onClose,
  onDownloadScoreCard,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isPassing = result.passed; // score > 50

  const handleDownload = async () => {
    if (onDownloadScoreCard) {
      onDownloadScoreCard();
      return;
    }
    setIsDownloading(true);
    try {
      await downloadScoreCardPdf({
        ...input,
        id: input.studentId || `stu-${Date.now()}`,
        prediction: result,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Calculate percentage along the gauge (0-100)
  const scorePercent = Math.min(100, Math.max(0, result.finalScore));

  // Compute both predictions for instant comparison
  const rfPrediction = useMemo(() => predictWithRandomForest(input), [input]);
  const lrPrediction = useMemo(() => predictWithLinearRegression(input), [input]);

  const alternateModel: ModelType = activeModel === 'random_forest' ? 'linear_regression' : 'random_forest';
  const alternatePrediction = activeModel === 'random_forest' ? lrPrediction : rfPrediction;
  const scoreDelta = (result.finalScore - alternatePrediction.finalScore).toFixed(2);
  const isDeltaPositive = Number(scoreDelta) >= 0;

  return (
    <div
      id="card-prediction-result"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {/* Top Card Header */}
      <div className="p-5 md:p-6 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Evaluated Candidate
            </span>
            <h3 id="display-student-name" className="text-lg font-bold text-slate-900 truncate mt-0.5">
              {input.studentName || 'Candidate Profile'}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span id="display-student-id" className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-600 shrink-0">
                {input.studentId || 'ID: PENDING'}
              </span>

              {/* In-Card Interactive Model Switcher */}
              {onModelChange ? (
                <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] shrink-0">
                  <button
                    type="button"
                    onClick={() => onModelChange('random_forest')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all flex items-center gap-1 ${
                      activeModel === 'random_forest'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Switch prediction to Random Forest"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Random Forest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onModelChange('linear_regression')}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${
                      activeModel === 'linear_regression'
                        ? 'bg-slate-800 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Switch prediction to Linear Regression"
                  >
                    <span>Linear Reg</span>
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  {result.modelUsed === 'random_forest' ? 'Random Forest (Primary)' : 'Linear Baseline'}
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowComparison(!showComparison)}
                className={`text-[11px] font-medium px-2 py-0.5 rounded border transition-colors flex items-center gap-1 shrink-0 ${
                  showComparison
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-white text-slate-500 hover:text-slate-800 border-slate-200'
                }`}
                title="Compare Random Forest vs Linear Regression side-by-side"
              >
                <ArrowRightLeft className="w-3 h-3 text-teal-600" />
                <span>{showComparison ? 'Hide Compare' : 'Compare Models'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs ${result.gradeColor}`}
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap tracking-tight">Grade {result.grade}</span>
            </div>

            {onClose && (
              <button
                type="button"
                id="btn-close-prediction-card"
                onClick={onClose}
                title="Dismiss and close result card"
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Score & Status Display */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Predicted Final Score
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span
                id="display-final-score"
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${
                  isPassing ? 'text-teal-700' : 'text-rose-600'
                }`}
              >
                {result.finalScore.toFixed(2)}
              </span>
              <span className="text-slate-400 font-medium text-sm">/ 100</span>
            </div>
          </div>

          <div className="text-right">
            <div
              id="display-pass-fail-status"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                isPassing
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {isPassing ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PASSED</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>FAILED</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isPassing
                ? `+${(result.finalScore - 50).toFixed(1)} above threshold`
                : `${(50 - result.finalScore).toFixed(1)} below pass mark`}
            </div>
          </div>
        </div>

        {/* Progress Bar with Threshold Marker & Thermal Heat Gradient */}
        <div className="mt-4">
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-300 dark:bg-slate-600 z-10" />
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreHeatGradient(result.finalScore)}`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
            <span>0</span>
            <span className="text-slate-500 dark:text-slate-400 font-semibold">50 Pass Mark</span>
            <span>100</span>
          </div>
        </div>

        {/* Expandable Side-by-Side Model Comparison Panel */}
        {showComparison && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
                Live Model Comparison for This Candidate
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Difference: <strong className={isDeltaPositive ? 'text-teal-700' : 'text-rose-600'}>
                  {isDeltaPositive ? `+${scoreDelta}` : scoreDelta} pts
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Random Forest Card */}
              <div className={`p-3 rounded-lg border transition-all ${
                activeModel === 'random_forest'
                  ? 'bg-teal-50/70 border-teal-300 shadow-2xs'
                  : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-teal-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    Random Forest
                  </span>
                  {activeModel === 'random_forest' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-teal-600 text-white rounded uppercase">
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-xl font-extrabold font-mono ${
                    rfPrediction.passed ? 'text-teal-800' : 'text-rose-600'
                  }`}>
                    {rfPrediction.finalScore.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span className={`font-semibold ${rfPrediction.passed ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {rfPrediction.passed ? 'PASSED' : 'FAILED'} (Grade {rfPrediction.grade})
                  </span>
                  <span className="font-mono">R² 0.7973</span>
                </div>
                {activeModel !== 'random_forest' && onModelChange && (
                  <button
                    type="button"
                    onClick={() => onModelChange('random_forest')}
                    className="mt-2 w-full py-1 text-[11px] font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded shadow-2xs transition-colors"
                  >
                    Select Random Forest
                  </button>
                )}
              </div>

              {/* Linear Regression Card */}
              <div className={`p-3 rounded-lg border transition-all ${
                activeModel === 'linear_regression'
                  ? 'bg-slate-100 border-slate-400 shadow-2xs'
                  : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">
                    Linear Regression
                  </span>
                  {activeModel === 'linear_regression' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-800 text-white rounded uppercase">
                      Current
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className={`text-xl font-extrabold font-mono ${
                    lrPrediction.passed ? 'text-slate-800' : 'text-rose-600'
                  }`}>
                    {lrPrediction.finalScore.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span className={`font-semibold ${lrPrediction.passed ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {lrPrediction.passed ? 'PASSED' : 'FAILED'} (Grade {lrPrediction.grade})
                  </span>
                  <span className="font-mono">R² 0.7702</span>
                </div>
                {activeModel !== 'linear_regression' && onModelChange && (
                  <button
                    type="button"
                    onClick={() => onModelChange('linear_regression')}
                    className="mt-2 w-full py-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded shadow-2xs transition-colors"
                  >
                    Select Linear Reg
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Section: Clean Factor Impact Breakdown */}
      <div className="p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Key Factors
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Model Weights</span>
        </div>

        {/* Top Influencers with Thermal Heat Bars (No Text Badges) */}
        <div className="space-y-2.5">
          {result.topPositiveFactors.slice(0, 3).map((factor) => {
            const heat = getFactorHeatStyle(factor.featureKey);
            const barWidth = Math.min(100, Math.max(16, (Math.abs(factor.contribution) / 10) * 100));
            return (
              <div
                key={factor.featureKey}
                className="py-1 border-b border-slate-100/70 dark:border-slate-800/80 last:border-0"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TrendingUp className={`w-3 h-3 ${heat.iconColor} shrink-0`} />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{factor.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">({factor.userValue})</span>
                  </div>
                  <span className={`font-mono font-semibold ${heat.textColor} shrink-0 ml-2`}>
                    +{factor.contribution} pts
                  </span>
                </div>
                {/* Visual heat bar without text label */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${heat.barGradient}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}

          {result.topNegativeFactors.slice(0, 2).map((factor) => {
            const heat = getFactorHeatStyle(factor.featureKey);
            const barWidth = Math.min(100, Math.max(16, (Math.abs(factor.contribution) / 10) * 100));
            return (
              <div
                key={factor.featureKey}
                className="py-1 border-b border-slate-100/70 dark:border-slate-800/80 last:border-0"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TrendingDown className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{factor.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">({factor.userValue})</span>
                  </div>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 shrink-0 ml-2">
                    {factor.contribution} pts
                  </span>
                </div>
                {/* Visual heat bar without text label */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${heat.barGradient}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Actionable Improvement Recommendations */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Academic Feedback</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-700 dark:text-slate-200">{result.modelName}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>Test R² <strong className="text-teal-700 dark:text-teal-400 font-mono font-bold">{result.modelAccuracy?.testR2?.toFixed(4) ?? '0.7973'}</strong></span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span>MSE <strong className="text-slate-700 dark:text-slate-200 font-mono font-bold">{result.modelAccuracy?.testMse?.toFixed(2) ?? '50.45'}</strong></span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="btn-download-score-card"
            onClick={handleDownload}
            disabled={isDownloading}
            title="Download official PDF Score Card"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200/90 dark:border-slate-700/70 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Score Card'}</span>
          </button>

          {onViewAnalysis && (
            <button
              type="button"
              id="btn-card-score-analysis"
              onClick={onViewAnalysis}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 hover:text-teal-950 dark:hover:text-white bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/90 dark:border-teal-700/60 rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Score Analysis</span>
              <ChevronRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
