import React, { useEffect, useRef, useState, useMemo } from 'react'
import './App.css'
import { Painter } from './Painter'
import Slider from 'rc-slider'
import { Row, Col, Container, Button, Navbar, Nav, Image as BSImage } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.css'
import 'rc-slider/assets/index.css'
import { useAppState, ImageData } from './AppState'
import { useDropzone } from 'react-dropzone'
import { Carousel } from "react-responsive-carousel"
import FileSaver from "file-saver"
import "react-responsive-carousel/lib/styles/carousel.min.css"

import sampleImage1 from "./sample-images/balloons_noisy.png"
import sampleImage2 from "./sample-images/lenna_noisy.png"
import sampleImage3 from "./sample-images/tiny_fruits.png"

const [defaultWidth, defaultHeight] = [256, 256]
const defaultLayers = 5
const defaultFilters = 8

const App: React.FC = () => {
    const [state, dispatchState] = useAppState()

    function setWidth(value: number) {
        dispatchState({
            type: "algorithmSettings",
            newSettings: {
                ...state.algorithmSettings,
                width: value
            }
        })
    }

    function setHeight(value: number) {
        dispatchState({
            type: "algorithmSettings",
            newSettings: {
                ...state.algorithmSettings,
                height: value
            }
        })
    }

    function setLayers(value: number) {
        dispatchState({
            type: "algorithmSettings",
            newSettings: {
                ...state.algorithmSettings,
                layers: value
            }
        })
    }

    function setFilters(value: number) {
        dispatchState({
            type: "algorithmSettings",
            newSettings: {
                ...state.algorithmSettings,
                filters: value
            }
        })
    }

    useEffect(() => {
        if (state.generating && !state.requestRun) {
            dispatchState({ type: "incrementIteration" })
            dispatchState({ type: "setRequestRun", requestRun: true })
        }
    }, [state.requestRun, state.generating, dispatchState])

    const canvas = useRef<HTMLCanvasElement>(null)

    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null)

    useEffect(() => {
        if (selectedImage !== null) {
            const context = canvas.current!.getContext("2d")!
            context.drawImage(selectedImage, 0, 0, state.algorithmSettings.width, state.algorithmSettings.height)
            const imageData = context.getImageData(0, 0, state.algorithmSettings.width, state.algorithmSettings.height).data
            dispatchState({
                type: "setSourceImage",
                image: Array.from(imageData)
            })
        }
    }, [selectedImage, state.algorithmSettings.width, state.algorithmSettings.height, dispatchState])

    function onImageSelected(files: File[]) {
        setSelectedImage(null)

        const image = new Image()

        image.onload = function (evt: any) {
            setSelectedImage(image)
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

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: onImageSelected,
        disabled: state.generating || state.running
    })

    const statusText = useMemo(() => {
        if (state.generating && state.running) {
            return `Running, iteration: ${state.iteration}. Click an image to save it.`
        } else if (state.generating && !state.running) {
            return "Starting, your browser might freeze for a while..."
        } else if (!state.generating && state.running) {
            return "Stopping..."
        } else if (!state.generating && !state.running && !state.sourceImage) {
            return "Choose a sample image. You can also click on the empty canvas to select an image or drop an image on it. None of your data is uploaded as everything is running client-side."
        } else if (!state.generating && !state.running) {
            return "Click start"
        }

    }, [state.generating, state.running, state.sourceImage, state.iteration])

    return (
        <div>
            <Container>
                <Navbar bg="dark" variant="dark">
                    <Navbar.Brand>
                        Deep Image Prior
                    </Navbar.Brand>
                    <Nav.Link href="https://github.com/RobinKa/web-deep-image-prior">Source code</Nav.Link>
                    <Nav.Link href="https://arxiv.org/abs/1711.10925">Paper</Nav.Link>
                </Navbar>
            </Container>
            <Container style={{marginTop: "20px"}}>
                <Col>
                    <Row>
                        <Col>
                            <Row>
                                <Col><BSImage fluid width="256px" src={sampleImage1} alt={sampleImage1} onClick={e => setSelectedImage(e.target as HTMLImageElement)} /></Col>
                                <Col><BSImage fluid width="256px" src={sampleImage2} alt={sampleImage2} onClick={e => setSelectedImage(e.target as HTMLImageElement)} /></Col>
                                <Col><BSImage fluid width="256px" src={sampleImage3} alt={sampleImage3} onClick={e => setSelectedImage(e.target as HTMLImageElement)} /></Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div style={{ textAlign: "center" }} {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <canvas style={{ boxShadow: "0px 0px 5px gray" }} ref={canvas} width={state.algorithmSettings.width} height={state.algorithmSettings.height} />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <div style={{ textAlign: "center" }}>
                                <Slider disabled={state.generating || state.running} defaultValue={defaultWidth} min={0} max={1024} step={32} onChange={value => setWidth(value)} />
                                <label>Width: {state.algorithmSettings.width}</label>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <Slider disabled={state.generating || state.running} defaultValue={defaultHeight} min={0} max={1024} step={32} onChange={value => setHeight(value)} />
                                <label>Height: {state.algorithmSettings.height}</label>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <Slider disabled={state.generating || state.running} defaultValue={defaultLayers} min={1} max={20} step={1} onChange={value => setLayers(value)} />
                                <label>Layers: {state.algorithmSettings.layers}</label>
                            </div>
                            <div style={{ textAlign: "center" }}>
                                <Slider disabled={state.generating || state.running} defaultValue={defaultFilters} min={1} max={256} step={1} onChange={value => setFilters(value)} />
                                <label>Filters: {state.algorithmSettings.filters}</label>
                            </div>

                            <p style={{ fontSize: "20px" }}>{statusText}</p>

                            <div style={{ textAlign: "center" }}>
                                <Painter state={state} dispatchState={dispatchState} />

                                <Button style={{ visibility: !state.running && !state.generating && state.sourceImage ? "visible" : "hidden" }} onClick={() => dispatchState({ type: "start" })}>Start</Button>
                                <Button style={{ visibility: state.running && state.generating ? "visible" : "hidden" }} onClick={() => dispatchState({ type: "pause" })}>Stop</Button>
                                <Button onClick={() => dispatchState({ type: "reset" })}>Reset</Button>
                            </div>
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Carousel onClickItem={(index: number, item: React.ReactNode) => FileSaver.saveAs(state.images[index].uri, `image_iter${state.images[index].iteration}.png`)} selectedItem={state.images.length > 0 ? state.images.length - 1 : 0} showArrows={true} autoPlay={false}>
                        {state.images.map((image: ImageData) =>
                            <div key={image.uri}>
                                <img src={image.uri} alt={image.uri} />
                                <p className="legend">
                                    Iteration {image.iteration}
                                </p>
                            </div>
                        )}
                    </Carousel>
                </Col>
            </Container>
        </div>
    );
}

export default App
