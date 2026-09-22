import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Briefcase,
  HelpCircle,
  Clock,
  Download,
  Users,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { StudentRecord, StudentInput, ModelType } from '../types';

interface RosterTableProps {
  students: StudentRecord[];
  activeModel?: ModelType;
  onSelectStudent: (student: StudentRecord) => void;
  onDeleteStudent: (id: string) => void;
  onOpenReportCard: (student: StudentRecord) => void;
  onExportCsv: () => void;
  onReevaluateRoster?: (model: ModelType) => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  students,
  activeModel = 'random_forest',
  onSelectStudent,
  onDeleteStudent,
  onOpenReportCard,
  onExportCsv,
  onReevaluateRoster,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'score-desc' | 'score-asc' | 'attendance' | 'study-hours' | 'newest'>('score-desc');

  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Status filter
    if (statusFilter === 'passed') {
      result = result.filter((s) => s.prediction.passed);
    } else if (statusFilter === 'failed') {
      result = result.filter((s) => !s.prediction.passed);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'score-desc') return b.prediction.finalScore - a.prediction.finalScore;
      if (sortBy === 'score-asc') return a.prediction.finalScore - b.prediction.finalScore;
      if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
      if (sortBy === 'study-hours') return b.weeklyStudyHours - a.weeklyStudyHours;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    return result;
  }, [students, statusFilter, searchQuery, sortBy]);

  const passedCount = students.filter((s) => s.prediction.passed).length;
  const failedCount = students.length - passedCount;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Header and Control Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Evaluated Student Roster
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">
              {filteredStudents.length} of {students.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time scoreboard displaying model predictions and academic status.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segmented Control */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('passed')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'passed'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-emerald-700'
              }`}
            >
              Passed ({passedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('failed')}
              className={`px-3 py-1 rounded-md transition-colors ${
                statusFilter === 'failed'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-rose-700'
              }`}
            >
              Failed ({failedCount})
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            id="select-sort-roster"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500 focus:outline-hidden"
          >
            <option value="score-desc">Highest Score</option>
            <option value="score-asc">Lowest Score</option>
            <option value="attendance">Attendance</option>
            <option value="study-hours">Study Hours</option>
            <option value="newest">Most Recent</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="input-search-roster"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}

        {onReevaluateRoster && (
          <button
            type="button"
            onClick={() => onReevaluateRoster(activeModel)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition-colors shrink-0 shadow-2xs"
            title={`Re-calculate all ${students.length} student scores using ${
              activeModel === 'random_forest' ? 'Random Forest (R² 0.80)' : 'Linear Regression (R² 0.77)'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Re-score Roster with</span>
            <span>{activeModel === 'random_forest' ? 'Random Forest' : 'Linear Reg'}</span>
          </button>
        )}
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="py-2.5 px-4">Student</th>
              <th className="py-2.5 px-4">Attendance</th>
              <th className="py-2.5 px-4">Study Hrs</th>
              <th className="py-2.5 px-4">Prior Score</th>
              <th className="py-2.5 px-4">Predicted Score</th>
              <th className="py-2.5 px-4">Status (&gt;50)</th>
              <th className="py-2.5 px-4">Grade</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <Users className="w-7 h-7 text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600 text-xs">No students match current filter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Adjust your search query or reset filter to view all entries.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const isPass = student.prediction.passed;
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    {/* Name and ID */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.studentName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {student.studentId}
                        </span>
                        {student.partTimeJob === 1 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1 rounded border border-amber-200" title="Part-Time Job">
                            <Briefcase className="w-2.5 h-2.5" /> Job
                          </span>
                        )}
                        {student.learningDisability === 1 && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-700 bg-purple-50 px-1 rounded border border-purple-200" title="Learning Accommodation">
                            <HelpCircle className="w-2.5 h-2.5" /> Support
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            student.attendanceRate >= 85
                              ? 'bg-emerald-500'
                              : student.attendanceRate >= 70
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>{student.attendanceRate.toFixed(1)}%</span>
                      </div>
                    </td>

                    {/* Study Hours */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {student.weeklyStudyHours} hrs/wk
                    </td>

                    {/* Previous Score */}
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {student.previousSemesterScore.toFixed(1)}
                    </td>

                    {/* Predicted Score with Visual Bar and Model Badge */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isPass ? 'text-teal-700' : 'text-rose-600'
                          }`}
                        >
                          {student.prediction.finalScore.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1 rounded ${
                            student.prediction.modelUsed === 'random_forest'
                              ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                          title={`Predicted by ${student.prediction.modelName || 'Model'}`}
                        >
                          {student.prediction.modelUsed === 'random_forest' ? 'RF' : 'LR'}
                        </span>
                      </div>
                      <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            isPass ? 'bg-teal-600' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, student.prediction.finalScore))}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Pill: Passed vs Failed */}
                    <td className="py-3 px-4">
                      {isPass ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    {/* Letter Grade */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${student.prediction.gradeColor}`}>
                        {student.prediction.grade}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenReportCard(student)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded transition-colors"
                          title="View Official Report Card"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                          title="Load into Evaluator Form"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteStudent(student.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {filteredStudents.length} entries
        </div>
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
};
