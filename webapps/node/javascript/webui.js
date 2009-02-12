
function clone(obj){
	var n = {};
	for(var i in obj){
		n[i] = obj[i];
	}
	return n;
}

function closePopupWindow(){
  var evt = document.createEvent("Events");
  evt.initEvent("thinklink-close", true, false);
  document.body.dispatchEvent(evt);
}

function sendMessage(action,data){
  var evt = document.createEvent("Events");
  evt.initEvent("thinklink-action", true, false);
  evt.tl_action = action;
  evt.tl_data = data;
  document.body.dispatchEvent(evt);	
}

function tl_log(msg){		
	if(typeof console !== "undefined"){
		console.log(msg);
	}
}

function getPos(node){
	var left = 0;
	var top = 0;
	while(node){
		left += node.offsetLeft;
		top += node.offsetTop;
		node = node.offsetParent;
	}
	return {left:left,top:top}
}

function mk(tag,className){
	node = document.createElement(tag);
	node.className = className;
	return node;
}

var nextId = 0;

function getId(){
	return nextId++;
}

function getel(id){
	return document.getElementById(id);
}

function getIcon(obj){
	if(obj.icon){
		return obj.icon;
	}
	var mk = function(icon){return urlbase+"/images/"+icon+".png";};
	switch(obj.type){
		case "claim":
//			if(is_bookmarked(obj)){
//				return mk("lightbulb");
//			}else 
			if(obj.opposed){
				return mk("lightbulb_red");
			}else if(obj.supported){
				return mk("lightbulb_green");
			}else{
				return mk("lightbulb");
			}
		case "topic":
			return mk("folder");
		case "snippet":
			return mk("comment");
		case "recent":
			return mk("time");
		case "search":
			return mk("magnifier");
		case "newsnips":
			return mk("script");
		case "user":
			return mk("user");
	}
}

function makeSpacer(){
	return $("<div class='dragspacer'>spacer</div>");
}

function makeArgBrowseFrame(divid,obj,height,title){
	if (!title){
		title = "Claim Browser";
	}
	var idnum = getId();
	var browser = $("#"+divid)
		.attr("class","browsetable")
		.attr("id","browser-"+idnum)
		.mouseover(function(ev){
			browseDragIn(ev,this);
		})
		.mouseout(function(ev){
			browseDragOut(ev,this);
		});
	var box = $("<div class='browseborder'/>")
		.appendTo(browser);
	var h2 = $("<h2/>").appendTo(box);
	var table = $("<table class='browsetitle'/>")
		.css("width","100%").appendTo(h2);
	var row = $("<tr/>").appendTo(table);
//	$("<img src='"+urlbase+"/images/resultset_previous.png'/>").appendTo(row);
	$("<td class='browsetitle'>"+title+"</td>").appendTo(row);
	var buttons = $("<td class='browsebuttons'/>").appendTo(row);
	$("<nobr class='browsebutton'>back</nobr>").appendTo(buttons)
		.click(function(){goBack(idnum)});
	$("<nobr class='browsebutton'>search</nobr>").appendTo(buttons)
		.attr("id","search-"+idnum)
		.click(function(){searchMode(idnum)});
	$("<a class='browsebutton'>history</a>").appendTo(buttons)
		.attr("href",urlbase+"/node/recent")
		.attr("id","recent-"+idnum)
		.click(function(ev){
			ev.cancelBubble = true;
			ev.stopPropagation();
			ev.preventDefault();

				recentMode(idnum)});
//	$("<nobr class='browsebutton'>hot</nobr>").appendTo(buttons)
//		.click(function(){hotMode(idnum)});
	$("<a class='browsebutton'>unattached</a>").appendTo(buttons)
		.attr("href",urlbase+"/node/newsnips")
		.attr("id","newsnips-"+idnum)
		.click(function(ev){
			ev.cancelBubble = true;
			ev.stopPropagation();
			ev.preventDefault();
			unattachedMode(idnum)});
	$("<a class='browsebutton'>feed</a>").appendTo(buttons)
		.attr("id","feed-"+idnum)
		.attr("target","_blank");

//	$("<a/>").append($("<img/>")
//		.attr("src",urlbase+"/images/feed.png")).appendTo(buttons);
		

//	$("<nobr class='browsebutton'>mine</nobr>").appendTo(buttons)
//		.click(function(){mineMode(idnum)});
		
	makeInnerBrowser(idnum,box,obj,height);
}

function updateButton(idnum,name,id){
	var button = getel(name+"-"+idnum);
	if(!button) return;
	if(name == (id+"").substring(0,name.length)){
		button.className = "browsebutton_selected";
	}else{
		button.className = "browsebutton";
	}
}

function updateButtons(idnum,id){
	updateButton(idnum,"recent",id);
	updateButton(idnum,"history",id);
	updateButton(idnum,"newsnips",id);
	updateButton(idnum,"search",id);
	var feed = getel("feed-"+idnum);
	if(feed){
		feed.setAttribute("href",urlbase+"/node/"+id+".rss");
	}
}

function makeArgBrowser(divid,obj,height){
	var idnum = getId();
	var browser = $("#"+divid)
		.attr("class","browsetable")
		.attr("tl_id",obj.id)
		.attr("id","browser-"+idnum);
	makeInnerBrowser(idnum,browser,obj,height);	
}

var thinklink_user_id;
var thinklink_deletes;

