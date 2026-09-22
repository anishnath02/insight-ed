import React, { useState } from 'react';
import {
  X,
  BarChart3,
  CheckCircle2,
  Table as TableIcon,
  ScatterChart,
  Cpu,
  Award,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import {
  MODEL_COMPARISON_METRICS,
  RANDOM_FOREST_METRICS,
  RANDOM_FOREST_FEATURE_IMPORTANCES,
  LINEAR_REGRESSION_WEIGHTS,
  SCATTER_PLOT_DATA
} from '../mlModel';

interface ModelInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelInsightsModal: React.FC<ModelInsightsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'rf_architecture' | 'formula' | 'scatter'>('comparison');
  const [scatterModel, setScatterModel] = useState<'both' | 'rf' | 'linear'>('rf');

  if (!isOpen) return null;

  const featureImportanceList = Object.entries(RANDOM_FOREST_FEATURE_IMPORTANCES).sort(
    ([, a], [, b]) => b.importance - a.importance
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Machine Learning Model Architecture &amp; Benchmarks
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Primary: Random Forest
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Extracted from the training notebook (Random Forest Regressor depth=5 vs Linear Regression)
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white border-b border-slate-100 flex items-center gap-2 sm:gap-4 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'comparison'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Model Benchmarks (df_models)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rf_architecture')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rf_architecture'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Random Forest Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'formula'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Linear Formula (Baseline)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scatter')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'scatter'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ScatterChart className="w-3.5 h-3.5" />
            <span>Scatter Dispersion (Cells 223/224)</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Model Benchmarks Table from notebook cell 183 */}
          {activeTab === 'comparison' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Original Dataset</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">1,001 rows</div>
                  <div className="text-[11px] text-slate-400">885 records after dropna()</div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">Train / Test Split (80/20)</div>
                  <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">708 / 177 rows</div>
                  <div className="text-[11px] text-slate-400">random_state=100 (reproducible)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-300">
                  <div className="text-xs text-teal-800 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    Primary Model Test R²
                  </div>
                  <div className="text-lg font-bold text-teal-950 font-mono mt-0.5">0.7973 (79.7%)</div>
                  <div className="text-[11px] text-teal-700 font-medium">Random Forest MSE: 50.4475</div>
                </div>
              </div>

              {/* Exact Table replication */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100/80 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Notebook Comparison Table (Cell 183: df_models)</span>
                  <span className="text-[11px] font-mono text-slate-500">pd.concat([lr_results, rf_results])</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Method</th>
                      <th className="py-2.5 px-4 font-mono">Training MSE</th>
                      <th className="py-2.5 px-4 font-mono">Training R²</th>
                      <th className="py-2.5 px-4 font-mono">Test MSE</th>
                      <th className="py-2.5 px-4 font-mono">Test R²</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MODEL_COMPARISON_METRICS.map((row, idx) => (
                      <tr key={idx} className={row.isPrimary ? 'bg-teal-50/50 font-medium' : ''}>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <span className="font-bold text-slate-900">{row.method}</span>
                          {row.isPrimary && (
                            <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                              PRIMARY
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono">{row.trainingMse.toFixed(4)}</td>
                        <td className="py-3 px-4 font-mono text-teal-700 font-bold">{row.trainingR2.toFixed(5)}</td>
                        <td className="py-3 px-4 font-mono font-semibold">{row.testMse.toFixed(4)}</td>
                        <td className="py-3 px-4 font-mono text-emerald-700 font-extrabold">{row.testR2.toFixed(5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Why Random Forest is the Primary Model:</span>
                </div>
                <p className="leading-relaxed">
                  The notebook empirical benchmark clearly demonstrates that <strong>Random Forest Regressor (max_depth=5)</strong> dominates the evaluation. It achieves a <strong>higher Test R² (0.7973 vs 0.7702)</strong> and substantially <strong>lower Test MSE (50.45 vs 57.20)</strong>. Furthermore, Random Forest captures non-linear synergies between attendance and study hours, accounts for realistic diminishing returns beyond 30+ weekly hours, and accurately models compounding penalties when student part-time employment interacts with sleep deprivation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Random Forest Architecture & Feature Importances */}
          {activeTab === 'rf_architecture' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>// Scikit-Learn Training Specification</span>
                  <span>RandomForestRegressor(max_depth=5, random_state=100)</span>
                </div>
                <div className="text-teal-400 font-mono text-sm font-bold">
                  Ensemble: 10 Decision Trees • Max Depth = 5 • Criterion = 'squared_error'
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Each tree in the forest recursively splits student samples based on threshold rules. The final predicted score is the ensemble average of all decision tree leaves, guaranteeing bounded variance and robust generalization across diverse student profiles.
                </p>
              </div>

              {/* Feature Importance Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-100/80 px-4 py-2.5 text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Tree-Based Mean Decrease in Impurity (MDI Feature Importance)</span>
                  <span className="text-[11px] font-mono text-slate-500">rf.feature_importances_</span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                      <th className="py-2.5 px-4">Feature Name</th>
                      <th className="py-2.5 px-4">Importance</th>
                      <th className="py-2.5 px-4">Variance Contribution Bar</th>
                      <th className="py-2.5 px-4">Forest Decision Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {featureImportanceList.map(([key, info]) => {
                      const pct = (info.importance * 100).toFixed(1);
                      return (
                        <tr key={key} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-400">
                            #{info.rank}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {info.label}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-teal-700">
                            {pct}%
                          </td>
                          <td className="py-2.5 px-4 w-48">
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-600 rounded-full"
                                style={{ width: `${Math.min(100, info.importance * 200)}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                            {info.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Linear Formula (Baseline Reference) */}
          {activeTab === 'formula' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                <div className="text-slate-400 mb-1">// Baseline OLS Regression Reference (LinearRegression.fit):</div>
                <div className="text-emerald-400 font-bold text-sm">
                  Predicted_Score = -28.0734
                </div>
                <div className="pl-4 text-slate-200 mt-1 space-y-0.5">
                  <div>+ 0.64103151 &times; attendance_rate (%)</div>
                  <div>+ 0.50796735 &times; weekly_study_hours (hrs)</div>
                  <div>+ 0.29443109 &times; previous_semester_score (marks)</div>
                  <div>+ 2.12168839 &times; sleep_hours_per_night (hrs)</div>
                  <div>- 0.17202988 &times; extracurricular_activities (0 or 1)</div>
                  <div>- 0.51481117 &times; parental_education_level (0, 1, 2)</div>
                  <div>- 1.59324097 &times; internet_access_at_home (0 or 1)</div>
                  <div>- 4.49451783 &times; part_time_job (0 or 1)</div>
                  <div>- 0.29346414 &times; learning_disability (0 or 1)</div>
                </div>
              </div>

              {/* Coefficients Detail Table */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Feature Name</th>
                      <th className="py-2.5 px-4">Learned Coefficient</th>
                      <th className="py-2.5 px-4">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">Attendance Rate</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">+0.6410</td>
                      <td className="py-2.5 px-4 text-slate-600">Linear slope per percentage point of attendance</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">Weekly Study Hours</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">+0.5080</td>
                      <td className="py-2.5 px-4 text-slate-600">Linear gain per weekly self-study hour</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">Sleep Hours / Night</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-600">+2.1217</td>
                      <td className="py-2.5 px-4 text-slate-600">Cognitive rest factor multiplier</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">Part-Time Job</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-rose-600">-4.4945</td>
                      <td className="py-2.5 px-4 text-slate-600">Static tax on student schedule</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Matplotlib Scatter Plot recreation */}
          {activeTab === 'scatter' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Actual vs Predicted Dispersion (Test Set n=177)</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Display:</span>
                  <button
                    type="button"
                    onClick={() => setScatterModel('rf')}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                      scatterModel === 'rf'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Random Forest (Primary)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScatterModel('linear')}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                      scatterModel === 'linear'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Linear
                  </button>
                  <button
                    type="button"
                    onClick={() => setScatterModel('both')}
                    className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                      scatterModel === 'both'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Both Models
                  </button>
                </div>
              </div>

              {/* Interactive SVG Scatter Plot */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                <div className="w-full max-w-md aspect-square bg-white rounded-lg border border-slate-300 p-4 relative shadow-2xs">
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1="0" y1="100" x2="100" y2="100" stroke="#cbd5e1" strokeWidth="0.75" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1,1" />
                    <line x1="0" y1="0" x2="100" y2="0" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2="0" y2="100" stroke="#cbd5e1" strokeWidth="0.75" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1,1" />

                    {/* 50 point Pass/Fail threshold lines */}
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#f43f5e" strokeWidth="0.4" strokeDasharray="1,1" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#f43f5e" strokeWidth="0.4" strokeDasharray="1,1" />

                    {/* 1:1 Identity / Polyfit Trendline (#F8766D matching notebook!) */}
                    <line x1="20" y1="80" x2="95" y2="10" stroke="#F8766D" strokeWidth="1.5" />

                    {/* Scatter Points */}
                    {SCATTER_PLOT_DATA.map((pt, i) => {
                      const cx = pt.actual;
                      const rfPred = pt.rfPredicted ?? pt.predicted;
                      const linPred = pt.linearPredicted ?? pt.predicted;

                      return (
                        <g key={i}>
                          {(scatterModel === 'rf' || scatterModel === 'both') && (
                            <circle
                              cx={cx}
                              cy={100 - rfPred}
                              r={scatterModel === 'both' ? '2' : '2.5'}
                              fill="#0D9488"
                              opacity="0.85"
                              className="hover:r-3.5 transition-all cursor-pointer"
                            >
                              <title>
                                [Random Forest] {pt.studentName}: Actual {pt.actual}, Predicted {rfPred}
                              </title>
                            </circle>
                          )}
                          {(scatterModel === 'linear' || scatterModel === 'both') && (
                            <circle
                              cx={cx}
                              cy={100 - linPred}
                              r={scatterModel === 'both' ? '2' : '2.5'}
                              fill="#7CAE00"
                              opacity="0.75"
                              className="hover:r-3.5 transition-all cursor-pointer"
                            >
                              <title>
                                [Linear] {pt.studentName}: Actual {pt.actual}, Predicted {linPred}
                              </title>
                            </circle>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Axis labels */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">
                    Actual Final Score &rarr;
                  </div>
                  <div className="absolute top-1/2 left-1 -translate-y-1/2 -rotate-90 text-[9px] font-bold text-slate-500 origin-left">
                    Predicted Score &rarr;
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 flex-wrap justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#0D9488]" />
                    <span className="font-semibold text-teal-800">Random Forest (Cell 224, R²=0.797)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#7CAE00]" />
                    <span>Linear Regression (Cell 223, R²=0.770)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-[#F8766D]" />
                    <span>Identity Fit (#F8766D)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Close Insights
          </button>
        </div>
      </div>
    </div>
  );
};
