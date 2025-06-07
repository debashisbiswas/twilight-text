import type { Component } from 'solid-js'
import { HighlightedArea } from './components/highlighted-area'

const App: Component = () => {
    return (
        <div class="h-full bg-white">
            <div class="max-w-4xl mx-auto pt-6 h-full">
                <HighlightedArea />
            </div>
        </div>
    )
}

export default App
