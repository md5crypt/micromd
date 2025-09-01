# Micromd -- a ~3kB Markdown parser
See it parsing this document here: <https://md5crypt.github.io/micromd>

* minimal footprint
* 100% linear
* single pass
* AST generation with separate rendering backends
    * DOM backend available
    * string html backend available
    * super easy to implement a custom one!
* ok-ish compatibility (see below)

## Rational 

This parser offers a fine balance between footprint size and common mark compatibility. It is by no means perfect but it is tiny (~3kB minified) and fast.

## Syntax support

* emphasis & inline code
  - bold (`**, __`)
  - italics (`*, _`)
  - strikethrough (`~~`)
  - bold italic (`***`)
  - code spans (```` `, ``, ``` ````)
    - escaping in code spans does not work
    - inline code blocks don't stop on line breaks
  - simplified fencing rules
    - utf8 punctuation and whitespace characters like em-dash are not handled correctly

* links and images
  - `title` and `ref` not supported
  - `href`/`src` cannot contain `(` or `)`
  - `alt` cannot contain `[` or `]`
  - escapes are not processed in `alt`, `href`, and `src`

* autolinks
  - supported only with `<...>` and only for `http` / `https`
  - bare URLs are not auto-linked

* hard line breaks
  - more then two whitespaces at end of line are treated as hard break

* headers
  - headers using the `---` syntax (setext) are not supported

* horizontal lines
  - only `*** and ---` is supported, must start at column 0 (no indentation)

* lists
  - lists can't contain other block elements (header, blockquote, code fence)
  - slightly different indentation rule then commonmark, should never be visible in normal use
  - changing list type mid list has no effect
  - setting numeration start works only for first list element

* blockquotes
  - blockquotes can't contain other block elements (header, list, code fence)
  - blockquotes can not be nested

* code fences
  - only triple backticks ```` ``` ```` are supported
  - closing fence must be the only thing on its line
  - a newline is required before the closing fence
  - escaping inside fenced code is not supported

## Usage

### HTML generation

HTML strings can be generated with this function:

```typescript
/**
 * Generate a html string output
 * 
 * @param input - the input string
 * @param options - parser options, see {@link MdParseOptions}
 *
 * @returns the complete html string
 * - if {@link MdParseOptions.stream} is set returns "" (empty string)
 */
export function mdRenderHtml(input: string, options: MdRenderHtmlOptions = {})
```

It accepts the following options:

```typescript
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
```

### DOM generation

If used to display content on screen, why generate html, AST can be used to generate DOM elements directly:

```typescript
/**
 * Generate DOM elements directly
 * 
 * @param input - the input string
 * @param options - parser options, see {@link MdRenderDomOptions}
 *
 * @returns a DocumentFragment
 */
export function mdRenderDom(input: string, options: MdRenderDomOptions = {})
```

It accepts the following options:

```typescript
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
```


### AST generation

The main parser function looks as follows
```typescript
/**
 * Run the parser and build the AST
 * 
 * @param input - the input string
 * @param options - parser options, see {@link MdParseOptions}
 *
 * @returns
 * -  by default the first block-level node of the completed AST tree
 * - if {@link MdParseOptions.stream} is set returns undefined
 * - if {@link MdParseOptions.inline} is set returns first line-level node
 */
export function mdParse(input: string, options: MdParseOptions = {})
```

With options being:

```typescript
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
```

A single AST node looks like this:

```typescript
export interface MdBaseNode {
	/** node type enum */
	type: MdNodeType

	/** next element in the node list */
	next?: MdNode

	/** first child node */
	tree?: MdNode
}
```

Each special node has it's own interface, for example:

```typescript
export interface MdPreNode extends MdBaseNode {
	type: MdNodeType.CODE_BLOCK
	value: string
	lang?: string
}
```

### Adding a custom AST renderer

See `src/domRenderer.ts` and `src/htmlRenderer.ts` for examples

### Usage example

```javascript
import { mdRenderHtml } from "micromd"
import { readFileSync } from "fs"
mdRenderHtml(readFileSync("README.md", "utf8"), {stream: console.log})
```

## Playground

### Text Formatting

**bold** and __bold__  
*italic* and _italic_  
***bold italic***  
~~this thing~~  
`code` ``code`` ```code```  
*mixing `stuff` __bold__ italic*

escaping \*things\* \`like this\` and a slash \\

line line line line line line line line  
line break

next paragraph

### Links

auto link: <http://google.com/__strong__>  
normal [link **strong**](http://google.com/__strong__)

### Images

image: ![google](https://www.google.pl/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png)  
image link: [![alt text](https://www.google.pl/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png)](http://google.com)

### Headers

#### #hash in header
#### *italic* in header
#### [link](#) in header

### Block quotes

> block quote!  
> **hey!** look at _me_

### Lists

* unorderd list
- minus also works
    * nesting
        * woah!
    * ok, going back
        * not again!
            * help!
- ok I'm back

1. ordered list
    1. my hands are typing
        * an unordered list!
    2. and back
2. the end

### Code blocks

without language specification (class `language-none`):
```
**bold** and __bold__  
*italic* and _italic_  
***bold italic***  
~~this thing~~  
`code` ``code`` ```code```  
*mixing `stuff` __bold__ italic*
```

with language specification (class `language-lisp`):
```lisp
((((((((((((((((((((((((((((((((((((((((((([...and 1000 more]
)))))))))))))))))))))))))))))))))))
```

### Lines

---
***
-----
****
