import * as tf from "@tensorflow/tfjs"
import React from "react"
import { createUNet } from "./models/UNet"
import { useDropzone } from 'react-dropzone'

tf.enableProdMode()

type PainterProps = {
    width: number,
    height: number,
    filters: number,
    layers: number,
    iterations: number,
    setGenerating: (generating: boolean) => void,
}

export function Painter(props: PainterProps) {
    function onImageSelected(files: File[]) {
        const image = new Image()

        image.onload = function (evt: any) {
            const canvas = document.createElement("canvas")
            canvas.width = props.width
            canvas.height = props.height
            const context = canvas.getContext("2d")!
            context.drawImage(image, 0, 0, props.width, props.height)
            const imageData = context.getImageData(0, 0, props.width, props.height).data
            run(Array.from(imageData))
        }

        const file = files[0]

        const reader = new FileReader()

        reader.onload = function (evt: any) {
            if (evt.target.readyState === FileReader.DONE) {
                image.src = evt.target.result
            }
        }

        reader.readAsDataURL(file)
    }

    async function run(flatImage: number[]) {
        const canvas = document.createElement("canvas")
        canvas.width = props.width
        canvas.height = props.height
        const ctx = canvas.getContext("2d")!
        const imageData = ctx.createImageData(props.width, props.height)

        const imageTensor = tf.sub(tf.div(tf.tensor1d(flatImage).reshape([1, props.width, props.height, 4]).slice([0, 0, 0, 0], [1, props.width, props.height, 3]), 127.5), 1)

        const noiseShape: [number, number, number] = [props.width, props.height, 1]
        const outputFilters = 3

        const model = createUNet(noiseShape, outputFilters, props.layers, props.filters)
        model.compile({
            optimizer: "adam",
            loss: "meanSquaredError",
        })

        const noise = tf.randomNormal([1].concat(noiseShape))

        for (let iter = 0; iter < props.iterations; iter++) {
            await model.fit(noise, imageTensor, {
                batchSize: 1,
                epochs: 20,
            })

            const pred = await (model.predict(noise) as tf.Tensor).array() as number[][][][]

            for (let x = 0; x < props.width; x++) {
                for (let y = 0; y < props.height; y++) {
                    const i = x + y * props.width
                    imageData.data[i * 4 + 0] = Math.min(255, Math.max(0, 127.5 * (1 + pred[0][y][x][0])))
                    imageData.data[i * 4 + 1] = Math.min(255, Math.max(0, 127.5 * (1 + pred[0][y][x][1])))
                    imageData.data[i * 4 + 2] = Math.min(255, Math.max(0, 127.5 * (1 + pred[0][y][x][2])))
                    imageData.data[i * 4 + 3] = 255
                }
            }

            ctx.putImageData(imageData, 0, 0)
            const domImage = document.createElement("img")
            domImage.src = canvas.toDataURL("image/png")
            document.body.appendChild(domImage)
        }
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: onImageSelected
    })

    return (
        <div>
            <div style={{ marginTop: "10px", marginBottom: "10px", textAlign: "center" }}>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
            </div>
        </div>
    )
}