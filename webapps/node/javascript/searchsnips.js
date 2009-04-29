
var searchurl = "/thinklink/snipsearch/search.js"

function searchSnippets(target,str){
	$.getJSON(searchurl+"?callback=?&claimstr="+str,function(results){
		target.empty();
		for(var i = 0; i < results.length; i++){
			target.append(makeUrlSnippets(target,results[i]))
		}
	})
}

function makeUrlSnippets(target,urlsnips){
	if(!urlsnips) return;
	var urlbox = $("<div class='urlbox'>");
	$("<h3 class='urltitle'/>").text(urlsnips.title).appendTo(urlbox);
	$("<a class='snippet-url'/>").text(urlsnips.url).attr("href",urlsnips.url).appendTo(urlbox);
	if(urlsnips.snips){
		for(var i = 0; i < urlsnips.snips.length; i++){
				urlbox.append(makeFoundSnippet(urlsnips.snips[i]));
		}
	}else if(urlsnips.error){
		$("<span class='errormsg'/>").text(urlsnips.error).appendTo(urlbox);
	}	
	return urlbox;
}

function makeFoundSnippet(snip){	
	var div = $("<div class='snippet-box'/>");
	var add = $("<span class='greenadd'>add</span>")
		.click(function(){
			div.css("opacity",1);
			div.css("background-color","#EEFFEE");
			div.animate({borderWidth:"5px"},500);
		});
	var ignore = $("<span class='redbutton'>ignore</span>")
		.click(function(){
			div.animate({opacity:0.5},200);
			div.css("border-width",1);
		});
	div.append(makeHBox([makeSnipContext(snip),add,ignore]));
	return div;
}
	
function makeSnipContext(snip){
	var context = $("<div class='snippet-context-finder'/>");	
	if(!snip.pagetext){
		$("<div class='snippet-text'/>").text("\"..."+snip.text+"...\"").appendTo(context);					
		return context;
	}

	addSnippetHighlight(context,snip.text,snip.pagetext);
	
	context.mouseup(function(){
		var sel = window.getSelection();
		var selstr = sel.toString();
		if(sel.anchorNode.parentNode.parentNode == context.get(0)){
			context.empty();
			addSnippetHighlight(context,selstr,snip.pagetext);
		}
	});
	
	return context;
}

function addSnippetHighlight(context,snip,pagetext){
	pagetext = pagetext.replace(/\n[\s\n]+/g,"\n");
	snip = snip.replace(/\n[\s\n]+/g,"\n");
	
	var startpos = pagetext.indexOf(snip);
	var prevtext = pagetext.substring(0,startpos);
	var aftertext = pagetext.substring(startpos + snip.length);
	insertParagraphs(context,prevtext,'context-span');
	insertParagraphs(context,snip,'highlight-span');
	insertParagraphs(context,aftertext,'context-span');
}

