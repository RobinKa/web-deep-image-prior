import React, { useEffect, useState, useMemo, CSSProperties } from 'react'
import './App.css'
import { Painter } from './Painter'
import { Row, Col, Container, Button, Navbar, Nav, Image as BSImage } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.css'
import 'rc-slider/assets/index.css'
import { useAppState, ImageData } from './AppState'
import { useDropzone } from 'react-dropzone'
import ReactCompareImage from "react-compare-image"
import DrawableCanvas from './DrawableCanvas'
import LabeledSlider from './LabeledSlider'
import LabeledCheckbox from './LabeledCheckbox'

import sampleImage1 from "./sample-images/car_inpaint.png"
import sampleImage2 from "./sample-images/lenna_noisy.png"
import sampleImage3 from "./sample-images/cat_text.png"

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
        if (state.shouldRun && state.step !== "runIter") {
            dispatchState({ type: "startIter" })
        }
    }, [state.step, state.shouldRun, dispatchState])

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
    }, [selectedImage, state.algorithmSettings.width, state.algorithmSettings.height, dispatchState, canvas])

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

    const statusText = useMemo(() => {
        if (state.step !== "idle" && state.shouldRun) {
            return `Running, iteration: ${state.iteration}.`
        } else if (state.step === "idle" && state.shouldRun) {
            return "Starting, your browser might freeze for a while..."
        } else if (state.step !== "idle" && !state.shouldRun) {
            return "Stopping..."
        } else if (state.step === "idle" && !state.shouldRun && !state.sourceImage) {
            return "Choose an image."
        } else if (state.step === "idle" && !state.shouldRun) {
            return "Click start"
        }

    }, [state.step, state.shouldRun, state.sourceImage, state.iteration])

    const displayedImage = selectedImage ? selectedImage.src : ""

    type SettingsProps = {
        style: CSSProperties,
        disabled: boolean
    }

    const settingsProps: SettingsProps = {
        style: {
            textAlign: "center"
        },
        disabled: state.shouldRun || state.step !== "idle"
    }

    const [comparisonImageUri, setComparisonImageUri] = useState<string>("")

    const selectImage = (evt: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
        if (!settingsProps.disabled) {
            setSelectedImage(evt.target as HTMLImageElement)
        }
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: onImageSelected,
        disabled: settingsProps.disabled
    })

    return (
        <div>
            <Painter state={state} dispatchState={dispatchState} />

            <Container>
                <Navbar bg="dark" variant="dark">
                    <Navbar.Brand>
                        <div>
                            Deep Image Prior
                        </div>
                        <div style={{ fontSize: "12px" }}>
                            Implementation by <a href="https://github.com/RobinKa">Tora</a>
                        </div>
                    </Navbar.Brand>
                    <Nav.Link href="https://github.com/RobinKa/web-deep-image-prior">Source code</Nav.Link>
                    <Nav.Link href="https://dmitryulyanov.github.io/deep_image_prior">Original project page</Nav.Link>
                    <Nav.Link href="https://arxiv.org/abs/1711.10925">Paper</Nav.Link>
                </Navbar>
            </Container>
            <Container>
                <Row>
                    <Col style={{ padding: "10px" }}>
                        <Row>
                            <p style={{ fontSize: "20px" }}>{statusText}</p>
                        </Row>

                        <Row style={{ textAlign: "center" }}>
                            <Col>
                                <Button style={{ visibility: !state.shouldRun && state.step === "idle" && state.maskCanvas && state.sourceImage ? "visible" : "hidden" }} onClick={() => dispatchState({ type: "start" })}>Start</Button>
                            </Col>
                            <Col>
                                <Button style={{ visibility: state.shouldRun && state.step !== "idle" ? "visible" : "hidden" }} onClick={() => dispatchState({ type: "pause" })}>Stop</Button>
                            </Col>
                            <Col>
                                <Button onClick={() => dispatchState({ type: "reset" })}>Reset</Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col style={{ padding: "10px" }}>
                        <Row>
                            <Col><BSImage fluid style={{minWidth: "32px"}} src={sampleImage1} alt={sampleImage1} onClick={selectImage} /></Col>
                            <Col><BSImage fluid style={{minWidth: "32px"}} src={sampleImage2} alt={sampleImage2} onClick={selectImage} /></Col>
                            <Col><BSImage fluid style={{minWidth: "32px"}} src={sampleImage3} alt={sampleImage3} onClick={selectImage} /></Col>
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
                    <Col style={{ padding: "10px" }}>
                        <div style={{ width: state.algorithmSettings.width, height: state.algorithmSettings.height, boxShadow: "0px 0px 5px gray" }}>
                            <img src={displayedImage} alt="" style={{ width: state.algorithmSettings.width, height: state.algorithmSettings.height, position: "absolute" }} />
                            <div style={{ display: state.algorithmSettings.inpaint ? "block" : "none" }}>
                                <DrawableCanvas state={state} dispatchState={dispatchState} backgroundImage={displayedImage} />
                            </div>
                        </div>
                    </Col>
                    <Col style={{ padding: "10px" }}>
                        <p style={{ textAlign: "center", fontSize: "20px" }}>Settings</p>
                        <LabeledSlider {...settingsProps} min={32} max={1024} step={32} value={state.algorithmSettings.width} setValue={setWidth} label={"Width"} />
                        <LabeledSlider {...settingsProps} min={32} max={1024} step={32} value={state.algorithmSettings.height} setValue={setHeight} label={"Height"} />
                        <LabeledSlider {...settingsProps} min={1} max={20} step={1} value={state.algorithmSettings.layers} setValue={setLayers} label={"Layers"} />
                        <LabeledSlider {...settingsProps} min={4} max={128} step={4} value={state.algorithmSettings.filters} setValue={setFilters} label={"Filters"} />

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
