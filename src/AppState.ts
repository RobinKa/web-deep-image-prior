import { useReducer } from "react"

export type ImageData = {
    uri: string,
    iteration: number,
}

export type AlgorithmSettings = {
    filters: number,
    layers: number,
    width: number,
    height: number,
}

export type AppState = {
    generating: boolean,
    requestRun: boolean,
    running: boolean,
    images: ImageData[],
    algorithmSettings: AlgorithmSettings,
    sourceImage: number[] | null,
    iteration: number,
}

export type AppUpdateReset = { type: "reset" }
export type AppUpdateStart = { type: "start" }
export type AppUpdatePause = { type: "pause" }
export type AppUpdateAddImageData = {
    type: "addImageData"
    imageData: ImageData
}
export type AppUpdateAlgorithmSettings = {
    type: "algorithmSettings"
    newSettings: AlgorithmSettings
}
export type AppUpdateSetSourceImage = {
    type: "setSourceImage",
    image: number[]
}
export type AppUpdateIncrementIteration = {
    type: "incrementIteration"
}
export type AppUpdateSetRunning = {
    type: "setRunning"
    running: boolean
}
export type AppUpdateSetRequestRun = {
    type: "setRequestRun"
    requestRun: boolean
}

export type AppUpdateAction = AppUpdateReset | AppUpdateStart | AppUpdatePause | AppUpdateAddImageData | AppUpdateAlgorithmSettings | AppUpdateSetSourceImage | AppUpdateIncrementIteration | AppUpdateSetRunning | AppUpdateSetRequestRun

function updateAppState(state: AppState, action: AppUpdateAction) {
    const newState = { ...state }

    switch (action.type) {
        case "reset":
            newState.images = []
            newState.generating = false
            newState.iteration = 0
            newState.requestRun = false
            newState.algorithmSettings = {
                filters: 32,
                layers: 5,
                width: 256,
                height: 256,
            }
            break
        case "start":
            newState.generating = true
            break
        case "pause":
            newState.generating = false
            break
        case "addImageData":
            newState.images.push(action.imageData)
            break
        case "algorithmSettings":
            newState.algorithmSettings = action.newSettings
            break
        case "setSourceImage":
            newState.sourceImage = action.image
            newState.images = []
            newState.iteration = 0
            break
        case "incrementIteration":
            newState.iteration += 1
            break
        case "setRunning":
            newState.running = action.running
            break
        case "setRequestRun":
            newState.requestRun = action.requestRun
            break
        default:
            throw new Error("Unhandled action in state update: " + JSON.stringify(action))
    }

    return newState
}

export function useAppState() {
    return useReducer(updateAppState, {
        generating: false,
        running: false,
        iteration: 0,
        images: [],
        algorithmSettings: {
            filters: 32,
            layers: 5,
            width: 256,
            height: 256,
        },
        sourceImage: null,
        requestRun: false
    })
}
