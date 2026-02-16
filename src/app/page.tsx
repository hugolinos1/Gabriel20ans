import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Logo from '@/components/Logo';
import { Suspense } from 'react';
import RsvpEmailForm from '@/components/RsvpEmailForm';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'gabriel-gala-main');

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <Card className="overflow-hidden shadow-2xl md:grid md:grid-cols-2">
          <div className="relative h-64 w-full md:h-full">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
              />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Logo />
              </div>
              <CardTitle className="font-headline text-3xl tracking-tight md:text-4xl">
                Vous êtes invité !
              </CardTitle>
              <CardDescription className="text-lg">
                pour célébrer le 20e anniversaire de Gabriel
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-8 space-y-2">
                <p className="font-bold text-primary">Samedi 18 juillet</p>
                <p className="text-muted-foreground">Rejoignez-nous pour une journée de plaisir, de rigolades et de souvenirs.</p>
              </div>
              <Suspense fallback={<div className="h-20" />}>
                <RsvpEmailForm />
              </Suspense>
            </CardContent>
          </div>
        </Card>
      </div>
    </main>
  );
}
