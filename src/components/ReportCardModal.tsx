import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  GraduationCap,
  CheckCircle2,
  XCircle,
  FileDown,
  Download,
  Loader2,
  FileCheck,
  ArrowDownToLine
} from 'lucide-react';
import jsPDF from 'jspdf';
import { StudentRecord } from '../types';

interface ReportCardModalProps {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  // Print via browser
  const handlePrint = () => {
    window.print();
  };

  // Direct client-side PDF Generation & Download (Vector PDF - immune to oklch CSS parser errors)
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf || !student) return;
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const margin = 16;
      const contentWidth = pageWidth - margin * 2; // 178mm

      // 1. Top Decorative Header Bar
      doc.setFillColor(15, 118, 110); // Teal 700 (#0f766e)
      doc.rect(0, 0, pageWidth, 6, 'F');

      // 2. Institution / Assessment Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text('InsightEd  •  ACADEMIC PERFORMANCE ASSESSMENT', margin, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      const modelSubtitle = `Predictive Outcome Evaluation  •  ${student.prediction.modelName} (Test R²: ${
        student.prediction.modelAccuracy?.testR2?.toFixed(4) ?? '0.7973'
      })`;
      doc.text(modelSubtitle, margin, 26);

      // Reference and Date on top right
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`REF: ${student.studentId}`, pageWidth - margin, 19, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`DATE: ${new Date(student.createdAt).toLocaleDateString()}`, pageWidth - margin, 25, {
        align: 'right',
      });

      // Divider line
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);
      doc.line(margin, 30, pageWidth - margin, 30);

      // 3. Student Dossier Strip
      const dossierY = 36;
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, dossierY, contentWidth, 22, 3, 3, 'FD');

      const colWidth = contentWidth / 4;
      const dossierLabels = ['STUDENT NAME', 'STUDENT ID', 'CLASS ATTENDANCE', 'WEEKLY STUDY'];
      const dossierValues = [
        student.studentName,
        student.studentId,
        `${student.attendanceRate.toFixed(1)}%`,
        `${student.weeklyStudyHours} hrs`,
      ];

      dossierLabels.forEach((lbl, idx) => {
        const colX = margin + idx * colWidth + 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text(lbl, colX, dossierY + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        if (idx === 1) {
          doc.setTextColor(15, 118, 110); // Teal 700
        } else {
          doc.setTextColor(15, 23, 42); // Slate 900
        }
        doc.text(dossierValues[idx], colX, dossierY + 15);
      });

      // 4. Outcome Assessment Box
      const isPass = student.prediction.passed;
      const outcomeY = 64;
      const outcomeHeight = 36;

      if (isPass) {
        doc.setFillColor(240, 253, 244); // Emerald 50
        doc.setDrawColor(134, 239, 172); // Emerald 300
      } else {
        doc.setFillColor(255, 241, 242); // Rose 50
        doc.setDrawColor(253, 164, 175); // Rose 300
      }
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, outcomeY, contentWidth, outcomeHeight, 4, 4, 'FD');

      // Final Score section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('MACHINE LEARNING FINAL SCORE ESTIMATION', margin + 6, outcomeY + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      if (isPass) {
        doc.setTextColor(4, 120, 87); // Emerald 700
      } else {
        doc.setTextColor(190, 18, 60); // Rose 700
      }
      doc.text(`${student.prediction.finalScore.toFixed(2)}`, margin + 6, outcomeY + 22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(148, 163, 184);
      doc.text(' / 100', margin + 44, outcomeY + 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Evaluation Criterion: >50 marks represents Passing Grade', margin + 6, outcomeY + 29);

      // Official Status Badge
      const badgeWidth = 44;
      const badgeHeight = 12;
      const badgeX = pageWidth - margin - badgeWidth - 6;
      const badgeY = outcomeY + 7;

      if (isPass) {
        doc.setFillColor(5, 150, 105); // Emerald 600
        doc.setDrawColor(4, 120, 87);
      } else {
        doc.setFillColor(225, 29, 72); // Rose 600
        doc.setDrawColor(190, 18, 60);
      }
      doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(isPass ? 'PASSED' : 'FAILED', badgeX + badgeWidth / 2, badgeY + 8, { align: 'center' });

      // Awarded Grade
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Awarded Grade: ', badgeX + 4, outcomeY + 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 118, 110);
      doc.text(`${student.prediction.grade}`, badgeX + 33, outcomeY + 26);

      // 5. Evaluated Predictor Variables
      const predY = 106;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text('EVALUATED PREDICTOR VARIABLES', margin, predY);

      const tableY = predY + 4;
      const gridW = (contentWidth - 4) / 2;
      const gridH = 11;

      const predictorItems = [
        { label: 'Prior Semester Score:', val: `${student.previousSemesterScore.toFixed(1)}%` },
        { label: 'Sleep Schedule:', val: `${student.sleepHoursPerNight} hrs/night` },
        { label: 'Part-Time Employment:', val: student.partTimeJob === 1 ? 'Yes (-4.49 pts)' : 'None' },
        {
          label: 'Parental Education:',
          val:
            student.parentalEducationLevel === 2
              ? 'Master / PhD'
              : student.parentalEducationLevel === 1
              ? 'Bachelor'
              : 'High School',
        },
      ];

      predictorItems.forEach((item, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = margin + col * (gridW + 4);
        const y = tableY + row * (gridH + 3);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.25);
        doc.roundedRect(x, y, gridW, gridH, 2, 2, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(item.label, x + 3, y + 7);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(item.val, x + gridW - 3, y + 7, { align: 'right' });
      });

      // 6. Counselor & Academic Advisory Notes
      const notesY = 142;
      const notesHeight = 36;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, notesY, contentWidth, notesHeight, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text('Counselor & Academic Advisory Notes:', margin + 4, notesY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      const recommendations = student.prediction.recommendations || [
        'Maintain consistent daily study routines to sustain passing benchmarks.',
        'Focus on core problem areas prior to mid-semester evaluations.',
      ];

      recommendations.forEach((rec, idx) => {
        if (idx < 3) {
          doc.text(`•  ${rec}`, margin + 6, notesY + 14 + idx * 6);
        }
      });

      // 7. Official Signatures and Department Registrar
      const sigY = 200;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(margin, sigY, margin + 70, sigY);
      doc.line(pageWidth - margin - 70, sigY, pageWidth - margin, sigY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Academic Advisor Signature', margin, sigY + 5);
      doc.text('Department Registrar Official Stamp', pageWidth - margin - 70, sigY + 5);

      // 8. Footer verification stamp
      const footerY = 280;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'InsightEd Machine Learning Academic Verification System  •  Certified Evaluation Document',
        margin,
        footerY
      );
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageWidth - margin,
        footerY,
        { align: 'right' }
      );

      const cleanStudentName = student.studentName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `InsightEd_ReportCard_${cleanStudentName}_${student.studentId}.pdf`;
      doc.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (error) {
      console.error('Error rendering PDF:', error);
      // Fallback to browser print if any error occurs
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isPass = student.prediction.passed;
  const sanitizedFilename = `InsightEd_ReportCard_${student.studentName.trim().replace(/[^a-zA-Z0-9_-]/g, '_')}_${student.studentId}.pdf`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-card-title"
    >
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col print:border-none print:shadow-none my-auto">
        {/* Sticky Modal Top Bar with Quick Actions & Prominent Cross Close Button */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0" />
            <span id="report-card-title" className="text-xs sm:text-sm font-bold text-slate-800 truncate">
              Academic Report Card • <span className="font-mono text-teal-700">{student.studentName}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Download Button in Top Bar */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Download official PDF report"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </>
              )}
            </button>

            {/* Quick Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Print or save via browser system dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            {/* Prominent Cross (Close) Button */}
            <button
              type="button"
              id="report-card-close-btn"
              onClick={onClose}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-rose-100 hover:text-rose-700 border border-slate-200/80 transition-all flex items-center gap-1 cursor-pointer group"
              title="Close report card (Esc)"
              aria-label="Close report card"
            >
              <X className="w-4 h-4 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Printable Formal Academic Report Card */}
        <div id="printable-report-card" className="p-6 sm:p-8 space-y-6 bg-white">
          {/* Institution Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  InsightEd • ACADEMIC PERFORMANCE ASSESSMENT
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Predictive Outcome Evaluation • {student.prediction.modelName} (Test R²: {student.prediction.modelAccuracy?.testR2?.toFixed(4) ?? '0.7973'})
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono hidden sm:block">
              <div>REF: {student.studentId}</div>
              <div>DATE: {new Date(student.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Student Dossier Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Student Name</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{student.studentName}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Student ID</div>
              <div className="font-mono font-bold text-teal-700 text-sm mt-0.5">{student.studentId}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Class Attendance</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{student.attendanceRate.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Weekly Study</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{student.weeklyStudyHours} hrs</div>
            </div>
          </div>

          {/* Outcome Assessment Box */}
          <div
            className={`p-6 rounded-2xl border-2 flex flex-col sm:flex-row items-center justify-between gap-6 ${
              isPass
                ? 'bg-emerald-50/50 border-emerald-300'
                : 'bg-rose-50/50 border-rose-300'
            }`}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Machine Learning Final Score Estimation
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-4xl sm:text-5xl font-extrabold font-mono ${isPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {student.prediction.finalScore.toFixed(2)}
                </span>
                <span className="text-slate-400 font-bold text-xl">/ 100</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Evaluation Criterion: &gt;50 marks represents Passing Grade
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="text-xs text-slate-400 font-semibold mb-1">Official Status</div>
              <div
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-base sm:text-lg font-black border ${
                  isPass
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-rose-600 text-white border-rose-700 shadow-sm'
                }`}
              >
                {isPass ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 fill-white text-emerald-600" />
                    <span>PASSED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 fill-white text-rose-600" />
                    <span>FAILED</span>
                  </>
                )}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-2">
                Awarded Grade: <span className="font-extrabold text-teal-700">{student.prediction.grade}</span>
              </div>
            </div>
          </div>

          {/* Factor Breakdown Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Evaluated Predictor Variables
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex justify-between">
                <span className="text-slate-500">Prior Semester Score:</span>
                <span className="font-bold text-slate-900 font-mono">{student.previousSemesterScore.toFixed(1)}%</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex justify-between">
                <span className="text-slate-500">Sleep Schedule:</span>
                <span className="font-bold text-slate-900 font-mono">{student.sleepHoursPerNight} hrs/night</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex justify-between">
                <span className="text-slate-500">Part-Time Employment:</span>
                <span className="font-bold text-slate-900">{student.partTimeJob === 1 ? 'Yes (-4.49 pts)' : 'None'}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex justify-between">
                <span className="text-slate-500">Parental Education:</span>
                <span className="font-bold text-slate-900">
                  {student.parentalEducationLevel === 2 ? 'Master / PhD' : student.parentalEducationLevel === 1 ? 'Bachelor' : 'High School'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendation Notes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-800">Counselor &amp; Academic Advisory Notes:</div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
              {student.prediction.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Signatures & Certification */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300" />
              <div className="mt-1 font-medium">Academic Advisor Signature</div>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300" />
              <div className="mt-1 font-medium">Department Registrar Stamp</div>
            </div>
          </div>
        </div>

        {/* Dedicated Download Section as PDF (print:hidden) */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 text-white space-y-3.5 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0 text-teal-400">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white">Download Section (PDF)</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    A4 Ready • 300 DPI
                  </span>
                  {downloadSuccess && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      <span>Downloaded Successfully!</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Save the certified student evaluation to your local device with model metrics and grade assessment.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {/* Primary PDF Download Action */}
              <button
                type="button"
                id="report-card-download-pdf-btn"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="px-4 py-2.5 text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 disabled:opacity-60 rounded-xl transition-all shadow-md hover:shadow-teal-400/20 flex items-center gap-2 cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Rendering PDF...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4 text-slate-900" />
                    <span>Download as PDF</span>
                  </>
                )}
              </button>

              {/* Print Dialog Alternative */}
              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Print directly or save via browser print"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Print</span>
              </button>

              {/* Bottom Cross / Close Button */}
              <button
                type="button"
                id="report-card-bottom-close-btn"
                onClick={onClose}
                className="px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Close report card (Esc)"
              >
                <X className="w-3.5 h-3.5 text-slate-400" />
                <span>Close</span>
              </button>
            </div>
          </div>

          <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1.5">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-mono text-slate-300">{sanitizedFilename}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">High-Resolution Vector Format</span>
              <span>•</span>
              <button
                type="button"
                onClick={onClose}
                className="text-teal-400 hover:text-teal-300 underline font-medium cursor-pointer"
              >
                Dismiss Modal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
