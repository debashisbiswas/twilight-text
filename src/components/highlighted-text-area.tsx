import { createEffect, createMemo, createSignal } from 'solid-js'
import nlp from 'compromise'
import Sentiment from 'sentiment'

const sentiment = new Sentiment()

export const HighlightedTextArea = () => {
    let highlightRef: HTMLDivElement

    const localStorageTextKey = 'twilight-text'

    const [text, setText] = createSignal(
        localStorage.getItem(localStorageTextKey) || '',
    )

    createEffect(() => {
        localStorage.setItem(localStorageTextKey, text())
    })

    const highlightedText = createMemo(() => {
        if (!text()) return ''

        const selectedClauses: { text: string; score: number }[] = []

        const doc = nlp(text())
        const sentences = doc.sentences()

        sentences.forEach((sentence) => {
            const sentenceText = sentence.text()
            const sentenceDoc = nlp(sentenceText)
            const clauses = sentenceDoc.clauses()

            // <= 1 to avoid highlighting full sentences (sentences with one clause)
            if (clauses.length <= 1) return

            let bestClause = ''
            let bestScore = 0

            const impactfulClauses: string[] = []
            clauses.forEach((clause) => {
                const text = clause.text()
                const result = sentiment.analyze(text)

                const score = Math.abs(result.comparative)
                const aboveThreshold = score > 0

                if (aboveThreshold) {
                    impactfulClauses.push(text.trim())

                    if (score > bestScore) {
                        bestScore = score
                        bestClause = text.trim()
                    }
                }
            })

            if (bestClause) {
                const firstClauseText = clauses.first().text().trim()
                const lastClauseText = clauses.last().text().trim()

                // If the best clause is the first of the sentence, prefer the last instead:
                // if the beginning of the sentence is strong, the impact is often felt
                // when everything comes together at the end of the sentence
                if (bestClause === firstClauseText) {
                    bestClause = lastClauseText || bestClause
                }

                selectedClauses.push({ text: bestClause, score: bestScore })
            }
        })

        const sortedClauses = selectedClauses.map((item) => item.text)

        let itemHTML = text()

        if (sortedClauses.length > 0) {
            const termsPattern = sortedClauses
                .map((clause) => clause.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|')

            itemHTML = itemHTML.replace(
                new RegExp(`(${termsPattern})`, 'gi'),
                '<mark class="bg-purple-200 visible">$1</mark>',
            )
        }

        // Fix edge case with misalignment when textarea is long enough to
        // scroll and has a trailing newline
        // https://codersblock.com/blog/highlight-text-inside-a-textarea/
        itemHTML = itemHTML.replace(/\n$/, '\n\n')
        return itemHTML
    })

    return (
        <div class="relative leading-normal h-full max-w-4xl m-auto text-2xl">
            {/* Invisible div to line up text height; avoids textarea scroll */}
            <div
                class="whitespace-pre-wrap invisible wrap-break-word w-full h-full border-none outline-0 px-8 m-0 overflow-auto"
                innerHTML={text()}
            ></div>

            {/* Overlay to highlight words */}
            <div
                class="absolute top-0 bottom-0 left-0 right-0 z-10 pointer-events-none w-full whitespace-pre-wrap wrap-break-word overflow-auto invisible transition ease-in-out px-8"
                innerHTML={highlightedText()}
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
