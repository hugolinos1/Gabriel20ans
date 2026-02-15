import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PartyPopper, Frown } from 'lucide-react';

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams?: { attending?: string };
}) {
  const isNotAttending = searchParams?.attending === 'no';

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isNotAttending ? (
              <Frown className="h-8 w-8" />
            ) : (
              <PartyPopper className="h-8 w-8" />
            )}
          </div>
          <CardTitle className="font-headline text-3xl">Merci !</CardTitle>
          <CardDescription>
            {isNotAttending
              ? 'Votre réponse a bien été enregistrée.'
              : 'Votre participation a été confirmée.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            {isNotAttending
              ? 'Nous sommes navrés de ne pas pouvoir partager ce moment avec vous !'
              : 'Nous sommes ravis de célébrer avec vous les 20 ans de Gabriel !'}
          </p>
          <Button asChild>
            <Link href="/">Retour à l'invitation</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
