import * as React from "react";

export const CommunityInput = React.forwardRef(
  ({ className = "", type = "text", ...props }, ref) => {
    const base =
      "h-9 w-full rounded-xl border border-input bg-white px-3 py-1 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground";

    return (
      <input
        ref={ref}
        type={type}
        className={`${base} ${className}`}
        {...props}
      />
    );
  }
);

CommunityInput.displayName = "CommunityInput";

export default CommunityInput;