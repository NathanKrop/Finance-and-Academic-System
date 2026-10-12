type TermSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ value: string; label: string }>;
  label?: string;
};

export function TermSelect({
  value,
  onChange,
  options = [],
  label = "Term",
}: TermSelectProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink outline-none transition focus:border-academic-accent"
      >
        <option value="">Select term</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
