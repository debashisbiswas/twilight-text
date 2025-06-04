import type { Component } from 'solid-js';
import { createSignal, createMemo, For, createEffect } from 'solid-js';
import nlp from 'compromise';

interface TextSegment {
  text: string;
  isHighlighted: boolean;
}

const App: Component = () => {
  const [text, setText] = createSignal(localStorage.getItem('twilight-text') || '');

  createEffect(() => {
    localStorage.setItem('twilight-text', text());
  });

  const analyzedText = createMemo(() => {
    if (!text()) return [];
    
    const doc = nlp(text());
    const segments: TextSegment[] = [];
    
    // Find proper nouns, places, people, and organizations in the full text
    const properNouns = doc.match('#ProperNoun').out('array');
    const places = doc.places().out('array');
    const people = doc.people().out('array');
    const organizations = doc.organizations().out('array');
    
    // Combine all important terms
    const highlightTerms = [...properNouns, ...places, ...people, ...organizations];
    
    if (highlightTerms.length === 0) {
      segments.push({ text: text(), isHighlighted: false });
      return segments;
    }
    
    let remainingText = text();
    let processed = '';
    
    // Process each highlight term
    highlightTerms.forEach(term => {
      const index = remainingText.toLowerCase().indexOf(term.toLowerCase());
      if (index !== -1) {
        // Add text before the highlight
        if (index > 0) {
          segments.push({ text: remainingText.slice(0, index), isHighlighted: false });
        }
        
        // Add the highlighted term
        segments.push({ text: remainingText.slice(index, index + term.length), isHighlighted: true });
        
        // Update remaining text
        remainingText = remainingText.slice(index + term.length);
      }
    });
    
    // Add any remaining text
    if (remainingText) {
      segments.push({ text: remainingText, isHighlighted: false });
    }
    
    // If no segments were created (edge case), add the full text
    if (segments.length === 0) {
      segments.push({ text: text(), isHighlighted: false });
    }
    
    return segments;
  });

  const handleInput = (e: Event) => {
    const target = e.target as HTMLDivElement;
    setText(target.innerText);
  };

  return (
    <div class="min-h-screen bg-white" style="font-family: 'Work Sans', sans-serif;">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div
          contentEditable
          onInput={handleInput}
          class="w-full min-h-96 p-8 bg-transparent border-none focus:outline-none text-gray-800 text-xl leading-relaxed whitespace-pre-wrap"
          style="font-family: 'Work Sans', sans-serif; font-weight: 400;"
          innerHTML={
            analyzedText().length > 0 
              ? analyzedText().map(segment => 
                  segment.isHighlighted 
                    ? `<span style="color: #2563eb; font-weight: 500;">${segment.text}</span>`
                    : segment.text
                ).join('')
              : ''
          }
        />
        {!text() && (
          <div class="absolute top-20 left-14 text-gray-400 italic pointer-events-none">
            Start writing...
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
