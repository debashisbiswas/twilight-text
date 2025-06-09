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
        <div class="relative m-auto h-full max-w-4xl text-2xl leading-normal">
            {/* Invisible div to line up text height; avoids textarea scroll */}
            <div
                class="invisible h-full w-full overflow-auto px-8 wrap-break-word whitespace-pre-wrap"
                innerHTML={text()}
            ></div>

            {/* Overlay to highlight words */}
            <div
                class="pointer-events-none invisible absolute top-0 right-0 bottom-0 left-0 z-10 w-full overflow-auto px-8 wrap-break-word whitespace-pre-wrap"
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
                class="absolute top-0 right-0 bottom-0 left-0 h-full w-full resize-none px-8 wrap-break-word whitespace-pre-wrap outline-0"
            />
        </div>
    )
}
