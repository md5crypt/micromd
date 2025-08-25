const enum LineGroup {
	IMAGE_ALT = 1,
	IMAGE_SRC,
	LINK_SIMPLE,
	LINK_END,
	TOKEN,
	LINE
}

const enum BlockGroup {
	CODE_LANG = 1,
	HEADER_LEVEL,
	H_LINE,
	LIST_LEVEL,
	LIST_TYPE,
	BLOCKQUOTE_LEVEL
}

const enum WhitespaceType {
	NONE = 0,
	SPACE,
	NEW_LINE
}

export const enum MdNodeType {
	/** @internal */
	ROOT = -1,
	TEXT = 0,
	LINE_BREAK,
	HORIZONTAL_LINE,
	PARAGRAPH,
	BOLD,
	ITALIC,
	BOLD_ITALIC,
	STRIKETHROUGH,
	BLOCKQUOTE,
	CODE,
	CODE_BLOCK,
	HEADER,
	LIST,
	LIST_ITEM,
	LINK,
	IMAGE
}

/**
 * Base AST node
 */
export interface MdBaseNode {
	/** node type */
	type: MdNodeType

	/** next element in the node list */
	next?: MdNode

	/** first child node */
	tree?: MdNode
}

export interface MdGenericNode extends MdBaseNode {
	type: 
		| MdNodeType.LINE_BREAK
		| MdNodeType.PARAGRAPH
		| MdNodeType.BOLD
		| MdNodeType.ITALIC
		| MdNodeType.BOLD_ITALIC
		| MdNodeType.STRIKETHROUGH
		| MdNodeType.HORIZONTAL_LINE
		| MdNodeType.LIST_ITEM
		| MdNodeType.BLOCKQUOTE
}

interface MdBlockquoteInternalNode extends MdBaseNode {
	type: MdNodeType.BLOCKQUOTE
	_d: number
}

export interface MdHeaderNode extends MdBaseNode {
	type: MdNodeType.HEADER
	level: number
}

export interface MdPreNode extends MdBaseNode {
	type: MdNodeType.CODE_BLOCK
	value: string
	lang?: string
}

export interface MdCodeNode extends MdBaseNode {
	type: MdNodeType.CODE
	value: string
}

export interface MdListNode extends MdBaseNode {
	type: MdNodeType.LIST
	start?: number
}

interface MdListInternalNode extends MdBaseNode {
	type: MdNodeType.LIST
	start?: number
	_i: number
}

export interface MdLinkNode extends MdBaseNode {
	type: MdNodeType.LINK
	href: string
}

export interface MdImageNode extends MdBaseNode {
	type: MdNodeType.IMAGE
	src: string
	alt: string
}

export interface MdTextNode extends MdBaseNode {
	type: MdNodeType.TEXT
	value: string
}

export type MdNode = MdGenericNode | MdTextNode | MdImageNode | MdPreNode | MdCodeNode | MdHeaderNode | MdListNode | MdLinkNode

const TOKEN_LUT = {
	"*": MdNodeType.ITALIC,
	"**": MdNodeType.BOLD,
	"***": MdNodeType.BOLD_ITALIC,
	"_": MdNodeType.ITALIC,
	"__": MdNodeType.BOLD,
	"~~": MdNodeType.STRIKETHROUGH
} as Record<string, MdNodeType>

/**
 * Options for {@link mdParse}
 */
export interface MdParseOptions {
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
	stream?: (node: MdNode) => void
}

/**
 * Run the parser and build the AST
 * 
 * @param input - the input string
 * @param options - parser options, see {@link MdParseOptions}
 *
 * @returns
 * - by default the first block-level node of the completed AST tree
 * - if {@link MdParseOptions.stream} is set returns undefined
 * - if {@link MdParseOptions.inline} is set returns first line-level node
 */
