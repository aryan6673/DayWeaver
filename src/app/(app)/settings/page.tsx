import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggleSwitch } from '@/components/settings/theme-toggle-switch';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Settings</CardTitle>
          <CardDescription className="text-lg">
            Customize your Dey Weaver experience.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Adjust the look and feel of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThemeToggleSwitch />
        </CardContent>
      </Card>
    </div>
  );
}
