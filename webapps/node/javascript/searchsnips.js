
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
	$("<h3 class='urltitle'/>").text(urlsnips.url).appendTo(urlbox);
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
	$("<span class='snippet-text'/>").text("\"..."+snip.text+"...\"").appendTo(div);
	return div;
}
	
