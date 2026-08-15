import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

/**
 * The form reads `?next=` to decide where to send you after signing in, and
 * `useSearchParams` opts its whole subtree into dynamic rendering. Wrapping it
 * keeps that boundary here rather than bubbling out to the root layout.
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
