'use client';

import { SlideRenderer } from '@open-slide/document';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Deck, DeckSlide } from '@/lib/models';

export function PresentationPlayer({ deck, slides }: { deck: Deck; slides: DeckSlide[] }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown') {
        event.preventDefault();
        setIndex((current) => Math.min(slides.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
      }
      if (event.key === 'Escape') window.history.back();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slides.length]);

  return (
    <main className="presentation-player">
      <header>
        <strong>{deck.title}</strong>
        <span>
          {slides.length === 0 ? 0 : index + 1} / {slides.length}
        </span>
        <a href={`/decks/${deck.id}`} className="icon-button" aria-label="Exit presentation">
          <X size={17} />
        </a>
      </header>
      <section className="presentation-stage" aria-live="polite">
        {slide ? (
          <SlideRenderer document={slide.document} />
        ) : (
          <p>This presentation has no slides.</p>
        )}
      </section>
      <nav aria-label="Presentation navigation">
        <button
          type="button"
          className="icon-button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => setIndex((value) => Math.min(slides.length - 1, value + 1))}
          disabled={index >= slides.length - 1}
          aria-label="Next slide"
        >
          <ChevronRight />
        </button>
      </nav>
    </main>
  );
}
