
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function HelpPage() {
  const supportEmail = 'aryanbrite@gmail.com';

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Help & Support</CardTitle>
          <CardDescription className="text-lg">
            Find answers to your questions and get help with Day Weaver.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            If you need further assistance, please don't hesitate to reach out to our support team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <a href={`mailto:${supportEmail}?subject=Day Weaver Support Request`}>
              <Mail className="mr-2 h-5 w-5" />
              Mail Customer Support
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Or email us directly at: <a href={`mailto:${supportEmail}`} className="underline text-primary">{supportEmail}</a>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions (FAQ)</CardTitle>
          <CardDescription>
            Browse common questions and answers. (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our FAQ section is currently under development. Please check back later or contact support if you have immediate questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
