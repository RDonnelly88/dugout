"use client";

import type { ReactNode } from "react";
import { useIsSmallScreen } from "@/hooks/useIsSmallScreen";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/**
 * A panel of extra reading, arriving the way the device expects.
 *
 * Up from a thumb on a phone, in from the side on anything bigger. The same
 * children either way — writing the contents twice is how the two drift
 * apart, and the difference here is only where the thing slides in from.
 *
 * A drawer can be thrown back down, so it suits reading. It does not suit a
 * panel you drag things around inside: a drag meant for something on the
 * drawer is a drag on the drawer as far as it is concerned, and the panel
 * leaves rather than the player moving.
 */
export default function SidePanel({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  const small = useIsSmallScreen();

  if (small) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-8">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
