import {Configuration} from "webpack";

export default {
	mode: "production",
    resolve: {
        extensions: [".ts"],
    },
	target: "es5",
    output: {
        libraryTarget: "umd",
		library: "GlobalStyle",
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
