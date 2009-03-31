
var big_right_arrow = null;
var global_panelbox = null;
var topbar = null;

var widthpad = null;
var global_miniui = true;

function makeUI(id,withtop){
	if(withtop){
		topbar = makeTopBar();
		global_miniui = false;
	}
	if(!id){
		id = "hot.js";
	}
	$(document.body).append(topbar);
	global_panelbox = $("<tr class='panelbox'/>");
	$(document.body).append($("<table class='toptable'>").append(global_panelbox));
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
	$(".panelbody").css("max-height",window.innerHeight - 90 + "px");
}

function makeTopBar(){
	var topbar = $("<div class='topbar'/>");

	var leftbar = $("<div class='leftbar'/>").appendTo(topbar);
	
	var title = $("<span class='thinklinktitle'>Think Link</span>").appendTo(leftbar);
	
	var home = $("<span class='topbut'>Home</span>").appendTo(leftbar);
	var hot = $("<span class='topbut'>Hot</span>")
		.click(function(){
			gotoId("hot.js");
		})
		.appendTo(leftbar);
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

	var searchbox = $("<input class='searchbox-empty' value='Search'/>")
		.focus(function(){
			if(searchbox.attr("class") == "searchbox-empty"){
				searchbox.val("");
				searchbox.attr("class","searchbox");
			}
		})
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
	scrollToPanel(0);
}

function getPanel(panelnum,nodeid,name){
	if($(".toptable").width() > widthpad.width()){
		widthpad.css("width",$(".toptable").width());
	}
	
	for(var i = panelnum; $("#panel-"+i).length != 0; i++){
		$("#panel-"+i).remove();		
	}
	panel = makePanel(panelnum,nodeid,name);
	global_panelbox.append(panel);
	doLayout();
}

function refreshPanel(panelnum,nodeid,name){
	var url = makePanelUrl(nodeid,name);
	$.getJSON(url,function(obj){
		refreshInfoPanel($("#infopanel-"+panelnum),obj,panelnum);
		updateSnipScrollPos(panelnum);
	});	
}

