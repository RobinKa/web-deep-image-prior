import React, { CSSProperties } from "react"
import Slider from 'rc-slider'

type LabeledSliderProps = {
    disabled: boolean,
    setValue: (value: number) => void
    value: number
    label: string
    min: number
    max: number
    step: number
    style: CSSProperties
}

export default function LabeledSlider(props: LabeledSliderProps) {
    return (
        <div style={props.style}>
            <Slider disabled={props.disabled} value={props.value} min={props.min} max={props.max} step={props.step} onChange={value => props.setValue(value)} />
            <label>{props.label}: {props.value}</label>
        </div>
    )
}