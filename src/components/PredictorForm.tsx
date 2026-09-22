import React from 'react';
import {
  User,
  Hash,
  Clock,
  Percent,
  Moon,
  Briefcase,
  Wifi,
  Sparkles,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
  Zap,
  BookOpen,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { StudentInput, ParentalEducationLevel, ModelType } from '../types';
import { PRESET_SCENARIOS, ScenarioPreset } from '../sampleData';

interface PredictorFormProps {
  input: StudentInput;
  onChange: (updated: StudentInput) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  isRealtime: boolean;
  onToggleRealtime: () => void;
  activeModel?: ModelType;
  onModelChange?: (model: ModelType) => void;
  onViewAnalysis?: () => void;
}

export const PredictorForm: React.FC<PredictorFormProps> = ({
  input,
  onChange,
  onSubmit,
  onReset,
  isRealtime,
  onToggleRealtime,
  activeModel = 'random_forest',
  onModelChange,
  onViewAnalysis,
}) => {
  const handleTextChange = (field: 'studentName' | 'studentId', val: string) => {
    onChange({
      ...input,
      [field]: val,
    });
  };

  const handleNumberChange = (
    field: 'attendanceRate' | 'weeklyStudyHours' | 'previousSemesterScore' | 'sleepHoursPerNight',
    val: number
  ) => {
    let cleanVal = val;
    if (field === 'weeklyStudyHours') {
      cleanVal = Math.min(50, Math.max(0, val));
    }
    onChange({
      ...input,
      [field]: cleanVal,
    });
  };

  const handleBinaryChange = (
    field: 'extracurricularActivities' | 'internetAccessAtHome' | 'partTimeJob' | 'learningDisability',
    val: 0 | 1
  ) => {
    onChange({
      ...input,
      [field]: val,
    });
  };

  const handleParentEduChange = (level: ParentalEducationLevel) => {
    onChange({
      ...input,
      parentalEducationLevel: level,
    });
  };

  const applyPreset = (preset: ScenarioPreset) => {
    onChange({
      ...preset.data,
      studentId: input.studentId || preset.data.studentId,
      studentName: input.studentName || preset.data.studentName,
    });
  };

  const generateRandomId = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    onChange({
      ...input,
      studentId: `STU-${randomNum}`,
    });
  };

  return (
    <form id="form-predictor" onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-6">
      {/* Top Form Header with Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            Student Profile &amp; Model Inputs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure student parameters to calculate predicted final score and pass threshold.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {onModelChange && (
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs border border-slate-200/70">
              <button
                type="button"
                id="btn-model-rf"
                onClick={() => onModelChange('random_forest')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                  activeModel === 'random_forest'
                    ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Random Forest</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold uppercase tracking-wider">
                  Primary
                </span>
              </button>
              <button
                type="button"
                id="btn-model-linear"
                onClick={() => onModelChange('linear_regression')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  activeModel === 'linear_regression'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Linear Baseline</span>
              </button>
            </div>
          )}

          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition-colors">
            <input
              id="checkbox-realtime"
              type="checkbox"
              checked={isRealtime}
              onChange={onToggleRealtime}
              className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
            />
            <Zap className={`w-3.5 h-3.5 ${isRealtime ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span>Live Sync</span>
          </label>
        </div>
      </div>

      {/* Preset Scenarios Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-teal-600" />
          Presets:
        </span>
        {PRESET_SCENARIOS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset)}
            className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-600 border border-slate-200/80 hover:border-teal-300 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Student Identity Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="input-student-name" className="block text-xs font-semibold text-slate-700 mb-1">
            Student Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="input-student-name"
              type="text"
              required
              value={input.studentName}
              onChange={(e) => handleTextChange('studentName', e.target.value)}
              placeholder="e.g. Sofia Harris"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-student-id" className="block text-xs font-semibold text-slate-700">
              Student ID <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={generateRandomId}
              className="text-[11px] font-medium text-teal-600 hover:text-teal-800"
            >
              Auto-Generate
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-4 h-4" />
            </div>
            <input
              id="input-student-id"
              type="text"
              required
              value={input.studentId}
              onChange={(e) => handleTextChange('studentId', e.target.value)}
              placeholder="e.g. STU-1001"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Section 1: Academic Factors */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Percent className="w-3.5 h-3.5 text-teal-600" />
          Academic &amp; Study Metrics
        </h3>

        <div className="space-y-4">
          {/* Attendance Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="slider-attendance" className="font-semibold text-slate-700">
                Class Attendance Rate
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="number-attendance"
                  type="number"
                  min="50"
                  max="100"
                  step="0.1"
                  value={input.attendanceRate}
                  onChange={(e) => handleNumberChange('attendanceRate', parseFloat(e.target.value) || 50)}
                  className="w-16 px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono font-bold text-right text-teal-800 bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-medium">%</span>
              </div>
            </div>
            <input
              id="slider-attendance"
              type="range"
              min="50"
              max="100"
              step="0.1"
              value={input.attendanceRate}
              onChange={(e) => handleNumberChange('attendanceRate', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>50% (Min)</span>
              <span>75% (Target)</span>
              <span>100% (Full)</span>
            </div>
          </div>

          {/* Weekly Study Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="slider-study-hours" className="font-semibold text-slate-700">
                Weekly Self-Study Hours
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="number-study-hours"
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={input.weeklyStudyHours}
                  onChange={(e) => handleNumberChange('weeklyStudyHours', parseInt(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono font-bold text-right text-teal-800 bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-medium">hrs</span>
              </div>
            </div>
            <input
              id="slider-study-hours"
              type="range"
              min="0"
              max="50"
              step="1"
              value={input.weeklyStudyHours}
              onChange={(e) => handleNumberChange('weeklyStudyHours', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 hrs</span>
              <span>25 hrs (Typical)</span>
              <span>50 hrs (Max)</span>
            </div>
          </div>

          {/* Previous Semester Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="slider-prev-score" className="font-semibold text-slate-700">
                Previous Semester Score
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="number-prev-score"
                  type="number"
                  min="40"
                  max="100"
                  step="0.1"
                  value={input.previousSemesterScore}
                  onChange={(e) => handleNumberChange('previousSemesterScore', parseFloat(e.target.value) || 40)}
                  className="w-16 px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono font-bold text-right text-teal-800 bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-medium">pts</span>
              </div>
            </div>
            <input
              id="slider-prev-score"
              type="range"
              min="40"
              max="100"
              step="0.1"
              value={input.previousSemesterScore}
              onChange={(e) => handleNumberChange('previousSemesterScore', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>40 pts</span>
              <span>70 pts</span>
              <span>100 pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Lifestyle, Support, & Environment */}
      <div className="pt-2 border-t border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-teal-600" />
          Lifestyle &amp; Demographics
        </h3>

        <div className="space-y-4">
          {/* Nightly Sleep Duration */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="slider-sleep" className="font-semibold text-slate-700">
                Nightly Sleep Duration
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="number-sleep"
                  type="number"
                  min="4"
                  max="10"
                  step="0.5"
                  value={input.sleepHoursPerNight}
                  onChange={(e) => handleNumberChange('sleepHoursPerNight', parseFloat(e.target.value) || 4)}
                  className="w-16 px-1.5 py-0.5 border border-slate-200 rounded text-xs font-mono font-bold text-right text-teal-800 bg-white focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
                />
                <span className="text-xs text-slate-400 font-medium">hrs</span>
              </div>
            </div>
            <input
              id="slider-sleep"
              type="range"
              min="4"
              max="10"
              step="0.5"
              value={input.sleepHoursPerNight}
              onChange={(e) => handleNumberChange('sleepHoursPerNight', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>4 hrs</span>
              <span>7.5 hrs (Optimal)</span>
              <span>10 hrs</span>
            </div>
          </div>

          {/* Parental Education Level - Segmented Button */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Parental Education Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleParentEduChange(0)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  input.parentalEducationLevel === 0
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                High School
              </button>

              <button
                type="button"
                onClick={() => handleParentEduChange(1)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  input.parentalEducationLevel === 1
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Bachelor&apos;s
              </button>

              <button
                type="button"
                onClick={() => handleParentEduChange(2)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                  input.parentalEducationLevel === 2
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Master / PhD
              </button>
            </div>
          </div>

          {/* 4 Clean Binary Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Part-Time Job */}
            <div
              onClick={() => handleBinaryChange('partTimeJob', input.partTimeJob === 1 ? 0 : 1)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                input.partTimeJob === 1
                  ? 'bg-amber-50/60 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className={`w-4 h-4 ${input.partTimeJob === 1 ? 'text-amber-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">Part-Time Job</div>
                  <div className="text-[10px] text-slate-400">Employed during term</div>
                </div>
              </div>
              <div
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                  input.partTimeJob === 1 ? 'bg-amber-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-2xs transform transition-transform ${
                    input.partTimeJob === 1 ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Extracurricular Activities */}
            <div
              onClick={() =>
                handleBinaryChange('extracurricularActivities', input.extracurricularActivities === 1 ? 0 : 1)
              }
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                input.extracurricularActivities === 1
                  ? 'bg-teal-50/60 border-teal-300 text-teal-900'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className={`w-4 h-4 ${input.extracurricularActivities === 1 ? 'text-teal-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">Extracurriculars</div>
                  <div className="text-[10px] text-slate-400">Sports &amp; student clubs</div>
                </div>
              </div>
              <div
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                  input.extracurricularActivities === 1 ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-2xs transform transition-transform ${
                    input.extracurricularActivities === 1 ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Home Internet Access */}
            <div
              onClick={() => handleBinaryChange('internetAccessAtHome', input.internetAccessAtHome === 1 ? 0 : 1)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                input.internetAccessAtHome === 1
                  ? 'bg-teal-50/60 border-teal-300 text-teal-900'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wifi className={`w-4 h-4 ${input.internetAccessAtHome === 1 ? 'text-teal-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">Home Internet</div>
                  <div className="text-[10px] text-slate-400">Broadband access</div>
                </div>
              </div>
              <div
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                  input.internetAccessAtHome === 1 ? 'bg-teal-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-2xs transform transition-transform ${
                    input.internetAccessAtHome === 1 ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Learning Support / Disability */}
            <div
              onClick={() => handleBinaryChange('learningDisability', input.learningDisability === 1 ? 0 : 1)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${
                input.learningDisability === 1
                  ? 'bg-purple-50/60 border-purple-300 text-purple-900'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className={`w-4 h-4 ${input.learningDisability === 1 ? 'text-purple-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">Support Accommodation</div>
                  <div className="text-[10px] text-slate-400">Assisted learning program</div>
                </div>
              </div>
              <div
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                  input.learningDisability === 1 ? 'bg-purple-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-2xs transform transition-transform ${
                    input.learningDisability === 1 ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Bottom Submission Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/70"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <div className="flex items-center gap-2">
          {onViewAnalysis && (
            <button
              type="button"
              onClick={onViewAnalysis}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-colors shadow-2xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>Cohort Score Analysis</span>
              <ChevronRight className="w-3 h-3 text-teal-600" />
            </button>
          )}

          <button
            id="btn-submit-predict"
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Predict Score</span>
          </button>
        </div>
      </div>
    </form>
  );
};
