import React, { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  User,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  MapPin,
  Copy,
  Check
} from 'lucide-react';
import { ActiveView } from '../types';

interface ContactPageProps {
  onNavigate: (view: ActiveView) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    category: 'general_feedback',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTicketId(`INQ-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      institution: '',
      category: 'general_feedback',
      subject: '',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-800 text-xs font-semibold rounded-full border border-teal-200/80 mb-3">
            <Mail className="w-3.5 h-3.5 text-teal-600" />
            <span>Support &amp; Academic Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Contact Us
          </h1>
          <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
            Have questions about the Random Forest model, educational datasets, integration into your institution's LMS, or feature requests? Send us a message and our research team will respond within 24 to 48 hours.
          </p>
        </div>
      </section>

      {/* Main Form & Direct Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Contact Form (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
          {submitted ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Thank you for reaching out, <span className="font-semibold text-slate-700">{formData.fullName}</span>. A confirmation has been logged under inquiry reference:
                </p>
                <div className="inline-block mt-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-mono font-bold text-teal-900 border border-slate-200">
                  {ticketId}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Send Another Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('predict')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                >
                  Return to Predictor
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Send a Direct Message</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-xs font-semibold text-slate-700">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Prof. Jane Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-xs font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="jane.doe@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Institution / Organization */}
                <div className="space-y-1">
                  <label htmlFor="contact-institution" className="text-xs font-semibold text-slate-700">
                    Institution / University
                  </label>
                  <input
                    id="contact-institution"
                    type="text"
                    placeholder="Department of Computer Science"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label htmlFor="contact-category" className="text-xs font-semibold text-slate-700">
                    Inquiry Category
                  </label>
                  <select
                    id="contact-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    <option value="general_feedback">General Feedback</option>
                    <option value="model_methodology">Random Forest Model &amp; Methodology</option>
                    <option value="dataset_collaboration">Dataset Collaboration &amp; Research</option>
                    <option value="lms_integration">LMS / School Software Integration</option>
                    <option value="bug_report">Bug Report / Technical Issue</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <label htmlFor="contact-subject" className="text-xs font-semibold text-slate-700">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="Inquiry regarding Random Forest hyperparameters"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label htmlFor="contact-message" className="text-xs font-semibold text-slate-700">
                  Message <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="Please describe your question or research inquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Message'}</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Right Column: Direct Channels & FAQs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Core Developers Contact Card */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Core Developers</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-800 rounded-full border border-teal-200/60">
                Direct Contact
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Anish Nath */}
              <div className="p-3.5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/70 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900">Anish Nath</h4>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">
                        Model Building &amp; Web Implementation
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="text-slate-600 font-medium">B.Tech in CSE</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Kolkata, India</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                    AN
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] text-slate-700 font-medium select-all">
                    nathanish6@gmail.com
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyEmail('nathanish6@gmail.com')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail === 'nathanish6@gmail.com' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href="mailto:nathanish6@gmail.com"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Tithibrata Biswas */}
              <div className="p-3.5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/70 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900">Tithibrata Biswas</h4>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/80">
                        Data Processing, Analysis &amp; Visualization
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="text-slate-600 font-medium">B.Tech in CSE</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Kolkata, India</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                    TB
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] text-slate-700 font-medium select-all">
                    tithibrata123@gmail.com
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyEmail('tithibrata123@gmail.com')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Copy email"
                    >
                      {copiedEmail === 'tithibrata123@gmail.com' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href="mailto:tithibrata123@gmail.com"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick FAQ Card */}
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <details className="group p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <summary className="font-semibold text-slate-800 list-none flex items-center justify-between">
                  <span>How is student privacy protected?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  InsightEd runs purely in-browser for client predictions and uses no telemetry tracking. All evaluated students reside in local storage and can be wiped or exported by the user at any time.
                </p>
              </details>

              <details className="group p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <summary className="font-semibold text-slate-800 list-none flex items-center justify-between">
                  <span>Can I import my own school's CSV?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Yes! Head to the <strong>Predict Score</strong> or <strong>About</strong> section to download the template format, or use the <strong>Batch CSV</strong> uploader to import cohorts directly.
                </p>
              </details>

              <details className="group p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <summary className="font-semibold text-slate-800 list-none flex items-center justify-between">
                  <span>Why is Random Forest the primary model?</span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Random Forest achieved a higher test $R^2$ of 0.7973 and lower MSE (50.45) compared to Linear Regression ($R^2$ 0.7702, MSE 57.20), while capturing non-linear interactions between study hours and attendance.
                </p>
              </details>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
