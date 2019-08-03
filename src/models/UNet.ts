import * as tf from "@tensorflow/tfjs"

export function createUNet(inputShape: [number, number, number], outputFilters: number, layers: number, filters: number) {
    const input = tf.input({ shape: inputShape })

    const downs = [input]
    for (let i = 0; i < layers; i++) {
        downs.push(tf.layers.conv2d({
            filters: Math.pow(2, i) * filters,
            kernelSize: [3, 3],
            padding: "same",
            strides: 2,
            activation: "relu",
        }).apply(downs[downs.length - 1]) as tf.SymbolicTensor)
    }

    const ups = [downs[downs.length - 1]]
    for (let i = 0; i < layers; i++) {
        const last = i === layers - 1

        const upsampled = tf.layers.conv2dTranspose({
            filters: Math.pow(2, layers - i - 1) * filters,
            kernelSize: [3, 3],
            padding: "same",
            strides: 2,
            activation: "relu",
        }).apply(ups[ups.length - 1]) as tf.SymbolicTensor

        const concatenated = tf.layers.concatenate({axis: -1}).apply([upsampled, downs[layers - i - 1]])

        const processed = tf.layers.conv2d({
            filters: last ? outputFilters : Math.pow(2, layers - i - 1),
            kernelSize: [3, 3],
            padding: "same",
            strides: 1,
            activation: last ? "tanh" : "relu",
        }).apply(concatenated) as tf.SymbolicTensor

        ups.push(processed)
    }

    return tf.model({inputs: input, outputs: ups[ups.length - 1]})
}