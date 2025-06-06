import { For } from 'solid-js'
import { HighlightedAreaProps } from './highlighted-area'

export const HighlightedArea = (props: HighlightedAreaProps) => {
    const [text, setText] = createSignal(
        localStorage.getItem('twilight-text') || '',
    )
    return (
        <div class="relative">
            <div class="absolute h-72 z-10 pointer-events-none">
                <For each={analyzedText()}>
                    {(segment) => {
                        return segment.isHighlighted ? (
                            <span style="color: #2563eb">{segment.text}</span>
                        ) : (
                            <>{segment.text}</>
                        )
                    }}
                </For>
            </div>
            <textarea
                value={text()}
                onInput={(e) => {
                    setText(e.target.value)
                }}
                onScroll={(e) => {
                    backdrop.scrollTop = e.target.scrollTop
                }}
                placeholder="Start writing..."
                class="absolute h-72 w-full border-none"
            />
        </div>
    )
}