function removeArrows(panelnum){
	for(var i = panelnum; $("#arrow-"+i).length != 0; i++){
		$("#arrow-"+i).remove();		
		$("#panel-"+(i+1)).remove();		
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

function makePanelUrl(nodeid,name){
	var url;
	if(nodeid.indexOf("?") == -1){
		url = urlbase+"node/"+nodeid+"?callback=?";
	}else{
		url = urlbase+"node/"+nodeid+"&callback=?";
	}
	return url;	
}

function loadObject(panel,nodeid,panelnum,name){
	var url = makePanelUrl(nodeid,name);
	if(nodeid == "0.js"){ // wikipedia-only topic
		panel.empty();
		panel.append(makeWikiInfo(name,panelnum));	
		panel.attr("class","wikipanel");	
	}else{
		$.getJSON(url,function(obj){
			panel.empty();
			panel.append(makeInfo(obj,panelnum));
			updateSnipScrollPos(panelnum);
			updateWidthPad();
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
		.attr("src","http://en.wikipedia.org/wiki/"+name+"?printable=yes")
		.appendTo(info);		
	return info;
}

function makeNavButtons(panelnum){
	var navbuttons = $("<div class='navbutons'/>");
	var left = $("<img class='navleft'/>").attr("src",iconUrl("arrow_left6"))
		.click(function(){
			scrollToPanel(panelnum-1);
		})
		.appendTo(navbuttons);
	var right = $("<img class='navright'/>").attr("src",iconUrl("arrow_right6"))
		.click(function(){
			scrollToPanel(panelnum);
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

var global_myvotes = {};

function getMyVote(link){
	var myvote = global_myvotes[link.link_id];
	if(myvote){
		return myvote;
	}else{
		return 0;
	}
}

function applyMyVotes(obj){
	if(!obj.uservotes) return;
	for(var i = 0; i < obj.uservotes.length; i++){
		var entry = obj.uservotes[i];
		global_myvotes[entry.link_id] = entry.vote;
	}		
}

function orderByVotes(list){
	if(!list) return [];
	list.sort(function(a,b){
		if(getMyVote(a) != getMyVote(b)){
			return getMyVote(b) - getMyVote(a);
		}else{
			return b.agg_votes - a.agg_votes;
		}
	});
	return list;
}

function insertParagraphs(context,text,classname){
	var paras = text.split("\n");
	for(var i = 0; i < paras.length; i++){
		if(i != 0){
			context.append($("<br class='context-br'/>"));
		}
		context.append($("<span/>")
			.attr("class",classname)
			.text(paras[i]));
	}
}

function makeSnippetContext(obj,panelnum){
	var pagetext = obj.page_text;
	var context = $("<div class='snippet-context'/>");
		
	if(!pagetext){
		$("<div class='snippet-text'/>").text("\"..."+obj.text+"...\"").appendTo(context);					
		return context;
	}
	
	pagetext = pagetext.replace(/\n[\s\n]+/g,"\n");
	obj.text = obj.text.replace(/\n[\s\n]+/g,"\n");
	
	var startpos = pagetext.indexOf(obj.text);
	var prevtext = pagetext.substring(0,startpos);
	var aftertext = pagetext.substring(startpos + obj.text.length);
	insertParagraphs(context,prevtext,'context-span');
	var highlight = $("<span/>").attr("id","highlight-"+panelnum).appendTo(context);
	insertParagraphs(highlight,obj.text,'highlight-span');
	insertParagraphs(context,aftertext,'context-span');
	
	// TODO: do this properly
	 //var scrollpos = 200 * (startpos.length / pagetext.length);
	return context;
}

function updateSnipScrollPos(panelnum){
	var highlight = $("#highlight-"+panelnum).get(0);
	if(highlight){
		highlight.parentNode.scrollTop = highlight.offsetTop - 100;
	}
}

function refreshInfoPanel(infopanel,obj,panelnum){
	infopanel.empty();
	applyMyVotes(obj);
	
	if(obj.opposed){
		$("#title-"+panelnum).attr("class","disputed-title")
	}	
	if(obj.type == "snippet"){
		if(obj.info && obj.info.title){
			$("<div class='sniptitle'/>").text(obj.info.title).appendTo(infopanel);
		}
		infopanel.append(makeSnippetContext(obj,panelnum));
		//$("<div class='snippet-text'/>").text("\"..."+obj.text+"...\"").appendTo(infopanel);	
		$("<a class='snippet-url' target='_blank'/>")
			.attr("href",obj.info.realurl)
			.text(obj.info.realurl)
			.appendTo(infopanel);
	}else if(obj.type == "hot" || obj.type == "recent"){
	}else{
		$("<div class='objtitle'/>").text(obj.text).appendTo(infopanel);	
	}

	if(obj.type == "snippet" || obj.type == "claim" || obj.type == "topic"){		
		infopanel.append(makeUserLink(obj,panelnum));
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
			infopanel.append(makeSubGroup("claims this snippet supports",obj.from.supports,panelnum,obj,'supports'));
			infopanel.append(makeSubGroup("claims this snippet opposes",obj.from.opposes,panelnum,obj,'opposes'));
			infopanel.append(makeSubGroup("claims this snippet relates to",relates,panelnum,obj));
			infopanel.append(makeSubGroup("topics this snippet is about",obj.from.about,panelnum,obj));
			break;
		case "topic":
			var claims = filterByType(obj.to.about,"claim");
			var snippets = filterByType(obj.to.about,"snippet");
			infopanel.append(makeSubGroup("claims about this topic",claims,panelnum,obj));
			infopanel.append(makeSubGroup("snippets about this topic",snippets,panelnum,obj));
			infopanel.append(makeSubGroup("related topics",relates,panelnum,obj));
			break;
		case "claim":
			infopanel.append(makeSubGroup("supported by",obj.to.supports,panelnum,obj,'supports'));
			infopanel.append(makeSubGroup("opposed by",obj.to.opposes,panelnum,obj,'opposes'));
			infopanel.append(makeSubGroup("related to",relates,panelnum,obj));

			//infopanel.append(makeSubGroup("supporting claims",filterByType(obj.to.supports,"claim"),panelnum,obj));
			//infopanel.append(makeSubGroup("opposing claims",filterByType(obj.to.opposes,"claim"),panelnum,obj));
			//infopanel.append(makeSubGroup("related claims",relates,panelnum,obj));
			//infopanel.append(makeSubGroup("supporting snippets",obj.to.supports,panelnum,obj));
			//infopanel.append(makeSubGroup("opposing snippets",obj.to.opposes,panelnum,obj));
			//infopanel.append(makeSubGroup("related snippets",relates,panelnum,obj));
			infopanel.append(makeSubGroup("related topics",obj.from.about,panelnum,obj,'relates to'));
			break;
		case "hot":
			infopanel.append(makeSubGroup("hot topics",filterByType(obj.to.colitem,"topic"),panelnum,obj));
			infopanel.append(makeSubGroup("hot claims",filterByType(obj.to.colitem,"claim"),panelnum,obj));			
			break;
		case "recent":
			infopanel.append(makeSubGroup("recent topics",filterByType(obj.to.colitem,"topic"),panelnum,obj));
			infopanel.append(makeSubGroup("recent claims",filterByType(obj.to.colitem,"claim"),panelnum,obj));			
			break;
		default:
			infopanel.append(makeSubGroup(null,obj.to.colitem,panelnum,obj,null,true));
			break;
	}
}

function makeInfo(obj,panelnum){
	global_morefor = 0;
	
	var info = $("<div class='info'/>");

	if(panelnum != 0){
		info.append(makeNavButtons(panelnum));	
		var closebutton = $("<img class='closebutton'/>").attr("src",iconUrl("cancel_grey")).appendTo(info);
		closebutton.click(function(){
			removeArrows(panelnum-1);
			scrollToPanel(panelnum-1);
		});
	}

	var title;
	if(obj.type == "recent"){
		title = $("<h2 class='history-title'>History</h2>");
	}else if(obj.opposed){
		title = $("<h2 class='disputed-title'>Disputed claim</h2>");
	}else if(obj.type == "claim"){
		title = $("<h2 class='claim-title'>Claim</h2>");
	}else if(obj.type == "hot"){
		title = $("<h2 class='hot-title'>Hot</h2>");
	}else if(obj.type == "topic"){
		title = $("<h2 class='topic-title'>Topic</h2>");
	}else if(obj.type == "snippet"){
		title = $("<h2 class='snippet-title'>Snippet</h2>");
	}else{
		title = $("<h2/>").append(obj.type).appendTo(info);
	}

	if(obj.type == "claim" || obj.type == "snippet" || obj.type == "topic"){
		title.prepend($("<img class='panelicon'/>").attr("src",getIcon(obj)));
	}

	title.appendTo(info).attr("id","title-"+panelnum);


	var body = $("<div class='panelbody'>").appendTo(info);
	if(global_miniui){
		body.css("height","400px");
		body.css("overflow-y","auto");	
	}
	
	var infopanel = $("<div class='infopanel'>")
		.attr("id","infopanel-"+panelnum)
		.appendTo(body);
	
	body.scroll(function(){
		updateArrowPos(panelnum);
	});

	title.click(function(){
		scrollToPanel(panelnum);
	});

	refreshInfoPanel(infopanel,obj,panelnum);	
	
	var add = $("<div class='addbox'></div>").appendTo(body);;
	var addpanel = $("<div class='addpanel'/>");
	
	if(obj.type == "claim"){
		add.append(makeSuggester("topic",["about"],false,addpanel,obj,panelnum));
		add.append(makeSuggester("claim",["supports","opposes","relates to"],true,addpanel,obj,panelnum));
		add.append(makeSuggester("snippet",["supports","opposes","relates to"],true,addpanel,obj,panelnum));
	}else if(obj.type == "snippet"){
		add.append(makeSuggester("topic",["about"],false,addpanel,obj,panelnum));
		add.append(makeSuggester("claim",["supports","opposes","relates to"],false,addpanel,obj,panelnum));
	}else if(obj.type == "topic"){
		add.append(makeSuggester("topic",["relates to"],false,addpanel,obj,panelnum));
		add.append(makeSuggester("claim",["about"],true,addpanel,obj,panelnum));
		add.append(makeSuggester("snippet",["supports","opposes","relates to"],true,addpanel,obj,panelnum));
	}

	addpanel.appendTo(body);	
	return info;
}

var global_recentmode = false;

function makeSuggester(type,verbs,reverse,panel,obj,panelnum){
	var callback = function(othertxt,verb){	
		$.post(urlbase+"node/"+obj.id+"/addlink.js?verb="+verb+
			"&type="+type+"&text="+othertxt+"&reverse="+reverse,function(){
				refreshPanel(panelnum,obj.id+".js",null)
		});
	};
	
	var adder = $("<span class='adder'/>").text("link to "+type)
		.click(function(){
			panel.empty();
			if(adder.attr("class") == "adder-selected"){
				adder.attr("class","adder");
				return;
			}
			
			adder.parent().find(".adder-selected").attr("class","adder");
			adder.attr("class","adder-selected");

			var sugentry = $("<span class='sugentry'/>").appendTo(panel);
			var textbox;
			if(type != "snippet"){			
				textbox = $("<input class='addtxt-empty' type='text' value='enter new "+type+" or search keywords'>");		
			
				var buttons = makeVerbButtons(type,verbs,function(){return textbox.val()},callback);
				buttons.appendTo(sugentry);
			}else{
				textbox = $("<input class='addtxt-empty' type='text' value='enter search keywords'>");		
			}

			textbox.appendTo(sugentry);
			textbox.focus(function(){
				if(textbox.attr("class") == "addtxt-empty"){
					textbox.val("");
					textbox.attr("class","addtxt");
				}
			});
			textbox.keyup(function(){
				var text = textbox.val();
				setTimeout(function(){
					var nowtext = textbox.val();
					if(text == nowtext){
						if(type=="topic"){
							updateTopicSuggestions(panel,text,
								panelnum,"suggested topics",obj,callback,verbs);
						}else{
							updateSuggestions(panel,
								urlbase+"node/search.js?type="+type+"&callback=?&query="+encodeURIComponent(text),
								panelnum,type,obj,callback,verbs);
						}
					}
				},500);
			});

			if(global_recentmode){
				if(type == "topic"){
					updateRecentSuggestions(panel,
						"/test/test?id="+obj.id+"&callback=?",
						panelnum,"topic",obj,callback,verbs);
				}else{ // crappy suggestions for the moment
					updateRecentSuggestions(panel,
						"/thinklink/node/search.js?type="+type+"&query="+encodeURIComponent(obj.text)+"&callback=?",
						panelnum,type,obj,callback,verbs);
				}

			}else{
				if(type == "topic"){
					updateSuggestions(panel,
						"/test/test?id="+obj.id+"&callback=?",
						panelnum,"topic",obj,callback,verbs);
				}else{ // crappy suggestions for the moment
					updateSuggestions(panel,
						"/thinklink/node/search.js?type="+type+"&query="+encodeURIComponent(obj.text)+"&callback=?",
						panelnum,type,obj,callback,verbs);
				}
			}
		});
	
	if(obj.type == "snippet" && !obj.from.supports && !obj.from.opposes && type == "claim"){
		adder.click();
		
	}
	
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

function updateTopicSuggestions(panel,text,panelnum,title,obj,callback,verbs){
	var searchurl = urlbase+"node/search.js?type=topic&callback=?&query="+encodeURIComponent(text);
	var wikiurl = "/test/test?text="+text+"&callback=?";
	$.getJSON(searchurl,function(xs){
		$.getJSON(wikiurl,function(ys){
			panel.find(".suggestions").remove();
			panel.find(".sugghdr").remove();
			panel.find(".sugghdrbox").remove();
			var sugs = mergeSuggestions([xs.to.colitem,ys.to.colitem]);
			var hdrbox = $("<div class='sugghdrbox'/>").appendTo(panel);
			$("<span class='sugghdr-on'/>")
				.text(title).appendTo(hdrbox);

			//$("<div class='sugghdr'/>").text(title).appendTo(panel);
			panel.append(makeSuggestor("topic",obj,{to:{colitem:sugs}},panelnum,callback,verbs));	
		});
	});
}					
	


function makeLinkIndication(type){
	var span = $("<span class='sugbendbox'/>");
	var arrow = $("<img class='arrowbend'/>").attr("src",iconUrl("arrow_bend")).appendTo(span);
	var pick; 
	//if(type == "topic"){
		pick = $("<span class='sugghdr-bend'>click to link</span>").appendTo(span);
	//}else{
		//pick = $("<span class='sugghdr-bend'>click one to link</span>").appendTo(span);
		//span.attr("class","sugbendbox-many");
	//}
	return span;
}

function updateSuggestions(panel,url,panelnum,type,obj,callback,verbs){
	$.getJSON(url,function(sugs){
		panel.find(".suggestions").remove();
		panel.find(".sugghdr").remove();
		panel.find(".sugghdrbox").remove();
		var hdrbox = $("<div class='sugghdrbox'/>").appendTo(panel);
		makeLinkIndication(type).appendTo(hdrbox);
		$("<span class='sugghdr-on'/>")
			.text("suggested "+type+"s").appendTo(hdrbox);
		var recent = $("<span class='sugghdr-off'/>")
			.text("recent "+type+"s").appendTo(hdrbox);
		recent.click(function(){
			global_recentmode = true;
			updateRecentSuggestions(panel,url,panelnum,type,obj,callback,verbs);
		});
		panel.append(makeSuggestor(type,obj,sugs,panelnum,callback,verbs));
	});
}

function updateRecentSuggestions(panel,url,panelnum,type,obj,callback,verbs){
	$.getJSON(urlbase+"node/recent.js?type="+type+"&callback=?",function(sugs){
		panel.find(".suggestions").remove();
		panel.find(".sugghdr").remove();
		panel.find(".sugghdrbox").remove();
		var hdrbox = $("<div class='sugghdrbox'/>").appendTo(panel);
		makeLinkIndication(type).appendTo(hdrbox);
		
		$("<span class='sugghdr-off'/>")
			.click(function(){
				global_recentmode = false;
				updateSuggestions(panel,url,panelnum,type,obj,callback,verbs);
			})
			.text("suggested "+type+"s").appendTo(hdrbox);
		var recent = $("<span class='sugghdr-on'/>")
			.text("recent "+type+"s").appendTo(hdrbox);
		panel.append(makeSuggestor(type,obj,sugs,panelnum,callback,verbs));
	});	
}

function makeSuggestor(type,obj,topics,panelnum,callback,verbs){
	var box = $("<div class='suggestions'/>");
	var topics = topics.to.colitem;
	for(var i = 0; i < topics.length; i++){ // TODO: allow this to be expanded
		box.append(makeSuggestion(type,topics[i],panelnum,callback,verbs));
	}
	return box;
}

var global_morefor = 0;

function makeSubGroup(subtitle,links,panelnum,parentobj,verb,showall){
	links = orderByVotes(links);
	var group = $("<div class='subgroup'>");
	var i;
	if(links && links.length > 0){
		if(subtitle && subtitle != "colitem"){
			$("<h3/>").text(subtitle).appendTo(group);
		}
		for(i = 0; i < links.length; i++){
			var link = links[i];
			if(getMyVote(link) == -1 ||
					(i >= 2 && getMyVote(link) != 1 && link.type == "snippet") ||  
					(i >= 4 && getMyVote(link) != 1)){
				break;
			}
			group.append(makeLink(links[i],panelnum,parentobj,verb,showall));
		} 
		
		var endpoint = i;
		
		var extra = $("<div class='extralinks-hidden'/>").appendTo(group);
		if(i < links.length){
			for(;i < links.length; i++){
				extra.append(makeLink(links[i],panelnum,parentobj,verb,showall));
			}	
			var more = $("<div class='more'/>")
				.text("show "+(links.length - endpoint)+" more")
				.click(function(){
					extra.attr("class","extralinks-visible");
					global_morefor = parentobj.id;
					more.remove();
				}).appendTo(group);
			if(showall || global_morefor == parentobj.id){
				extra.attr("class","extralinks-visible");			
				more.remove();
			}
		} 
		
	}else{
		group.attr("class","nogroup");
	}


	return group;
}

function shortVerb(verb){
	switch(verb){
		case "supports": return "pro";
		case "opposes": return "con";
		case "relates to": return "add";
		case "about": return "add";
	}
}

function verbIcon(type,verb){
	switch(verb){
		case "supports": return "thumb_up";
		case "opposes": return "thumb_down";
		case "relates to": return "add";
		case "about": return "add";
	}	

	//switch(verb){
		//case "supports": return type+"_yes";
		//case "opposes": return type+"_no";
		//case "relates to": return type;
		//case "about": return type;
	//}	
}

function makeButton(type,verb,textfunc,callback){
	var icon = verbIcon(type,verb);

	var selected = false;

	var button = $("<img class='addbutton'>")
		.attr("src",iconUrl(icon+"_grey"))
		.attr("title","link as "+verb)
		//.mouseover(function(){
			//button.css("background-color",'blue');
		//})
		//.mouseout(function(){
			//button.css("background-color",'transparent');
		//})

		.mouseover(function(){
			button.attr("src",iconUrl(icon));
		})
		.mouseout(function(){
			if(!selected){
				button.attr("src",iconUrl(icon+"_grey"));
			}
		})
		.click(function(ev){
				ev.preventDefault(); ev.stopPropagation();			
				button.attr("src",iconUrl(icon));
				selected = true;
				callback(textfunc(),verb);
		});
	return button;
}

function makeVerbButtons(type,verbs,textfunc,callback){
	var buttons = $("<span class='linkbuttons'/>");
	for(var i = 0; i < verbs.length; i++){
		var verb = verbs[i];
		//var add = $("<span class='greenadd'>"+shortverb+"</span>")
			//.css('font-size','13px')
		var button = makeButton(type,verb,textfunc,callback);
		button.appendTo(buttons);
	}	
	return buttons;
}

function makeSuggestion(type,obj,panelnum,callback,verbs){
	var sugg = $("<a class='sugg'/>")
		.attr("href",urlbase+"node/"+obj.id)
		.attr("tl_panel",panelnum)
		.click(function(ev){
			ev.preventDefault();
			selectItem(item,obj.id,panelnum,obj.text);
			return false;
		});
	
	var buttons = makeVerbButtons(type,verbs,function(){return obj.text},callback);

	var item = $("<div class='item'/>");

	var text;
	if(obj.type == "snippet"){
		text = $("<span class='snippet-text'/>").text("\"..."+obj.text.substring(0,160)+"...\"");	
	}else{
		text = $("<span/>").css('font-size','13px').text(obj.text);
	}
	item.append(text);
	//item.append(buttons);
	//item.append(makeHBox([text,buttons],"linkbox"));
	sugg.append(makeHBox([buttons,item],"linkbox"));
	
	return sugg;
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

function getVoteUpIcon(obj,over){
	if(global_myvotes[obj.linkid] == 1){
		return "vote_up_on";
	}else if(global_myvotes[obj.linkid] == -1){
		if(over){
			return "vote_restore_up_on";
		}else{
			return "vote_restore_up";
		}
	}else{
		if(over){
			return "vote_up_on";
		}else{
			return "vote_up_e";
		}
	}
}

function getVoteDownIcon(obj,over){
	if(global_myvotes[obj.linkid] == -1){
		return "vote_down_on";
	}else if(global_myvotes[obj.linkid] == 1){
		if(over){
			return "vote_restore_down_on";
		}else{
			return "vote_restore_down";
		}
	}else{
		if(over){
			return "vote_down_on";
		}else{
			return "vote_down_e";
		}
	}
}

function makeLink(obj,panelnum,parentobj,verb,novote){
	var item = $("<a class='item'/>")
		.attr("href",urlbase+"node/"+obj.id)
		.attr("tl_panel",panelnum)
		.click(function(ev){
			ev.preventDefault();
			selectItem(item,obj.id,panelnum);
			return false;
			});		
	
	var icon = $("<img class='icon'/>").attr("src",getIcon(obj,verb));				
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
	
	if(!novote){
		var votebox = $("<nobr class='votebox'/>").appendTo(text);
		
		var up = $("<img class='vote' title='Vote up'/>").attr("src",iconUrl(getVoteUpIcon(obj,false)))
			.mouseover(function(){up.attr("src",iconUrl(getVoteUpIcon(obj,true)))})
			.mouseout(function(){up.attr("src",iconUrl(getVoteUpIcon(obj,false)))})
			.appendTo(votebox);

		var down = $("<img class='vote' title='Vote down'/>").attr("src",iconUrl(getVoteDownIcon(obj,false)))
			.mouseover(function(){down.attr("src",iconUrl(getVoteDownIcon(obj,true)))})
			.mouseout(function(){down.attr("src",iconUrl(getVoteDownIcon(obj,false)))})
			.appendTo(votebox);		

		up.click(function(ev){
				ev.preventDefault(); ev.stopPropagation();									
				if(global_myvotes[obj.linkid]){
					global_myvotes[obj.linkid] = 0;
					setVote(parentobj.id,obj.linkid,0);
				}else{
					global_myvotes[obj.linkid] = 1;
					setVote(parentobj.id,obj.linkid,1);
				}

				up.attr("src",iconUrl(getVoteUpIcon(obj,false)));			
				down.attr("src",iconUrl(getVoteDownIcon(obj,false)));
				refreshPanel(panelnum,parentobj.id+'.js');
				// TODO: slide to the top
			});
		down.click(function(ev){
				ev.preventDefault(); ev.stopPropagation();			
				if(global_myvotes[obj.linkid]){
					global_myvotes[obj.linkid] = 0;
					setVote(parentobj.id,obj.linkid,0);
				}else{
					global_myvotes[obj.linkid] = -1;
					setVote(parentobj.id,obj.linkid,-1);
				}
				up.attr("src",iconUrl(getVoteUpIcon(obj,false)));			
				down.attr("src",iconUrl(getVoteDownIcon(obj,false)));
				refreshPanel(panelnum,parentobj.id+'.js');
			})	
	}
	return item;
}

function setVote(nodeid,linkid,vote){
	$.post(urlbase+"node/"+nodeid+"/vote?linkid="+linkid+"&vote="+vote,function(){});
}

function iconUrl(icon){
	return urlbase+"images/"+icon+".png";
}

function getIcon(obj,verb){
	if(obj.icon){
		return obj.icon;
	}
	if(obj.type == "claim" && obj.opposed){
		return iconUrl("lightbulb_red");
	}else if(obj.type == "snippet"){
		return iconUrl("comment");
	}else{
		return iconUrl(obj.type);
	}
	//if(verb == "opposes"){
		//return iconUrl(obj.type + "_no");
	//}else if(verb == "supports"){
		//return iconUrl(obj.type + "_yes");
	//}else{
		//return iconUrl(obj.type);
	//}
	
	//switch(obj.type){
		//case "claim":
			//if(verb == "opposes"){
				//return iconUrl("lightbulb_red");
////				return iconUrl("exclamation");
			//}else if(verb == "supports"){
				//return iconUrl("lightbulb_green");
				////return iconUrl("lightbulb");
			//}else{
			//}
		//case "snippet":
			//return iconUrl("comment");
		//case "topic":
			//return iconUrl("folder");
		//case "user":
			//return iconUrl("user");
	//}
}
	

var selection = {};
var selectionid = {};

function updateWidthPad(){
	if($(".toptable").width() > widthpad.width()){
		widthpad.css("width",$(".toptable").width());
	}
}

function selectItem(item,id,panelnum,text){
	try{
		updateWidthPad();
			
		//if(selection[panelnum] == item){
			//scrollToPanel(panelnum+1);
			//return;
		//}
		item.attr("class","item-selected");
		if(selection[panelnum]){
			selection[panelnum].attr("class","item");
		}
		selection[panelnum] = item;
		selectionid[panelnum] = id;
		global_panelbox.append(makeArrow(panelnum,item));
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
