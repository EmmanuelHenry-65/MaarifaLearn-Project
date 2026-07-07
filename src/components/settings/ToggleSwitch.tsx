interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

// Accessible on/off switch (role="switch") used for the boolean preferences:
// study reminders and quiz hints.
export default function ToggleSwitch({ checked, onChange, label, disabled }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'bg-cyan-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}
