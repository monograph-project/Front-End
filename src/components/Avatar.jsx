export default function Avatar({
  initials,
  colorClass,
  size = "w-8 h-8",
  text = "text-xs",
}) {
  return (
    <div
      className={`${size} ${colorClass} rounded-full flex items-center justify-center shrink-0`}
    >
      <span className={`${text} font-semibold text-white leading-none`}>
        {initials}
      </span>
    </div>
  );
}
