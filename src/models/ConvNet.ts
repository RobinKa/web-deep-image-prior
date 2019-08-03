import * as tf from "@tensorflow/tfjs"

export function createConvNet(inputShape: [number, number, number], outputFilters: number, layers: number, filters: number) {
    const model = tf.sequential()

    const hiddenShape = [inputShape[0], inputShape[1], filters]

    for (let layerIndex = 0; layerIndex < layers - 1; layerIndex++) {
        model.add(tf.layers.conv2d({
            inputShape: layerIndex === 0 ? inputShape : hiddenShape,
            kernelSize: [3, 3],
            padding: "same",
            filters: filters,
            activation: "relu"
        }))

        model.add(tf.layers.batchNormalization())
    }

    model.add(tf.layers.conv2d({
        inputShape: layers === 1 ? inputShape : hiddenShape,
        kernelSize: [3, 3],
        padding: "same",
        filters: 3,
        activation: "tanh"
    }))

    return model
}