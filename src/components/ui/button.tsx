import { JSX, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, ["variant", "size", "class", "children"]);

  const variantClass = () => {
    switch (local.variant) {
      case "outline":
        return "border border-border/80 bg-background/60 hover:bg-accent/80 text-foreground shadow-xs";
      case "ghost":
        return "hover:bg-accent/80 hover:text-accent-foreground";
      case "secondary":
        return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs";
    }
  };

  const sizeClass = () => {
    switch (local.size) {
      case "sm":
        return "h-8 rounded-lg px-3 text-xs";
      case "lg":
        return "h-11 rounded-2xl px-6 text-sm";
      case "icon":
        return "size-9 rounded-full";
      default:
        return "h-9 px-4 py-2 rounded-xl text-xs";
    }
  };

  return (
    <button
      class={cn(
        "inline-flex items-center justify-center gap-1.5 font-medium transition-all apple-press cursor-pointer disabled:pointer-events-none disabled:opacity-50",
        variantClass(),
        sizeClass(),
        local.class
      )}
      {...rest}
    >
      {local.children}
    </button>
  );
}
