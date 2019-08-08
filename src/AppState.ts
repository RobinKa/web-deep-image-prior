import { useReducer } from "react"

export type ImageData = {
    uri: string
    iteration: number
}

export type AlgorithmSettings = {
    filters: number
    layers: number
    width: number
    height: number
    inpaint: boolean
}

export type AppState = {
    step: "idle" | "runIter" | "finishedIter"
    shouldRun: boolean

    images: ImageData[]
    maskCanvas: HTMLCanvasElement | null
    algorithmSettings: AlgorithmSettings
    sourceImage: number[] | null
    iteration: number
}

export type AppUpdateReset = { type: "reset" }
export type AppUpdateStart = { type: "start" }
export type AppUpdatePause = { type: "pause" }

export type AppUpdateAlgorithmSettings = {
    type: "algorithmSettings"
    newSettings: AlgorithmSettings
}
export type AppUpdateSetSourceImage = {
    type: "setSourceImage",
    image: number[]
}
export type AppUpdateFinishIter = {
    type: "finishIter",
    imageData: ImageData | undefined
}
export type AppUpdateSetMaskCanvas = {
    type: "setMaskCanvas"
    maskCanvas: HTMLCanvasElement | null
}
export type AppUpdateStartIter = {
    type: "startIter"
}
export type AppUpdateStopped = {
    type: "stopped"
}

export type AppUpdateAction = AppUpdateReset | AppUpdateStart | AppUpdatePause |
    AppUpdateAlgorithmSettings | AppUpdateSetSourceImage | AppUpdateFinishIter | AppUpdateSetMaskCanvas | AppUpdateStartIter | AppUpdateStopped

function updateAppState(state: AppState, action: AppUpdateAction) {
    const newState = { ...state }

    switch (action.type) {
        case "reset":
            newState.images = []
            newState.shouldRun = false
            newState.iteration = 0
            newState.algorithmSettings = {
                filters: 8,
                layers: 5,
                width: 256,
                height: 256,
                inpaint: false,
            }
            break
        case "start":
            newState.shouldRun = true
            break
        case "pause":
            newState.shouldRun = false
            break
        case "algorithmSettings":
            newState.algorithmSettings = action.newSettings
            newState.images = []
            newState.iteration = 0
            break
        case "setSourceImage":
            newState.sourceImage = action.image
            newState.images = []
            newState.iteration = 0
            break
        case "finishIter":
            if (newState.shouldRun) {
                newState.iteration += 1
                if (action.imageData) {
                    newState.images.push(action.imageData)
                }
            }
            newState.step = "finishedIter"
            break
        case "stopped":
            newState.step = "idle"
            newState.iteration = 0
            break
        case "startIter":
            newState.step = "runIter"
            break
        case "setMaskCanvas":
            newState.maskCanvas = action.maskCanvas
            break
        default:
            throw new Error("Unhandled action in state update: " + JSON.stringify(action))
    }

    return newState
}

export function useAppState() {
    return useReducer(updateAppState, {
        step: "idle",
        shouldRun: false,
        iteration: 0,
        images: [],
        algorithmSettings: {
            filters: 8,
            layers: 5,
            width: 256,
            height: 256,
            inpaint: false,
        },
        sourceImage: null,
        maskCanvas: null,
    })
}
