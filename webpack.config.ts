import {Configuration} from "webpack";

export default [{
    resolve: {
        extensions: [".ts"],
    },
    output: {
        libraryTarget: "umd",
        filename: "index.umd.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
            },
        ],
    }
}] as Configuration[];
