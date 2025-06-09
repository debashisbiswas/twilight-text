import type { Component } from 'solid-js'
import { HighlightedTextArea } from './components/highlighted-text-area'

const App: Component = () => {
    return (
        <div class="h-full bg-white">
            <div class="max-w-4xl mx-auto pt-6 h-full">
                <HighlightedTextArea />
            </div>
        </div>
    )
}

export default App
