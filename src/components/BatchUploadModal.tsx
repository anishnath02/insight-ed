import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  Info
} from 'lucide-react';
import { StudentInput, StudentRecord, ModelType } from '../types';
import { predictStudentPerformance } from '../mlModel';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (newStudents: StudentRecord[]) => void;
  activeModel?: ModelType;
}

const SAMPLE_CSV_TEMPLATE = `student_id,student_name,attendance_rate,weekly_study_hours,previous_semester_score,sleep_hours_per_night,extracurricular_activities,parental_education_level,internet_access_at_home,part_time_job,learning_disability
STU-2001,Nathan Fisher,88.5,24,76.0,8.0,1,1,1,0,0
STU-2002,Chloe Bennett,54.0,6,48.5,5.0,0,0,1,1,0
STU-2003,Marcus Vance,94.0,30,88.0,7.5,1,2,1,0,0
STU-2004,Olivia Chen,62.5,14,56.0,6.0,0,1,1,1,0
STU-2005,Daniel Miller,79.0,18,71.0,7.0,1,1,1,0,0`;

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  activeModel = 'random_forest',
}) => {
  const [csvText, setCsvText] = useState(SAMPLE_CSV_TEMPLATE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const parseAndPredict = () => {
    try {
      setErrorMsg(null);
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('Please provide at least one header line and one data row.');
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const newRecords: StudentRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map((c) => c.trim());

        if (cols.length < 11) {
          throw new Error(`Row ${i + 1} has ${cols.length} columns, expected 11 columns.`);
        }

        const input: StudentInput = {
          studentId: cols[0] || `STU-${1000 + i}`,
          studentName: cols[1] || `Student ${i}`,
          attendanceRate: parseFloat(cols[2]) || 75.0,
          weeklyStudyHours: parseFloat(cols[3]) || 15,
          previousSemesterScore: parseFloat(cols[4]) || 70.0,
          sleepHoursPerNight: parseFloat(cols[5]) || 7.0,
          extracurricularActivities: (parseInt(cols[6], 10) === 1 ? 1 : 0) as 0 | 1,
          parentalEducationLevel: (Math.min(2, Math.max(0, parseInt(cols[7], 10) || 0))) as 0 | 1 | 2,
          internetAccessAtHome: (parseInt(cols[8], 10) === 1 ? 1 : 0) as 0 | 1,
          partTimeJob: (parseInt(cols[9], 10) === 1 ? 1 : 0) as 0 | 1,
          learningDisability: (parseInt(cols[10], 10) === 1 ? 1 : 0) as 0 | 1,
        };

        const prediction = predictStudentPerformance(input, activeModel);
        newRecords.push({
          ...input,
          id: `batch-${Date.now()}-${i}`,
          prediction,
          createdAt: new Date().toISOString(),
        });
      }

      if (newRecords.length === 0) {
        throw new Error('No valid student entries parsed.');
      }

      onImportStudents(newRecords);
      setSuccessCount(newRecords.length);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error parsing CSV data. Please verify column format.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Batch Predict Student Roster
              </h3>
              <p className="text-xs text-slate-500">
                Import CSV files or paste spreadsheet rows to evaluate multiple students simultaneously.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* File input strip */}
          <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <Upload className="w-6 h-6 text-teal-600 mb-1" />
            <p className="text-xs font-semibold text-slate-800">
              Drag and drop your CSV file here, or browse
            </p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="mt-2 text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
            />
          </div>

          {/* Or Paste Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Or Edit / Paste CSV Content:
              </label>
              <button
                type="button"
                onClick={() => setCsvText(SAMPLE_CSV_TEMPLATE)}
                className="text-[11px] font-medium text-teal-600 hover:text-teal-800"
              >
                Reset to Sample
              </button>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              className="w-full p-3 font-mono text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              placeholder="Paste comma-separated rows here..."
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Successfully predicted &amp; imported {successCount} student records!</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Expected 11 columns in order: <code>student_id, student_name, attendance_rate, weekly_study_hours, previous_semester_score, sleep_hours_per_night, extracurricular_activities (0/1), parental_education_level (0/1/2), internet_access_at_home (0/1), part_time_job (0/1), learning_disability (0/1)</code>.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={parseAndPredict}
            className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
          >
            Run Batch Prediction
          </button>
        </div>
      </div>
    </div>
  );
};