export function mdParse(input: string, options: MdParseOptions = {}) {
	const lineRe = /!\[([^\[\]]*)\]\(([^()]+)\)|\<(https?:\/\/[^<>]*[^\s])\>|\]\(([^)]*)\)|(\*{1,3}|_{1,2}|~~|`{1,}|\[|\\.)|([\t ]*)\r?\n/g
	const root = {type: MdNodeType.ROOT} as MdBaseNode

	let currentNode = root
	let lineStack = [] as MdTextNode[]
	let lastIndex = 0
	let insertWhitespace = WhitespaceType.NONE

	// this visits each node at most ONCE as it does not scan trees
	// just the immediate node lists before placing them as a tree inside a node
	function combineTexts(node?: MdNode) {
		if (node) {
			let last = node
			let current = node.next
			while (current) {
				if (last.type == MdNodeType.TEXT && current.type == MdNodeType.TEXT) {
					last.value += current.value
					current = current.next
					last.next = current
				} else {
					last = current
					current = current.next
				}
			}
		}
		return node
	}
	
	function isBoundary(position: number) {
		if (position < 0 || position >= input.length) {
			return true
		} else {
			const c = input.charCodeAt(position)
			// approximation, but should be good enough
			return (
				(c >= 9 && c <= 12) ||
				(c >= 32 && c <= 47) ||
				(c >= 58 && c <= 64) ||
				(c >= 91 && c <= 96) ||
				(c >= 123 && c <= 126) ||
				(c == 160)
			)
		}
	}

	function addLeaf(node: MdNode) {
		currentNode.next = node
		currentNode = node
	}

	function addText(value: string, addToStack?: boolean) {
		const text = {type: MdNodeType.TEXT, value} as MdTextNode
		addLeaf(text)
		if (addToStack) {
			lineStack.push(text)
		}
	}

	function parseLine() {
		lineRe.lastIndex = lastIndex
		if (insertWhitespace == WhitespaceType.SPACE) {
			addText(" ")
		} else if (insertWhitespace == WhitespaceType.NEW_LINE) {
			addLeaf({type: MdNodeType.LINE_BREAK})
		}
		while (true) {
			const match = lineRe.exec(input)
			if (!match) {
				if (lastIndex < input.length) {
					addText(input.slice(lastIndex))
					lastIndex = input.length
				}
				return false
			}
			if (match.index != lastIndex) {
				addText(input.slice(lastIndex, match.index))
			}
			if (match[LineGroup.IMAGE_ALT] !== undefined) {
				addLeaf({
					type: MdNodeType.IMAGE,
					src: match[LineGroup.IMAGE_SRC],
					alt: match[LineGroup.IMAGE_ALT]
				})
			} else if (match[LineGroup.LINK_SIMPLE] !== undefined) {
				const href = match[LineGroup.LINK_SIMPLE]
				addLeaf({
					type: MdNodeType.LINK,
					href,
					tree: {type: MdNodeType.TEXT, value: href}
				})
			} else if (match[LineGroup.LINK_END] !== undefined) {
				// ( ) in links do not work but it's an edge case and
				// adding proper support would add a lof of code
				const stackSize = lineStack.length
				let index = stackSize - 1
				for (; index >= 0 && lineStack[index].value != "["; index -= 1) {
					// no-op
				}
				if (index < 0) {
					addText(match[0])
				} else {
					const target = lineStack[index] as MdNode as MdLinkNode
					target.type = MdNodeType.LINK
					target.tree = combineTexts(target.next)
					target.next = undefined
					target.href = match[LineGroup.LINK_END]
					currentNode = target
					for (; index < stackSize; index += 1) {
						lineStack.pop()
					}
				}
			} else if (match[LineGroup.TOKEN] !== undefined) {
				const token = match[LineGroup.TOKEN]
				if (token[0] == "`") {
					// code blocks can span multiple lines because of this
					// but thanks to it we avoid catastrophic backtracking
					// a proper solution would be much longer
					let index = input.indexOf(token, lineRe.lastIndex)
					if (index < 0) {
						addText(token)
					} else {
						addLeaf({
							type: MdNodeType.CODE,
							value: input.slice(lineRe.lastIndex, index)
						})
						lineRe.lastIndex = index + token.length
					}
				} else if (token[0] == "\\") {
					addText(token[1])
				} else if (token == "[") {
					addText(token, true)
				} else {
					const leftBoundary = isBoundary(match.index - 1)
					const rightBoundary = isBoundary(lineRe.lastIndex)
					if (!rightBoundary && leftBoundary) {
						addText(token, true)
					} else if (!leftBoundary && (rightBoundary || token[0] != "_")) {
						const stackSize = lineStack.length
						let index = -1
						for (index = stackSize - 1; index >= 0 && lineStack[index].value != token; index -= 1) {
							// no-op
						}
						if (index < 0) {
							addText(token, !rightBoundary)
						} else {
							const target = lineStack[index] as MdBaseNode
							target.type = TOKEN_LUT[token]
							target.tree = combineTexts(target.next)
							target.next = undefined
							currentNode = target as MdNode
							for (; index < stackSize; index += 1) {
								lineStack.pop()
							}
						}
					} else {
						addText(token)
					}
				}
			} else if (match[LineGroup.LINE] !== undefined) {
				insertWhitespace = match[LineGroup.LINE].length >= 2 ? WhitespaceType.NEW_LINE : WhitespaceType.SPACE
				lastIndex = lineRe.lastIndex
				return true
			}
			lastIndex = lineRe.lastIndex
		}
	}

	function parseBlock() {
		const blockRe = /```([^\s]*)[ \t]*\r?\n|(#+)[ \t]+|(-{3,}|\*{3,})[ \t]*(?:\r?\n|$)|([ \t]*)(\d+\.|[*+-])[ \t]+|(>[>\t ]*)|[^\S\r\n]*\r?\n/y
		const stack = [] as MdNode[]
		const inputLength = input.length
		const streamFunc = options.stream
		let pendingFlush = false

		function flushInline() {
			pendingFlush = false
			while (lineStack.length) {
				lineStack.pop()
			}
			insertWhitespace = WhitespaceType.NONE
		}

		function popNode() {
			const node = stack.pop()!
			node.tree = combineTexts(node.next)
			node.next = undefined
			currentNode = node
		}

		function addNode(node: MdNode) {
			flush()
			addLeaf(node)
		}

		function addTreeNode(node: MdNode, noFlush?: boolean) {
			if (!noFlush) {
				flush()
			}
			addLeaf(node)
			stack.push(node)
		}

		function flush() {
			flushInline()
			while (stack.length) {
				popNode()
			}
			if (streamFunc && root.next) {
				streamFunc(root.next)
				root.next = undefined
				currentNode = root
			}
		}

		while (lastIndex < inputLength) {
			blockRe.lastIndex = lastIndex
			const match = blockRe.exec(input)
			if (match) {
				lastIndex = blockRe.lastIndex
				if (match[BlockGroup.CODE_LANG] !== undefined) {
					// leading new line is required, off spec but simple
					let endPosition = input.indexOf("\n```", lastIndex - 1)
					if (endPosition < 0) {
						// consume all
						endPosition = inputLength
					}
					addNode({
						type: MdNodeType.CODE_BLOCK,
						value: input.slice(lastIndex, endPosition),
						lang: match[BlockGroup.CODE_LANG]
					})
					// eat remaining line data, not a perfect solution, but good enough
					// as alternative would add a lot of code with no greater benefit
					lastIndex = input.indexOf("\n", endPosition + 4)
					if (lastIndex < 0) {
						lastIndex = inputLength
					} else {
						lastIndex += 1
					}
					continue
				} else if (match[BlockGroup.HEADER_LEVEL] !== undefined) {
					addTreeNode({
						type: MdNodeType.HEADER,
						level: match[BlockGroup.HEADER_LEVEL].length
					})
					parseLine()
					popNode()
					continue
				} else if (match[BlockGroup.H_LINE] !== undefined) {
					addNode({type: MdNodeType.HORIZONTAL_LINE})
					continue
				} else if (match[BlockGroup.LIST_LEVEL] !== undefined) {
					let stackTop = stack.length - 1
					const level = match[BlockGroup.LIST_LEVEL].length
					let create = true
					if (stackTop >= 0 && stack[stackTop].type == MdNodeType.LIST_ITEM) {
						// if last node was LIST_ITEM current node HAS to be LIST
						let indent = (stack[stackTop - 1] as MdListInternalNode)._i
						if (level < indent + 2) {
							popNode()
							stackTop -= 1
							while (level < indent - 1 && stackTop > 0) {
								popNode()
								popNode()
								stackTop -= 2
								indent = (stack[stackTop] as MdListInternalNode)._i
							}
							addTreeNode({type: MdNodeType.LIST_ITEM}, true)
							create = false
						}
						flushInline()
					} else {
						flush()
					}
					if (create) {
						const type = match[BlockGroup.LIST_TYPE]
						const list = {type: MdNodeType.LIST, _i: level} as MdListInternalNode
						if (type.length > 1) {
							list.start = parseInt(type)
						}
						addTreeNode(list, true)
						addTreeNode({type: MdNodeType.LIST_ITEM}, true)
					}
				} else if (match[BlockGroup.BLOCKQUOTE_LEVEL] !== undefined) {
					const levelStr = match[BlockGroup.BLOCKQUOTE_LEVEL]
					let level = 0 
					for (let i = 0; i < levelStr.length; i += 1) {
						if (levelStr[i] == ">") {
							level += 1
						}
					}
					const topQuote = stack.length - 2
					let depth = 0
					if (topQuote >= 0 && stack[topQuote].type == MdNodeType.BLOCKQUOTE) {
						depth = (stack[topQuote] as MdBlockquoteInternalNode)._d
						if (depth != level) {
							popNode()
						}
					} else {
						flush()
					}
					if (depth != level) {
						flushInline()
						while (depth > level) {
							popNode()
							depth -= 1
						}
						while (depth < level) {
							depth += 1
							addTreeNode({type: MdNodeType.BLOCKQUOTE, _d: depth} as MdBlockquoteInternalNode, true)
						}
						addTreeNode({type: MdNodeType.PARAGRAPH}, true)
					}
				} else {
					pendingFlush = true
					continue
				}
			}
			if (pendingFlush) {
				flush()
			}
			if (stack.length == 0) {
				addTreeNode({type: MdNodeType.PARAGRAPH})
			}
			parseLine()
		}
		flush()
	}

	if (options.inline) {
		while (parseLine()) {
			// no-op
		}
		combineTexts(root.next)
	} else {
		parseBlock()
	}
	return root.next
}
