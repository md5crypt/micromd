# Micromd -- a 1.8kB Markdown parser
see it parsing this document here: [https://md5crypt.github.io/micromd]
```javascript
(function(){"use strict";function e(e){return e.replace(/(!?)\[([^\[\]\r\n]+?)\](?:\((.+?)\))?/gm,function(e,r,n,t){var c=(t||n).replace(/[*_~`#=-]/g,function(e){return"\0"+e.charCodeAt(0).toString(16)});return r?'<img alt="'+n+'" src="'+c+'"/>':'<a href="'+c+'">'+(t?n:c)+"</a>"})}function r(e){return e.replace(/(\*{1,2}|_{1,2}|~~|`{1,3})([^\s*~_`]|[^\s*~_`].*?[^\s*~_`])\1/gm,function(e,r,n){var t=c[l[r]];return"<"+t+">"+n+"</"+t+">"})}function n(n,c){return r(r(e(e(c?t(n):n))))}function t(e){return e.replace(/[&<>"']/g,function(e){return"&#"+e.charCodeAt(0)+";"})}var c=["strong","em","del","code"],l={"**":0,__:0,"*":1,_:1,"~~":2,"`":3,"``":3,"```":3};this.micromd=function(e,r){e=e.replace(/\\[\\*_~\[\]`#=>-]/g,function(e){return"\0"+e.charCodeAt(1).toString(16)})+"\n\n";for(var c=/^`{3}([^\s]+)?\s*\n([\s\S]+?)\n`{3}$|^(#+)\s*(.+)$|^([ \t]*)(\d+.|\*)\s+(.+)$|^(>[>\t ]*)(.+)$|^(-{3,}|_{3,}|\*{3,}|={3,}[\t ]*$)|^[\t ]*(.*)$/gm,l="",o="",u=[];;){var a=c.exec(e);if(!a)break;if(c.lastIndex+=!a[0].length,u.length>0&&!(a[6]&&"b"!=u[0][2]||a[8]&&"b"==u[0][2]))for(;u.length;)l+=u.pop();if(a[11])o+=n(a[11],r)+"<br/>";else{if(o&&(l+="<p>"+o.slice(0,-5)+"</p>",o=""),a[6]||a[8]){var g=a[6]?a[5].replace(/    /g,"\t").length+1:a[8].replace(/[^>]/g,"").length,i=a[6]?1==a[6].length?"ul":"ol":"blockquote";for(a[8]&&u.length==g&&(l+="<br/>");u.length>g;)l+=u.pop();for(;u.length<g;)l+="<"+i+">",u.push("</"+i+">");l+=a[6]?"<li>"+n(a[7],r)+"</li>":n(a[9],r)}a[2]?l+='<pre class="language-'+(a[1]||"none")+'"><code>'+t(a[2]).replace(/\u0000/g,"\\\0")+"</code></pre>":a[3]?l+="<h"+a[3].length+">"+n(a[4],r)+"</h"+a[3].length+">":a[10]&&(l+="<hr/>")}}return l.replace(/\u0000(..)/g,function(e,n){return"3e"==n&&r?"&gt;":String.fromCharCode(parseInt(n,16))})}}).call(this);
```

## Usage
### function micromd(input\[, nohtml\])
Parses a markdown string `input` and returns a string contaning the resulting HTML code.

The optional `nothtml` argument can be used to escape all HTML characters in the input, disallowing raw HTML in markdown.

```javascript
var out1 = micromd('**<em>strong!</em>**');
var out2 = micromd('**<em>strong!</em>**',true);
// out1 == "<p><strong><em>strong!</em></strong></p>"
// out2 == "<p><strong>&#60;em&#62;strong!&#60;/em&#62;</strong></p>"
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
    * nesting
        * woah!
    * ok, going back
        * not again!
            * help!
* ok I'm back

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

#### html in code blocks:

```html
<html></html>
<strong>heh, nope.</strong>
```

### Lines

---
***
===
___

### Raw HTML

<marquee>marquee!</marquee>
<center><blink>blink!</blink></center>