import Image from 'next/image';
import RsvpForm from '@/components/RsvpForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Logo from '@/components/Logo';

export default function RsvpPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email || '';
  const bannerImage = PlaceHolderImages.find(
    (img) => img.id === 'gabriel-gala-banner'
  );

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background py-8 sm:py-12">
      <div className="w-full max-w-2xl px-4">
        <div className="mx-auto mb-6 w-fit">
          <Logo />
        </div>
        <div className="relative mb-6 h-48 w-full overflow-hidden rounded-lg shadow-lg sm:h-64">
          {bannerImage && (
            <Image
              src={bannerImage.imageUrl}
              alt={bannerImage.description}
              fill
              className="object-cover"
              data-ai-hint={bannerImage.imageHint}
              priority
            />
          )}
        </div>
        <RsvpForm email={email} />
      </div>
    </main>
  );
}
