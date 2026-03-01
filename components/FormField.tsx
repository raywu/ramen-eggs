"use client";

import { useId, cloneElement, type ReactElement } from "react";

export default function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactElement<{ id?: string }>;
}) {
  const generatedId = useId();
  const inputId = children.props.id || generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
        {required && (
          <span className="ml-0.5" style={{ color: "var(--color-accent)" }}>
            *
          </span>
        )}
      </label>
      {hint && <span className="text-xs opacity-50">{hint}</span>}
      {cloneElement(children, { id: inputId })}
    </div>
  );
}
