import { ThreePixelBackground } from '@/components/landing';
import Header from '@/components/header';

export default function Home() {
  return (
    <main>
      <header><Header></Header></header>
      <ThreePixelBackground />
    </main>
  );
}
