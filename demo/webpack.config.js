const path = require("path")

module.exports = env => ({
	entry: "./index.ts",
	output: {
		filename: "site.js",
		path: path.resolve(__dirname, "dist")
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js"],
		extensionAlias: {
			'.js': ['.js', '.ts'],
		},
		symlinks: false
	},
	mode: env.production ? "production" : "development",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [
					{loader: "ts-loader", options: {onlyCompileBundledFiles: true}}
				]
			}
		]
	},
	devServer: {
		compress: env.production,
		port: 9000,
		host: "0.0.0.0",
		devMiddleware: {
			writeToDisk: x => !/\.hot-update\./.test(x)
		},
		static: {
			directory: path.resolve(__dirname),
			watch: false,
		},
		allowedHosts: "all",
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
			"Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
		},
		setupMiddlewares: (middlewares, devServer) => {
			devServer.app.get("/README.md", (req, res) => res.sendFile(path.resolve(__dirname, "../README.md")))
			return middlewares
		}
	}
})
