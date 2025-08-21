import { MdNode, MdNodeType, mdParse } from "./parser.js"

export interface MdRenderDomOptions {
	/**
	 * when true parser will ignore all block elements (lists, quotes, headers, horizontal lines)
	 * and not wrap output in a paragraph
	 */
	inline?: boolean

	/**
	 * called for each code block to apply syntax coloring
	 *
	 * expects a DocumentFragment or single Element to put into
	 * <pre><code></code></pre> block
	 */
	codeStyler?: (code: string, lang?: string) => Node
}

/**
 * Generate DOM elements directly
 * 
 * @param input - the input string
 * @param options - parser options, see {@link MdRenderDomOptions}
 *
 * @returns a DocumentFragment
 */
export function mdRenderDom(input: string, options: MdRenderDomOptions = {}) {

	const codeStyler = options.codeStyler || (code => document.createTextNode(code))

	function renderTree(node: MdNode | undefined, parent: Node) {
		while (node) {
			renderNode(node, parent)
			node = node.next
		}
	}

	function renderNode(node: MdNode, parent: Node) {

		function tag<T = HTMLElement>(tagName: string) {
			const element = document.createElement(tagName)
			parent.appendChild(element)
			renderTree(node.tree, element)
			return element as T
		}

		switch (node.type) {
			case MdNodeType.TEXT:
				parent.appendChild(document.createTextNode(node.value))
				break
			case MdNodeType.LINE_BREAK:
				tag("br")
				break
			case MdNodeType.HORIZONTAL_LINE:
				tag("hr")
				break
			case MdNodeType.PARAGRAPH:
				tag("p")
				break
			case MdNodeType.BOLD:
				tag("strong")
				break
			case MdNodeType.ITALIC:
				tag("em")
				break
			case MdNodeType.STRIKETHROUGH:
				tag("del")
				break
			case MdNodeType.BLOCKQUOTE:
				tag("blockquote")
				break
			case MdNodeType.CODE:
				tag("code").appendChild(document.createTextNode(node.value))
				break
			case MdNodeType.CODE_BLOCK: {
				const element = document.createElement("code")
				element.appendChild(codeStyler(node.value, node.lang))
				const pre = tag("pre")
				pre.appendChild(element)
				if (node.lang) {
					pre.classList.add("language-" + node.lang)
				}
				break
			}
			case MdNodeType.HEADER:
				tag("h" + Math.min(6, node.level))
				break
			case MdNodeType.LIST: {
				tag(node.ordered ? "ol" : "ul")
				break
			}
			case MdNodeType.LIST_ITEM:
				tag("li")
				break
			case MdNodeType.LINK:
				tag<HTMLAnchorElement>("a").href = node.href
				break
			case MdNodeType.IMAGE: {
				const element = tag<HTMLImageElement>("img")
				element.src = node.src
				element.alt = node.alt
				break
			}
		}
	}

	const accumulator = document.createDocumentFragment()

	if (options.inline) {
		renderTree(mdParse(input, {inline: true}), accumulator)
	} else {
		mdParse(input, {stream: x => renderNode(x, accumulator)})
	}
	return accumulator
}
