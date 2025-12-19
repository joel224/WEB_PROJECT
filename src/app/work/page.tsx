'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { SplitText } from 'gsap/all';
import { useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const WorkPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      // This plugin is commercial, so we should check for it.
      if (typeof SplitText !== 'undefined') {
        const heroSplit = new SplitText('.title', {
          type: 'chars, words',
        });
        const paragraphSplit = new SplitText('.subtitle', {
          type: 'lines',
        });

        heroSplit.chars.forEach((char) => char.classList.add('text-gradient'));

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
      }

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
    <div className="bg-background min-h-screen">
       <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
            JJ
          </Link>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </header>
      <main ref={containerRef}>
        <section id="hero" className="relative noisy h-screen flex flex-col items-center justify-center text-center overflow-hidden">
          <h1 className="title text-8xl md:text-9xl font-black text-primary uppercase" style={{ zIndex: 10 }}>
            MOJITO
          </h1>

          <Image
            src="https://picsum.photos/seed/leaf1/800/1200"
            alt="left-leaf"
            width={800}
            height={1200}
            className="left-leaf absolute top-0 left-0 object-cover w-1/2 h-full opacity-50"
            style={{ zIndex: 1 }}
          />
          <Image
            src="https://picsum.photos/seed/leaf2/800/1200"
            alt="right-leaf"
            width={800}
            height={1200}
            className="right-leaf absolute top-0 right-0 object-cover w-1/2 h-full opacity-50"
            style={{ zIndex: 1 }}
          />

          <div className="body absolute bottom-10 md:bottom-20 w-full px-4" style={{ zIndex: 10 }}>
            <div className="content flex justify-between items-end max-w-6xl mx-auto">
              <div className="space-y-2 hidden md:block text-left text-foreground">
                <p className="text-lg">Cool. Crisp. Classic.</p>
                <p className="subtitle text-2xl font-medium">
                  Sip the Spirit <br /> of Summer
                </p>
              </div>

              <div className="view-cocktails max-w-xs text-left md:text-right text-foreground">
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
