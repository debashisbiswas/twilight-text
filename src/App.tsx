import type { Component } from 'solid-js'
import { HighlightedTextArea } from './components/highlighted-text-area'

const App: Component = () => {
    return (
        <div class="h-full bg-white">
            <div class="mx-auto h-full max-w-4xl pt-6">
                <HighlightedTextArea />
            </div>
        </div>
    )
}

export default App
