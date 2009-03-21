
var big_right_arrow = null;
var panelbox = null;
var topbar = null;

var widthpad = null;
var global_miniui = true;

function makeUI(id,withtop){
	if(withtop){
		topbar = makeTopBar();
		global_miniui = false;
	}
	if(!id){
		id = "recent.js";
	}
	$(document.body).append(topbar);
	panelbox = $("<tr class='panelbox'/>");
	$(document.body).append($("<table class='toptable'>").append(panelbox));
	widthpad = $("<div class='widthpad'/>").appendTo(document.body);	
	getPanel(0,id);
	if(global_miniui){
		$(".toptable").css("margin-top",0);
	}else{
		$(window).resize(doLayout);
		doLayout();
	}
}

function doLayout(){
	if(global_miniui) return;
	$(".panelbody").height(window.innerHeight - 90 + "px");
}

function makeTopBar(){
	var topbar = $("<div class='topbar'/>");

	var leftbar = $("<div class='leftbar'/>").appendTo(topbar);
	
	var title = $("<span class='thinklinktitle'>Think Link</span>").appendTo(leftbar);
	
	var home = $("<span class='topbut'>Home</span>").appendTo(leftbar);
	var hot = $("<span class='topbut'>Hot</span>").appendTo(leftbar);
		// TODO - show count beside unfiled if have unfiled snippets
	var unfiled = $("<span class='topbut'>Unfiled</span>")
		.click(function(){
			gotoId("newsnips.js");
		})
		.appendTo(leftbar);
	var me = $("<span class='topbut'>Profile</span>").appendTo(leftbar);
	var recent = $("<span class='topbut'>History</span>")
		.click(function(){
			gotoId("recent.js");
		})
		.appendTo(leftbar);
	var friends = $("<span class='topbut'>Friends</span>").appendTo(leftbar);

	var rightbar = $("<div class='rightbar'/>").appendTo(topbar);


	var searchbox = $("<input class='searchbox'/>")
		.keydown(function(ev){
			if(ev.keyCode == 13){
				gotoId("search.js?callback=?&query="+encodeURIComponent(searchbox.val()));
			}
		})
		.appendTo(rightbar);
	var searchbut = $("<img class='searchbut'/>")
		.attr("src",iconUrl("magnifier"))
		.click(function(){
			gotoId("search.js?callback=?&query="+encodeURIComponent(searchbox.val()));
		})
		.appendTo(rightbar);
	
	return topbar;
}

function gotoId(id){
	removeArrows(0);
	getPanel(0,id);
}

function getPanel(panelnum,nodeid,name){
	if($(".toptable").width() > widthpad.width()){
		widthpad.css("width",$(".toptable").width());
	}
	
	for(var i = panelnum; $("#panel-"+i).length != 0; i++){
		$("#panel-"+i).remove();		
	}
	panel = makePanel(panelnum,nodeid,name);
	panelbox.append(panel);
	doLayout();
}

function removeArrows(panelnum){
	for(var i = panelnum; $("#arrow-"+i).length != 0; i++){
		$("#arrow-"+i).remove();		
	}	
}

function makeArrow(panelnum,item){
	removeArrows(panelnum);
	var pos = GetElementAbsolutePos(item.get(0));
	var arrow = $("<td class='arrow'>")
		.attr("id","arrow-"+panelnum)
		.css("padding-top",pos.y + item.height()/2 - 60);
	arrow.append($("<img/>").attr("src",iconUrl("big_right_arrow")));
	return arrow;	
}

function updateArrowPos(panelnum){
	var item = selection[panelnum];
	var arrow = $("#arrow-"+panelnum);
	if(item && arrow){
		var pos = GetElementAbsolutePos(item.get(0));
		arrow.css("padding-top",pos.y + item.height()/2 - 60);				
	}
}


function makePanel(panelnum,nodeid,name){
	var panel = $("<td class='panel'/>").attr("id","panel-"+panelnum);
	$("<div class='filler'>Loading...</div>").appendTo(panel);
	loadObject(panel,nodeid,panelnum,name);
	return panel;
}

function loadObject(panel,nodeid,panelnum,name){
	var url;
	if(nodeid.indexOf("?") == -1){
		url = urlbase+"node/"+nodeid+"?callback=?";
	}else{
		url = urlbase+"node/"+nodeid+"&callback=?";
	}
	if(nodeid == "0.js"){ // wikipedia-only topic
		panel.empty();
		panel.append(makeWikiInfo(name,panelnum));	
		panel.attr("class","wikipanel");	
	}else{
		$.getJSON(url,function(obj){
			panel.empty();
			panel.append(makeInfo(obj,panelnum));
		});	
	}
}

