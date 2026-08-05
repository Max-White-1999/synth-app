'use client'

import Knob from './knob.js'

export default function Page() {
    return (<>
        <h1>Hello world!</h1>
        <Knob
            x = "256" y = "192" step = "0.25" valueList = {["A", "B", "C", "D", "E"]}
        />
    </>
    )
}