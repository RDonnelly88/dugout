import Layout from "@/components/Layout";

/**
 * The signed-in shell: sidebar, team switcher, quick actions. Everything in
 * this route group renders inside it. `/login` sits outside the group so it
 * gets a bare page.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
