import * as tf from "@tensorflow/tfjs"
import React, { Dispatch, useEffect, useState, useMemo } from "react"
import { createUNet } from "./models/UNet"
import { AppState, AppUpdateAction } from "./AppState"

tf.enableProdMode()

type PainterProps = {
    state: AppState,
    dispatchState: Dispatch<AppUpdateAction>
}

function imageTensorFromFlatArray(flat: number[], width: number, height: number) {
    return tf.sub(tf.div(tf.tensor1d(flat).reshape([1, width, height, 4]).slice([0, 0, 0, 0], [1, width, height, 3]), 127.5), 1)
}

function createMemoryCanvas(width: number, height: number) {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    return canvas
}

function drawImageTensor(ctx: CanvasRenderingContext2D, imageTensor: number[][][][]) {
    const [width, height] = [ctx.canvas.width, ctx.canvas.height]

    const imageData = ctx.createImageData(width, height)

    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const i = x + y * width
            imageData.data[i * 4 + 0] = Math.min(255, Math.max(0, 127.5 * (1 + imageTensor[0][y][x][0])))
            imageData.data[i * 4 + 1] = Math.min(255, Math.max(0, 127.5 * (1 + imageTensor[0][y][x][1])))
            imageData.data[i * 4 + 2] = Math.min(255, Math.max(0, 127.5 * (1 + imageTensor[0][y][x][2])))
            imageData.data[i * 4 + 3] = 255
        }
    }

    ctx.putImageData(imageData, 0, 0)
}

export function Painter(props: PainterProps) {
    const { state, dispatchState } = props

    const [model, setModel] = useState<tf.LayersModel | null>(null)
    const [noise, setNoise] = useState<tf.Tensor<tf.Rank> | null>(null)
    const [imageTensor, setImageTensor] = useState<tf.Tensor<tf.Rank> | null>(null)

    const canvas = useMemo(() => {
        return createMemoryCanvas(state.algorithmSettings.width, state.algorithmSettings.height)
    }, [state.algorithmSettings.width, state.algorithmSettings.height])

    useEffect(() => {
        if (state.requestRun) {
            let m = model
            let n = noise
            let it = imageTensor

            if (m === null || n === null || it === null) {
                const noiseShape: [number, number, number] = [state.algorithmSettings.width, state.algorithmSettings.height, 1]
                const outputFilters = 3

                m = createUNet(noiseShape, outputFilters, state.algorithmSettings.layers, state.algorithmSettings.filters)
                m.compile({
                    optimizer: "adam",
                    loss: "meanAbsoluteError",
                })

                n = tf.randomNormal([1].concat(noiseShape))

                it = imageTensorFromFlatArray(state.sourceImage!, state.algorithmSettings.width, state.algorithmSettings.height)

                setModel(m)
                setNoise(n)
                setImageTensor(it)
            }

            (async () => {
                try {
                    dispatchState({
                        type: "setRunning",
                        running: true
                    })

                    await m.fit(n, it, {
                        batchSize: 1,
                        epochs: 20,
                    })

                    const output = await (m.predict(n) as tf.Tensor).array() as number[][][][]

                    drawImageTensor(canvas.getContext("2d")!, output)

                    dispatchState({
                        type: "addImageData",
                        imageData: {
                            iteration: state.iteration,
                            uri: canvas.toDataURL("image/png")
                        }
                    })
                }
                catch {
                    
                }

                dispatchState({
                    type: "setRunning",
                    running: false
                })

                dispatchState({
                    type: "setRequestRun",
                    requestRun: false
                })
            })()
        }
    }, [state.requestRun])

    useEffect(() => {
        if (!state.generating) {
            if (model !== null) {
                model.dispose()
            }

            if (imageTensor !== null) {
                imageTensor.dispose()
            }

            if (noise !== null) {
                noise.dispose()
            }

            setModel(null)
            setImageTensor(null)
            setNoise(null)
        }
    }, [state.generating])

    return <div />
}