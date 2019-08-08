import React, { useState, useRef, Dispatch, useEffect } from "react"
import { AppState, AppUpdateAction } from "./AppState"

type DrawableCanvasProps = {
    state: AppState
    dispatchState: Dispatch<AppUpdateAction>
    backgroundImage: string
}

export default function DrawableCanvas(props: DrawableCanvasProps) {
    const [width, height] = [props.state.algorithmSettings.width, props.state.algorithmSettings.height]
    const maskCanvas = props.state.maskCanvas
    const dispatchState = props.dispatchState

    const [drawing, setDrawing] = useState(false)

    const canvas = useRef<HTMLCanvasElement>(null)

    function tryStartDraw() {
        if (props.state.step === "idle" && !props.state.shouldRun) {
            setDrawing(true)
        }
    }

    function endDraw() {
        setDrawing(false)
    }

    function reset() {
        const cnv = canvas.current!
        const ctx = cnv.getContext("2d")!

        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, width, height)
    }

    function onMouseUp(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        endDraw()
        if (event.button === 2) {
            reset()
        }
    }

    function onMove(clientPos: [number, number]) {
        if (drawing) {
            const cnv = canvas.current!
            const ctx = cnv.getContext("2d")!
            const bounds = cnv.getBoundingClientRect()

            const mousePos = [clientPos[0] - bounds.left, clientPos[1] - bounds.top]
            const radius = 5

            ctx.beginPath()
            ctx.arc(mousePos[0], mousePos[1], radius, 0, 2 * Math.PI)
            ctx.fillStyle = "black"
            ctx.fill()
        }
    }

    function onTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
        onMove([
            e.targetTouches[0] ? e.targetTouches[0].pageX : e.changedTouches[e.changedTouches.length - 1].pageX,
            e.targetTouches[0] ? e.targetTouches[0].pageY : e.changedTouches[e.changedTouches.length - 1].pageY
        ])
    }

    useEffect(() => {
        const cnv = canvas.current!
        const ctx = cnv.getContext("2d")!
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, width, height)
    }, [canvas, width, height])

    useEffect(() => {
        if (canvas.current !== maskCanvas) {
            dispatchState({
                type: "setMaskCanvas",
                maskCanvas: canvas.current
            })
        }
    }, [canvas, maskCanvas, dispatchState])

    return (
        <canvas width={width} height={height} ref={canvas}
            style={{ width: width, height: height, opacity: 0.6 }}
            onTouchStart={tryStartDraw} onTouchEnd={endDraw} onTouchMove={onTouchMove}
            onMouseDown={tryStartDraw} onMouseUp={onMouseUp} onMouseMove={e => onMove([e.clientX, e.clientY])} />
    )
}