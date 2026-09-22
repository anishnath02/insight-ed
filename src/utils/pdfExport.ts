import { jsPDF } from 'jspdf';
import { StudentRecord } from '../types';

/**
 * Generates and triggers download of an official academic Score Card PDF.
 */
export async function downloadScoreCardPdf(student: StudentRecord): Promise<boolean> {
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
    doc.text(`DATE: ${new Date(student.createdAt || Date.now()).toLocaleDateString()}`, pageWidth - margin, 25, {
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
      student.studentName || 'Student Candidate',
      student.studentId || 'ID: PENDING',
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
      doc.setTextColor(15, 23, 42);
      doc.text(dossierValues[idx], colX, dossierY + 15);
    });

    // 4. Primary Academic Outcome Box
    const outcomeY = 64;
    const isPassing = student.prediction.passed;
    doc.setFillColor(isPassing ? 240 : 255, isPassing ? 253 : 241, isPassing ? 250 : 242);
    doc.setDrawColor(isPassing ? 153 : 254, isPassing ? 246 : 205, isPassing ? 228 : 211);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, outcomeY, contentWidth, 32, 3, 3, 'FD');

    // Predicted Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PREDICTED FINAL GRADE SCORE', margin + 8, outcomeY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.setTextColor(isPassing ? 15 : 225, isPassing ? 118 : 29, isPassing ? 110 : 72);
    doc.text(`${student.prediction.finalScore.toFixed(2)}`, margin + 8, outcomeY + 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text('/ 100 pts', margin + 44, outcomeY + 22);

    // Letter Grade Badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Letter Grade: ${student.prediction.grade}`, margin + 80, outcomeY + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Pass Threshold: 50.0 pts`, margin + 80, outcomeY + 21);

    // Pass / Fail Stamp on right
    const stampX = pageWidth - margin - 40;
    const stampY = outcomeY + 7;
    doc.setFillColor(isPassing ? 16 : 225, isPassing ? 185 : 29, isPassing ? 129 : 72);
    doc.roundedRect(stampX, stampY, 32, 18, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(student.prediction.status.toUpperCase(), stampX + 16, stampY + 11.5, {
      align: 'center',
    });

    // 5. Feature Audit Table
    const tableY = 104;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('Key Factor Breakdown & Evaluated Inputs:', margin, tableY);

    const inputRows = [
      ['Attendance Rate', `${student.attendanceRate.toFixed(1)}%`, 'Benchmark >= 80%'],
      ['Weekly Study Hours', `${student.weeklyStudyHours} hrs/wk`, 'Optimal 20-30 hrs'],
      ['Prior Semester Score', `${student.previousSemesterScore.toFixed(1)} pts`, 'Baseline baseline'],
      ['Sleep Duration', `${student.sleepHoursPerNight} hrs/night`, 'Recommended 7-9 hrs'],
      ['Extracurricular Activities', student.extracurricularActivities ? 'Participating' : 'None', 'Synergistic'],
      ['Home Internet Access', student.internetAccessAtHome ? 'High-speed Connected' : 'Limited', 'Core resource'],
    ];

    let currentY = tableY + 5;
    inputRows.forEach(([feature, val, note]) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, currentY, contentWidth, 5.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(feature, margin + 4, currentY + 3.8);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(val, margin + 80, currentY + 3.8);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(note, margin + 125, currentY + 3.8);

      currentY += 6;
    });

    // 6. Counselor & Academic Advisory Notes
    const notesY = currentY + 4;
    const notesHeight = 32;
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
        doc.text(`•  ${rec}`, margin + 6, notesY + 14 + idx * 5.5);
      }
    });

    // 7. Official Signatures
    const sigY = notesY + notesHeight + 20;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(margin, sigY, margin + 65, sigY);
    doc.line(pageWidth - margin - 65, sigY, pageWidth - margin, sigY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Academic Advisor Signature', margin, sigY + 5);
    doc.text('Department Registrar Official Stamp', pageWidth - margin - 65, sigY + 5);

    // 8. Footer verification stamp
    const footerY = 282;
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

    const cleanStudentName = (student.studentName || 'Student').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `InsightEd_ScoreCard_${cleanStudentName}_${student.studentId || 'Report'}.pdf`;
    doc.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating score card PDF:', error);
    return false;
  }
}
