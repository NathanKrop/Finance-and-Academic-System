"use client";

import { Fragment, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { FilterCard } from "@/components/academic/cbe-reports/FilterCard";
import { useNotesAssignments, type AssignmentQuestion, type AssignmentRecord, type NoteRecord, type SubmissionRecord } from "@/components/academic/notes-assignments/NotesAssignmentsProvider";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { useSettingsData } from "@/components/academic/settings/SettingsProvider";
import { PORTAL_URL } from "@/lib/academic/autoLogin";
import { seedMockSubmissions } from "@/mock/submissionsSeed";

const FORM_OPTIONS = ["Form 1", "Form 2", "Form 3", "Form 4", "Grade 10", "Grade 11", "Grade 12"];
const SUBJECT_CATALOG = ["English", "Mathematics", "Kiswahili", "Biology", "Chemistry", "Physics", "History", "Geography", "CRE", "Business Studies", "Agriculture", "Computer Studies"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function createQuestion(): AssignmentQuestion {
  return {
    id: `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: "",
    marks: 1,
    type: "text",
    choices: [""],
    correctChoiceIndex: null,
    attachmentRef: null,
  };
}

type StreamItem = { name: string; grade: string };

function getStreamOptions(form: string, streams: StreamItem[]) {
  if (!form) return [];
  const matches = streams.filter((stream) => stream.grade === form);
  return matches.length > 0 ? matches.map((stream) => stream.name) : ["STEM A", "Humanities A", "Arts A"];
}

function getSubjectOptions(form: string) {
  if (!form) return [];
  if (form.startsWith("Form")) {
    return SUBJECT_CATALOG;
  }
  return SUBJECT_CATALOG;
}

function calculateTotalMarks(questions: AssignmentQuestion[]) {
  return questions.reduce((sum, question) => sum + Math.max(0, Number(question.marks || 0)), 0);
}

function normalizeText(value: string) {
  return value.trim();
}

export function InstructionBanner({ text }: { text: string }) {
  return (
    <div className="mb-4 rounded-xl border border-[#cbebd9] bg-[#edf8f2] px-3 py-2 text-xs italic text-[#1a4f3b]">
      {text}
    </div>
  );
}

export function LabelTab({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="inline-flex max-w-full items-center rounded-r-xl border border-[#b8c9d1] bg-[#dfeaf0] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2a3d49] shadow-sm">
        <span className="font-display text-[11px] tracking-[0.12em]">{label}</span>
        {required && <span className="ml-2 text-[#a14d3f]">*</span>}
      </div>
      {children}
    </div>
  );
}

export function QuestionCard({
  question,
  canDelete,
  onChange,
  onRemove,
  onAddChoice,
  onDeleteChoice,
  onToggleCorrectChoice,
  onUploadFile,
  onRemoveFile,
}: {
  question: AssignmentQuestion;
  canDelete: boolean;
  onChange: (value: Partial<AssignmentQuestion>) => void;
  onRemove: () => void;
  onAddChoice: () => void;
  onDeleteChoice: (index: number) => void;
  onToggleCorrectChoice: (index: number) => void;
  onUploadFile: (file: File | null) => void;
  onRemoveFile: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#83a1bb] bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-md border border-[#d7c9a6] bg-[#f4ead3] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a3d2e]" onClick={onAddChoice}>
            {question.type === "choice" ? "Edit Choices" : "Add Choices"}
          </button>
          <label className="rounded-md border border-[#d7c9a6] bg-[#f4ead3] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4a3d2e]">
            <input type="file" className="hidden" onChange={(event) => onUploadFile(event.target.files?.[0] ?? null)} accept=".pdf,.doc,.docx,image/*" />
            Upload file
          </label>
        </div>
        <button
          type="button"
          className="rounded-md border border-[#b34d46] bg-[#f6d4d2] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a2f2d] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canDelete}
          onClick={onRemove}
        >
          Delete
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2e4654] underline decoration-[1.5px] underline-offset-4">
          {question.type === "choice" ? "CHOICE QUESTION" : "INPUT QUESTION"}
        </span>
        <label className="flex items-center gap-2 text-[11px] text-[#2d4a53]">
          <input
            type="number"
            min={1}
            value={question.marks}
            onChange={(event) => onChange({ marks: Math.max(1, Number(event.target.value || 1)) })}
            className="w-16 rounded-md border border-[#cbd6db] bg-[#f4f7f8] px-2 py-1 text-right text-sm"
          />
          <span>mark(s)</span>
        </label>
      </div>

      <textarea
        value={question.text}
        onChange={(event) => onChange({ text: event.target.value })}
        placeholder="Type the question here"
        className="min-h-[100px] w-full resize-y rounded-md border border-dashed border-[#bfd0d8] bg-[#f6f8f9] px-3 py-2 text-sm italic text-[#6d7c82] placeholder:text-[#7e8a8c]"
      />

      {question.type === "choice" && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2e4654]">Choices</span>
            <button type="button" onClick={onAddChoice} className="text-xs font-semibold text-[#1e5d42] underline">
              Add choice
            </button>
          </div>
          {question.choices.length === 0 ? (
            <p className="text-xs text-[#73818a]">No choices yet.</p>
          ) : (
            question.choices.map((choice, index) => (
              <div key={`${question.id}-choice-${index}`} className="flex items-center gap-2 rounded-md border border-[#dfe7eb] bg-[#f5f8f9] p-2">
                <button
                  type="button"
                  className={`h-4 w-4 rounded-full border ${question.correctChoiceIndex === index ? "bg-[#1e5d42]" : "bg-white"}`}
                  aria-label={question.correctChoiceIndex === index ? "Selected correct choice" : "Mark as correct choice"}
                  onClick={() => onToggleCorrectChoice(index)}
                />
                <input
                  value={choice}
                  onChange={(event) => onChange({ choices: question.choices.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)) })}
                  className="flex-1 rounded border border-dashed border-[#d2dbe1] bg-white px-2 py-1 text-sm text-[#2e4654]"
                  placeholder={`Choice ${index + 1}`}
                />
                <button type="button" onClick={() => onDeleteChoice(index)} className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a14d3f]">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {question.attachmentRef && (
        <div className="mt-3 flex items-center justify-between rounded-md border border-[#d7e3d8] bg-[#eef7f3] px-2 py-1.5 text-xs text-[#234536]">
          <span className="truncate">Attachment stored</span>
          <button type="button" className="font-semibold text-[#a14d3f]" onClick={onRemoveFile}>Remove</button>
        </div>
      )}
    </div>
  );
}

export function ThreeColumnWorkspace({ left, center, right }: { left: ReactNode; center: ReactNode; right: ReactNode }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)_390px]">
      <div>{left}</div>
      <div>{center}</div>
      <div>{right}</div>
    </div>
  );
}

export function PostedList<T extends { id: string }>({
  title,
  emptyText,
  items,
  renderItem,
}: {
  title: string;
  emptyText: string;
  items: T[];
  renderItem: (item: T) => ReactNode;
}) {
  return (
    <aside className="rounded-2xl border border-academic-line bg-[#f3f4f5] p-4 shadow-sm" style={{ background: "radial-gradient(circle at top, rgba(255,255,255,0.8), rgba(243,244,245,0.9))" }}>
      <div className="mb-4 rounded-xl border border-[#b6c7cf] bg-[#dfeaf0] px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] text-[#2c4652]">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-academic-line bg-white/70 px-3 py-8 text-center text-xs italic text-academic-ink-soft">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">{items.map((item) => renderItem(item))}</div>
      )}
    </aside>
  );
}

export function SearchAdmInput({ value, onChange, placeholder = "Search ADM" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div className="mb-4 w-full max-w-[300px]">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-[#c8d6da] bg-white px-3 py-2 text-sm italic text-[#677a83] placeholder:text-[#7d878a]"
      />
    </div>
  );
}

export function InfoBox({ title, children, tone = "blue" }: { title: string; children: ReactNode; tone?: "blue" | "light" }) {
  return (
    <div
      className={`rounded-xl border border-[#a7c7d5] p-4 text-sm ${tone === "light" ? "bg-[#eaf5ff] text-[#1c4468]" : "bg-white text-[#1a2c39]"}`}
      style={tone === "blue" ? { borderLeftWidth: 3, borderRightWidth: 3, borderStyle: "solid", borderColor: "#99bfd4" } : {}}
    >
      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1a3d58]">{title}</p>
      <div>{children}</div>
    </div>
  );
}

export function AutoLoginPreviewTable({ rows }: { rows: Array<{ admNo: string; name: string; parentPhone: string; message: string; status: string; selected: boolean; link: string; }> }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#bfd0d8] bg-white">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead className="bg-[#1f4c5a] text-white">
          <tr>
            <th className="px-2 py-2 text-center"><input type="checkbox" aria-label="Select all recipients" /></th>
            <th className="px-2 py-2 font-serif">ADM</th>
            <th className="px-2 py-2 font-serif">Name</th>
            <th className="px-2 py-2 font-serif">Parent Phone</th>
            <th className="px-2 py-2 font-serif">Message</th>
            <th className="px-2 py-2 font-serif">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.admNo} className="border-b border-[#dfe9ed] last:border-b-0">
              <td className="px-2 py-2 text-center"><input type="checkbox" checked={row.selected} readOnly /></td>
              <td className="px-2 py-2">{row.admNo}</td>
              <td className="px-2 py-2">{row.name}</td>
              <td className="px-2 py-2">{row.parentPhone || "no phone"}</td>
              <td className="px-2 py-2 max-w-[240px] break-words text-[#1d465b]">{row.message}</td>
              <td className="px-2 py-2">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubmissionMarkingPanel({
  submission,
  assignment,
  onSave,
  onCancel,
}: {
  submission: SubmissionRecord;
  assignment: AssignmentRecord | undefined;
  onSave: (scores: number[], comment: string) => void;
  onCancel: () => void;
}) {
  const [scores, setScores] = useState<number[]>(submission.perQuestionScores.length ? submission.perQuestionScores : assignment?.questions.map(() => 0) ?? []);
  const [comment, setComment] = useState(submission.comment ?? "");

  if (!assignment) return null;

  const total = scores.reduce((sum, score) => sum + Number(score || 0), 0);

  return (
    <div className="rounded-2xl border border-academic-line bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-academic-ink-soft">Submission review</p>
          <h3 className="mt-1 text-lg font-semibold text-academic-ink">{submission.name} · {submission.admNo}</h3>
        </div>
        <div className="rounded-full border border-[#d3e3d8] bg-[#edf7f2] px-3 py-1 text-sm font-semibold text-[#1a553d]">Total: {total}</div>
      </div>

      <div className="mb-4 rounded-xl border border-[#d6e6ef] bg-[#f7fbfd] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2e4654]">Assignment instructions</p>
        <p className="mt-2 text-sm text-[#2b3640]">{assignment.instructions}</p>
      </div>

      <div className="space-y-4">
        {assignment.questions.map((question, index) => (
          <div key={`${question.id}-${index}`} className="rounded-xl border border-academic-line bg-[#fafbfc] p-3">
            <p className="mb-2 text-sm font-semibold text-[#233a45]">Q{index + 1}: {question.text}</p>
            <div className="mb-2 text-xs text-[#4b6470]">Student answer: {submission.answers[index] ?? "No answer provided"}</div>
            <label className="flex items-center gap-2 text-sm text-[#2b3640]">
              Score
              <input
                type="number"
                min={0}
                max={question.marks}
                value={scores[index] ?? 0}
                onChange={(event) => {
                  const nextScores = [...scores];
                  nextScores[index] = Math.min(question.marks, Math.max(0, Number(event.target.value || 0)));
                  setScores(nextScores);
                }}
                className="w-20 rounded border border-[#cfd9df] bg-white px-2 py-1"
              />
              <span className="text-xs text-[#687b8a]">/ {question.marks}</span>
            </label>
          </div>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2d4b58]">Comment</span>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} className="min-h-[90px] w-full rounded-md border border-dashed border-[#bfd0d8] bg-[#f8fafb] px-3 py-2 text-sm text-[#1d3644]" placeholder="Add a brief comment for the learner" />
      </label>

      <div className="mt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md border border-academic-line bg-white px-4 py-2 text-sm font-semibold text-academic-ink">
          Cancel
        </button>
        <button type="button" onClick={() => onSave(scores, comment)} className="rounded-md bg-[#1f6d4d] px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white">
          Save marking
        </button>
      </div>
    </div>
  );
}

function NotesAssignmentsShell({ route }: { route: string }) {
  switch (route) {
    case "post-assignments":
      return <PostAssignmentsScreen />;
    case "post-study-notes":
      return <PostStudyNotesScreen />;
    case "view-unmarked-assignments":
      return <ViewUnmarkedAssignmentsScreen />;
    case "marked-assignments":
      return <MarkedAssignmentsScreen />;
    case "generate-send-parents-auto-login-link":
      return <AutoLoginLinkScreen />;
    default:
      return <div className="rounded-2xl border border-dashed border-academic-line bg-academic-paper p-6 text-sm text-academic-ink-soft">Route not configured.</div>;
  }
}

function PostAssignmentsScreen() {
  const { state, addAssignment, updateAssignment, deleteAssignment } = useNotesAssignments();
  const { data } = useRegistrationData();
  const { state: settings } = useSettingsData();
  const [enabled, setEnabled] = useState(true);
  const [form, setForm] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([createQuestion()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBlocked, setEditBlocked] = useState("");

  const subjectOptions = useMemo(() => getSubjectOptions(form), [form]);
  const streamOptions = useMemo(() => getStreamOptions(form, data.streams as Array<{ name: string; grade: string }>), [form, data.streams]);
  const totalMarks = calculateTotalMarks(questions);
  const postedAssignments = state.assignments.filter((item) => item.form === form && item.subject === subject).sort((first, second) => second.postedAt.localeCompare(first.postedAt));

  const onQuestionChange = (questionIndex: number, partial: Partial<AssignmentQuestion>) => {
    setQuestions((current) => current.map((item, index) => (index === questionIndex ? { ...item, ...partial } : item)));
  };

  const onQuestionRemove = (questionIndex: number) => {
    if (questions.length === 1) return;
    setQuestions((current) => current.filter((_, index) => index !== questionIndex));
  };

  const onQuestionAdd = () => {
    setQuestions((current) => [...current, createQuestion()]);
  };

  const onAddChoice = (questionIndex: number) => {
    setQuestions((current) => {
      const next = [...current];
      const question: AssignmentQuestion = {
        ...next[questionIndex],
        type: "choice",
        choices: [...(next[questionIndex].choices.length > 0 ? next[questionIndex].choices : ["", ""])],
      };
      if (question.choices.length < 2) {
        question.choices = ["", ""];
      }
      next[questionIndex] = question;
      return next;
    });
  };

  const onChoiceDelete = (questionIndex: number, choiceIndex: number) => {
    setQuestions((current) => current.map((item, index) => {
      if (index !== questionIndex) return item;
      const nextChoices = item.choices.filter((_, idx) => idx !== choiceIndex);
      return { ...item, choices: nextChoices.length ? nextChoices : ["", ""], correctChoiceIndex: nextChoices.length ? item.correctChoiceIndex ?? null : null };
    }));
  };

  const handleToggleStream = (streamName: string) => {
    setSelectedStreams((current) => current.includes(streamName) ? current.filter((item) => item !== streamName) : [...current, streamName]);
  };

  const handlePublish = () => {
    const nextErrors: Record<string, string> = {};
    if (!form) nextErrors.form = "Select a form.";
    if (!subject) nextErrors.subject = "Select a subject.";
    if (selectedStreams.length === 0) nextErrors.streams = "At least one stream is required.";
    if (!normalizeText(instructions)) nextErrors.instructions = "Assignment instructions are required.";
    questions.forEach((question, index) => {
      if (!normalizeText(question.text)) nextErrors[`question-${index}`] = `Question ${index + 1} text is required.`;
      if (!Number.isFinite(question.marks) || question.marks < 1) nextErrors[`marks-${index}`] = `Question ${index + 1} marks must be at least 1.`;
      if (question.type === "choice") {
        if (question.choices.filter((choice) => normalizeText(choice)).length < 2) {
          nextErrors[`choice-${index}`] = `Question ${index + 1} requires at least 2 choices.`;
        }
      }
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const assignment: AssignmentRecord = {
      id: `assignment-${Date.now()}`,
      form,
      subject,
      streams: selectedStreams,
      instructions,
      questions,
      totalMarks,
      postedBy: "Mike",
      postedAt: new Date().toISOString(),
      term: settings.currentTerm,
      year: settings.currentYear,
    };

    if (editingId) {
      updateAssignment(editingId, assignment);
      setEditingId(null);
    } else {
      addAssignment(assignment);
    }

    setToast("Published");
    setForm("");
    setSubject("");
    setSelectedStreams([]);
    setInstructions("");
    setQuestions([createQuestion()]);
    setErrors({});
    setTimeout(() => setToast(""), 1600);
  };

  const handleEdit = (assignment: AssignmentRecord) => {
    const existingSubmissions = state.submissions.filter((item) => item.assignmentId === assignment.id);
    if (existingSubmissions.length > 0) {
      setEditBlocked("This assignment already has student submissions. Editing is blocked until the mark set is cleared.");
      return;
    }
    setEditBlocked("");
    setEditingId(assignment.id);
    setForm(assignment.form);
    setSubject(assignment.subject);
    setSelectedStreams(assignment.streams);
    setInstructions(assignment.instructions);
    setQuestions(assignment.questions.length ? assignment.questions : [createQuestion()]);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this assignment?")) return;
    deleteAssignment(id);
  };

  return (
    <ThreeColumnWorkspace
      left={
        <FilterCard title="POST ASSIGNMENTS" enabled={enabled} onToggle={setEnabled}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Form</span>
              <select value={form} onChange={(event) => { setForm(event.target.value); setSubject(""); }} disabled={!enabled} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
                <option value="">~select form~</option>
                {FORM_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Subject</span>
              <select value={subject} onChange={(event) => setSubject(event.target.value)} disabled={!enabled || !form} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
                <option value="">~select subject~</option>
                {subjectOptions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
        </FilterCard>
      }
      center={
        <div className="rounded-2xl border border-academic-line bg-white p-4 shadow-sm">
          <div className="mb-4 rounded-xl bg-gradient-to-r from-[#2a4b57] via-[#81a7ba] to-[#dee7ec] px-4 py-3 text-center text-xl font-serif text-[#1f2d35]">
            Assignments Details
          </div>

          {!form || !subject ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[#d15751] bg-[#fff5f4] p-6 text-center text-sm font-medium text-[#9b413c]">
              * Please Select Class and Subject to activate this area *
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-3">
                <LabelTab label="Streams :" required>
                  <div className="rounded-lg border border-dashed border-[#bfd0d8] bg-[#f4f8fa] p-3">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#2d4b58]">
                      <input type="checkbox" checked={selectedStreams.length === streamOptions.length && streamOptions.length > 0} onChange={() => setSelectedStreams((current) => (current.length === streamOptions.length ? [] : streamOptions))} />
                      <span>Select all</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {streamOptions.map((streamName) => (
                        <label key={streamName} className="flex items-center gap-2 rounded-full border border-[#d9e4ea] bg-white px-2 py-1 text-xs text-[#394d58]">
                          <input type="checkbox" checked={selectedStreams.includes(streamName)} onChange={() => handleToggleStream(streamName)} />
                          {streamName}
                        </label>
                      ))}
                    </div>
                  </div>
                </LabelTab>
                {errors.streams && <p className="text-xs text-[#a14d3f]">{errors.streams}</p>}
              </div>

              <LabelTab label="Instructions :" required>
                <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Type assignment instructions here" className="min-h-[100px] w-full resize-y rounded-md border border-dashed border-[#bfd0d8] bg-[#f5f8fa] px-3 py-2 text-sm italic text-[#6f7d83] placeholder:text-[#798489]" />
              </LabelTab>
              {errors.instructions && <p className="text-xs text-[#a14d3f]">{errors.instructions}</p>}

              <div className="space-y-3">
                {questions.map((question, questionIndex) => (
                  <div key={question.id} className="space-y-2">
                    <LabelTab label={`Question ${questionIndex + 1} :`} required>
                      <QuestionCard
                        question={question}
                        canDelete={questions.length > 1}
                        onChange={(partial) => onQuestionChange(questionIndex, partial)}
                        onRemove={() => onQuestionRemove(questionIndex)}
                        onAddChoice={() => onAddChoice(questionIndex)}
                        onDeleteChoice={(choiceIndex) => onChoiceDelete(questionIndex, choiceIndex)}
                        onToggleCorrectChoice={(choiceIndex) => {
                          setQuestions((current) => current.map((item, idx) => {
                            if (idx !== questionIndex) return item;
                            if (item.type !== "choice") {
                              return { ...item, type: "choice", choices: item.choices.length ? item.choices : ["", ""], correctChoiceIndex: 0 };
                            }
                            return { ...item, correctChoiceIndex: item.correctChoiceIndex === choiceIndex ? null : choiceIndex };
                          }));
                        }}
                        onUploadFile={(file) => {
                          if (!file) return;
                          if (file.size > MAX_FILE_SIZE) {
                            setErrors((current) => ({ ...current, [`attachment-${questionIndex}`]: "File exceeds 10MB limit." }));
                            return;
                          }
                          setQuestions((current) => current.map((item, idx) => (idx === questionIndex ? { ...item, attachmentRef: `file:${file.name}` } : item)));
                        }}
                        onRemoveFile={() => onQuestionChange(questionIndex, { attachmentRef: null })}
                      />
                    </LabelTab>
                    {errors[`question-${questionIndex}`] && <p className="text-xs text-[#a14d3f]">{errors[`question-${questionIndex}`]}</p>}
                    {errors[`marks-${questionIndex}`] && <p className="text-xs text-[#a14d3f]">{errors[`marks-${questionIndex}`]}</p>}
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button type="button" onClick={onQuestionAdd} className="rounded-md border border-dashed border-[#c9ba8e] bg-[#f5efe3] px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#2f392b]">
                  Add Question
                </button>
                <button type="button" onClick={handlePublish} className="rounded-md bg-[#1d6f52] px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
                  Publish Assignments
                </button>
              </div>
              <div className="text-center text-xs font-semibold uppercase tracking-[0.12em] text-[#2c5047]">Total marks: {totalMarks}</div>
              {toast && <div className="text-center text-sm font-semibold text-[#1d6f52]">{toast}</div>}
              {editBlocked && <div className="rounded-md border border-[#d1b1a6] bg-[#fff2ef] px-3 py-2 text-xs text-[#7d3e33]">{editBlocked}</div>}
            </div>
          )}
        </div>
      }
      right={
        <PostedList
          title="Posted Assignments"
          emptyText="~No Assignments Posted Yet~"
          items={postedAssignments}
          renderItem={(assignment: AssignmentRecord) => (
            <div key={assignment.id} className="rounded-xl border border-academic-line bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2 text-xs text-academic-ink-soft">
                <span>{new Date(assignment.postedAt).toLocaleDateString()}</span>
                <span>{assignment.streams.length} stream(s)</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-academic-ink">{assignment.subject}</p>
              <p className="text-xs text-academic-ink-soft">{assignment.streams.join(", ")}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-academic-ink-soft">
                <span>{assignment.questions.length} questions</span>
                <span>{assignment.totalMarks} marks</span>
              </div>
              <div className="mt-2 text-[11px] text-academic-ink-soft">Submissions: {state.submissions.filter((item) => item.assignmentId === assignment.id).length}</div>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => handleEdit(assignment)} className="rounded-md bg-[#e7f3ec] px-2.5 py-1 text-[11px] font-semibold text-[#1d4e3d]">Edit</button>
                <button type="button" onClick={() => handleDelete(assignment.id)} className="rounded-md bg-[#f9e7e4] px-2.5 py-1 text-[11px] font-semibold text-[#883f3a]">Delete</button>
              </div>
            </div>
          )}
        />
      }
    />
  );
}

function PostStudyNotesScreen() {
  const { state, addNote, deleteNote, updateNote, putFileBlob, getFileBlob, deleteFileBlob } = useNotesAssignments();
  const { state: settings } = useSettingsData();
  const [enabled, setEnabled] = useState(true);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileRef, setFileRef] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const subjectOptions = useMemo(() => getSubjectOptions(className || "Form 1"), [className]);
  const notesForClass = state.notes.filter((note) => note.className === className && note.subject === subject).sort((first, second) => second.postedAt.localeCompare(first.postedAt));

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setErrors((current) => ({ ...current, file: "File exceeds the 10MB upload limit." }));
      return;
    }
    setUploading(true);
    const ref = await putFileBlob(file);
    setFileRef(ref);
    setFileName(file.name);
    setUploading(false);
  };

  const validateAndPublish = () => {
    const nextErrors: Record<string, string> = {};
    if (!className) nextErrors.className = "Class is required.";
    if (!subject) nextErrors.subject = "Subject is required.";
    if (!normalizeText(topic)) nextErrors.topic = "Topic is required.";
    if (!normalizeText(instructions)) nextErrors.instructions = "Instructions are required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const note: NoteRecord = {
      id: editingId ?? `note-${Date.now()}`,
      className,
      subject,
      topic,
      instructions,
      postedBy: "Mike",
      postedAt: new Date().toISOString(),
      term: settings.currentTerm,
      year: settings.currentYear,
      fileRef,
    };

    if (editingId) {
      updateNote(editingId, note);
      setEditingId(null);
    } else {
      addNote(note);
    }

    setClassName("");
    setSubject("");
    setTopic("");
    setInstructions("");
    setFileName("");
    setFileRef(null);
  };

  return (
    <ThreeColumnWorkspace
      left={
        <FilterCard title="POST STUDY NOTES" enabled={enabled} onToggle={setEnabled}>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Class</span>
            <select value={className} onChange={(event) => { setClassName(event.target.value); setSubject(""); }} disabled={!enabled} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
              <option value="">~select class~</option>
              {FORM_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Subject</span>
            <select value={subject} onChange={(event) => setSubject(event.target.value)} disabled={!enabled || !className} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
              <option value="">~select subject~</option>
              {subjectOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        </FilterCard>
      }
      center={
        <div className="rounded-2xl border border-academic-line bg-white p-4 shadow-sm">
          <div className="mb-4 rounded-xl bg-gradient-to-r from-[#2a4b57] via-[#81a7ba] to-[#dee7ec] px-4 py-3 text-center text-xl font-serif text-[#1f2d35]">
            Notes Details
          </div>

          {!className || !subject ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[#d15751] bg-[#fff5f4] p-6 text-center text-sm font-medium text-[#9b413c]">
              * Please Select Class and Subject to activate this area *
            </div>
          ) : (
            <div className="space-y-5">
              <LabelTab label="Topic :" required>
                <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="study notes topic" className="w-full rounded-md border border-dashed border-[#bfd0d8] bg-[#f5f8fa] px-3 py-2 text-sm italic text-[#6f7d83] placeholder:text-[#798489]" />
              </LabelTab>
              {errors.topic && <p className="text-xs text-[#a14d3f]">{errors.topic}</p>}

              <LabelTab label="Instructions :" required>
                <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="study instructions" className="min-h-[110px] w-full resize-y rounded-md border border-dashed border-[#bfd0d8] bg-[#f5f8fa] px-3 py-2 text-sm italic text-[#6f7d83] placeholder:text-[#798489]" />
              </LabelTab>
              {errors.instructions && <p className="text-xs text-[#a14d3f]">{errors.instructions}</p>}

              <LabelTab label="Upload Notes File ( audio, video, document. etc):">
                <div className="rounded-md border border-dashed border-[#bfd0d8] bg-[#f5f8fa] p-3">
                  <input type="file" accept="audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={handleUpload} className="block w-full text-xs text-[#394d58]" />
                  <div className="mt-2 flex items-center justify-between text-xs text-[#4a6370]">
                    <span>{fileName || "No file chosen"}</span>
                    {uploading && <span className="font-semibold text-[#1a5e46]">Uploading...</span>}
                  </div>
                  {errors.file && <p className="mt-2 text-xs text-[#a14d3f]">{errors.file}</p>}
                </div>
              </LabelTab>

              <div className="text-center">
                <button type="button" onClick={validateAndPublish} className="rounded-md bg-[#1d6f52] px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                  Post Notes
                </button>
              </div>
            </div>
          )}
        </div>
      }
      right={
        <PostedList
          title="Posted Notes"
          emptyText="~No Notes Posted Yet~"
          items={notesForClass}
          renderItem={(note: NoteRecord) => (
            <div key={note.id} className="rounded-xl border border-academic-line bg-white p-3 shadow-sm">
              <p className="text-sm font-semibold text-academic-ink">{note.topic}</p>
              <p className="mt-1 text-[11px] text-academic-ink-soft">{new Date(note.postedAt).toLocaleDateString()} · {note.subject}</p>
              <p className="mt-2 text-[11px] text-academic-ink-soft">{note.fileRef ? "File attached" : "No file attached"}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="rounded-md bg-[#e7f3ec] px-2.5 py-1 text-[11px] font-semibold text-[#1d4e3d]" onClick={() => { if (note.fileRef) void getFileBlob(note.fileRef).then((blob) => { if (blob) { const url = URL.createObjectURL(blob); window.open(url, "_blank"); } }); }}>Download</button>
                <button type="button" className="rounded-md bg-[#f9e7e4] px-2.5 py-1 text-[11px] font-semibold text-[#883f3a]" onClick={async () => { if (note.fileRef) { await deleteFileBlob(note.fileRef); } deleteNote(note.id); }}>Delete</button>
              </div>
            </div>
          )}
        />
      }
    />
  );
}

function ViewUnmarkedAssignmentsScreen() {
  const { state, addSubmission, updateSubmission } = useNotesAssignments();
  const [search, setSearch] = useState("");
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const unmarked = state.submissions.filter((submission) => submission.status === "unmarked");
  const visible = unmarked.filter((submission) => {
    const query = search.toLowerCase();
    return !query || submission.admNo.toLowerCase().includes(query) || submission.name.toLowerCase().includes(query);
  });

  const assignmentMap = useMemo(() => new Map(state.assignments.map((assignment) => [assignment.id, assignment])), [state.assignments]);

  const handleSaveMarking = (submissionId: string, scores: number[], comment: string) => {
    const submission = state.submissions.find((item) => item.id === submissionId);
    if (!submission) return;
    const total = scores.reduce((sum, score) => sum + Number(score || 0), 0);
    updateSubmission(submissionId, { status: "marked", perQuestionScores: scores, total, comment });
    setToast("Saved");
    setTimeout(() => setToast(""), 1200);
    setActiveSubmissionId(null);
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("Dev helper available: use the seed button to simulate submissions.");
  }

  return (
    <div className="space-y-4">
      <SearchAdmInput value={search} onChange={setSearch} />
      {process.env.NODE_ENV !== "production" && (
        <div className="flex justify-end">
          <button type="button" className="rounded-md border border-[#b7c9d1] bg-[#edf6f8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#274e62]" onClick={() => {
            const assignment = state.assignments[0];
            if (!assignment) return;
            const seats = [
              { admNo: "ADM-101", name: "Amina Yusuf" },
              { admNo: "ADM-102", name: "Faith Mwende" },
            ];
            const generated = seedMockSubmissions(seats.map((student) => ({
              assignmentId: assignment.id,
              admNo: student.admNo,
              name: student.name,
              answers: ["Student answer 1", "Student answer 2"],
              submittedAt: new Date().toISOString(),
              status: "unmarked",
            })));
            generated.forEach((submission) => addSubmission(submission as SubmissionRecord));
          }}>
            Simulate student submission
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-academic-line bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[#0f3e4a] text-white">
            <tr>
              <th className="px-3 py-2 font-serif">ID</th>
              <th className="px-3 py-2 font-serif">SUBJECT</th>
              <th className="px-3 py-2 font-serif">FORM</th>
              <th className="px-3 py-2 font-serif">ADM</th>
              <th className="px-3 py-2 font-serif">START MARKING</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm italic text-academic-ink-soft">~ no unmarked assignments found ~</td>
              </tr>
            ) : (
              visible.map((submission) => {
                const assignment = assignmentMap.get(submission.assignmentId);
                return (
                  <tr key={submission.id} className="border-b border-academic-line last:border-b-0">
                    <td className="px-3 py-3">{submission.id.slice(0, 8)}</td>
                    <td className="px-3 py-3">{assignment?.subject ?? "-"}</td>
                    <td className="px-3 py-3">{assignment?.form ?? "-"}</td>
                    <td className="px-3 py-3">{submission.admNo}</td>
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => setActiveSubmissionId(submission.id)} className="rounded-md bg-[#1d6f52] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white">Mark</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {activeSubmissionId && (
        <SubmissionMarkingPanel
          submission={state.submissions.find((item) => item.id === activeSubmissionId)!}
          assignment={assignmentMap.get(state.submissions.find((item) => item.id === activeSubmissionId)?.assignmentId ?? "")}
          onSave={(scores, comment) => handleSaveMarking(activeSubmissionId, scores, comment)}
          onCancel={() => setActiveSubmissionId(null)}
        />
      )}

      {toast && <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{toast}</div>}
    </div>
  );
}

function MarkedAssignmentsScreen() {
  const { state } = useNotesAssignments();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const marked = state.submissions.filter((submission) => submission.status === "marked");
  const visible = marked.filter((submission) => !search || submission.admNo.toLowerCase().includes(search.toLowerCase()));
  const assignmentMap = useMemo(() => new Map(state.assignments.map((assignment) => [assignment.id, assignment])), [state.assignments]);

  return (
    <div className="space-y-4">
      <SearchAdmInput value={search} onChange={setSearch} />

      <div className="overflow-x-auto rounded-2xl border border-academic-line bg-white">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[#0f3e4a] text-white">
            <tr>
              <th className="px-3 py-2 font-serif">ID</th>
              <th className="px-3 py-2 font-serif">SUBJECT</th>
              <th className="px-3 py-2 font-serif">FORM</th>
              <th className="px-3 py-2 font-serif">TOTAL</th>
              <th className="px-3 py-2 font-serif">MORE</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm italic text-academic-ink-soft">~ no assignments found ~</td>
              </tr>
            ) : (
              visible.map((submission) => {
                const assignment = assignmentMap.get(submission.assignmentId);
                return (
                  <Fragment key={submission.id}>
                    <tr className={`border-b border-academic-line last:border-b-0 ${expandedId === submission.id ? "bg-[#eef8f2]" : ""}`}>
                      <td className="px-3 py-3">{submission.id.slice(0, 8)}</td>
                      <td className="px-3 py-3">{assignment?.subject ?? "-"}</td>
                      <td className="px-3 py-3">{assignment?.form ?? "-"}</td>
                      <td className="px-3 py-3">{assignment?.totalMarks ?? 0}</td>
                      <td className="px-3 py-3">
                        <button type="button" onClick={() => setExpandedId((current) => current === submission.id ? null : submission.id)} className="rounded-md bg-[#234e62] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white">View</button>
                      </td>
                    </tr>
                    {expandedId === submission.id && (
                      <tr>
                        <td colSpan={5} className="bg-[#f8fafb] px-3 py-3">
                          <div className="overflow-x-auto rounded-lg border border-academic-line bg-white">
                            <table className="min-w-full border-collapse text-left text-xs">
                              <thead className="bg-[#dce8eb] text-[#2a434e]">
                                <tr>
                                  <th className="px-2 py-2">ADM</th>
                                  <th className="px-2 py-2">NAME</th>
                                  <th className="px-2 py-2">SCORE</th>
                                  <th className="px-2 py-2">%</th>
                                  <th className="px-2 py-2">marked on</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="px-2 py-2">{submission.admNo}</td>
                                  <td className="px-2 py-2">{submission.name}</td>
                                  <td className="px-2 py-2">{submission.total}</td>
                                  <td className="px-2 py-2">{assignment ? ((submission.total / assignment.totalMarks) * 100).toFixed(0) : 0}%</td>
                                  <td className="px-2 py-2">{new Date(submission.submittedAt).toLocaleDateString()}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <button type="button" className="rounded-md border border-academic-line bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-academic-ink">Re-mark</button>
                            <button type="button" className="rounded-md border border-academic-line bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-academic-ink">Export CSV</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AutoLoginLinkScreen() {
  const { generateAutoLoginLink } = useNotesAssignments();
  const { data } = useRegistrationData();
  const [form, setForm] = useState("");
  const [stream, setStream] = useState("");
  const [studentAdm, setStudentAdm] = useState("");
  const [message, setMessage] = useState("");
  const [previewRows, setPreviewRows] = useState<Array<{ admNo: string; name: string; parentPhone: string; message: string; status: string; selected: boolean; link: string }>>([]);
  const [warning, setWarning] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const streamOptions = useMemo(() => getStreamOptions(form, data.streams as Array<{ name: string; grade: string }>), [data.streams, form]);

  const handleInsertLink = () => {
    setMessage((current) => `${current}${current ? " " : ""}{LINK}`);
  };

  const handlePreview = async () => {
    if (!form && !studentAdm) {
      setWarning("Please choose a form or a student ADM number.");
      return;
    }
    if (!message.includes("{LINK}")) {
      setWarning("The message must include {LINK} before previewing.");
      return;
    }

    const studentPool = data.students.filter((student) => {
      const matchesForm = !form || (data.streams.find((stream) => stream.id === student.streamId)?.grade === form);
      const matchesAdm = !studentAdm || student.admNo === studentAdm;
      return matchesForm && matchesAdm;
    });

    try {
      const rows = await Promise.all(studentPool.map(async (student) => {
        const linkData = await generateAutoLoginLink(student.admNo);
        const studentMessage = message.replace("{LINK}", linkData.url);
        return { admNo: student.admNo, name: student.name, parentPhone: student.phone || "No phone", message: studentMessage, status: "ready", selected: true, link: linkData.url };
      }));

      setPreviewRows(rows);
      setWarning("");
      setStatusMessage(`${rows.length} preview rows generated.`);
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Unable to generate parent links.");
    }
  };

  const handleSend = async () => {
    const selectedRows = previewRows.filter((row) => row.selected);
    if (selectedRows.length === 0) {
      setStatusMessage("No recipient rows were selected.");
      return;
    }
    const recipients = selectedRows
      .filter((row) => row.parentPhone !== "No phone")
      .map((row) => ({ phone: row.parentPhone, message: row.message }));
    if (recipients.length === 0) {
      setStatusMessage("No selected recipients have a phone number.");
      return;
    }
    const response = await fetch("/api/notes-assignments/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients }),
    });
    const result = await response.json() as { error?: string; data?: { delivered: number } };
    setStatusMessage(response.ok
      ? `${result.data?.delivered ?? 0} messages delivered.`
      : result.error ?? "SMS delivery is unavailable.");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <FilterCard title="GENERATE PARENTS AUTO-LOGIN LINK" enabled onToggle={() => undefined}>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Form</span>
            <select value={form} onChange={(event) => { setForm(event.target.value); setStream(""); }} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
              <option value="">~select form~</option>
              {FORM_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Stream</span>
            <select value={stream} onChange={(event) => setStream(event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
              <option value="">select form</option>
              {streamOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Student</span>
            <input value={studentAdm} onChange={(event) => setStudentAdm(event.target.value)} placeholder="student's adm no." className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm italic text-[#6e7a80] placeholder:text-[#7b8588]" />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Message</span>
              <button type="button" onClick={handleInsertLink} className="rounded-full bg-[#1d5a66] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Insert link</button>
            </div>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="type your message here, use INSERT LINK button to insert link Where prefered" className="min-h-[120px] w-full resize-y rounded-md border border-[#a9c6d3] bg-[#f4fbfe] px-3 py-2 text-sm text-[#2c4550] placeholder:text-[#78878c]" />
          </div>

          <button type="button" onClick={handlePreview} className="w-full rounded-md bg-[#1d6f52] px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] text-white">
            Preview Messages
          </button>
          {warning && <p className="text-xs text-[#a14d3f]">{warning}</p>}
        </FilterCard>

        <div className="space-y-4 rounded-2xl border border-academic-line bg-[#f7fbfd] p-4 shadow-sm">
          <p className="text-center text-sm italic text-[#334e5e]">Select your preferred options on the fields provided, then click Preview Messages to preview the message</p>

          <InfoBox title="Portal notice">
            <p className="text-center text-sm leading-6">
              Generated links will allow parents to <strong className="italic">Access</strong> notes and assignments portal <strong className="italic">Automatically</strong> without having to enter Username and Password.
            </p>
          </InfoBox>

          <InfoBox title="Access note" tone="light">
            <p className="text-sm leading-6">
              Without the auto-login links, Parents can use this link <a href={PORTAL_URL} target="_blank" rel="noreferrer" className="text-[#1d5a66] underline">{PORTAL_URL}</a> to access notes and assignments. Enter student&apos;s <strong className="italic">ADM</strong> as <strong className="italic">Username</strong> and <strong className="italic">password</strong> to login.
            </p>
          </InfoBox>

          {previewRows.length > 0 && (
            <div className="space-y-3">
              <AutoLoginPreviewTable rows={previewRows} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#32546a]">Count: {previewRows.length} · Character count: {message.length} · SMS segments: {Math.max(1, Math.ceil(message.length / 160))}</div>
                <div className="flex gap-2">
                  <button type="button" onClick={handleSend} className="rounded-md bg-[#1d6f52] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">Send via SMS</button>
                  <button type="button" className="rounded-md border border-academic-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-academic-ink">Copy links</button>
                </div>
              </div>
              {statusMessage && <p className="text-xs text-[#1d5a66]">{statusMessage}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotesAssignmentsPage({ route }: { route: string }) {
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Academic workspace</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Notes & Assignments</h1>
          </div>
          <div className="rounded-full border border-academic-line bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-academic-ink-soft">
            Mike
          </div>
        </div>
      </header>
      <NotesAssignmentsShell route={route} />
    </div>
  );
}

