import React, { useEffect, useState, useMemo, CSSProperties } from 'react'
import './App.css'
import { Painter } from './Painter'
import { Row, Col, Container, Button, Navbar, Nav, Image as BSImage } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.css'
import 'rc-slider/assets/index.css'
import { useAppState, ImageData } from './AppState'
import { useDropzone } from 'react-dropzone'
import FileSaver from "file-saver"
import ReactCompareImage from "react-compare-image"

import sampleImage1 from "./sample-images/car_inpaint.png"
import sampleImage2 from "./sample-images/lenna_noisy.png"
import sampleImage3 from "./sample-images/tiny_fruits.png"
import DrawableCanvas from './DrawableCanvas';
import LabeledSlider from './LabeledSlider';
import LabeledCheckbox from './LabeledCheckbox';

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

    function setInpaint(value: boolean) {
        dispatchState({
            type: "algorithmSettings",
            newSettings: {
                ...state.algorithmSettings,
                inpaint: value
            }
        })
    }

    useEffect(() => {
        if (state.generating && !state.requestRun) {
            dispatchState({ type: "incrementIteration" })
            dispatchState({ type: "setRequestRun", requestRun: true })
        }
    }, [state.requestRun, state.generating, dispatchState])

    useEffect(() => {
        if (state.mask && !state.generating && !state.requestMask) {
            dispatchState({ type: "start" })
        }
    }, [state.requestMask, state.generating, dispatchState, state.mask])

    const canvas = useMemo(() => {
        const cnv = document.createElement("canvas")
        cnv.width = state.algorithmSettings.width
        cnv.height = state.algorithmSettings.height
        return cnv
    }, [state.algorithmSettings.width, state.algorithmSettings.height])

    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null)

    useEffect(() => {
        if (selectedImage !== null) {
            const context = canvas.getContext("2d")!
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

    const displayedImage = selectedImage ? selectedImage.src : ""

    type SettingsProps = {
        style: CSSProperties,
        disabled: boolean
    }

    const settingsProps: SettingsProps = {
        style: {
            textAlign: "center"
        },
        disabled: state.generating || state.running
    }

    const [comparisonImageUri, setComparisonImageUri] = useState<string>("")

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
            <Container style={{ marginTop: "20px" }}>
                <Row>
                    <Col>
                        <p style={{ fontSize: "20px" }}>{statusText}</p>

                        <div style={{ textAlign: "center" }}>
                            <Painter state={state} dispatchState={dispatchState} />

                            <Button style={{ visibility: !state.running && !state.generating && state.sourceImage ? "visible" : "hidden" }} onClick={() => dispatchState({ type: "requestMask" })}>Start</Button>
                            <Button style={{ visibility: state.running && state.generating ? "visible" : "hidden" }} onClick={() => dispatchState({ type: "pause" })}>Stop</Button>
                            <Button onClick={() => dispatchState({ type: "reset" })}>Reset</Button>
                        </div>
                    </Col>
                    <Col>
                        <Row>
                            <Col><BSImage fluid src={sampleImage1} alt={sampleImage1} onClick={e => setSelectedImage(e.target as HTMLImageElement)} /></Col>
                            <Col><BSImage fluid src={sampleImage2} alt={sampleImage2} onClick={e => setSelectedImage(e.target as HTMLImageElement)} /></Col>
                            <Col><BSImage fluid src={sampleImage3} alt={sampleImage3} onClick={e => setSelectedImage(e.target as HTMLImageElement)} /></Col>
                        </Row>
                        <Row>
                            <Col>
                                <div style={{ textAlign: "center" }} {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p style={{ fontSize: "20px" }}>Click to select an image</p>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <div style={{ width: state.algorithmSettings.width, height: state.algorithmSettings.height, boxShadow: "0px 0px 5px gray" }}>
                            <img src={displayedImage} alt="" style={{ width: state.algorithmSettings.width, height: state.algorithmSettings.height, position: "absolute" }} />
                            <div style={{ display: state.algorithmSettings.inpaint ? "block" : "none" }}>
                                <DrawableCanvas state={state} dispatchState={dispatchState} backgroundImage={displayedImage} />
                            </div>
                        </div>
                    </Col>
                    <Col>
                        <p style={{ textAlign: "center", fontSize: "20px" }}>Settings</p>
                        <LabeledSlider {...settingsProps} min={0} max={1024} step={32} value={state.algorithmSettings.width} setValue={setWidth} label={"Width"} />
                        <LabeledSlider {...settingsProps} min={0} max={1024} step={32} value={state.algorithmSettings.height} setValue={setHeight} label={"Height"} />
                        <LabeledSlider {...settingsProps} min={1} max={20} step={1} value={state.algorithmSettings.layers} setValue={setLayers} label={"Layers"} />
                        <LabeledSlider {...settingsProps} min={1} max={256} step={1} value={state.algorithmSettings.filters} setValue={setFilters} label={"Filters"} />

                        <LabeledCheckbox {...settingsProps} value={state.algorithmSettings.inpaint} setValue={setInpaint} label={"Inpaint"} />
                    </Col>
                </Row>
                <Row>
                    <Col />
                    <Col style={{ maxWidth: state.algorithmSettings.width }}>
                        <ReactCompareImage leftImage={displayedImage} rightImage={comparisonImageUri} />
                    </Col>
                    <Col />
                </Row>
                <Row>
                    {state.images.map((image: ImageData) =>
                        <img width="64px" key={image.uri} src={image.uri} alt={image.uri} onClick={(evt) => setComparisonImageUri(image.uri)} />
                    )}
                </Row>
            </Container>
        </div>
    );
}

export default App
