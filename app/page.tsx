"use client";

import { useState, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DrillRow {
  date: string;
  type: string;
  loggedBy: string;
  notes: string;
}

interface FormData {
  // Cover
  schoolName: string;
  siteName: string;
  peakNumber: string;
  numberOfSites: string;
  completedBy: string;
  dateCompleted: string;

  // Responsible Person & SIA
  rpName: string;
  rpRole: string;
  rpEmail: string;
  rpAppointedOn: string;
  siaRegistered: boolean;
  siaRegistrationDate: string;
  siaaNotes: string;

  // Compliance Tasks — each has { checked, completedBy, date }
  tasks: Record<string, { checked: boolean; completedBy: string; date: string }>;

  // Drill Log
  drills: DrillRow[];

  // Governance & Sign-off
  reviewedBy: string;
  reviewDate: string;
  nextReviewDue: string;
  govNotes: string;
  signedBy: string;
  dateSigned: string;
}

const TASKS = [
  { id: "appoint_rp",        label: "Appoint a Responsible Person",                         level: "MUST",   category: "GOVERNANCE" },
  { id: "register_sia",      label: "Register premises with the SIA",                        level: "MUST",   category: "REGISTRATION" },
  { id: "evacuation",        label: "Document an evacuation procedure",                      level: "MUST",   category: "PROCEDURES" },
  { id: "invacuation",       label: "Document an invacuation procedure",                     level: "MUST",   category: "PROCEDURES" },
  { id: "lockdown",          label: "Document a lockdown procedure",                         level: "MUST",   category: "PROCEDURES" },
  { id: "communication",     label: "Document a communication procedure",                    level: "MUST",   category: "PROCEDURES" },
  { id: "safe_space",        label: "Identify designated safe / refuge space(s)",             level: "SHOULD", category: "PROCEDURES" },
  { id: "multi_channel",     label: "Set up multi-channel staff alerting (not email-only)",  level: "SHOULD", category: "PROCEDURES" },
  { id: "send_plans",        label: "Adapt plans for SEND & vulnerable pupils",              level: "SHOULD", category: "PROCEDURES" },
  { id: "training",          label: "Deliver staff terrorism-awareness training",             level: "MUST",   category: "TRAINING" },
  { id: "drills",            label: "Schedule termly drills",                                level: "SHOULD", category: "TRAINING" },
  { id: "induction",         label: "Include lockdown procedures in new-staff induction",    level: "SHOULD", category: "TRAINING" },
  { id: "risk_assessment",   label: "Review and update the risk assessment",                 level: "MUST",   category: "REVIEW" },
  { id: "next_review",       label: "Set next formal review date",                           level: "SHOULD", category: "REVIEW" },
  { id: "board_signoff",     label: "Governing body / trust board sign-off recorded",        level: "SHOULD", category: "REVIEW" },
];

const DRILL_TYPES = ["Evacuation", "Invacuation", "Lockdown", "Communication"];

const EMPTY_DRILL: DrillRow = { date: "", type: "", loggedBy: "", notes: "" };

const defaultTasks = Object.fromEntries(
  TASKS.map((t) => [t.id, { checked: false, completedBy: "", date: "" }])
);

const defaultForm: FormData = {
  schoolName: "", siteName: "", peakNumber: "", numberOfSites: "",
  completedBy: "", dateCompleted: "",
  rpName: "", rpRole: "", rpEmail: "", rpAppointedOn: "",
  siaRegistered: false, siaRegistrationDate: "", siaaNotes: "",
  tasks: defaultTasks,
  drills: [{ ...EMPTY_DRILL }, { ...EMPTY_DRILL }, { ...EMPTY_DRILL }],
  reviewedBy: "", reviewDate: "", nextReviewDue: "", govNotes: "",
  signedBy: "", dateSigned: "",
};

// ─── Badge ───────────────────────────────────────────────────────────────────

function Badge({ level }: { level: string }) {
  const style =
    level === "MUST"
      ? "bg-[#e05a2b] text-white"
      : level === "SHOULD"
      ? "bg-[#4a7fb5] text-white"
      : "bg-gray-300 text-gray-700";
  return (
    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${style} mr-2`}>
      {level}
    </span>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="bg-[#162040] text-white px-8 py-5 flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {subtitle && <p className="text-xs text-blue-200 mt-0.5 tracking-wide">{subtitle}</p>}
      </div>
      <div className="text-right">
        <p className="text-xs font-bold tracking-widest text-blue-200">SOTARA</p>
      </div>
    </div>
  );
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", className = "",
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; className?: string;
}) {
  return (
    <div className={`field-wrap ${className}`}>
      <label className="field-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
        placeholder=" "
      />
    </div>
  );
}

function DateField({
  label, value, onChange, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <div className={`date-wrap ${className}`}>
      <label className="field-label">{label}</label>
      <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="date-input"
      />
    </div>
  );
}

function TextArea({
  label, value, onChange, rows = 4,
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="field-input"
      />
    </div>
  );
}

function Checkbox({
  checked, onChange,
}: {
  checked: boolean; onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 22, height: 22, flexShrink: 0,
        borderRadius: 5,
        border: checked ? "none" : "2px solid #d1d5db",
        background: checked ? "#162040" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s, border 0.15s",
        cursor: "pointer",
        outline: "none",
      }}
      onMouseEnter={(e) => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = "#9ca3af"; }}
      onMouseLeave={(e) => { if (!checked) (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db"; }}
    >
      {checked && (
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
          <path
            className="check-path"
            d="M2 6l3 3 5-5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

// ─── Task item ────────────────────────────────────────────────────────────────

function TaskItem({
  task,
  value,
  onChange,
}: {
  task: (typeof TASKS)[number];
  value: { checked: boolean; completedBy: string; date: string };
  onChange: (v: { checked: boolean; completedBy: string; date: string }) => void;
}) {
  return (
    <div className="border-b border-gray-100 py-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="mt-0.5">
          <Checkbox
            checked={value.checked}
            onChange={() => onChange({ ...value, checked: !value.checked })}
          />
        </div>
        <div>
          <span className="text-sm font-medium text-gray-800">{task.label}</span>
          <div className="mt-1">
            <Badge level={task.level} />
            <span className="text-[10px] text-gray-400 tracking-wide">{task.category}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 ml-9">
        <Field
          label="Completed By"
          value={value.completedBy}
          onChange={(v) => onChange({ ...value, completedBy: v })}
        />
        <DateField
          label="Date"
          value={value.date}
          onChange={(v) => onChange({ ...value, date: v })}
        />
      </div>
    </div>
  );
}

// ─── Print-ready PDF layout ───────────────────────────────────────────────────

function PrintPage({
  title, subtitle, pageNum, children,
}: {
  title: string; subtitle: string; pageNum: number; children: React.ReactNode;
}) {
  return (
    <div className="pdf-page bg-white" style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", padding: "0", marginBottom: "0" }}>
      {/* Header */}
      <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "2px" }}>{title}</div>
          <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em" }}>{subtitle}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
          <div style={{ fontSize: "9px", color: "#93c5fd", letterSpacing: "0.1em" }}>PAGE {pageNum}</div>
        </div>
      </div>
      {/* Blue accent line */}
      <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
      {/* Content */}
      <div style={{ padding: "28px 32px" }}>{children}</div>
      {/* Footer */}
      <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
        <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page {pageNum}</span>
      </div>
    </div>
  );
}

function PdfField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "9px", fontWeight: "600", letterSpacing: "0.07em", color: "#6b7280", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
      <div style={{ border: "1.5px solid #d1d5db", borderRadius: "6px", background: "#ffffff", minHeight: "28px", padding: "4px 10px", fontSize: "12px", color: "#111827" }}>{value}</div>
    </div>
  );
}

function PdfBadge({ level }: { level: string }) {
  const bg = level === "MUST" ? "#e05a2b" : level === "SHOULD" ? "#4a7fb5" : "#9ca3af";
  return (
    <span style={{ display: "inline-block", background: bg, color: "white", fontSize: "13px", fontWeight: "700", padding: "5px 14px", borderRadius: "9999px", marginRight: "8px", letterSpacing: "0.05em", lineHeight: "1.3" }}>
      {level}
    </span>
  );
}

function PdfDateField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ fontSize: "9px", fontWeight: "600", letterSpacing: "0.07em", color: "#6b7280", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
      <div style={{ position: "relative", border: "1.5px solid #d1d5db", borderRadius: "6px", background: "#ffffff", height: "32px", display: "flex", alignItems: "center", paddingLeft: "32px", paddingRight: "10px" }}>
        <svg style={{ position: "absolute", left: "9px", width: "14px", height: "14px", flexShrink: 0, stroke: "#9ca3af", fill: "none", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as React.CSSProperties} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="3"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <span style={{ fontSize: "12px", color: value ? "#111827" : "#c4c9d4" }}>{value || "dd/mm/yyyy"}</span>
      </div>
    </div>
  );
}

function PdfTaskItem({ task, value }: { task: (typeof TASKS)[number]; value: { checked: boolean; completedBy: string; date: string } }) {
  return (
    <div style={{ borderBottom: "1px solid #f3f4f6", paddingTop: "10px", paddingBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
        <div style={{ width: "14px", height: "14px", border: "1.5px solid", borderColor: value.checked ? "#162040" : "#9ca3af", background: value.checked ? "#162040" : "white", flexShrink: 0, marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {value.checked && <span style={{ color: "white", fontSize: "10px", lineHeight: 1 }}>✓</span>}
        </div>
        <div>
          <span style={{ fontSize: "12px", fontWeight: "500", color: "#111827" }}>{task.label}</span>
          <div style={{ marginTop: "2px" }}>
            <PdfBadge level={task.level} />
            <span style={{ fontSize: "9px", color: "#9ca3af", letterSpacing: "0.04em" }}>{task.category}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginLeft: "24px" }}>
        <PdfField label="Completed By" value={value.completedBy} />
        <PdfDateField label="Date" value={value.date} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof FormData) => (value: FormData[typeof key]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setTask = (id: string) => (value: { checked: boolean; completedBy: string; date: string }) =>
    setForm((f) => ({ ...f, tasks: { ...f.tasks, [id]: value } }));

  const setDrill = (index: number, field: keyof DrillRow) => (value: string) =>
    setForm((f) => {
      const drills = [...f.drills];
      drills[index] = { ...drills[index], [field]: value };
      return { ...f, drills };
    });

  const addDrillRow = () =>
    setForm((f) => ({ ...f, drills: [...f.drills, { ...EMPTY_DRILL }] }));

  const removeDrillRow = (i: number) =>
    setForm((f) => ({ ...f, drills: f.drills.filter((_, idx) => idx !== i) }));

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const el = printRef.current;
      if (!el) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { default: html2canvas } = await import("html2canvas" as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { default: jsPDF } = await import("jspdf" as any);
      const pdf = new jsPDF({ unit: "px", format: [794, 1123], orientation: "portrait" });
      const pages = Array.from(el.children) as HTMLElement[];
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage([794, 1123]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const canvas = await (html2canvas as any)(pages[i], {
          scale: 2, useCORS: true, width: 794, height: 1123, logging: false,
        });
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, 794, 1123);
      }
      const name = form.schoolName.replace(/\s+/g, "-") || "school";
      pdf.save(`martyns-law-checklist-${name}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  // Group tasks by category for display
  const categories = [...new Set(TASKS.map((t) => t.category))];

  const tasksOnPage3 = TASKS.filter((t) =>
    ["GOVERNANCE", "REGISTRATION", "PROCEDURES"].includes(t.category) &&
    !["multi_channel", "send_plans"].includes(t.id)
  );
  const tasksOnPage4a = TASKS.filter((t) =>
    (t.category === "PROCEDURES" && ["multi_channel", "send_plans"].includes(t.id)) ||
    t.category === "TRAINING" ||
    (t.category === "REVIEW" && t.id === "risk_assessment")
  );
  const tasksOnPage5 = TASKS.filter((t) => ["next_review", "board_signoff"].includes(t.id));

  return (
    <>
    <div id="no-print" className="min-h-screen">
      {/* ── Top nav ── */}
      <nav className="bg-[#162040] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-tight">SOTARA</span>
          <span className="text-blue-300 text-sm">|</span>
          <span className="text-blue-200 text-sm">Martyn's Law Compliance Checklist</span>
        </div>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex items-center gap-2 bg-[#e05a2b] hover:bg-[#c94e22] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
        >
          {generating ? (
            <>
              <span className="animate-spin">⏳</span> Generating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </nav>

      {/* ── Hero banner ── */}
      <div className="bg-[#1e2f55] text-white px-8 py-6 border-b border-blue-900">
        <div className="max-w-3xl">
          <div className="inline-block bg-[#e05a2b] text-white text-[10px] font-bold px-3 py-1 rounded mb-3 tracking-widest">
            FREE TOOL FROM SOTARA
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            A fillable record of your school or trust's Standard Tier obligations under Martyn's Law:
            Responsible Person &amp; SIA registration, the compliance checklist, drill log, and governance
            sign-off. Fill in the form below and click <strong>Download PDF</strong> to save your record.
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Section 1: Cover */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SectionHeader title="School / Trust Details" subtitle="COVER" />
          <div className="p-8 space-y-5">
            <Field label="School / Trust Name" value={form.schoolName} onChange={set("schoolName")} />
            <Field label="Site / Premises Name" value={form.siteName} onChange={set("siteName")} />
            <div className="grid grid-cols-2 gap-6">
              <Field label="Approx. Number of Pupils / Staff on Site at Peak" value={form.peakNumber} onChange={set("peakNumber")} />
              <Field label="Number of Sites in This Trust (if applicable)" value={form.numberOfSites} onChange={set("numberOfSites")} />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <h3 className="font-bold text-[#162040] text-sm mb-4">Document Owner</h3>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Completed By (Name & Role)" value={form.completedBy} onChange={set("completedBy")} className="col-span-2" />
                <DateField label="Date Completed" value={form.dateCompleted} onChange={set("dateCompleted")} />
              </div>
            </div>
            <div className="bg-gray-50 rounded p-4 text-xs text-gray-600 border border-gray-200">
              <strong>What this covers:</strong> Early years, primary, secondary and further education settings sit in the Standard Tier regardless of pupil numbers. This checklist reflects common Standard Tier guidance. Verify wording against the official Section 27 statutory guidance and take your own legal advice before relying on it as a formal compliance record.
            </div>
          </div>
        </div>

        {/* Section 2: Responsible Person & SIA */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SectionHeader title="Responsible Person & SIA" subtitle="STANDARD TIER · SECTION 1 OF 4" />
          <div className="p-8 space-y-6">
            <div>
              <h3 className="font-bold text-[#162040] text-sm mb-1">Responsible Person</h3>
              <p className="text-xs text-gray-500 mb-4">Standard Tier requires a named individual with formal oversight of preparedness.</p>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Name" value={form.rpName} onChange={set("rpName")} />
                <Field label="Role" value={form.rpRole} onChange={set("rpRole")} />
                <Field label="Email" value={form.rpEmail} onChange={set("rpEmail")} type="email" />
                <DateField label="Appointed On (Date)" value={form.rpAppointedOn} onChange={set("rpAppointedOn")} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-[#162040] text-sm mb-1">SIA Registration</h3>
              <p className="text-xs text-gray-500 mb-4">Confirms the school understands its responsibilities and has proportionate measures in place.</p>
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <Checkbox
                  checked={form.siaRegistered}
                  onChange={() => set("siaRegistered")(!form.siaRegistered)}
                />
                <span className="text-sm text-gray-800">Registered with the SIA</span>
              </label>
              <DateField label="Registration Date" value={form.siaRegistrationDate} onChange={set("siaRegistrationDate")} className="max-w-xs" />
            </div>

            <div className="border-t border-gray-100 pt-6">
              <TextArea label="Notes" value={form.siaaNotes} onChange={set("siaaNotes")} />
            </div>
          </div>
        </div>

        {/* Section 3: Compliance Tasks */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SectionHeader title="Compliance Tasks" subtitle="STANDARD TIER · SECTION 2 OF 4" />
          <div className="px-8 pt-4 pb-2">
            <p className="text-xs text-gray-500">
              <strong>"Must"</strong> = express legal requirement in the guidance. &nbsp;
              <strong>"Should"</strong> = expected good practice. &nbsp;
              <strong>"Could"</strong> = optional.
            </p>
          </div>
          <div className="px-8 pb-8">
            {categories.map((cat) => (
              <div key={cat} className="mt-6">
                <h3 className="text-xs font-bold tracking-widest text-[#162040] border-b-2 border-[#162040] pb-1 mb-2">{cat}</h3>
                {TASKS.filter((t) => t.category === cat).map((task) => (
                  <TaskItem key={task.id} task={task} value={form.tasks[task.id]} onChange={setTask(task.id)} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Drill Log */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SectionHeader title="Drill Log" subtitle="STANDARD TIER · SECTION 3 OF 4" />
          <div className="p-8">
            <p className="text-xs text-gray-500 mb-6">Record termly practice of evacuation, invacuation, lockdown and communication procedures.</p>

            {/* Table header */}
            <div className="grid grid-cols-[120px_140px_160px_1fr_32px] gap-2 mb-2">
              {["Date", "Type", "Logged By", "Notes / Outcome", ""].map((h) => (
                <span key={h} className="field-label">{h}</span>
              ))}
            </div>

            {form.drills.map((drill, i) => (
              <div key={i} className="grid grid-cols-[130px_140px_160px_1fr_32px] gap-2 mb-3 items-center">
                <div className="relative">
                  <svg className="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <input type="date" value={drill.date} onChange={(e) => setDrill(i, "date")(e.target.value)} className="date-input" style={{fontSize:'12px'}} />
                </div>
                <select value={drill.type} onChange={(e) => setDrill(i, "type")(e.target.value)} className="field-input" style={{height:44,fontSize:13}}>
                  <option value="">Select…</option>
                  {DRILL_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input value={drill.loggedBy} onChange={(e) => setDrill(i, "loggedBy")(e.target.value)} className="field-input" placeholder="Name" style={{height:44,fontSize:13}} />
                <input value={drill.notes} onChange={(e) => setDrill(i, "notes")(e.target.value)} className="field-input" placeholder="Outcome…" style={{height:44,fontSize:13}} />
                <button
                  type="button"
                  onClick={() => removeDrillRow(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none"
                  title="Remove row"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addDrillRow}
              className="mt-2 text-xs text-[#162040] border border-[#162040] hover:bg-[#162040] hover:text-white px-3 py-1.5 rounded transition-colors"
            >
              + Add Row
            </button>
          </div>
        </div>

        {/* Section 5: Governance & Sign-off */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <SectionHeader title="Governance & Sign-off" subtitle="STANDARD TIER · SECTION 4 OF 4" />
          <div className="p-8 space-y-6">
            <p className="text-xs text-gray-500">
              The governing body or trust board is legally responsible for Standard Tier compliance. Record
              formal review here once it has been minuted, rather than leaving it informal.
            </p>

            <div>
              <h3 className="font-bold text-[#162040] text-sm mb-4">Latest Sign-off</h3>
              <div className="space-y-4">
                <Field label="Reviewed / Approved By" value={form.reviewedBy} onChange={set("reviewedBy")} />
                <div className="grid grid-cols-2 gap-6">
                  <DateField label="Review Date" value={form.reviewDate} onChange={set("reviewDate")} />
                  <DateField label="Next Review Due" value={form.nextReviewDue} onChange={set("nextReviewDue")} />
                </div>
                <TextArea label="Notes (Minute Reference, Decisions Made, Outstanding Actions)" value={form.govNotes} onChange={set("govNotes")} />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-[#162040] text-sm mb-4">Sign-off Record</h3>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Signed (Chair of Governors / Trust Representative)" value={form.signedBy} onChange={set("signedBy")} />
                <DateField label="Date Signed" value={form.dateSigned} onChange={set("dateSigned")} />
              </div>
            </div>
          </div>
        </div>

        {/* Download CTA */}
        <div className="text-center py-4">
          <button
            onClick={handleDownload}
            disabled={generating}
            className="inline-flex items-center gap-3 bg-[#162040] hover:bg-[#1e2f55] disabled:opacity-60 text-white font-bold px-10 py-4 rounded-lg text-base transition-colors shadow-lg"
          >
            {generating ? "Generating PDF…" : "Download as PDF"}
          </button>
          <p className="text-xs text-gray-400 mt-3">Your data stays in your browser. Nothing is uploaded or stored.</p>
        </div>

      </div>

    </div>

    {/* ── PDF layout (shown only during print) ── */}
    <div id="pdf-layout" style={{ position: "absolute", left: "-9999px", top: 0, width: "794px" }}>
      <div ref={printRef} style={{ width: "794px", fontFamily: "Arial, Helvetica, sans-serif" }}>

          {/* PDF Page 1 — Cover */}
          <div style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", background: "white" }}>
            <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>Martyn's Law Compliance Checklist</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em", marginTop: "2px" }}>STANDARD TIER · TERRORISM (PROTECTION OF PREMISES) ACT 2025</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
                <div style={{ fontSize: "9px", color: "#93c5fd" }}>COVER</div>
              </div>
            </div>
            <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
            <div style={{ padding: "28px 32px" }}>
              <div style={{ display: "inline-block", background: "#e05a2b", color: "white", fontSize: "9px", fontWeight: "bold", padding: "3px 10px", borderRadius: "3px", letterSpacing: "0.1em", marginBottom: "16px" }}>FREE TOOL FROM SOTARA</div>
              <p style={{ fontSize: "12px", color: "#374151", lineHeight: "1.6", marginBottom: "28px" }}>A fillable record of your school or trust's Standard Tier obligations under Martyn's Law: Responsible Person &amp; SIA registration, the compliance checklist, drill log, and governance sign-off. Print, save, or fill digitally.</p>

              <h3 style={{ fontWeight: "bold", fontSize: "16px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px", marginBottom: "16px" }}>School / Trust Details</h3>
              <PdfField label="School / Trust Name" value={form.schoolName} />
              <PdfField label="Site / Premises Name" value={form.siteName} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <PdfField label="Approx. Number of Pupils/Staff on Site at Peak" value={form.peakNumber} />
                <PdfField label="Number of Sites in This Trust (if applicable)" value={form.numberOfSites} />
              </div>

              <h3 style={{ fontWeight: "bold", fontSize: "16px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px", marginBottom: "16px", marginTop: "24px" }}>Document Owner</h3>
              <PdfField label="Completed By (Name & Role)" value={form.completedBy} />
              <div style={{ maxWidth: "260px" }}>
                <PdfDateField label="Date Completed" value={form.dateCompleted} />
              </div>

              <div style={{ marginTop: "32px", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "14px 16px", background: "#f9fafb" }}>
                <div style={{ fontWeight: "600", fontSize: "11px", marginBottom: "4px" }}>What this covers</div>
                <p style={{ fontSize: "11px", color: "#6b7280", lineHeight: "1.5" }}>Early years, primary, secondary and further education settings sit in the Standard Tier regardless of pupil numbers. This checklist reflects common Standard Tier guidance. Verify wording against the official Section 27 statutory guidance and take your own legal advice before relying on it as a formal compliance record.</p>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page 1</span>
            </div>
          </div>

          {/* PDF Page 2 — Responsible Person & SIA */}
          <div style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", background: "white" }}>
            <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>Responsible Person &amp; SIA</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em", marginTop: "2px" }}>STANDARD TIER · SECTION 1 OF 4</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
                <div style={{ fontSize: "9px", color: "#93c5fd" }}>PAGE 2</div>
              </div>
            </div>
            <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
            <div style={{ padding: "28px 32px" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "15px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px", marginBottom: "10px" }}>Responsible Person</h3>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "14px" }}>Standard Tier requires a named individual with formal oversight of preparedness.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <PdfField label="Name" value={form.rpName} />
                <PdfField label="Role" value={form.rpRole} />
                <PdfField label="Email" value={form.rpEmail} />
                <PdfDateField label="Appointed On (Date)" value={form.rpAppointedOn} />
              </div>

              <h3 style={{ fontWeight: "bold", fontSize: "15px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px", marginBottom: "10px", marginTop: "24px" }}>SIA Registration</h3>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "14px" }}>Confirms the school understands its responsibilities and has proportionate measures in place.</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div style={{ width: "14px", height: "14px", border: "1.5px solid", borderColor: form.siaRegistered ? "#162040" : "#9ca3af", background: form.siaRegistered ? "#162040" : "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.siaRegistered && <span style={{ color: "white", fontSize: "10px" }}>✓</span>}
                </div>
                <span style={{ fontSize: "12px" }}>Registered with the SIA</span>
              </div>
              <div style={{ maxWidth: "260px" }}>
                <PdfDateField label="Registration Date" value={form.siaRegistrationDate} />
              </div>

              <h3 style={{ fontWeight: "bold", fontSize: "15px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px", marginBottom: "10px", marginTop: "24px" }}>Notes</h3>
              <div style={{ minHeight: "80px", border: "1.5px solid #d1d5db", borderRadius: "6px", background: "#ffffff", padding: "8px 10px", fontSize: "12px", color: "#111827" }}>{form.siaaNotes}</div>
            </div>
            <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page 2</span>
            </div>
          </div>

          {/* PDF Page 3 — Compliance Tasks (part 1) */}
          <div style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", background: "white" }}>
            <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>Compliance Tasks</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em", marginTop: "2px" }}>STANDARD TIER · SECTION 2 OF 4</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
                <div style={{ fontSize: "9px", color: "#93c5fd" }}>PAGE 3</div>
              </div>
            </div>
            <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
            <div style={{ padding: "20px 32px" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "16px" }}>"Must" = express legal requirement in the guidance. &nbsp;"Should" = expected good practice. &nbsp;"Could" = optional.</p>
              {["GOVERNANCE", "REGISTRATION", "PROCEDURES"].map((cat) => (
                <div key={cat}>
                  <div style={{ fontWeight: "bold", fontSize: "11px", letterSpacing: "0.1em", color: "#162040", borderBottom: "2px solid #162040", paddingBottom: "3px", marginBottom: "2px", marginTop: "14px" }}>{cat}</div>
                  {tasksOnPage3.filter((t) => t.category === cat).map((task) => (
                    <PdfTaskItem key={task.id} task={task} value={form.tasks[task.id]} />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page 3</span>
            </div>
          </div>

          {/* PDF Page 4 — Compliance Tasks (part 2) */}
          <div style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", background: "white" }}>
            <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>Compliance Tasks (cont.)</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em", marginTop: "2px" }}>STANDARD TIER · SECTION 2 OF 4</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
                <div style={{ fontSize: "9px", color: "#93c5fd" }}>PAGE 4</div>
              </div>
            </div>
            <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
            <div style={{ padding: "20px 32px" }}>
              {["PROCEDURES", "TRAINING", "REVIEW"].map((cat) => {
                const items = tasksOnPage4a.filter((t) => t.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <div style={{ fontWeight: "bold", fontSize: "11px", letterSpacing: "0.1em", color: "#162040", borderBottom: "2px solid #162040", paddingBottom: "3px", marginBottom: "2px", marginTop: "14px" }}>{cat}</div>
                    {items.map((task) => (
                      <PdfTaskItem key={task.id} task={task} value={form.tasks[task.id]} />
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page 4</span>
            </div>
          </div>

          {/* PDF Page 5 — Compliance Tasks (cont.) board sign-off */}
          <div style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", background: "white" }}>
            <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>Compliance Tasks (cont.)</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em", marginTop: "2px" }}>STANDARD TIER · SECTION 2 OF 4</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
                <div style={{ fontSize: "9px", color: "#93c5fd" }}>PAGE 5</div>
              </div>
            </div>
            <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
            <div style={{ padding: "20px 32px" }}>
              <div style={{ fontWeight: "bold", fontSize: "11px", letterSpacing: "0.1em", color: "#162040", borderBottom: "2px solid #162040", paddingBottom: "3px", marginBottom: "2px" }}>REVIEW</div>
              {tasksOnPage5.map((task) => (
                <PdfTaskItem key={task.id} task={task} value={form.tasks[task.id]} />
              ))}
            </div>
            <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page 5</span>
            </div>
          </div>

          {/* PDF Page 6 — Drill Log */}
          <div style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", background: "white" }}>
            <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>Drill Log</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em", marginTop: "2px" }}>STANDARD TIER · SECTION 3 OF 4</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
                <div style={{ fontSize: "9px", color: "#93c5fd" }}>PAGE 6</div>
              </div>
            </div>
            <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
            <div style={{ padding: "20px 32px" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "14px" }}>Record termly practice of evacuation, invacuation, lockdown and communication procedures.</p>
              <div style={{ display: "grid", gridTemplateColumns: "100px 120px 150px 1fr", gap: "8px", marginBottom: "6px" }}>
                {["DATE", "TYPE", "LOGGED BY", "NOTES / OUTCOME"].map((h) => (
                  <span key={h} style={{ fontSize: "9px", fontWeight: "600", letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>
              {form.drills.map((drill, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 120px 150px 1fr", gap: "8px", marginBottom: "8px" }}>
                  {[drill.date, drill.type, drill.loggedBy, drill.notes].map((v, j) => (
                    <div key={j} style={{ border: "1.5px solid #d1d5db", borderRadius: "4px", background: "#ffffff", minHeight: "24px", padding: "2px 8px", fontSize: "11px", color: "#111827" }}>{v}</div>
                  ))}
                </div>
              ))}
              <p style={{ fontSize: "10px", color: "#9ca3af", marginTop: "12px" }}>Type options: Evacuation / Invacuation / Lockdown / Communication</p>
            </div>
            <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page 6</span>
            </div>
          </div>

          {/* PDF Page 7 — Governance & Sign-off */}
          <div style={{ position: "relative", width: "794px", height: "1123px", overflow: "hidden", background: "white" }}>
            <div style={{ background: "#162040", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>Governance &amp; Sign-off</div>
                <div style={{ fontSize: "10px", color: "#93c5fd", letterSpacing: "0.05em", marginTop: "2px" }}>STANDARD TIER · SECTION 4 OF 4</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "#93c5fd", letterSpacing: "0.1em" }}>SOTARA</div>
                <div style={{ fontSize: "9px", color: "#93c5fd" }}>PAGE 7</div>
              </div>
            </div>
            <div style={{ height: "3px", background: "linear-gradient(to right, #3b82f6, #1d4ed8)" }} />
            <div style={{ padding: "24px 32px" }}>
              <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "20px" }}>The governing body or trust board is legally responsible for Standard Tier compliance. Record formal review here once it has been minuted, rather than leaving it informal.</p>

              <h3 style={{ fontWeight: "bold", fontSize: "15px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px", marginBottom: "14px" }}>Latest Sign-off</h3>
              <PdfField label="Reviewed / Approved By" value={form.reviewedBy} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <PdfDateField label="Review Date" value={form.reviewDate} />
                <PdfDateField label="Next Review Due" value={form.nextReviewDue} />
              </div>
              <div style={{ marginTop: "8px" }}>
                <div style={{ fontSize: "9px", fontWeight: "600", letterSpacing: "0.08em", color: "#9ca3af", textTransform: "uppercase", marginBottom: "2px" }}>Notes (Minute Reference, Decisions Made, Outstanding Actions)</div>
                <div style={{ minHeight: "80px", border: "1.5px solid #d1d5db", borderRadius: "6px", background: "#ffffff", padding: "6px 10px", fontSize: "12px", color: "#111827", whiteSpace: "pre-wrap" }}>{form.govNotes}</div>
              </div>

              <h3 style={{ fontWeight: "bold", fontSize: "15px", color: "#111827", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px", marginBottom: "14px", marginTop: "24px" }}>Sign-off Record</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <PdfField label="Signed (Chair of Governors / Trust Representative)" value={form.signedBy} />
                <PdfDateField label="Date Signed" value={form.dateSigned} />
              </div>

              {/* Sotara promo box */}
              <div style={{ marginTop: "40px", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "16px 20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "13px", color: "#162040", marginBottom: "4px" }}>More than a checklist?</div>
                  <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>Sotara builds operations software for UK schools: leave management, helpdesk, visitor sign-in and more.</p>
                  <span style={{ fontSize: "11px", color: "#162040", fontWeight: "600" }}>Scan to explore → sotara.co.uk</span>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: "12px", left: "32px", right: "32px", borderTop: "1px solid #e5e7eb", paddingTop: "6px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Martyn's Law Standard Tier Compliance Checklist · Powered by Sotara</span>
              <span style={{ fontSize: "9px", color: "#9ca3af" }}>Page 7</span>
            </div>
          </div>

        </div>
    </div>

    </>
  );
}
