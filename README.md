# Micromd -- a 1.8kB Markdown parser
See it parsing this document here: [https://md5crypt.github.io/micromd]
```javascript
(function(){"use strict";function r(r){return r.replace(/(!?)\[([^\[\]\r\n]+?)\](?:\((.+?)\))?/gm,function(r,e,n,t){var o=(t||n).replace(/[*_~`]/g,function(r){return"\0"+r.charCodeAt(0).toString(16)});return e?'<img alt="'+n+'" src="'+o+'"/>':'<a href="'+o+'">'+(t?n:o)+"</a>"})}function e(r){return r.replace(/(\*{1,2}|_{1,2}|~~|`{1,3})([^\s*~_`]|[^\s*~_`].*?[^\s*~_`])\1/gm,function(r,e,n){var t=o[c[e]];return"<"+t+">"+n+"</"+t+">"})}function n(n,o){return e(e(r(r(o?t(n):n))))}function t(r){return r.replace(/[&<>"']/g,function(r){return"&#"+r.charCodeAt(0)+";"})}var o=["strong","em","del","code"],c={"**":0,__:0,"*":1,_:1,"~~":2,"`":3,"``":3,"```":3};this.micromd=function(r,e,o){r=r.replace(/\\[\\*_~\[\]`#>-]/g,function(r){return"\0"+r.charCodeAt(1).toString(16)})+"\n\n";for(var c=/^```([^\s]+)?[ \t]*\r?\n([\s\S]+?)\r?\n```$|^(#+)[ \t]*(.+)$|^([ \t]*)(\d+\.|[*-])[ \t]+(.+)$|^(>[>\t ]*)(.+)$|^(-{3,}|\*{3,})$|^[\t ]*(.*)$/gm,l="",a="",g=[];;){var i=c.exec(r);if(!i)break;if(c.lastIndex+=!i[0].length,g.length>0&&!(i[6]&&"b"!=g[0][2]||i[8]&&"b"==g[0][2]))for(;g.length;)l+=g.pop();if(i[11])a+=n(i[11],e)+"<br/>";else{if(a&&(l+="<p>"+a.slice(0,-5)+"</p>",a=""),i[6]||i[8]){var u=i[6]?i[5].replace(/    /g,"\t").length+1:i[8].replace(/[^>]/g,"").length,f=i[6]?1==i[6].length?"ul":"ol":"blockquote";for(i[8]&&g.length==u&&(l+="<br/>");g.length>u;)l+=g.pop();for(;g.length<u;)l+="<"+f+">",g.push("</"+f+">");l+=i[6]?"<li>"+n(i[7],e)+"</li>":n(i[9],e)}if(i[2]){var h=i[2].replace(/\0(..)/g,function(r,e){return"\\"+String.fromCharCode(parseInt(e,16))});l+='<pre class="language-'+(i[1]||"none")+'"><code>'+(o?o(i[1],h):t(h))+"</code></pre>"}else i[3]?l+="<h"+i[3].length+">"+n(i[4],e)+"</h"+i[3].length+">":i[10]&&(l+="<hr/>")}}return l.replace(/\0(..)/g,function(r,n){return"3e"==n&&e?"&gt;":String.fromCharCode(parseInt(n,16))})}}).call(this);
```

## Usage
### function micromd(input\[, nohtml\[, styler\]\])
Parses a markdown string `input` and returns a string contaning the resulting HTML code.

The optional `nothtml` argument can be used to escape all HTML characters in the input, disallowing raw HTML in markdown.

The optional `styler` argument is a hook to a external syntax highlighter. This function gets called from within the parser with the following arguments:

1. the language string (`''` if not specified)
2. the code

It is expected to return valid HTML. The result will be wrapped in a `pre` block with an appropriate style.

Example usage

```javascript
var out1 = micromd('**<em>strong!</em>**');
var out2 = micromd('**<em>strong!</em>**',true);
var out3 = micromd('```lisp\ntest\n```',false,(lang,code)=>lang+code);
// out1 == "<p><strong><em>strong!</em></strong></p>"
// out2 == "<p><strong>&#60;em&#62;strong!&#60;/em&#62;</strong></p>"
// out3 == "<pre class="language-lisp"><code>lisptest</code></pre>"
```

## Supported syntax

### Text Formatting

**bold** and __bold__
*italic* and _italic_
~~this thing~~
`code` ``code`` ```code```
*mixing `stuff` __bold__ italic*
escaping \*things\* \[like this\] and a slash \\

line line line line line line line line
line break

next paragraph

### Links

simple link: [http://google.com/__strong__]
normal [link **strong**](http://google.com/__strong__)

### Images

simple image: ![https://www.google.pl/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png]
image with alt: ![google](https://www.google.pl/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png)

image link: [![alt text](https://www.google.pl/images/branding/googlelogo/2x/googlelogo_color_120x44dp.png)](http://google.com)

### Headers

#### #hash in header
#### **bold** in header
#### [link](#) in header

### Block quotes

> block quote
> hey!
> > nesting nesting
> > > arrrghhh!
> > > help!
> oh, it's ok know

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
~~this thing~~
`code` ``code`` ```code```
*mixing `stuff` __bold__ italic*
escaping \*things\* \[like this\] and a slash \\
```

with language specification (class `language-lisp`):
```lisp
((((((((((((((((((((((((((((((((((((((((((([...and 1000 more]
)))))))))))))))))))))))))))))))))))
```

html in code blocks:

```html
<html></html>
<strong>heh, nope.</strong>
```

### Lines

---
***
-----
****

### Raw HTML

<marquee>marquee!</marquee>
<center><blink>blink!</blink></center>

### Parser sanity checks
\# header
#
*
\1. list
\> quote
\ \\ \> \* \~ \-
```
\ \\ \> \* \~ \-
```
\```
\---
** bam! **
