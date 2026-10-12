type YearSelectProps = {
  value: string | number;
  onChange: (value: string) => void;
  years?: Array<number | string>;
  label?: string;
};

export function YearSelect({
  value,
  onChange,
  years = [],
  label = "Year",
}: YearSelectProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">
        {label}
      </span>
      <select
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink outline-none transition focus:border-academic-accent"
      >
        {years.length === 0 ? (
          <option value="">No years</option>
        ) : (
          years.map((year) => (
            <option key={String(year)} value={String(year)}>
              {year}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
