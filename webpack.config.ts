import {Configuration} from "webpack";

export default {
	mode: "production",
	devtool: "cheap-source-map",
    resolve: {
        extensions: [".ts"],
    },
	target: ["es5", "web"],
    output: {
        libraryTarget: "umd",
		library: "GlobalStyle",
		globalObject: "this",
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
} as Configuration;
