type ToolSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export function ToolSwitch({ checked, onChange, label, disabled = false }: ToolSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-academic-line bg-academic-paper px-3 py-2">
      {label && <span className="text-xs font-medium text-academic-ink-soft">{label}</span>}
      <button
        type="button"
        aria-label={label ?? "Tool switch"}
        aria-pressed={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
          checked
            ? "border-academic-accent bg-academic-accent"
            : "border-academic-line bg-academic-muted"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
