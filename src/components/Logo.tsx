import { Gift } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <Gift className="h-6 w-6" />
      <span className="font-headline text-xl font-bold tracking-tight">
        Les 20 ans de Gabriel
      </span>
    </div>
  );
}
