import { InputHTMLAttributes, forwardRef, useId } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, hint, error, id, className = "", "aria-describedby": ariaDescribedBy, ...rest },
  ref,
) {
  // Stable IDs for hint/error so we can wire aria-describedby. The implicit
  // <label> wrapping is preserved (works for SR), but hint/error need an
  // explicit aria-describedby per WCAG SC 1.3.1 / 3.3.2.
  const reactId = useId();
  const inputId = id ?? `tf-${reactId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-err` : undefined;
  const describedBy = [ariaDescribedBy, errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <label className="block" htmlFor={inputId}>
      {label && (
        <span className="mb-1.5 block text-[13px] font-medium text-ink-700">{label}</span>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "block w-full h-12 rounded-md bg-ink-100 px-4 text-[15px] text-ink-900",
          "placeholder:text-ink-400",
          "focus-visible:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
          "focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand",
          error ? "ring-2 ring-danger" : "",
          className,
        ].join(" ")}
        {...rest}
      />
      {error ? (
        <span id={errorId} role="alert" className="mt-1.5 block text-[12px] text-danger">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="mt-1.5 block text-[12px] text-ink-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
});
