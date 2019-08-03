import React, { useState } from 'react';
import './App.css'
import { Painter } from './Painter'
import Slider from 'rc-slider'
import 'bootstrap/dist/css/bootstrap.css'
import 'rc-slider/assets/index.css'

const [defaultWidth, defaultHeight] = [512, 512]
const defaultLayers = 5
const defaultFilters = 32

const App: React.FC = () => {
    const [width, setWidth] = useState(defaultWidth)
    const [height, setHeight] = useState(defaultHeight)
    const [generating, setGenerating] = useState(false)
    const [layers, setLayers] = useState(defaultLayers)
    const [filters, setFilters] = useState(defaultFilters)

    return (
        <div>
            <div style={{ marginLeft: "20%", marginRight: "20%" }}>
                <h1 style={{ textAlign: "center" }}>Deep Image Prior (<a href="https://arxiv.org/abs/1711.10925">Paper</a>)</h1>
                <a href="https://github.com/RobinKa/web-deep-image-prior"><h3 style={{ textAlign: "center" }}>Source Code</h3></a>

                <label style={{ fontSize: "24px", visibility: !generating ? "collapse" : "visible" }}>Generating...</label>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultWidth} min={0} max={4096} step={16} onChange={value => setWidth(value)} />
                    <label>Width: {width}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultHeight} min={0} max={4096} step={16} onChange={value => setHeight(value)} />
                    <label>Height: {height}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultLayers} min={1} max={50} step={1} onChange={value => setLayers(value)} />
                    <label>Layers: {layers}</label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <Slider defaultValue={defaultFilters} min={1} max={256} step={1} onChange={value => setFilters(value)} />
                    <label>Filters: {filters}</label>
                </div>
            </div>

            <div style={{ visibility: generating ? "hidden" : "visible", textAlign: "center" }}>
                <Painter width={width} height={height} iterations={100000} setGenerating={setGenerating} layers={layers} filters={filters} />
            </div>
        </div>
    );
}

export default App