function makeInnerBrowser(idnum,browser,obj,height){
	if(!thinklink_user_id) thinklink_user_id = 0;
	if(!thinklink_deletes) thinklink_deletes = {};
	
	document.addEventListener("keydown",function(ev){
		keyDownHandler(ev);
	},true);
	
	var searchbar = $("<div class='hidden'/>")
		.attr("id","searchbar-"+idnum)
		.appendTo(browser);
	var searchbox = $("<input class='searchbox inputbox' type='text'/>")
		.attr("id","searchbox-"+idnum)
		.appendTo(searchbar)
		.keypress(function(ev){
			searchKeyPress(ev,idnum);
		});
	var searchbutton = $("<input class='searchbutton' type='button' value='Search'/>")
		.appendTo(searchbar)
		.click(function(){
			searchDo(idnum);
		});
	var body = $("<div class='browser_body'/>")
		.attr("id","body-"+idnum).appendTo(browser);

	if(height){
		body.css("height",height)
	}
	
	if(typeof obj == "object"){
		loadObject(idnum,obj);		
	}else{
		$.getJSON(urlbase+"/node/"+obj+".js?callback=?",{},function(obj){
			loadObject(idnum,obj);
		});
	}
}

function makeDragItem(obj,label){
	if(!obj.type){
		return $("<span/>");
	}
	if(obj.type == "snippet"){
		return makeSnippet(obj,label);
	}
	if(obj.type == "user"){
		obj.text = obj.name;
	}
	var id = getId();
	var icon = $("<img/>").attr("src",getIcon(obj));	
	var holder = $("<div class='dragholder'/>")
		.attr("tl_id",obj.id).attr("tl_cls",obj.type)
		.attr("id","holder-"+id);	
	var table = $("<table class='dragtable'>").appendTo(holder);
	var tbody = $("<tbody/>").appendTo(table);
	var tr = $("<tr>").appendTo(tbody);
	
	if(obj.linkid){
		holder.attr("tl_linkid",obj.linkid);
	}
	
	if(label){
		$("<td class='draglabel'><nobr>"+label+": </nobr></td>")
			.attr("id","label-"+id)
			.appendTo(tr);
	}
	var tdicon = $("<td/>").append(icon).appendTo(tr);
	var item = $("<a class='dragitem'/>")
		.attr("id",id)
		.attr("href",urlbase+"/node/"+obj.id)
		.attr("tl_id",obj.id).attr("tl_cls",obj.type)
		.click(function(ev){
			ev.preventDefault();
		})
		.text(obj.text);

	var tditem = $("<td/>").append(item).appendTo(tr);

//	var rssicon = $("<img/>")
//		.css("display","none")
//		.css("cursor","pointer")
//		.css("margin-left","4px")
//		.attr("src",urlbase+"/images/feed.png")
//		.attr("title","rss feed")
//		.attr("class","itembutton");
//	var rssbutton = $("<a/>").append(rssicon)
//		.attr("target","blank")
//		.attr("href",urlbase+"/node/"+obj.id+".rss")
//		.appendTo(item);
//
	var breakicon = $("<img/>")
		.css("display","none")
		.css("cursor","pointer")
		.css("margin-left","4px")
		.attr("src",urlbase+"/images/link_break.png")
		.attr("title","disconnect")
		.attr("class","itembutton")
		.appendTo(item)
		.click(function(ev){
			ev.cancelBubble = true;
			ev.stopPropagation();
			ev.preventDefault();
			deleteLink(ev,holder,obj.linkid)});

//	if(thinklink_user_id == obj.user){
	var deleteicon = $("<img/>")
		.css("display","none")
		.css("cursor","pointer")
		.attr("src",urlbase+"/images/cross.png")
		.attr("title","delete")
		.attr("class","itembutton")
		.appendTo(item)
		.click(function(ev){
			ev.cancelBubble = true;
			ev.stopPropagation();
			ev.preventDefault();
			deleteNode(ev,holder,obj.id,obj.type)});
//		var tddelete = $("<td/>").append(deleteicon).appendTo(tr);				
//	}


	if(thinklink_user_id == obj.user){
		var renameicon = $("<img/>")
				.css("display","none")
				.css("cursor","pointer")
				.attr("src",urlbase+"/images/pencil.png")
				.attr("title","rename")
				.attr("class","itembutton")
				.appendTo(item)
				.click(function(ev){
					ev.cancelBubble = true;
					ev.stopPropagation();
					ev.preventDefault();
					renameNode(ev,item,obj.id)});
	}
			
	holder.click(function(){selectItem(this,obj.id)})
		.mouseup(function(ev){dragCapture(ev,this)})
		.mousedown(function(ev){dragStart(ev,this)})
		.mouseover(function(ev){
			holder.tl_selected = true;
			setTimeout(function(){
				if(holder.tl_selected){
					breakicon.css("display","");
//					rssicon.css("display","");
					if(deleteicon){
						deleteicon.css("display","");						
					}
					if(renameicon){
						renameicon.css("display","");						
					}
				}
			},300);
			dragOver(ev,this,id)}
			)
		.mousemove(function(ev){dragOver(ev,this,id)})
		.mouseout(function(ev){
			if(isParent(ev.relatedTarget,holder.get(0))) return;
			breakicon.css("display","none");
//			rssicon.css("display","none");
			if(deleteicon){
				deleteicon.css("display","none");						
			}
			if(renameicon){
				renameicon.css("display","none");						
			}

			holder.tl_selected = false;
			dragOut(ev,this,id)});
		


	return holder;
}

