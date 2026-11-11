import * as React from "react";

export const CommunityButton = React.forwardRef(
  (
    {
      className = "",
      variant = "default", // default | secondary | outline | ghost
      size = "default",    // default | sm | lg | icon
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      default: "bg-violet-600 text-white hover:bg-violet-700 shadow",
      secondary: "bg-muted text-foreground hover:bg-muted/70",
      outline: "border border-input bg-transparent hover:bg-muted",
      ghost: "hover:bg-muted/60",
    };

    const sizes = {
      default: "h-9 px-4",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-6",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

CommunityButton.displayName = "CommunityButton";

export default CommunityButton;