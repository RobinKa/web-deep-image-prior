import React, { useState, useRef, Dispatch, useEffect } from "react"
import { AppState, AppUpdateAction } from "./AppState"

type DrawableCanvasProps = {
    state: AppState
    dispatchState: Dispatch<AppUpdateAction>
    backgroundImage: string
}

export default function DrawableCanvas(props: DrawableCanvasProps) {
    const [width, height] = [props.state.algorithmSettings.width, props.state.algorithmSettings.height]

    const [drawing, setDrawing] = useState(false)

    const canvas = useRef<HTMLCanvasElement|null>(null)

    function onMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        if (!props.state.generating && !props.state.running) {
            setDrawing(true)
        }
    }

    function onMouseUp(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        setDrawing(false)

        if (event.button === 2) {
            const cnv = canvas.current!
            const ctx = cnv.getContext("2d")!

            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, width, height)
        }
    }

    function onMouseMove(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        if (drawing) {
            const cnv = canvas.current!
            const ctx = cnv.getContext("2d")!
            const bounds = cnv.getBoundingClientRect()

            const mousePos = [event.clientX - bounds.left, event.clientY - bounds.top]
            const radius = 5

            ctx.beginPath()
            ctx.arc(mousePos[0], mousePos[1], radius, 0, 2 * Math.PI)
            ctx.fillStyle = "black"
            ctx.fill()
        }
    } 

    useEffect(() => {
        if (props.state.requestMask) {
            props.dispatchState({
                type: "setMask",
                mask: Array.from(canvas.current!.getContext("2d")!.getImageData(0, 0, width, height).data)
            })
        }
    }, [props.state.requestMask, height, width])

    useEffect(() => {
        const cnv = canvas.current!
        const ctx = cnv.getContext("2d")!
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, width, height)
    }, [canvas, width, height])

    return (
        <canvas width={width} height={height} ref={canvas} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove} style={{ width: width, height: height, opacity: 0.6 }} />
    )
}