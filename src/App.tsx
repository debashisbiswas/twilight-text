import type { Component } from 'solid-js'
import { HighlightedArea } from './components/highlighted-area'

const App: Component = () => {
    return (
        <div class="h-full bg-white">
            <div class="max-w-4xl mx-auto px-6 py-12 h-full">
                <HighlightedArea />
            </div>
        </div>
    )
}

export default App
