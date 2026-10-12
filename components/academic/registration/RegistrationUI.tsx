import Image from "next/image";
import { Input, Select, Textarea } from "@/components/ui/Form";
import type { SchoolDetails } from "@/lib/academic/registration-data";

export function RegistrationHeading({ title, description, actions }: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-academic-line pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-academic-accent">Registration portal</p>
        <h1 className="font-display text-2xl text-academic-ink sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm text-academic-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function RegistrationPanel({ title, children, className = "" }: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-md border border-academic-line bg-academic-surface p-4 shadow-[0_1px_0_rgba(27,51,41,0.04)] sm:p-5 ${className}`}>
      <h2 className="mb-4 font-display text-lg text-academic-ink">{title}</h2>
      {children}
    </section>
  );
}

export function AcademicButton({ children, variant = "primary", ...props }: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "danger" | "ghost";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const classes = {
    primary: "border-academic-accent bg-academic-accent text-white hover:bg-academic-ink",
    outline: "border-academic-line bg-academic-surface text-academic-ink hover:border-academic-accent hover:text-academic-accent",
    danger: "border-red-300 bg-white text-red-700 hover:bg-red-50",
    ghost: "border-transparent bg-transparent text-academic-ink-soft hover:bg-academic-paper hover:text-academic-ink",
  };
  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${classes[variant]} ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function FormField({ label, required, children, className = "" }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-academic-ink-soft">
        {label}{required && <span className="ml-0.5 text-red-700">*</span>}
      </span>
      {children}
    </label>
  );
}

const registrationInputClass = "border-academic-line focus:border-academic-accent focus:ring-academic-accent";

export function RegInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className={`${registrationInputClass} ${props.className ?? ""}`} />;
}

export function RegSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <Select {...props} className={`${registrationInputClass} ${props.className ?? ""}`} />;
}

export function RegTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <Textarea {...props} className={`${registrationInputClass} ${props.className ?? ""}`} />;
}

export function PrintHeader({ school }: { school: SchoolDetails }) {
  return (
    <header className="mb-5 flex items-center gap-4 border-b-2 border-academic-ink pb-4 print:mb-3">
      <Image src={school.logoUrl || "/Logo/school_logo.jpg"} alt="School logo" width={64} height={64} className="h-16 w-16 object-contain" unoptimized />
      <div>
        <h1 className="font-display text-xl font-semibold text-black">{school.name}</h1>
        {school.motto && <p className="text-sm italic text-black">{school.motto}</p>}
        <p className="text-sm text-black">{[school.poBox, school.town].filter(Boolean).join(", ")}</p>
      </div>
    </header>
  );
}

export function TeacherLabel({ id, teachers }: {
  id: string;
  teachers: { id: string; name: string }[];
}) {
  return teachers.find((teacher) => teacher.id === id)?.name ?? "Not assigned";
}

export function RegistrationSelectField({
  label,
  value,
  onChange,
  options,
  emptyLabel = "Select...",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  emptyLabel?: string;
}) {
  return (
    <FormField label={label}>
      <RegSelect value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{emptyLabel}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </RegSelect>
    </FormField>
  );
}