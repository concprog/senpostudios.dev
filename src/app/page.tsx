import { ThreePixelBackground } from '@/components/landing';
import { OurGoalBackground } from '@/components/ourgoal';
import Header from '@/components/header';
import { MailBackground } from '@/components/mail';
import {Contact} from '@/components/contact'

export default function Home() {
  return (
    <main className="relative">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </header>
      
      {/* Landing Section */}
      <section id="landing" className="h-screen">
        <ThreePixelBackground />
      </section>
      
      {/* Our Goal Section */} 
      <section id="our-goal" className="min-h-screen">
        <OurGoalBackground />
      </section>
      <section id="mail" className="min-h-screen">
        <MailBackground />
      </section>
      <section id="contact" className="min-h-screen">
        <Contact />
      </section>

    </main>
  );
}