var verbs = ["supports","opposes","relates to","colitem"];

function removeParent(list,panelnum){
	if(!list){return null;};
	var newlist = [];
	for(var i = 0; i < list.length; i++){
		var item = list[i];
		if(item.id != selectionid[panelnum-2]){
			newlist.push(item);			
		}
	}
	return newlist;
}

function makeWikiInfo(name,panelnum){
	var info = $("<div class='info'/>");
	
	info.append(makeNavButtons(panelnum));
	
	$("<h2>Wikipedia Topic</h2>")
		.click(function(){
			scrollToPanel(panelnum);
		})
		.appendTo(info);
	var iframe = $("<iframe class='wikiframe'/>")
		.attr("height",	$(".toptable").height())
		.attr("src","http://en.wikipedia.org/wiki/"+name)
		.appendTo(info);		
	return info;
}

function makeNavButtons(panelnum){
	var navbuttons = $("<div class='navbutons'/>");
	var left = $("<img class='navleft'/>").attr("src",iconUrl("resultset_previous"))
		.click(function(){
			scrollToPanel(panelnum-1);
		})
		.appendTo(navbuttons);
	var right = $("<img class='navright'/>").attr("src",iconUrl("resultset_next"))
		.click(function(){
			scrollToPanel(panelnum+1);
		})
		.appendTo(navbuttons);

	return navbuttons;
}

function filterByType(list,type){
	var out = [];
	if(!list) return [];
	for(var i = 0; i<list.length;i++){
		var item = list[i];
		if(item.type == type){
			out.push(item);
		}
	}
	return out;
}

function makeInfo(obj,panelnum){
	var info = $("<div class='info'/>");
		
	//if(!global_miniui){	
		info.append(makeNavButtons(panelnum));
	//}

	var title;
	if(obj.type == "recent"){
		title = $("<h2/>").append("History").appendTo(info);
	}else if(obj.opposed){
		title = $("<h2 class='disputed-title'/>").append("disputed claim").appendTo(info);
	}else{
		title = $("<h2/>").append(obj.type).appendTo(info);
	}

	var body = $("<div class='panelbody'>").appendTo(info);
	if(global_miniui){
		body.css("height","400px");
		body.css("overflow-y","auto");	
	}
	
	body.scroll(function(){
		updateArrowPos(panelnum);
	});

	
	title.click(function(){
		scrollToPanel(panelnum);
	});
	
	if(obj.type == "snippet"){
		$("<div class='snippet-text'/>").text("\"..."+obj.text+"...\"").appendTo(body);	
		$("<a class='snippet-url' target='_blank'/>")
			.attr("href",obj.info.realurl)
			.text(obj.info.realurl)
			.appendTo(body);
	}else{
		$("<div class='objtitle'/>").text(obj.text).appendTo(body);	
	}
		
	//obj.from.supports = removeParent(obj.from.supports,panelnum);
	//obj.from.opposes = removeParent(obj.from.opposes,panelnum);
	//obj.from['relates to'] = removeParent(obj.from['relates to'],panelnum);
			

	if(obj.type == "snippet" || obj.type == "claim" || obj.type == "topic"){		
		body.append(makeUserLink(obj,panelnum));
	}
	
	var relates = [];
	if(obj.to['relates to']){
		relates = relates.concat(obj.to['relates to']);
	}
	if(obj.from['relates to']){
		relates = relates.concat(obj.from['relates to']);
	}
	
	switch(obj.type){
		case "snippet":		
			body.append(makeSubGroup("claims supported",obj.from.supports,panelnum));
			body.append(makeSubGroup("claims opposed",obj.from.opposes,panelnum));
			body.append(makeSubGroup("claims related",relates,panelnum));
			body.append(makeSubGroup("related topics",obj.from.about,panelnum));
			break;
		case "topic":
			var claims = filterByType(obj.to.about,"claim");
			var snippets = filterByType(obj.to.about,"snippet");
			body.append(makeSubGroup("claims about this topic",claims,panelnum));
			body.append(makeSubGroup("snippets about this topic",snippets,panelnum));
			body.append(makeSubGroup("related topics",relates,panelnum));
			break;
		case "claim":
			body.append(makeSubGroup("supported by",obj.to.supports,panelnum));
			body.append(makeSubGroup("opposed by",obj.to.opposes,panelnum));
			body.append(makeSubGroup("related to",relates,panelnum));
			body.append(makeSubGroup("supporting snippets",obj.to.prosnips,panelnum));
			body.append(makeSubGroup("opposing snippets",obj.to.consnips,panelnum));
			body.append(makeSubGroup("related snippets",obj.to.aboutsnips,panelnum));
			body.append(makeSubGroup("related topics",obj.from.about,panelnum));
			break;
		default:
			body.append(makeSubGroup(null,obj.to.colitem,panelnum));
			break;

	}
	
	var add = $("<div class='addbox'><span class='addhdr'>add</span></div>").appendTo(body);;
	var addpanel = $("<div class='addpanel'/>");
	if(obj.type == "claim"){
		add.append(makeAdder("topic","topic","about",false,addpanel,obj,panelnum));
		add.append($("<br/>"));
		add.append(makeAdder("supporting claim","claim","supports",true,addpanel,obj,panelnum));
		add.append(makeAdder("opposing claim","claim","opposes",true,addpanel,obj,panelnum));
		add.append(makeAdder("related claim","claim","relates to",true,addpanel,obj,panelnum));
		add.append($("<br/>"));
		add.append(makeAdder("supporting snippet","snippet","supports",true,addpanel,obj,panelnum));
		add.append(makeAdder("opposing snippet","snippet","opposes",true,addpanel,obj,panelnum));
		add.append(makeAdder("related snippet","snippet","about",true,addpanel,obj,panelnum));
		add.append($("<br/>"));
		add.append(makeAdder("claim this supports","claim","supports",false,addpanel,obj,panelnum));
		add.append(makeAdder("claim this opposes","claim","opposes",false,addpanel,obj,panelnum));
	}else if(obj.type == "snippet"){
		add.append(makeAdder("topic","topic","about",false,addpanel,obj,panelnum));
		add.append(makeAdder("claim this supports","claim","supports",false,addpanel,obj,panelnum));
		add.append(makeAdder("claim this opposes","claim","opposes",false,addpanel,obj,panelnum));
		add.append(makeAdder("related claim","claim","relates to",false,addpanel,obj,panelnum));
	}else if(obj.type == "topic"){
		add.append(makeAdder("related topic","topic","relates to",false,addpanel,obj,panelnum));
		add.append(makeAdder("related claim","claim","about",true,addpanel,obj,panelnum));
		add.append(makeAdder("related snippet","snippet","about",true,addpanel,obj,panelnum));
	}

	addpanel.appendTo(body);

	//if(obj.type == "snippet" && obj.info && obj.info.url){
	//var iframe = $("<iframe class='snipframe'/>")
		//.attr("height",	$(".toptable").height())
		//.attr("src",obj.info.url)
		//.appendTo(info);		
	//}
	
	return info;
}

