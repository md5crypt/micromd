# Micromd -- a 1.8kB Markdown parser
see it parsing this document here: [https://md5crypt.github.io/micromd]
```javascript
(function(){"use strict";function e(e){return e.replace(/(!?)\[([^\[\]\r\n]+?)\](?:\((.+?)\))?/gm,function(e,r,n,t){var c=(t||n).replace(/[*_~`#=-]/g,function(e){return"\\"+e.charCodeAt(0).toString(16)});return r?'<img alt="'+n+'" src="'+c+'"/>':'<a href="'+c+'">'+(t?n:c)+"</a>"})}function r(e){return e.replace(/(\*{1,2}|_{1,2}|~~|`{1,3})([^\s*~_`]|[^\s*~_`].*?[^\s*~_`])\1/gm,function(e,r,n){var t=c[l[r]];return"<"+t+">"+n+"</"+t+">"})}function n(n){return r(r(e(e(n))))}function t(e){return e.replace(/[&<>"']/g,function(e){return"&#"+e.charCodeAt(0)+";"})}var c=["strong","em","del","code"],l={"**":0,__:0,"*":1,_:1,"~~":2,"`":3,"``":3,"```":3};this.micromd=function(e){e=e.replace(/\\[\\*_~\[\]`#=-]/g,function(e){return"\\"+e.charCodeAt(1).toString(16)})+"\n\n";for(var r=/^`{3}([^\s]+)?\s*\n([\s\S]+?)\n`{3}$|^(#+)\s*(.+)$|^([ \t]*)(\d+.|\*)\s+(.+)$|^(>[>\t ]*)(.+)$|^(-{3,}|_{3,}|\*{3,}|={3,}[\t ]*$)|^[\t ]*(.*)$/gm,c="",l="",o=[];;){var a=r.exec(e);if(!a)break;if(r.lastIndex+=!a[0].length,o.length>0&&!(a[6]&&"b"!=o[0][2]||a[8]&&"b"==o[0][2]))for(;o.length;)c+=o.pop();if(a[11])l+=a[11]+"<br/>";else{if(l&&(c+=n("<p>"+l.slice(0,-5)+"</p>"),l=""),a[6]||a[8]){var g=a[6]?a[5].replace(/    /g,"\t").length+1:a[8].replace(/[^>]/g,"").length,u=a[6]?1==a[6].length?"ul":"ol":"blockquote";for(a[8]&&o.length==g&&(c+="<br/>");o.length>g;)c+=o.pop();for(;o.length<g;)c+="<"+u+">",o.push("</"+u+">");c+=n(a[6]?"<li>"+a[7]+"</li>":a[9])}a[2]?c+='<pre class="language-'+(a[1]||"none")+'"><code>'+t(a[2]).replace(/\\/g,"\\5c\\")+"</code></pre>":a[3]?c+=n("<h"+a[3].length+">"+a[4]+"</h"+a[3].length+">"):a[10]&&(c+="<hr/>")}}return c.replace(/\\(..)/g,function(e,r){return String.fromCharCode(parseInt(r,16))})}}).call(this);
```

## Usage

```javascript
var html = micromd('**strong!**');
// html == "<p><strong>strong</strong></p>"
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

#### without language specification (class `language-none`):
```
**bold** and __bold__
*italic* and _italic_
~~this thing~~
`code` ``code`` ```code```
*mixing `stuff` __bold__ italic*
escaping \*things\* \[like this\] and a slash \\
```

#### with language specification (class `language-lisp`):
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