import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantCls: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover disabled:bg-ink-300 disabled:text-ink-500",
  secondary:
    "bg-ink-100 text-ink-900 hover:bg-ink-200 disabled:text-ink-400",
  ghost:
    "bg-transparent text-ink-800 hover:bg-ink-100 disabled:text-ink-400",
};

const sizeCls: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px] rounded-sm",
  md: "h-11 px-4 text-[15px] rounded-md",
  lg: "h-14 px-5 text-[16px] rounded-md font-semibold",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", fullWidth, className = "", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[
        "inline-flex items-center justify-center font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        variantCls[variant],
        sizeCls[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    />
  );
});
