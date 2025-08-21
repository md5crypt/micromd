import { createStyles } from "./createStyles";

export const markdownClasses = createStyles({
	root: {
		lineHeight: 1.45,
		wordWrap: "break-word",
		fontFamily: "Source Sans Pro, sans-serif",
		"& p, blockquote, ul, ol, pre": {
			marginTop: 0,
			marginBottom: 16
		},
		"& a": {
			color: "#4fa1db",
			textDecoration: "none",
			"&:hover": {
				textDecoration: "underline"
			}
		},
		"& strong": {
			fontWeight: 600
		},
		"& hr": {
			height: "0.25em",
			margin: [24, 0],
			border: 0,
			borderBottom: [1, "solid", "#eee"],
			backgroundColor: "#e1e4e8",
			padding: 0
		},
		"& p": {
			textAlign: "justify"
		},
		"& ul, ol": {
			marginTop: 0,
			paddingLeft: "2em"
		},
		"& ol ol, ul ol": {
			listStyleType: "lower-roman"
		},
		"& ul ul ol, ul ol ol, ol ul ol, ol ol ol": {
			listStyleType: "lower-alpha"
		},
		"& ul ul, ul ol, ol ol, ol ul": {
			marginTop: 0,
			marginBottom: 0
		},
		"& blockquote": {
			padding: "0em 1em",
			color: "#6a737d",
			borderLeft: [10, "solid", "#80808013"],
			marginLeft: 0,
			marginRight: 0,
			backgroundColor: "#80808003"
		},
		"& blockquote > :first-child": {
			marginTop: 0
		},
		"& blockquote > :last-child": {
			marginBottom: 0
		},
		"& h1, h2, h3, h4, h5, h6": {
			lineHeight: 1.25,
			marginTop: 24,
			marginBottom: 16,
			fontWeight: "normal"
		},
		"& h1": {
			fontWeight: 300,
			fontSize: "2.6em",
			paddingBottom: ".3em",
			borderBottom: [1, "solid", "#c9c9c9c9"],
			marginTop: "2em"
		},
		"& h2": {
			fontWeight: 300,
			fontSize: "2.15em",
			paddingBottom: ".3em",
			borderBottom: [1, "solid", "#c9c9c9c9"]
		},
		"& h3": {
			fontSize: "1.5em"
		},
		"& h4": {
			fontSize: "1.2em"
		},
		"& h5": {
			fontSize: "1em"
		},
		"& h6": {
			fontSize: ".85em",
			color: "#6a737d"
		},
		"& li > p": {
			marginTop: 16
		},
		"& li + li": {
			marginTop: ".25em"
		},
		"& img": {
			maxWidth: "100%",
			borderStyle: "none"
		},
		"& code, pre": {
			fontFamily: "SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier, monospace"
		},
		"& code": {
			padding: [0, ".5em"],
			paddingTop: ".175em",
			paddingBottom: ".175em",
			margin: 0,
			fontSize: ".85em",
			backgroundColor: "#80808014",
			borderRadius: 3,
		},
		"& pre": {
			overflow: "auto",
			padding: 16,
			borderRadius: 3,
			backgroundColor: "#1b1f2305",
			tabSize: 4
		},
		"& pre code": {
			margin: 0,
			padding: 0,
			wordWrap: "normal",
			backgroundColor: "transparent"
		},
		"& > *:first-child": {
			marginTop: "0 !important"
		},
		"& > *:last-child": {
			marginBottom: "0 !important"
		},
		"& pre.language-javascript": {
			backgroundColor: "rgba(27,31,35,0.05)",
		},
		"& pre.language-lisp": {
			backgroundColor: "rgba(80,0,0,0.05)"
		},
		"& pre.language-html": {
			backgroundColor: "rgba(0,80,0,0.05)"
		}
	}
}, "markdown")
