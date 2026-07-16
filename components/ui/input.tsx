import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftNode?: React.ReactNode;
  rightNode?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helpText,
      leftNode,
      rightNode,
      required,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="space-y-2 w-full font-sans">
        {label && (
          <label className="block text-caption-mono-sm font-mono uppercase text-gray-400">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftNode && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              {leftNode}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "block w-full rounded-sm border border-hairline bg-canvas-soft py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-white transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              leftNode ? "pl-10" : "pl-3.5",
              rightNode ? "pr-10" : "pr-3.5",
              error && "border-red-500 focus:border-red-500",
              className,
            )}
            ref={ref}
            // required={required}
            {...props}
          />
          {rightNode && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightNode}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helpText && !error && (
          <p className="text-[10px] text-gray-500">{helpText}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