function makeAdder(title,type,verb,reverse,panel,obj,panelnum){
	var callback = function(othertxt){	
		$.post(urlbase+"node/"+obj.id+"/addlink.js?verb="+verb+
			"&type="+type+"&text="+othertxt+"&reverse="+reverse,function(){
				getPanel(panelnum,obj.id+'.js',null);
		});
	};
	
	var adder = $("<span class='adder'/>").text(title)
		.click(function(){
			panel.empty();
			if(adder.attr("class") == "adder-selected"){
				adder.attr("class","adder");
				return;
			}
			
			adder.parent().find(".adder-selected").attr("class","adder");
			adder.attr("class","adder-selected");
			var textbox = $("<input class='addtxt' type='text'>").appendTo(panel);
			var gobut = $("<input class='addbutton' type='button' value='add'>")
				.click(function(){
					callback(textbox.val());
				})
				.appendTo(panel);

			textbox.keyup(function(){
				var text = textbox.val();
				setTimeout(function(){
					var nowtext = textbox.val();
					if(text == nowtext){
						if(type=="topic"){
							updateTopicSuggestions(panel,text,
								panelnum,"suggested topics",obj,callback);
						}else{
							updateSuggestions(panel,
								urlbase+"node/search.js?type="+type+"&callback=?&query="+encodeURIComponent(text),
								panelnum,"suggested "+type+"s",obj,callback);
						}
					}
				},500);
			});

			if(type == "topic"){
				updateSuggestions(panel,
					"http://localhost:8180/test/test?id="+obj.id+"&callback=?",
					panelnum,"suggested topics",obj,callback);
			}else{ // crappy suggestions for the moment
				updateSuggestions(panel,
					"http://localhost:8180/thinklink/node/search.js?type=claim&query="+encodeURIComponent(obj.text)+"&callback=?",
					panelnum,"suggested claims",obj,callback);
			}
		});
	
	return adder;
}

function mergeSuggestions(lists){
	var hsh = {};
	var out = [];
	for(var i = 0; i < lists.length; i++){
		for(var j = 0; j < lists[i].length; j++){
			var item = lists[i][j];
			if(!hsh[item.text]){
				hsh[item.text] = true;
				out.push(item);
			}
		}
	}
	return out;
}

