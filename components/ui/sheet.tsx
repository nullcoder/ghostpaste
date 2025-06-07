"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled
    ? (onOpenChange as (o: boolean) => void)
    : setInternalOpen;
  return (
    <SheetContext.Provider value={{ open: currentOpen, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({
  asChild = false,
  children,
  ...props
}: { asChild?: boolean } & React.ComponentProps<"button">) {
  const ctx = React.useContext(SheetContext)!;
  const handleClick = () => ctx.setOpen(!ctx.open);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }
  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "top" | "bottom" | "left" | "right";
}

function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: SheetContentProps) {
  const ctx = React.useContext(SheetContext)!;
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") ctx.setOpen(false);
    }
    if (ctx.open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);

  if (!ctx.open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          "bg-background fixed p-6 shadow-lg transition-transform",
          side === "left" && "inset-y-0 left-0 w-3/4 max-w-sm border-r",
          side === "right" && "inset-y-0 right-0 w-3/4 max-w-sm border-l",
          side === "top" && "inset-x-0 top-0 h-3/4 border-b",
          side === "bottom" && "inset-x-0 bottom-0 h-3/4 border-t",
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => ctx.setOpen(false)}
          className="focus:ring-ring absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:outline-none"
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>,
    document.body
  );
}

export { Sheet, SheetTrigger, SheetContent };
