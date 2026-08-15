import PasskeySettings from "@/components/PasskeySettings";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import { getThemePreference } from "@/lib/theme-server";
import { supabaseServer } from "@/lib/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Settings · The Dugout",
};

export default async function SettingsPage() {
  // Read on the server so the control renders already showing the account's
  // choice, rather than flicking to it once JavaScript arrives.
  const [theme, supabase] = await Promise.all([
    getThemePreference(),
    supabaseServer(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          How the app looks, and how you get into it.
        </p>
      </div>

      <div className="grid max-w-3xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
            <CardDescription>
              Follows your device unless you pick one. Saved to your account, so
              it comes with you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle initial={theme} />
          </CardContent>
        </Card>

        <PasskeySettings />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <SignOutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
