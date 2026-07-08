// Small pill used next to any control that isn't wired up to real
// functionality yet — matches the "coming soon" language already used
// elsewhere on the Settings page rather than presenting a fake control.
export default function ComingSoonBadge() {
  return (
    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[10px] font-bold whitespace-nowrap">
      Coming Soon
    </span>
  );
}