function updateTopicSuggestions(panel,text,panelnum,title,obj,callback){
	var searchurl = urlbase+"node/search.js?type=topic&callback=?&query="+encodeURIComponent(text);
	var wikiurl = "http://localhost:8180/test/test?text="+text+"&callback=?";
	$.getJSON(searchurl,function(xs){
		$.getJSON(wikiurl,function(ys){
			panel.find(".suggestions").remove();
			panel.find(".sugghdr").remove();
			var sugs = mergeSuggestions([xs.to.colitem,ys.to.colitem]);
			$("<div class='sugghdr'/>").text(title).appendTo(panel);
			panel.append(makeSuggestor(obj,{to:{colitem:sugs}},panelnum,callback));	
		});
	});
					
	
}

function updateSuggestions(panel,url,panelnum,title,obj,callback){
	panel.find(".suggestions").remove();
	panel.find(".sugghdr").remove();
	$.getJSON(url,function(sugs){
		$("<div class='sugghdr'/>").text(title).appendTo(panel);
		panel.append(makeSuggestor(obj,sugs,panelnum,callback));
	});
}

function makeSuggestor(obj,topics,panelnum,callback){
	var box = $("<div class='suggestions'/>");
	var topics = topics.to.colitem;
	for(var i = 0; i < topics.length; i++){ // TODO: allow this to be expanded
		box.append(makeSuggestion(topics[i],panelnum,callback));
	}
	return box;
}

function makeSubGroup(subtitle,links,panelnum){
	var group = $("<div class='subgroup'>").appendTo(group);
	if(links && links.length > 0){
		if(subtitle && subtitle != "colitem"){
			$("<h3/>").text(subtitle).appendTo(group);
		}
		for(var j = 0; j < links.length; j++){
			group.append(makeLink(links[j],panelnum));
		} 
	} 
	return group;
}

function makeSuggestion(obj,panelnum,callback){
	var item = $("<a class='item'/>")
		.attr("href",urlbase+"node/"+obj.id)
		.attr("tl_panel",panelnum)
		.click(function(ev){
			ev.preventDefault();
			selectItem(item,obj.id,panelnum,obj.text);
			return false;
		});
	
	var add = $("<span class='greenadd'>add</span>")
		.css('font-size','13px')
		.click(function(ev){
			ev.preventDefault(); ev.stopPropagation();			
			callback(obj.text);
		});

	var text = $("<span/>").css('font-size','13px').text(obj.text);
	item.append(makeHBox([add,text],"linkbox"));
	
	return item;
}

function makeUserLink(obj,panelnum){
	var item = $("<a class='item'/>")
		.attr("href",urlbase+"user/"+obj.user_id)
		.click(function(ev){
			ev.preventDefault();
			selectItem(item,obj.user_id,panelnum,obj.username);
			return false;
		});		

	item.append($("<span class='createdby'>created by </span>"));	
	
	item.append($("<span class='username'/>").text(obj.username));

	return item;		
}

function trim_url(url){
	m = url.match(/http:\/\/(www.)?([^\/]*)/);
	if(m){
		return m[2];
	}else{
		return url;
	}		
}

function makeLink(obj,panelnum,suggestcb){
	var item = $("<a class='item'/>")
		.attr("href",urlbase+"node/"+obj.id)
		.attr("tl_panel",panelnum)
		.click(function(ev){
			ev.preventDefault();
			selectItem(item,obj.id,panelnum);
			return false;
			});		
	
	var icon = $("<img class='icon'/>").attr("src",getIcon(obj));				
		// TODO: fix bug that requires explicit CSS here
	var text;
	if(obj.type == "snippet"){
		text = $("<span class='snippet-text'/>").text("\"..."+obj.text.substring(0,160)+"...\"");	
	}else{
		text = $("<span/>").css('font-size','13px').text(obj.text);
	}
	item.append(makeHBox([icon,text],"linkbox"));
	
	if(obj.type == "snippet" && obj.info && obj.info.url){
		var site = $("<span class='snipshorturl'/>").text(trim_url(obj.info.url));
		site.appendTo(text);		
	}
	
	var votebox = $("<nobr class='votebox'/>").appendTo(text);
	
	var up = $("<img class='vote' title='Promote'/>").attr("src",iconUrl("vote_up_e"))
		.mouseover(function(){up.attr("src",iconUrl("vote_up_on"))})
		.mouseout(function(){up.attr("src",iconUrl("vote_up_e"))})
		.click(function(ev){
			ev.preventDefault(); ev.stopPropagation();			
		})
		.appendTo(votebox);		

	var down = $("<img class='vote' title='Remove'/>").attr("src",iconUrl("vote_down_e"))
		.mouseover(function(){down.attr("src",iconUrl("vote_down_on"))})
		.mouseout(function(){down.attr("src",iconUrl("vote_down_e"))})
		.click(function(ev){
			ev.preventDefault(); ev.stopPropagation();			
		})
		.appendTo(votebox);		
	
	return item;
}

