import type { Component } from 'solid-js'
import { createSignal, For, createEffect } from 'solid-js'
import { HighlightedArea } from './components/highlighted-area'

const App: Component = () => {
    const fonts = [
        { name: 'RocknRoll One', value: 'RocknRoll One' },
        { name: 'Open Sans', value: 'Open Sans' },
        { name: 'Work Sans', value: 'Work Sans' },
        { name: 'Titillium Web', value: 'Titillium Web' },
        { name: 'Saira', value: 'Saira' },
        { name: 'Exo 2', value: 'Exo 2' },
        { name: 'Maven Pro', value: 'Maven Pro' },
    ]

    const [selectedFont, setSelectedFont] = createSignal(
        localStorage.getItem('twilight-font') || fonts[0].value,
    )

    createEffect(() => {
        localStorage.setItem('twilight-font', selectedFont())
    })

    return (
        <div
            class="h-full bg-white"
            style={`font-family: '${selectedFont()}', sans-serif;`}
        >
            <div class="max-w-4xl mx-auto px-6 py-12 h-full">
                <div class="mb-4 flex justify-end">
                    <select
                        value={selectedFont()}
                        onChange={(e) => setSelectedFont(e.currentTarget.value)}
                        class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    >
                        <For each={fonts}>
                            {(font) => (
                                <option
                                    value={font.value}
                                    style={`font-family: '${font.value}', sans-serif;`}
                                >
                                    {font.name}
                                </option>
                            )}
                        </For>
                    </select>
                </div>

                <HighlightedArea />
            </div>
        </div>
    )
}

export default App
