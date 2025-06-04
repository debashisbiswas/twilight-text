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

  return (
    <div class="min-h-screen bg-white" style="font-family: 'Work Sans', sans-serif;">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="mb-12">
          <textarea
            value={text()}
            onInput={(e) => setText(e.currentTarget.value)}
            placeholder="Start writing..."
            class="w-full h-96 p-8 bg-transparent border-none resize-none focus:outline-none text-gray-800 placeholder-gray-400 text-xl leading-relaxed"
            style="font-family: 'Work Sans', sans-serif; font-weight: 400;"
          />
        </div>
        
        <div class="border-t border-gray-200 pt-8">
          <div class="text-gray-800 text-xl leading-relaxed" style="font-family: 'Work Sans', sans-serif;">
            <For each={analyzedText()}>
              {(segment) => (
                <span class={segment.isHighlighted ? "text-blue-600 font-medium" : ""}>
                  {segment.text}
                </span>
              )}
            </For>
            {!text() && (
              <span class="text-gray-400 italic">
                Your text will appear here with important terms subtly highlighted...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
