import { MdNode, MdNodeType, mdParse } from "./parser.js"

/** Options for {@link mdRenderHtml} */
export interface MdRenderHtmlOptions {
	/**
	 * when true parser will ignore all block elements (lists, quotes, headers, horizontal lines)
	 * and not wrap output in a paragraph
	 */
	inline?: boolean

	/**
	 * this function will be called after each root-level element finishes parsing
	 * useful to keep memory footprint small by consuming elements as the come
	 * 
	 * mdParse always returns undefined when set
	 * 
	 * @note ignored if inline is set
	 */
	stream?: (node: string) => void

	/**
	 * called for each code block to apply syntax coloring
	 *
	 * expects valid html code as response to put inside the
	 * <pre><code></code></pre> block
	 */
	codeStyler?: (code: string, lang?: string) => string
}

export function escapeHtml(input: string) {
	return input.replace(/[&<>"']/g, m => `&#${m.charCodeAt(0)};`)
}

/**
 * Generate a html string output
 * 
 * @param input - the input string
 * @param options - parser options, see {@link MdParseOptions}
 *
 * @returns the complete html string
 * - if {@link MdParseOptions.stream} is set returns "" (empty string)
 */
export function mdRenderHtml(input: string, options: MdRenderHtmlOptions = {}) {

	const codeStyler = options.codeStyler || escapeHtml

	function renderTree(node: MdNode | undefined) {
		while (node) {
			renderNode(node)
			node = node.next
		}
	}

	function renderNode(node: MdNode) {

		function tag(open: string, close: string) {
			accumulator.push(open)
			renderTree(node.tree)
			accumulator.push(close)
		}

		switch (node.type) {
			case MdNodeType.TEXT:
				accumulator.push(escapeHtml(node.value))
				break
			case MdNodeType.LINE_BREAK:
				accumulator.push("<br/>")
				break
			case MdNodeType.HORIZONTAL_LINE:
				accumulator.push("<hr/>")
				break
			case MdNodeType.PARAGRAPH:
				tag("<p>", "</p>")
				break
			case MdNodeType.BOLD:
				tag("<strong>", "</strong>")
				break
			case MdNodeType.ITALIC:
				tag("<em>", "</em>")
				break
			case MdNodeType.STRIKETHROUGH:
				tag("<del>", "</del>")
				break
			case MdNodeType.BLOCKQUOTE:
				tag("<blockquote>", "</blockquote>")
				break
			case MdNodeType.CODE:
				accumulator.push("<code>", escapeHtml(node.value), "</code>")
				break
			case MdNodeType.CODE_BLOCK:
				accumulator.push(`<pre ${node.lang ? ` class="language-${escapeHtml(node.lang)}"` : ""}><code>`, codeStyler(node.value), "</code></pre>")
				break
			case MdNodeType.HEADER: {
				const level = Math.min(6, node.level)
				tag(`<h${level}>`, `</h${level}>`)
				break
			}
			case MdNodeType.LIST: {
				if (node.ordered) {
					tag("<ol>", "</ol>")
				} else {
					tag("<ul>", "</ul>")
				}
				break
			}
			case MdNodeType.LIST_ITEM:
				tag("<li>", "</li>")
				break
			case MdNodeType.LINK:
				tag(`<a href="${escapeHtml(node.href)}">`, "</a>")
				break
			case MdNodeType.IMAGE:
				accumulator.push(`<img src="${escapeHtml(node.src)}"${node.alt ? ` alt="${escapeHtml(node.alt)}"` : ""}/>`)
				break
		}
	}

	const streamFunc = options.stream
	let accumulator = [] as string[]
	if (options.inline) {
		renderTree(mdParse(input, {inline: true}))
	} else {
		mdParse(input, {stream: x => {
			renderNode(x)
			if (streamFunc) {
				streamFunc(accumulator.join(""))
				accumulator = []
			}
		}})
	}
	return accumulator.join("")
}
