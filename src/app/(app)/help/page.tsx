
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
            Get assistance with Dey Weaver.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            If you need further assistance, please don't hesitate to reach out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <a href={`mailto:${supportEmail}?subject=Dey Weaver Support Request`}>
              <Mail className="mr-2 h-5 w-5" />
              Mail Customer Support
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
