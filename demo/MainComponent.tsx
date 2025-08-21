import { Component } from "stagnate"
import { mdRenderDom } from "../src/domRenderer"
import { createStyles } from "./createStyles"
import { markdownClasses } from "./markdownClasses"

const classes = createStyles({
	root: {
		display: "flex",
		width: "100%",
		height: "100%",
		flexDirection: "row",
		alignItems: "stretch",
		"& > *": {
			width: 0,
			flexGrow: 1,
			overflow: "auto"
		}
	},
	input: {
		boxSizing: "border-box",
		padding: 25,
		fontFamily: "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace",
		"&:focus": {
			outline: "none"
		}
	},
	output: {
		composes: markdownClasses.root,
		padding: 25,
		fontSize: 17,
		color: "#3f3f3f"
	}
}, "MainComponent")

interface Refs {
	input: HTMLTextAreaElement
	output: HTMLDivElement
}

function loadFromUrl(url: string) {
	return new Promise<string>((resolve, reject) => {
		const request = new XMLHttpRequest()
		request.responseType = "text"
		request.onload = () => {
			if (request.status >= 200 && request.status < 300) {
				resolve(request.response)
			} else {
				reject(new Error(request.statusText))
			}
		}
		request.onerror = () => reject(new Error(request.statusText))
		request.open("GET", url)
		request.send(null)
	})
}

export class MainComponent extends Component<Refs> {
	public render() {
		return <div class={classes.root}>
			<textarea
				class={classes.input}
				onInput={() => this.handleUpdate()}
				onScroll={() => this.handleScroll("input")}
				ref={this.ref("input")}
				disabled
			/>
			<div
				ref={this.ref("output")}
				class={classes.output}
				onScroll={() => this.handleScroll("output")}
			>
				Loading content, please wait
			</div>
		</div>
	}

	private handleScroll(side: "input" | "output") {
		const self = side == "input" ? this.refs.input : this.refs.output
		const other = side == "input" ? this.refs.output : this.refs.input
		other.scrollTop = self.scrollTop / (self.scrollHeight - self.offsetHeight) * (other.scrollHeight - other.offsetHeight)
	}

	private async load() {
		const content = await loadFromUrl("README.md")
		this.refs.input.disabled = false
		this.refs.input.value = content
		this.handleUpdate()
	}

	public onAttach() {
		this.load().catch(e => this.refs.output.innerText = e.toString())
	}

	public handleUpdate() {
		const fragment = mdRenderDom(this.refs.input.value)
		const output = this.refs.output
		while (output.lastChild) {
			output.lastChild.remove()
		}
		output.appendChild(fragment)
	}
}