function newThing(node,id,verb,objecttype){
	var group = findNodeGroup(node);
	var idnum = getNodeIdNum(group);
	var reqId = getId();
	var browser = findBrowser(node);
	var id = browser.getAttribute("tl_id");
	var typ = getVerbSubjectType(verb,objecttype);
	var icon = $("<img/>").attr("src",getIcon({type:typ}));	
	var holder = $("<div class='dragholder'/>");
	var table = $("<table class='dragtable'>").appendTo(holder);
	var tbody = $("<tbody/>").appendTo(table);
	var tr = $("<tr>").appendTo(tbody);
	var tdicon = $("<td/>").append(icon).appendTo(tr);
	var item = $("<div class='dragitem'/>").attr("id",id);
	var input = $("<input type='text'/>").css("width",300).appendTo(item);
	var tditem = $("<td/>").append(item).appendTo(tr);
	var msg = $("<div class='minimessage'/>")
			.text("Enter text to create a new "+typ+". Use drag and drop to connect an existing "+typ+".")
			.appendTo(holder);
	input.blur(function(){
		createFinished(id,holder,input,typ,verb,reqId,idnum);
	});	
	input.keypress(function(ev){
		ev.stopPropagation();
		if(ev.keyCode == 13){
			createFinished(id,holder,input,typ,verb,reqId,idnum);
		}else if(ev.keyCode == 27){
			input.value = "";
			holder.remove();
		}
	});
	holder.insertAfter(findRelationTitle(node));
	input.get(0).focus();
}

var doneReqs = {}

function createFinished(id,holder,input,typ,verb,reqId,idnum){
	if(doneReqs[reqId]){
		return;
	}
	doneReqs[reqId] = true;
	var text = input.val();
	if(!text || !normalizeText(text)){
		holder.remove();
		return;
	}	
	$.post(urlbase+"/node/create.json",{type:typ,info:makeJSONString({text:input.val()})},function(newid){
		$.post(urlbase+"/node/create.json",{type:"link",info:makeJSONString({subject:newid,verb:verb,object:id})},function(result){
			holder.remove();
			loadItemInfo(idnum,id);
		});
	});
}

function trim_string(string,length){
	if(string.length > length){
		return string.substring(0,length) + "...";
	}else{
		return string;
	}
}

function trim_url(url){
	m = url.match(/http:\/\/[^\/]*/);
	if(m){
		return m[0];
	}else{
		return url;
	}		
}

function makeSnippet(snippet){
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
	table.find("img").attr("src",urlbase+"/images/comment.png");
	var snipbody = table.find(".snipbody");
	$("<div class='sniptext'/>")
		.text("... "+snippet.text.substring(0,200)+" ...")
		.appendTo(table.find(".snipbody"));
	$("<a class='snippet_url'/>").text(trim_string(snippet.info.title,40) + " - "+trim_url(url))
		.attr("href",realurl).attr("target","_blank")
		.append(img)
		.appendTo(table.find(".snipbody"));

	
	var breakicon = $("<img/>")
		.css("display","none")
		.css("cursor","pointer")
		.attr("src",urlbase+"/images/link_break.png")
		.css("margin-left","4px")
		.attr("title","disconnect")
		.attr("class","itembutton")
		.appendTo(snipbody)
		.click(function(ev){
			ev.cancelBubble = true;
			ev.stopPropagation();
			deleteLink(ev,holder,snippet.linkid)});

	if(thinklink_user_id == snippet.user){
		var deleteicon = $("<img/>")
			.css("display","none")
			.css("cursor","pointer")
			.attr("src",urlbase+"/images/cross.png")
			.attr("title","delete")
			.attr("class","itembutton")
			.appendTo(snipbody)
			.click(function(ev){
				ev.cancelBubble = true;
				ev.stopPropagation();
				deleteNode(ev,holder,snippet.id,"snippet")});
	}

	holder
		.click(function(){suggestDo(snippet.id)})
//		.click(function(){selectItem(this,snippet.id)})
		.mouseup(function(ev){dragCapture(ev,this)})
		.mousedown(function(ev){dragStart(ev,this)})
		.mouseover(function(ev){
			holder.tl_selected = true;
			setTimeout(function(){
				if(holder.tl_selected){
					breakicon.css("display","");
					if(deleteicon){
						deleteicon.css("display","");
					}
				}
			},300);
			dragOver(ev,this,id)
		})
		.mousemove(function(ev){dragOver(ev,this,id)})
		.mouseout(function(ev){
			if(isParent(ev.relatedTarget,holder.get(0))) return;
			breakicon.css("display","none");
			if(deleteicon){
				deleteicon.css("display","none");
			}
			holder.tl_selected = false;
			dragOut(ev,this,id)
		});		
		
		
	return holder;
}	

function getVerbsTo(type){	
	switch(type){
		case "claim":	return ["supports","opposes","relates to","states"];
		case "topic": return ["relates to","about","states"];
		case "snippet": return [];
		case "user": return ["created by"];
		case "recent":
		case "newsnips":
		case "search":
		case "hot":
		case "suggestions":
			return ["colitem"];			
	}
}

