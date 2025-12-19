'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/all';
import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const WorkPage = () => {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (typeof SplitText === 'undefined') return;

      const heroSplit = new SplitText('.title', {
        type: 'chars, words',
      });
      const paragraphSplit = new SplitText('.subtitle', {
        type: 'lines',
      });

      heroSplit.chars.forEach((char) => {
        // Add a class for styling the gradient
        char.classList.add('text-gradient', 'bg-gradient-to-b', 'from-zinc-300', 'to-zinc-500');
      });

      gsap.from(heroSplit.chars, {
        yPercent: 100,
        duration: 1.8,
        ease: 'expo.out',
        stagger: 0.06,
      });

      gsap.from(paragraphSplit.lines, {
        opacity: 0,
        yPercent: 100,
        duration: 1.8,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 1,
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
        .to('.right-leaf', { y: 200, ease: 'none' }, 0)
        .to('.left-leaf', { y: -200, ease: 'none' }, 0);
    },
    { scope: containerRef }
  );

  return (
    <div className="bg-black min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 text-white">
          <Link href="/" className="text-xl font-bold tracking-tighter">
            Velvet Pour
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-primary transition-colors">Cocktails</Link>
            <Link href="#" className="hover:text-primary transition-colors">About Us</Link>
            <Link href="#" className="hover:text-primary transition-colors">The Art</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
           <Button asChild variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-black">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>
      <main ref={containerRef}>
        <section
          id="hero"
          className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden noisy"
        >
          <h1
            className="title text-8xl md:text-9xl font-black uppercase"
            style={{ zIndex: 10 }}
          >
            MOJITO
          </h1>

          <Image
            src="https://picsum.photos/seed/leaf1/800/1200"
            alt="left-leaf"
            width={300}
            height={450}
            data-ai-hint="monstera leaf"
            className="left-leaf absolute -left-20 top-1/2 -translate-y-1/2 w-48 md:w-80"
          />
          <Image
            src="https://picsum.photos/seed/leaf2/800/1200"
            alt="right-leaf"
            width={300}
            height={450}
            data-ai-hint="monstera leaf"
            className="right-leaf absolute -right-20 top-1/2 -translate-y-1/2 w-48 md:w-80"
          />

          <div
            className="body absolute bottom-10 md:bottom-20 w-full px-4"
            style={{ zIndex: 10 }}
          >
            <div className="content flex justify-between items-end max-w-6xl mx-auto text-white">
              <div className="space-y-2 hidden md:block text-left">
                <p className="text-lg">Cool. Crisp. Classic.</p>
                <p className="subtitle text-2xl font-medium text-yellow-300">
                  Sip the Spirit <br /> of Summer
                </p>
              </div>

              <div className="view-cocktails max-w-xs text-left md:text-right">
                <p className="subtitle text-base">
                  Every cocktail on our menu is a blend of premium ingredients,
                  creative flair, and timeless recipes — designed to delight
                  your senses.
                </p>
                <a href="#cocktails" className="text-primary mt-2 inline-block">View cocktails</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkPage;
