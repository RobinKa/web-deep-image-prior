import React, { CSSProperties } from "react"

type LabeledCheckboxProps = {
    disabled: boolean,
    setValue: (value: boolean) => void
    value: boolean
    label: string
    style: CSSProperties
}

export default function LabeledCheckbox(props: LabeledCheckboxProps) {
    return (
        <div style={props.style}>
            <input type="checkbox" disabled={props.disabled} checked={props.value} onChange={evt => props.setValue(evt.target.checked)} />
            <label>{props.label}</label>
        </div>
    )
}