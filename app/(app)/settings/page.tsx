import PasskeySettings from "@/components/PasskeySettings";

export const metadata = {
  title: "Settings · The Dugout",
};

export default function SettingsPage() {
  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          How you sign in to The Dugout.
        </p>
      </div>

      <div className="max-w-2xl">
        <PasskeySettings />
      </div>
    </div>
  );
}
