export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonPrimary = `${buttonBase} h-11 bg-emerald-700 px-5 text-white hover:bg-emerald-800`;

export const buttonSecondary = `${buttonBase} h-11 border border-stone-300 bg-white px-5 text-stone-700 hover:bg-stone-50`;

export const buttonGhost = `${buttonBase} h-10 px-3 text-stone-600 hover:bg-stone-100`;

export const buttonDanger = `${buttonBase} h-11 px-3 text-sm text-red-600 hover:bg-red-50`;

export const buttonSmall = `${buttonBase} h-9 px-3 text-xs`;

export const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-stone-100";

export const labelClass = "text-sm font-medium text-stone-700";

export const fieldHintClass = "mt-1.5 text-xs text-stone-500";

export const fieldErrorClass = "mt-1.5 text-xs font-medium text-red-600";

export const cardClass =
  "rounded-2xl border border-stone-200 bg-white shadow-sm";

export const badgeClass =
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium";

export const tableActionClass =
  "text-sm font-medium text-stone-600 transition-colors hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";
