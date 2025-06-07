"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function NavigationMenu({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav className={cn(className)} {...props} />;
}

const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex items-center gap-4", className)}
    {...props}
  />
));
NavigationMenuList.displayName = "NavigationMenuList";

const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn(className)} {...props} />
));
NavigationMenuItem.displayName = "NavigationMenuItem";

const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a">
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn("text-sm font-medium hover:underline", className)}
    {...props}
  />
));
NavigationMenuLink.displayName = "NavigationMenuLink";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
};
