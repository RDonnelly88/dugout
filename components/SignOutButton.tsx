"use client";

import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <Button variant="outline" onClick={() => signOut()}>
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </Button>
  );
}
