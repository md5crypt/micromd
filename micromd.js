/*! micromd | https://github.com/md5crypt/micromd */
/*jshint browser: true, jquery: true, devel: true, freeze:true, latedef:true, nocomma:true, nonbsp:true, nonew:true, strict:true, undef:true, unused:true*/
(function(){
"use strict";

var lookup1 = ['strong','em','del','code'];
var lookup2 = {'**':0,'__':0,'*':1,'_':1,'~~':2,'`':3,'``':3,'```':3};
function link(input){
	return input.replace(/(!?)\[([^\[\]\r\n]+?)\](?:\((.+?)\))?/gm,function(match,img,text,link){
		var src = (link||text).replace(/[*_~`]/g,function(m){
			return '\0'+m.charCodeAt(0).toString(16);
		});
		return img?'<img alt="'+text+'" src="'+src+'"/>':'<a href="'+src+'">'+(link?text:src)+'</a>';
	});
}
function styles(input){
	return input.replace(/(\*{1,2}|_{1,2}|~~|`{1,3})([^\s*~_`]|[^\s*~_`].*?[^\s*~_`])\1/gm,function(match,type,text){
		var tag = lookup1[lookup2[type]];
		return '<'+tag+'>'+text+'</'+tag+'>';
	});
}
function pp(input,nohtml){
	return styles(styles(link(link(nohtml?escapeHtml(input):input))));
}
function escapeHtml(input){
	return input.replace(/[&<>"']/g,function(m){
		return '&#'+m.charCodeAt(0)+';';
	});
}
this.micromd = function(input,nohtml,styler){
	input = input.replace(/\\[\\*_~\[\]`#>-]/g,function(m){
		return '\0'+(m.charCodeAt(1)).toString(16);
	})+'\n\n';
	var re = /^```([^\s]+)?[ \t]*\r?\n([\s\S]+?)\r?\n```$|^(#+)[ \t]*(.+)$|^([ \t]*)(\d+\.|[*-])[ \t]+(.+)$|^(>[>\t ]*)(.+)$|^(-{3,}|\*{3,})$|^[\t ]*(.*)$/gm;
	var output = '';
	var buffer = '';
	var stack = [];
	while(true){
		var m = re.exec(input);
		if(!m)
			break;
		re.lastIndex += !m[0].length;
		if(stack.length > 0 && !((m[6] && stack[0][2]!='b') || (m[8] && stack[0][2]=='b')))
			while(stack.length)
				output += stack.pop();
		if(m[11]){
			buffer += pp(m[11],nohtml)+'<br/>';
		}else{
			if(buffer){
				output += '<p>'+buffer.slice(0,-5)+'</p>';
				buffer = '';
			}
			//list: 5 - level; 6 - list type; 7 - text
			//blockquote: 8 - level; 9 - text
			if(m[6] || m[8]){
				var level = m[6]?m[5].replace(/    /g,'\t').length+1:m[8].replace(/[^>]/g,'').length;
				var tag = m[6]?(m[6].length==1?'ul':'ol'):'blockquote';
				if(m[8]&&stack.length==level)
					output += '<br/>';
				while(stack.length > level)
					output += stack.pop();
				while(stack.length < level){
					output += '<'+tag+'>';
					stack.push('</'+tag+'>');
				}
				output += m[6]?'<li>'+pp(m[7],nohtml)+'</li>':pp(m[9],nohtml);
			}if(m[2]){ //1 - language; 2 - code
				var unescaped = m[2].replace(/\0(..)/g,function(m,g){
					return '\\'+String.fromCharCode(parseInt(g,16));
				});
				output += '<pre class="language-'+(m[1]||'none')+'"><code>'+(styler?styler(m[1],unescaped):escapeHtml(unescaped))+'</code></pre>';
			}else if(m[3]){ //3 - number; 4 - text
				output += '<h'+m[3].length+'>'+pp(m[4],nohtml)+'</h'+m[3].length+'>';
			}else if(m[10]){ //10 - hr
				output += '<hr/>';
			}
		}
	}
	return output.replace(/\0(..)/g,function(m,g){
		return (g=='3e'&&nohtml)?'&gt;':String.fromCharCode(parseInt(g,16));
	});
};

}).call(this);