function getVerbsFrom(type){	
	switch(type){
		case "claim":	return ["supports","opposes","about"];
		case "topic": return ["refines"];
		case "snippet": return ["states","created by"];
		case "user": return [];
		case "recent":
		case "newsnips":
		case "search":
		case "hot":
			return ["colitem"];			
	}
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

function getVerbSubjectType(verb,objecttype){
	switch(verb){
		case "about": return "claim";
		case "refines": return "topic";
		case "opposes": return "claim";
		case "supports": return "claim";
		case "states": return "snippet";
		case "related": return objecttype;
		case "created by": return "snippet";
		case "relates to": return objecttype;
	}
}

function makeSubItems(div,obj){
	var verbs = getVerbsTo(obj.type);
	if(obj.userorder){
		var userorder = parseJSON(obj.userorder);
	}else{
		var userorder = null;
	}
	
	for(var i = 0; i < verbs.length; i++){
		var verb = verbs[i];		
		var newicon = $("<img class='newthing' src='"+urlbase+
			"/images/add.png' onclick='newThing(this,"+obj.id+
			",\""+verb+"\",\""+obj.type+"\")'/>");
		if(verb != "colitem"){
			var reltitle = $("<div class='relationtitle'/>")
				.attr("tl_verb",verb)
				.text(invertVerb(verb,obj.text,obj.type))
				.appendTo(div);	
			if(verb != "created by" && verb != "states"){
				reltitle.append(newicon);
			}
		}
		var items = obj.to[verb];
		var byid = {};
		var empty = true;
		if(items && items.length > 0){
			for(var j = 0; j < items.length; j++){
				byid[items[j].id] = items[j];
			}
			if(userorder && userorder[verb]){
				for(var j = 0; j < userorder[verb].length; j++){
					var orderid = userorder[verb][j];
					if(byid[orderid] && !is_deleted(byid[orderid])){
						$(div).append(makeDragItem(byid[orderid]));
						byid[orderid].done = true;
						empty = false;
					}
				}
			}
			for(var j = 0; j < items.length; j++){
				if(items[j].done || is_deleted(items[j])) continue;
				$(div).append(makeDragItem(items[j]));
				empty = false;
			}
		}
		
		if(empty){
			var empty = $("<div class='empty'>empty</div>")
				.attr("tl_verb",verb)
				.mouseover(function(ev){dragEmptyOver(ev,this,obj.id)})
				.mouseout(function(ev){dragEmptyOut(ev,this,obj.id)})
				.mouseup(function(ev){dragEmptyCapture(ev,this,obj.id)});
				
			$(div).append(empty);
		}				
	}
}

function is_deleted(obj){
	if(window.thinklink_deletes === undefined) return;
	if(thinklink_deletes[obj.id] || (obj.linkid && thinklink_deletes[obj.linkid])) return true;
	return false;
}

function is_bookmarked(obj){
	return(thinklink_bookmarks[obj.id]);
}

function get_hash_keys(hsh){
	var keys = [];
	for(key in hsh){
		keys.push(key);
	}
	return keys;
}

function makeParentItems(div,obj){
	var verbs = get_hash_keys(obj.from);
	//getVerbsFrom(obj.type);
	for(var i = 0; i < verbs.length; i++){
		var verb = verbs[i];					
		var items = obj.from[verb];
		if(items){
			for(var j = 0; j < items.length; j++){
				var item = makeDragItem(items[j],verb);
				$(div).append(item);
			}
		}				
	}
}

function makeCurrentItem(div,obj){
	var item = makeDragItem(obj).appendTo(div);
	$(item).find(".dragitem").css("fontSize","20px");
}


function getNodeIdNum(node){
	var id = node.getAttribute("id");
	var m = id.match(/.*-(\d*)/);
	return m[1];
}

function findBrowser(node){
	while(node != null && node.getAttribute){
		if(node.className == "browsetable"){
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

function findHolderRelation(holder){
	while(holder != null){
		if(holder.className == "relationtitle"){
			return holder;
		}
		holder = holder.previousSibling;	
	}
	return null;
}

function findLinkInfo(holder){
	var group = findNodeGroup(holder);
	var idnum = getNodeIdNum(group);
	var reltitle = findHolderRelation(holder);

	if(group.className == "item-children" && reltitle){
		var verb = reltitle.getAttribute("tl_verb");
		var browser = findBrowser(holder);
		var objectid = browser.getAttribute("tl_id");	
		return {verb: reltitle.getAttribute("tl_verb"), objectid: objectid}
	}else{
		return null;
	}
}

function findHolder(node){
	while(node != null && node.getAttribute){
		var node_tl_id = node.getAttribute("tl_id");
		if(node_tl_id && node.className == "dragholder"){
			return node;
		}
		node = node.parentNode;
	}
	return null;	
}

function findSelectedHolder(node){
  if(node){
    var group = findNodeGroup(node);
    var idnum = getNodeIdNum(group);
    var propholder = getel("propholder-"+idnum);
    if(!propholder.selectedDiv){
      propholder.selectedDiv = getel(idnum);
    }
    return findHolder(propholder.selectedDiv);
  }else{
    if(selectedDivId && selectedId){
      return findHolder(document.getElementById(selectedDivId));
    }else{
      return null;
    }
  }
}

function findRelationTitle(node){
  while(node != null){
    if(node.className == 'relationtitle'){
      return node;
    }
    node = node.parentNode;
  }
  return null;  
}

function findNodeGroup(node){
	while(node){
		if(node.className == "item-parents" || node.className == "item-current" || node.className == "item-children"){
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

function findSiblings(node){
	var holder = findHolder(node);
	if(!holder) return [];
	var siblings = [];
	for(var i = 0; i < holder.parentNode.childNodes.length; i++){
		var child = holder.parentNode.childNodes[i];
		if(child.getAttribute && ((child.getAttribute("tl_id") != holder.getAttribute("tl_id")) || 
				(child.getAttribute("tl_cls") != holder.getAttribute("tl_cls")))){
			siblings.push(child);
		}
	}
	return siblings;
}

function hideSiblings(node){
	var siblings = findSiblings(node);
	for(var i = 0; i < siblings.length; i++){
		$(siblings[i]).animate({height:'hide'},500);
	}
}

function hideLabel(holder){
	var idnum = getNodeIdNum(holder);
	var label = getel("label-"+idnum);
	$(label).animate({width:'hide'},500);
}

function animateInitHide(div){
	var curheight = div.offsetHeight;
	div.style.height = curheight + "px";
	div.style.overflow = "hidden";
}

function animateShow(div){
	$(div).animate({height:div.scrollHeight},500,function(){
		div.style.height = "";
		div.style.overflow = "";
	});
}


function loadItemInfo(idnum,id){
	var parents = getel("parents-"+idnum);
	var children = getel("children-"+idnum);
	animateInitHide(parents);
	animateInitHide(children);
	$.getJSON(urlbase+"/node/" + id +".js?callback=?",{},function(obj){
		combineRelates(obj);
		parents.innerHTML = "";
		children.innerHTML = "";
		makeParentItems(parents,obj);
		makeSubItems(children,obj);
		animateShow(parents);
		animateShow(children);		
	});
}

function getBrowseHistory(idnum){
	var browser = getel("browser-"+idnum);
	if(!browser.tl_browsehistory){
		browser.tl_browsehistory = [];
	}
	return browser.tl_browsehistory;
}

function pushHistory(idnum,place){
	var history = getBrowseHistory(idnum);
	history.push(place);
	tl_log(history);
	updateButtons(idnum,place);
}

function findDivWithId(idnum,id){
	var parents = getel("parents-"+idnum);
	for(var i = 0; i < parents.childNodes.length; i++){
		var node = parents.childNodes[i];
		if(node.getAttribute && node.getAttribute("tl_id") == id){
			return node;
		}
	}
	var parents = getel("children-"+idnum);
	for(var i = 0; i < parents.childNodes.length; i++){
		var node = parents.childNodes[i];
		if(node.getAttribute && node.getAttribute("tl_id") == id){
			return node;
		}
	}
}

function goBack(idnum){
	var history = getBrowseHistory(idnum);
	history.pop();
	var last = history.pop();	
	tl_log(history);
	if(last){
		var div = findDivWithId(idnum,last);
		if(div){
			selectItem(div,last);
		}else{		
			$.getJSON(urlbase+"/node/"+last+".js?callback=?",{},function(obj){
				loadObject(idnum,obj);
			})
		}
	}
}

function selectItem(div,id){
	var group = findNodeGroup(div);
	var idnum = getNodeIdNum(group);
	var current = getel("current-"+idnum);
	var parents = getel("parents-"+idnum);
	var children = getel("children-"+idnum);
	var propholder = getel("propholder-"+idnum);
	var holder = findHolder(div);
	var browser = findBrowser(div);
	var dragitem = $(div).find(".dragitem");
	browser.setAttribute("tl_id",id);
	
	document.location.hash = id;
	
	pushHistory(idnum,id);

	clearSelect(getNodeIdNum(browser));
	
	if(group.className == "item-parents"){
		current.setAttribute("id","children-"+idnum);
		children.setAttribute("id","dead-"+idnum);
		parents.setAttribute("id","current-"+idnum);
				
		var newparents = document.createElement("div");
		newparents.className = "item-parents";
		newparents.setAttribute("id","parents-"+idnum);
		group.parentNode.insertBefore(newparents,parents);
	 		 	
 		if(propholder.selectedDiv){
			$(propholder.selectedDiv).animate({fontSize:'13px'},500);
		}		
		hideSiblings(div);
		hideLabel(holder);

		$(current).animate({borderLeft:'1px dotted grey',marginLeft:"5px",paddingLeft:"5px"},500,function(){
			current.className = "item-children";
		});

		if(dragitem.length == 0){
			parents.className = "item-current";
		}
		$(dragitem).animate({fontSize:"20px"},500,function(){
			parents.className = "item-current";
		});				
		propholder.selectedDiv = dragitem;

		loadItemInfo(idnum,id);				
//		smoothReplace(url+"expand?"+params,"children-"+idnum);
//		smoothReplace(url+"parents?"+params,"parents-"+idnum);
		
		if(children){
			$(children).animate({height:'hide'},500,function(){
				children.parentNode.removeChild(children);
			});
		}				
	}else if (group.className == "item-children"){
		current.setAttribute("id","parents-"+idnum);
		children.setAttribute("id","current-"+idnum);
		parents.setAttribute("id","dead-"+idnum);
		var newchildren = document.createElement("div");
		newchildren.className = "item-children";
		newchildren.setAttribute("id","children-"+idnum);
		group.parentNode.appendChild(newchildren);	
		
		if(propholder.selectedDiv){
			$(propholder.selectedDiv).animate({fontSize:"13px"},500);
		}
		hideSiblings(div);
		if(dragitem.length == 0){
			current.className = "item-parents";
		}
		$(dragitem).animate({fontSize:"20px"},500,function(){
			current.className = "item-parents";
		});				
		
		$(group).animate({marginLeft:"0px",paddingLeft:"0px",borderLeft:""},500,function(){
			group.className = "item-current";
		});

		loadItemInfo(idnum,id);				
//				
//		smoothReplace(url+"expand?"+params,"children-"+idnum);
//		smoothReplace(url+"parents?"+params,"parents-"+idnum);
		
		propholder.selectedDiv = dragitem;
		if(parents){
			$(parents).animate({height:'hide'},500,function(){
				parents.parentNode.removeChild(parents);								
			});
		}
	}else if (group.className == "item-current"){
		// already selected. Do nothing 
		propholder.selectedDiv = div;
	}	
		
}

function keyDownHandler(ev){
	tl_log("keydown");
	if(dragInfo.logo){
		if(ev.keyCode == 27){
			dragStop();
		}
	}
}

function keyUpHandler(ev){
	// nothing
}


function keyPressHandler(ev){
	var keycode = ev.keyCode;
	if(keycode == 8 || keycode == 46){ // delete
		actionDelete(ev);
	}
	if(keycode == 113 || keycode == 13){ // F2 or enter
		actionEdit();
	}
}

var resizeBar = null;
var resizeBox = null;
var startHeight = 0;
var startY = 0;
function dragBar(ev){
	resizeBar = getel("dragbar");
	resizeBox = $(".browser_body");
	window.addEventListener("mousemove",resizeMove,false);
	window.addEventListener("mouseup",resizeStop,false);
	resizeBar.addEventListener("mouseup",resizeStop,false);
	startY = ev.clientY;
	startHeight = resizeBox.get(0).offsetHeight;
	ev.preventDefault();
}

function resizeMove(ev){
	var dragDiff = ev.clientY	- startY;
	resizeBox.css("height",startHeight + dragDiff + "px");
	ev.preventDefault();
}

function resizeStop(ev){
	window.removeEventListener("mousemove",resizeMove,false);
	window.removeEventListener("mouseup",resizeStop,false);
	resizeBar.removeEventListener("mouseup",resizeStop,false);
}

function clearSelect(idnum){
	getel("searchbar-"+idnum).className = "hidden";
}

function searchMode(idnum){
	clearSelect(idnum);
	updateButtons(idnum,"search");
	getel("searchbar-"+idnum).className = "searchbar";
//	getel("search-"+idnum).className = "browsetab browsetab_selected";
	getel("body-"+idnum).innerHTML = "<div class='msg'>Enter search terms above</div>";
}

function searchKeyPress(ev,idnum){
	ev.stopPropagation();
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		searchDo(idnum);
	}
}

function recentMode(idnum){
	$.getJSON(urlbase+"/node/recent.js?callback=?",{},function(obj){
			loadObject(idnum,obj);		
	});
}

function mineMode(idnum){
	$.getJSON(urlbase+"/node/me.js?callback=?",{},function(obj){
			loadObject(idnum,obj);
	});
}

function unattachedMode(idnum){
	$.getJSON(urlbase+"/node/newsnips.js?callback=?",{},function(obj){
			loadObject(idnum,obj);
	});
}

function makeMainGroups(idnum){
	var body = getel("body-"+idnum);
	body.innerHTML = "";
//	var id = getId();
	var id = idnum;
	$("<div class='item-parents'/>").attr("id","parents-"+id).appendTo(body);
	$("<div class='item-current'/>").attr("id","current-"+id).appendTo(body);
	$("<div class='item-children'/>").attr("id","children-"+id).appendTo(body);
	$("<div class='item-propholder'/>").attr("id","propholder-"+id).appendTo(body);
	return id;
}

function combineRelates(obj){
	var fromrel = obj.from['relates to'];
	var torel = obj.to['relates to'];
	if(!torel){
		torel = [];
	}
	if(fromrel){
		if(!obj.to['relates to']){
			obj.to['relates to'] = [];
		}
		for(var i = 0; i < torel.length; i++){
			fromrel.push(torel[i]);
		}
		obj.from['relates to'] = [];
		obj.to['relates to'] = fromrel;
	}
}

function loadObject(idnum,obj){
	combineRelates(obj);
	var id = makeMainGroups(idnum);	
	makeParentItems(getel("parents-"+id),obj);
	makeSubItems(getel("children-"+id),obj);
	makeCurrentItem(getel("current-"+id),obj);
	pushHistory(idnum,obj.id);
	
	var browser = getel("browser-"+id);
	if(browser){
		browser.setAttribute("tl_id",obj.id);
	}
}
	
function searchDo(idnum){
	var query = getel("searchbox-"+idnum).value;
	getel("searchbar-"+idnum).className = "hidden";
	getel("body-"+idnum).innerHTML = "<div class='msg'>Searching...</div>";

//	var id = makeMainGroups(idnum);
//	var children = getel("children-"+id);
	$.getJSON(urlbase+"/node/search.js?query="+encodeURIComponent(query)+"&callback=?",function(obj){
			loadObject(idnum,obj);
//		for(var i = 0; i < results.length; i++){
//			$(children).append(makeDragItem(results[i]));
//		}
	});
}

function suggestDo(id){
	$.getJSON("http://localhost:8180/test/test?id="+id+"&callback=?",function(obj){
		loadObject(0,obj);
	});
}


function normalizeText(txt){
	txt = txt.replace(/\s+/g," ");
	txt = txt.replace(/^\s*/,"");
	txt = txt.replace(/\s*$/,"");
	return txt;
}

var dragInfo = {};

function dragStart(ev,node){
	ev.preventDefault();
	
	var holder = findHolder(node);
	dragInfo.node = node;
	dragInfo.holder = holder;
	dragInfo.browser = findBrowser(node);
	dragInfo.reltitle = findHolderRelation(holder);
	dragInfo.id = holder.getAttribute("tl_id");
	dragInfo.type = holder.getAttribute("tl_cls");
	dragInfo.text = normalizeText(node.textContent);	
	dragInfo.startX = ev.clientX;
	dragInfo.startY = ev.clientY;
	dragInfo.icon = $(holder).find("img").attr("src");
	
	if(dragInfo.type == "snippet"){
		dragInfo.title = holder.getAttribute("tl_title");
		dragInfo.url = holder.getAttribute("tl_url");
		dragInfo.realurl = holder.getAttribute("tl_realurl");
		dragInfo.text = holder.getAttribute("tl_text");
	}

	document.body.addEventListener("mousemove",dragMove,false);
	document.body.addEventListener("mouseup",dragDone,false);
}

function dragMove(ev){
	if(!dragInfo.logo){
		if(Math.abs(dragInfo.startX - ev.clientX) + Math.abs(dragInfo.startY - ev.clientY) > 16){
			 dragInfo.logo = makeDragItem(dragInfo).get(0);
			 document.body.appendChild(dragInfo.logo);
			 document.body.style.cursor = "pointer";
			 dragInfo.holder.style.display = "none";
		 	 dragInfo.holder.style.opacity = "0.5";
		}
	}
	if(dragInfo.logo){
		var logo = $(dragInfo.logo);	
		logo.css("position","fixed");
	 	logo.css("left",ev.clientX+2);
	 	logo.css("top",ev.clientY-(dragInfo.logo.offsetHeight/2));
	}
}

// TODO: don't allow dragging to a parent position. Only to a child position

function dragDone(ev,node){
	if(dragInfo.dropNode){
		tl_log("captured by "+dragInfo.dropNode.textContent+" after="+dragInfo.after);
		
		var draglink = findLinkInfo(dragInfo.holder);
		var droplink = findLinkInfo(findHolder(dragInfo.dropNode));
		
		var subjectid = dragInfo.id;
		
		var newitem = makeDragItem(dragInfo);
		if(dragInfo.after){
			newitem.insertAfter(dragInfo.dropNode);
		}else{
			newitem.insertBefore(dragInfo.dropNode);
		}
		
		var sourceobjectid = dragInfo.browser.getAttribute("tl_id");
		
		if((dragInfo.droptitle && dragInfo.droptitle == dragInfo.reltitle) || 
				sourceobjectid == "newsnips"){
			$(dragInfo.holder).remove();			
		}else{
			dragInfo.holder.style.display = "";
		}
		
		makeFixedOrder(newitem.get(0));
		var dragorder = getDragOrder(dragInfo.dropNode);
		var browser = findBrowser(dragInfo.dropNode);
		var topid = browser.getAttribute("tl_id");

		$.post(urlbase+"/node/"+topid+"/order.json",{order:makeJSONString(dragorder)},function(){
			if(draglink && droplink && draglink.objectid == droplink.objectid && draglink.verb == droplink.verb){
				return;
			}else{
				$.post(urlbase+"/node/create.json",{type:"link",info:makeJSONString(
					{subject:subjectid,verb:droplink.verb,object:droplink.objectid})},function(){
						tl_log("created new link");
					});
			}			
		});
	}else if(dragInfo.empty){
		tl_log("captured by empty");
		var newitem = makeDragItem(dragInfo);
		newitem.insertAfter(dragInfo.empty);
		var subjectid = dragInfo.id;
		var objectid = dragInfo.eid;
		$(dragInfo.empty).remove();
		$.post(urlbase+"/node/create.json",{type:"link",info:makeJSONString(
					{subject:subjectid,verb:dragInfo.verb,object:objectid})},function(){
					tl_log("created new link");
			});
	}
	dragStop(ev,node);
}

function makeFixedOrder(node){
	while(node && node.className != "relationtitle"){
		if(node.setAttribute){
			node.setAttribute("tl_pos","true");
		}
		node = node.prevSibling;		
	}
}

// create a JSON order string describing the order of things
// for this node. Split this by the verbs used in headers.
function getDragOrder(node){
	var siblings = findNodeGroup(node).childNodes;
	var verb = null;
	var ordermap = {};
	var thisorder = [];
	for(var i = 0; i < siblings.length; i++){
		var child = siblings[i];
		if(child.className == "relationtitle"){
			thisorder = [];						
			verb = child.getAttribute("tl_verb");
			ordermap[verb] = thisorder;
		}else{
			var hasorder = child.getAttribute("tl_pos");
			if(hasorder){
				thisorder.push(child.getAttribute("tl_id"));
			}			
		}
	}
	return ordermap;	
}


function dragStop(ev,node){	
	document.body.removeEventListener("mousemove",dragMove,false);
	document.body.removeEventListener("mouseup",dragDone,false);
	if(dragInfo.logo){
		document.body.removeChild(dragInfo.logo);
	}
	dragInfo.holder.style.display = "";
	dragInfo.holder.style.opacity = "";
	if(dragInfo.spacer){
		dragInfo.spacer.remove();
		dragInfo.spacer = null;
	}

	dragInfo = {};
	document.body.style.cursor = "";
}

function dragCapture(ev,node){
}

function dragEmptyOver(ev,node,id){
	if(!dragInfo.id) return;
	var verb = node.getAttribute("tl_verb");
	
	node.style.display = "none";
	var spacer = makeSpacer();
	spacer.insertAfter(node);
	
	if(dragInfo.spacer){
		var oldspacer = dragInfo.spacer;
			oldspacer.remove();
	}
	if(dragInfo.empty){
		dragInfo.empty.style.display = "";
	}
	dragInfo.spacer = spacer;
	dragInfo.dropNode = null;
	dragInfo.empty = node;
	dragInfo.verb = verb;
	dragInfo.eid = id;
	dragInfo.droptitle = findHolderRelation(node);
	dragInfo.holder.style.display = "";
}

function dragEmptyOut(ev,node,id){
//	node.style.display = "";
}

function dragOver(ev,node,id){
	if(node == dragInfo.logo) return;
	if(ev.relatedTarget && isParent(ev.relatedTarget,dragInfo.logo)) return;
	var holder = findHolder(node);
	if(holder == dragInfo.spacer /* || node == dragInfo.node */) return;

	var droptitle = findHolderRelation(holder);
	if(!droptitle) return;

	if(dragInfo.id && dragInfo.id != id && dragInfo.logo){
		var spacer = makeSpacer();
		// spacer.css("opacity","0");

//		tl_log("dragOver - "+id);

		var cinfo = clone(dragInfo);
		var noff = node.offsetTop;
		var top = getPos(holder).top;

		if(ev.clientY > (top + (holder.offsetHeight / 2))){
			spacer.insertAfter(holder);
			dragInfo.after = true;
		}else{
			spacer.insertBefore(holder);
			dragInfo.after = false;
		}
		
		if(dragInfo.spacer){
			var oldspacer = dragInfo.spacer;
				oldspacer.remove();
		}
		if(dragInfo.empty){
			dragInfo.empty.style.display = "";
		}

		dragInfo.spacer = spacer;
		var browser = findBrowser(node);
		dragInfo.dropNode = node;
		dragInfo.empty = false;
		dragInfo.droptitle = droptitle;
		
		if(dragInfo.droptitle && dragInfo.droptitle == dragInfo.reltitle){
			tl_log("same verb section");
			dragInfo.holder.style.display = "none";
		}else{
			tl_log("different section");
			dragInfo.holder.style.display = "";
		}
	}
}

// nothing right now
function dragOut(ev,node,id){
//	if(dragInfo.dropNode == node && dragInfo.spacer){
//		dragInfo.spacer.remove();
//		dragInfo.spacer = null;		
//		dragInfo.dropNode = null;
//	}
}


// nothing right now
function browseDragIn(ev,browser){
	return;
	
//	
//	if(ev.target == browser || dragInfo.hoverBrowser != browser){
//		dragInfo.hoverBrowser = browser;
//
//		if(dragInfo.holder && dragInfo.browser == browser){
//			dragInfo.holder.style.display = "none";
//		}else if(dragInfo.holder){
//			dragInfo.holder.style.display = "";
//			if(dragInfo.spacer){
//				dragInfo.spacer.remove();
//				dragInfo.spacer = null;
//			}
//		}
//	}
}

function isParent(node,parent){
	while(node && node != document){
		if(node == parent) return true;
		try{
			node = node.parentNode;
		}catch(e){
			return false;
			// we were passed a XUL object rather than a DOM element
		}
	}
	return false;
}

// nothing right now
function browseDragOut(ev,browser){
	return;
}

function setClaim(snipid){
	var claimid = $("#browser-1").attr("tl_id");
	$.post(urlbase+"/node/create.json",{type:"link",info:makeJSONString({subject:snipid,verb:"states",object:claimid})},function(){
		closePopupWindow();
	});	
}

// This is only a delete request, not a full delete, so it is a post rather than an HTTP DELETE
// the result is to knock down the score and hide it from us unless we have "show deleted" turned on
function deleteLink(ev,node,id){
	$.post(urlbase+"/node/"+id+"/delete.json",{},function(){
		thinklink_deletes[id] = true;
		tl_log("deleted link");
		$(node).remove();
	});
}

function deleteNode(ev,node,id,type){
	if(confirm("Are you sure you want to completely delete this "+type+"?\n"
		+"If you just want to disconnect the "+type+" then click 'Cancel' and"
		+"then click the disconnect button")){
		$.post(urlbase+"/node/"+id+"/delete.json",{},function(){
			thinklink_deletes[id] = true;
			tl_log("deleted node");
			$(node).remove();
		});
	}
}

function renameNode(ev,item,id){
	var newname = prompt("New name:",item.text());
	if(newname){
		$.post(urlbase+"/node/"+id+"/rename.json",{name:newname},function(){
			item.text(newname);
			tl_log("renamed node");
		});
	}
}

function make_hash(deletes){
	var hsh = {};
	for(var i = 0; i < deletes.length; i++){
		hsh[deletes[i]] = true;
	}
	return hsh;
}


//function deleteLink(ev,node,id,verb){
//	var group = findNodeGroup(node);
//	var idnum = getNodeIdNum(group);
//	var current = getel("current-"+idnum);
//	var objectid = current.getAttribute("tl_id");
//	$.post(urlbase+"/node/deletelink.json",{subject:id,object:objectid,verb:verb},function(){
//		tl_msg("deleted link");
//	});
//	
//}
