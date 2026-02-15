import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper } from 'lucide-react';

export default function ConfirmationPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PartyPopper className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">Thank You!</CardTitle>
          <CardDescription>Your RSVP has been confirmed.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">We're excited to celebrate with you at Gabriel's Gala!</p>
          <Button asChild>
            <Link href="/">Back to Invitation</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
