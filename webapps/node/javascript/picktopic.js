
function loadSnippets(){
	$.getJSON(urlbase+"/node/newsnips.js?callback=?",{},function(obj){
		showSnippets(obj);
	});
}

function loadTopics(id){
	$.getJSON("http://localhost:8180/test/test?id="+id+"&callback=?",{},function(obj){
		showTopics(obj);
	});
}

var big_right_arrow = null;


function makeTopicPicker(){
	big_right_arrow = makeBigArrow();
	loadSnippets();
	
	 window.addEventListener("resize",function(){
	 		moveArrow(selected_snippet);
	 	},true);

}

function moveArrow(snippet){
	var pos = getPos(snippet.get(0));
	big_right_arrow.css('left',pos.left + snippet.width() + 1);
	big_right_arrow.css('top',pos.top + snippet.height()/2 - big_right_arrow.height()/2);
}

function makeBigArrow(){
	var arrow = $("<img class='arrow'/>")
		.attr("src",urlbase+"/images/big_right_arrow.png")
		.css("position","absolute");
	arrow.appendTo(document.body);
	return arrow; 
}

function showTopics(obj){
	var topics = obj.to.colitem;
	var topicbox = $("#topics");
	topicbox.empty();
	for(var i = 0; i < topics.length; i++){
		topic = makePickTopic(topics[i]);
		topicbox.append(topic);
	}
	moveArrow(selected_snippet);
}


var selected_snippet = null;

function select_snippet(snippet){
	if(selected_snippet){
		selected_snippet.css("background-color","white");
	}
	selected_snippet = snippet;
	selected_snippet.css("background-color","grey");
	moveArrow(snippet);
}

function showSnippets(obj){
	var snippets = obj.to.colitem;
	var snippetbox = $("#snippets");
	snippetbox.empty();
	var toselect = null;
	for(var i = 0; i < snippets.length; i++){
		snippet = makePickSnippet(snippets[i]);
		snippetbox.append(snippet);
		if(i == 0){
			toselect = snippet;
		}
	}
	if(snippets.length > 0){
		loadTopics(snippets[0].id);
		select_snippet(toselect);
	}
}

function makePickTopic(obj){
	var id = getId();
	var icon = $("<img/>").attr("src",urlbase+"/images/folder.png");	
	var holder = $("<div class='dragholder'/>")
		.attr("tl_id",obj.id).attr("tl_cls",obj.type)
		.attr("id","holder-"+obj.id);	
	var table = $("<table class='dragtable'>").appendTo(holder);
	var tbody = $("<tbody/>").appendTo(table);
	var tr = $("<tr>").appendTo(tbody);
	var add = $("<div class='topbut'/>").text("set topic");
	var tdadd = $("<td/>").append(add).appendTo(tr);

//	var tdicon = $("<td/>").append(icon).appendTo(tr);
	
	
	var item = $("<a class='dragitem'/>")
		.attr("id",id)
		.attr("href",urlbase+"/node/"+obj.id)
		.attr("tl_id",obj.id).attr("tl_cls",obj.type)
		.click(function(ev){
			ev.preventDefault();
		})
		.text(obj.text);
	var tditem = $("<td/>").append(item).appendTo(tr);
	return holder;
}


function makePickSnippet(snippet){
	var id = getId();
	var url = snippet.info.url;
	var realurl = snippet.info.realurl;
	if(!realurl){
		realurl = url;
	}
	var holder = $("<div class='dragholder'>")
		.attr("id","holder-"+id)
		.attr("tl_id",snippet.id)
		.attr("tl_title",snippet.info.title)
		.attr("tl_url",snippet.info.url)
		.attr("tl_realurl",snippet.info.realurl)
		.attr("tl_text",snippet.text)
		.attr("tl_cls","snippet");
	;
	var table = $(
		"<table class='dragtable'>"
			+"<tr><td><img/></td><td><div class='snipbody'/></td></tr>"
		+"</table>").appendTo(holder);	
	var img = $("<img/>").attr("src",urlbase+"/images/application_go.png");
	var link = $("<a/>").append(img)
		.attr("href",realurl).attr("target","_blank");
	table.find("img").attr("src",urlbase+"/images/comment.png");
	var snipbody = table.find(".snipbody");
	$("<div class='sniptext'/>")
		.text("... "+snippet.text.substring(0,200)+" ...")
		.append(link)
		.appendTo(table.find(".snipbody"));
	$("<span class='snippet_url'/>").text(trim_string(snippet.info.title,40) + " - "+trim_url(url))
		.appendTo(table.find(".snipbody"));
	
	holder.click(function(ev){
		select_snippet(holder);
		loadTopics(snippet.id);
	});
	
	return holder;
}	
