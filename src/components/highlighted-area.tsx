import { createEffect, createMemo, createSignal } from 'solid-js'
import nlp from 'compromise'

export const HighlightedArea = () => {
    const [text, setText] = createSignal(
        localStorage.getItem('twilight-text') || '',
    )

    createEffect(() => {
        localStorage.setItem('twilight-text', text())
    })

    const analyzedText = createMemo(() => {
        if (!text()) return ''

        const doc = nlp(text())

        const properNouns = doc.match('#ProperNoun').out('array')
        const places = doc.places().out('array')
        const people = doc.people().out('array')
        const organizations = doc.organizations().out('array')

        const highlightTerms = [
            ...properNouns,
            ...places,
            ...people,
            ...organizations,
        ]

        // Sort by length (longest first) to avoid highlighting parts of longer terms
        highlightTerms.sort((a, b) => b.length - a.length)

        let result = text()

        // Create a regex that matches any of the terms
        // Use word boundaries to match whole words only
        const termsPattern = highlightTerms
            .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex characters
            .join('|')

        if (termsPattern) {
            const regex = new RegExp(`\\b(${termsPattern})\\b`, 'gi')
            result = result.replace(
                regex,
                '<span class="text-blue-600">$1</span>',
            )
        }

        return result
    })

    return (
        <div class="relative">
            <div
                class="absolute z-10 pointer-events-none w-full overflow-clip"
                innerHTML={analyzedText()}
            ></div>
            <textarea
                value={text()}
                onInput={(e) => {
                    setText(e.target.value)
                }}
                placeholder="Start writing..."
                class="absolute h-72 w-full border-none"
            />
        </div>
    )
}