function iconUrl(icon){
	return urlbase+"images/"+icon+".png";
}

function getIcon(obj){
	if(obj.icon){
		return obj.icon;
	}
	switch(obj.type){
		case "claim":
			if(obj.opposed){
				return iconUrl("exclamation");
			}else{
				return iconUrl("lightbulb");
			}
		case "snippet":
			return iconUrl("comment");
		case "topic":
			return iconUrl("folder");
		case "user":
			return iconUrl("user");
	}
}
	

var selection = {};
var selectionid = {};

function selectItem(item,id,panelnum,text){
	try{
		if($(".toptable").width() > widthpad.width()){
			widthpad.css("width",$(".toptable").width());
		}
			
		if(selection[panelnum] == item){
			scrollToPanel(panelnum+1);
			return;
		}
		item.attr("class","item-selected");
		if(selection[panelnum]){
			selection[panelnum].attr("class","item");
		}
		selection[panelnum] = item;
		selectionid[panelnum] = id;
		panelbox.append(makeArrow(panelnum,item));
		getPanel(panelnum+1,""+id+".js",text);
		scrollToPanel(panelnum+1);
	}catch(ex){
		console.error(ex);
	}
}

function scrollToPanel(panelnum){
	var panel = $("#panel-"+panelnum);
	var pos = getPos(panel.get(0));
	var width = document.documentElement.clientWidth;
	if(window.scrollX > pos.left - 16){  // clipped off the left
		$('html,body').animate({scrollLeft: pos.left-16},500);
	}
	if(window.scrollX + width < pos.left + panel.width() + 16){ // clipped off the right	
		$('html,body').animate({scrollLeft: pos.left + panel.width() + 16 - width},500);
	}
	
}

function getParentWithClass(node,classname){
	while(node != null && node.getAttribute){
		if(node.className == classname){
			return node;
		}
		node = parentNode;
	}
}

function makeHBox(items,classname){
	var table = $("<table/>");
	if(classname){
		table.attr("class",classname);
	}
	var tr = $("<tr/>").appendTo(table);
	for(var i = 0; i < items.length; i++){
		var td = $("<td/>").append(items[i]).appendTo(tr);
	}
	return table;
}

function getPos(node){
	var left = 0;
	var top = 0;
	while(node){
		left += node.offsetLeft;
		top += node.offsetTop;
		node = node.offsetParent;
	}
	return {left:left,top:top};
}

function invertVerb(verb,text,type){
	switch(verb){
		case "about": return "claims about "+text;
		case "refines": return "more specific topics";
		case "opposes": return "opposed by";
		case "supports": return "supported by";
		case "relates to": return "relates to";
		case "states": 
			if(type == "claim"){
				return "snippets making this claim";
			}else{
				return "snippets about this topic";
			}
		case "related": return "related";
		case "colitem": return "colitem";
		case "created by": return "created";
	}	
	return "";
}

function tl_log(msg){		
	if(typeof console !== "undefined"){
		console.log(msg);
	}
}

var __isFireFox = true;

function GetElementAbsolutePos(element) {  
    var res = new Object();  
    res.x = 0; res.y = 0;  
    if (element !== null) {  
        res.x = element.offsetLeft;   
        res.y = element.offsetTop;   
          
        var offsetParent = element.offsetParent;  
        var parentNode = element.parentNode;  
  
        while (offsetParent !== null) {  
            res.x += offsetParent.offsetLeft;  
            res.y += offsetParent.offsetTop;  
  
            if (offsetParent != document.body && offsetParent != document.documentElement) {  
                res.x -= offsetParent.scrollLeft;  
                res.y -= offsetParent.scrollTop;  
            }  
            //next lines are necessary to support FireFox problem with offsetParent  
            if (__isFireFox) {  
                while (offsetParent != parentNode && parentNode !== null) {  
                    res.x -= parentNode.scrollLeft;  
                    res.y -= parentNode.scrollTop;  
                      
                    parentNode = parentNode.parentNode;  
                }      
            }  
            parentNode = offsetParent.parentNode;  
            offsetParent = offsetParent.offsetParent;  
        }  
    }  
    return res;  
}  
