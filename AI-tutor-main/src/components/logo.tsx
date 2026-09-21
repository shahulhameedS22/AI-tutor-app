import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="AI Study Buddy Home">
      <BookOpenCheck className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-semibold text-foreground">
        AI Study Buddy
      </span>
    </Link>
  );
}
