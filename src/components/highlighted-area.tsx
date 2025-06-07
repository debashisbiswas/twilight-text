import { createEffect, createMemo, createSignal } from 'solid-js'
import nlp from 'compromise'

export const HighlightedArea = () => {
    const [text, setText] = createSignal(
        localStorage.getItem('twilight-text') || '',
    )

    let highlightRef: HTMLDivElement

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

        highlightTerms.sort((a, b) => b.length - a.length)

        let result = text()

        const termsPattern = highlightTerms
            .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|')

        if (termsPattern) {
            const regex = new RegExp(`\\b(${termsPattern})\\b`, 'gi')
            result = result.replace(
                regex,
                '<mark id="$1" class="text-purple-400 text-shadow-sm bg-transparent visible">$1</mark>',
            )
        }

        // Fix edge case with misalignment on trailing newline when textarea is long enough to scroll
        // Shoutout to https://codersblock.com/blog/highlight-text-inside-a-textarea/
        result = result.replace(/\n$/, '\n\n')
        return result
    })

    return (
        <div class="relative leading-normal h-full max-w-4xl m-auto text-2xl">
            {/* Invisible div to line up text height */}
            {/* Workaround: add a bit of space when the text ends in newlines */}
            <div
                class="whitespace-pre-wrap invisible wrap-break-word w-full h-full border-none outline-0 px-8 m-0 overflow-auto"
                innerHTML={text()}
            ></div>

            {/* Highlight overlay */}
            <div
                class="absolute top-0 bottom-0 left-0 right-0 z-10 pointer-events-none w-full whitespace-pre-wrap wrap-break-word overflow-auto invisible transition ease-in-out px-8"
                innerHTML={analyzedText()}
                ref={highlightRef}
            ></div>

            <textarea
                value={text()}
                on:input={(event) => setText(event.target.value)}
                on:scroll={(event) =>
                    (highlightRef.scrollTop = event.target.scrollTop)
                }
                placeholder="Start writing..."
                class="absolute top-0 bottom-0 left-0 right-0 h-full w-full border-none resize-none outline-0 whitespace-pre-wrap wrap-break-word px-8 m-0 rounded-none"
            />
        </div>
    )
}
