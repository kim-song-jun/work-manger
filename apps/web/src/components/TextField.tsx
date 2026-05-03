import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, hint, error, id, className = "", ...rest },
  ref,
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-ink-700">{label}</span>
      )}
      <input
        ref={ref}
        id={id}
        className={[
          "block w-full h-12 rounded-md bg-ink-100 px-4 text-[15px] text-ink-900",
          "placeholder:text-ink-400",
          "focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand",
          error ? "ring-2 ring-danger" : "",
          className,
        ].join(" ")}
        {...rest}
      />
      {(hint || error) && (
        <span
          className={`mt-1.5 block text-[12px] ${
            error ? "text-danger" : "text-ink-500"
          }`}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
});
