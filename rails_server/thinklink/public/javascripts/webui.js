
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
	var mk = function(icon){return "/images/"+icon+".png";};
	switch(obj.type){
		case "claim":
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
		case "user":
			return mk("user");
	}
}

function makeSpacer(){
	return $("<div class='dragtable'>spacer</div>");
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
	$("<td class='browsetitle'>"+title+"</td>").appendTo(row);
	var buttons = $("<td class='browsebuttons'/>").appendTo(row);
	$("<nobr class='browsebutton'>search</nobr>").appendTo(buttons)
		.click(function(){searchMode(idnum)});
	$("<nobr class='browsebutton'>history</nobr>").appendTo(buttons)
		.click(function(){recentMode(idnum)});
	$("<nobr class='browsebutton'>hot</nobr>").appendTo(buttons)
		.click(function(){hotMode(idnum)});
	$("<nobr class='browsebutton'>mine</nobr>").appendTo(buttons)
		.click(function(){mineMode(idnum)});
		
	makeInnerBrowser(idnum,box,obj,height);
}

function makeArgBrowser(divid,obj,height){
	var idnum = getId();
	var browser = $("#"+divid)
		.attr("class","browsetable")
		.attr("tl_id",obj.id)
		.attr("id","browser-"+idnum);
	makeInnerBrowser(idnum,browser,obj,height);	
}

function makeInnerBrowser(idnum,browser,obj,height){
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

	
	loadObject(idnum,obj);		
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
	
	if(label){
		$("<td class='draglabel'><nobr>"+label+": </nobr></td>")
			.attr("id","label-"+id)
			.appendTo(tr);
	}
	var tdicon = $("<td/>").append(icon).appendTo(tr);
	var item = $("<div class='dragitem'/>").attr("id",id)
		.attr("tl_id",obj.id).attr("tl_cls",obj.type)
		.text(obj.text);

	var tditem = $("<td/>").append(item).appendTo(tr);

	var breakicon = $("<img/>")
		.css("display","none")
		.css("cursor","pointer")
		.attr("src","/images/link_break.png")
		.css("margin-left","4px")
		.attr("title","disconnect")
		.attr("class","itembutton")
		.appendTo(item)
		.click(function(ev){
			ev.cancelBubble = true;
			ev.stopPropagation();
			deleteLink(ev,this,obj.id,label)});
//	var tdbreak = $("<td/>").append(breakicon).appendTo(tr);

	if(thinklink_user_id == obj.user){
		var deleteicon = $("<img/>")
			.css("display","none")
			.css("cursor","pointer")
			.attr("src","/images/cross.png")
			.attr("title","delete")
			.attr("class","itembutton")
			.appendTo(item)
			.click(function(ev){
				ev.cancelBubble = true;
				ev.stopPropagation();
				deleteNode(ev,this,obj.id,label)});
//		var tddelete = $("<td/>").append(deleteicon).appendTo(tr);				
	}
			
	holder.click(function(){selectItem(this,obj.id)})
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
			dragOver(ev,this,id)}
			)
		.mouseout(function(ev){
			if(isParent(ev.relatedTarget,holder.get(0))) return;
			breakicon.css("display","none");
			if(deleteicon){
				deleteicon.css("display","none");						
			}
			holder.tl_selected = false;
			dragOut(ev,this,id)});
		


	return holder;
}

function newThing(node,id,verb){
	var group = findNodeGroup(node);
	var idnum = getNodeIdNum(group);
	var reqId = getId();
	var browser = findBrowser(node);
	var id = browser.getAttribute("tl_id");
	var typ = getVerbSubjectType(verb);
	var icon = $("<img/>").attr("src",getIcon({type:typ}));	
	var holder = $("<div class='dragholder'/>");
	var table = $("<table class='dragtable'>").appendTo(holder);
	var tbody = $("<tbody/>").appendTo(table);
	var tr = $("<tr>").appendTo(tbody);
	var tdicon = $("<td/>").append(icon).appendTo(tr);
	var item = $("<div class='dragitem'/>").attr("id",id);
	var input = $("<input type='text'/>").appendTo(item);
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
	$.post("/node.json",{type:typ,info:makeJSONString({text:input.val()})},function(newid){
		$.post("/node.json",{type:"link",info:makeJSONString({subject:newid,verb:verb,object:id})},function(result){
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
	
	var url = snippet.url;
	var realurl = snippet.realurl;
	if(!realurl){
		realurl = url;
	}
	var holder = $("<div class='dragholder'>")
		.attr("id","holder-"+id)
		.attr("tl_id",snippet.id);
	var table = $(
		"<table class='dragtable'>"
			+"<tr><td><img/></td><td><div class='snipbody'/></td></tr>"
		+"</table>").appendTo(holder);	
	var img = $("<img/>").attr("src","/images/application_go.png");
	table.find("img").attr("src","/images/comment.png");
	$("<div class='sniptext'/>")
		.text("... "+snippet.text.substring(0,200)+" ...")
		.appendTo(table.find(".snipbody"));
	$("<a class='snippet_url'/>").text(trim_string(snippet.title,40) + " - "+trim_url(url))
		.attr("href",realurl).attr("target","_blank")
		.append(img)
		.appendTo(table.find(".snipbody"));

	holder.click(function(){selectItem(this,snippet.id)})
		.mouseup(function(ev){dragCapture(ev,this)})
		.mousedown(function(ev){dragStart(ev,this)})
		.mouseover(function(ev){dragOver(ev,this,id)})
		.mouseout(function(ev){dragOut(ev,this,id)});		
		
	return holder;
}	

function getVerbsTo(type){	
	switch(type){
		case "claim":	return ["supports","opposes","states"];
		case "topic": return ["refines","about"];
		case "snippet": return [];
		case "user": return ["created by"];
		case "recent":
		case "search":
		case "hot":
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
		case "search":
		case "hot":
			return ["colitem"];			
	}
}


function invertVerb(verb,text){
	switch(verb){
		case "about": return "claims about "+text;
		case "refines": return "more specific topics";
		case "opposes": return "opposed by";
		case "supports": return "supported by";
		case "states": return "snippets making this claim";
		case "related": return "related";
		case "colitem": return "colitem";
		case "created by": return "created";
	}	
	return "";
}

function getVerbSubjectType(verb){
	switch(verb){
		case "about": return "claim";
		case "refines": return "topic";
		case "opposes": return "claim";
		case "supports": return "claim";
		case "states": return "snippet";
		case "related": return "claim";
		case "created by": return "snippet";
	}
}

function makeSubItems(div,obj){
	var verbs = getVerbsTo(obj.type);
	for(var i = 0; i < verbs.length; i++){
		var verb = verbs[i];		
		var newicon = $("<img class='newthing' src='/images/add.png' onclick='newThing(this,"+obj.id+",\""+verb+"\")'/>");
		if(verb != "colitem"){
			var reltitle = $("<div class='relationtitle'/>")
				.attr("tl_verb",verb)
				.text(invertVerb(verb,obj.text))
				.appendTo(div);	
			if(verb != "created by" && verb != "states"){
				reltitle.append(newicon);
			}
		}
		var items = obj.to[verb];
		if(items && items.length > 0){
			for(var j = 0; j < items.length; j++){
				if(verb == "states"){
					$(div).append(makeSnippet(items[j]));
				}else{			
					$(div).append(makeDragItem(items[j]));
				}
			}
		}else{
			$(div).append($("<div class='empty'>empty</div>"));
		}				
	}
}

function makeParentItems(div,obj){
	var verbs = getVerbsFrom(obj.type);
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
	$.getJSON("/node/" + id,{},function(obj){
		parents.innerHTML = "";
		children.innerHTML = "";
		makeParentItems(parents,obj);
		makeSubItems(children,obj);
		animateShow(parents);
		animateShow(children);		
	});
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

function clearButton(what,idnum){
	var but = getel(what+"-"+idnum);
	if(but){
		but.className = "browsetab";
	}
}

function clearSelect(idnum){
	clearButton("all",idnum);
	clearButton("recent",idnum);
	clearButton("scratch",idnum);
	clearButton("hot",idnum);
	clearButton("friends",idnum);
	clearButton("search",idnum);
	clearButton("hot",idnum);
	getel("searchbar-"+idnum).className = "hidden";
}


function searchMode(idnum){
	clearSelect(idnum);
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
	$.getJSON("/node/recent",{},function(obj){
			loadObject(idnum,obj);		
	});
}

function mineMode(idnum){
	$.getJSON("/node/me",{},function(obj){
			loadObject(idnum,obj);
	});
}

function makeMainGroups(idnum){
	var body = getel("body-"+idnum);
	body.innerHTML = "";
	var id = getId();
	$("<div class='item-parents'/>").attr("id","parents-"+id).appendTo(body);
	$("<div class='item-current'/>").attr("id","current-"+id).appendTo(body);
	$("<div class='item-children'/>").attr("id","children-"+id).appendTo(body);
	$("<div class='item-propholder'/>").attr("id","propholder-"+id).appendTo(body);
	return id;
}

function loadObject(idnum,obj){
	var id = makeMainGroups(idnum);
	makeParentItems(getel("parents-"+id),obj);
	makeSubItems(getel("children-"+id),obj);
	makeCurrentItem(getel("current-"+id),obj);
}
	
function searchDo(idnum){
	var query = getel("searchbox-"+idnum).value;
	getel("searchbar-"+idnum).className = "hidden";
	getel("body-"+idnum).innerHTML = "<div class='msg'>Searching...</div>";

//	var id = makeMainGroups(idnum);
//	var children = getel("children-"+id);
	$.getJSON("/node/search",{query:query},function(obj){
			loadObject(idnum,obj);
//		for(var i = 0; i < results.length; i++){
//			$(children).append(makeDragItem(results[i]));
//		}
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
	dragInfo.id = holder.getAttribute("tl_id");
	dragInfo.type = holder.getAttribute("tl_cls");
	dragInfo.text = normalizeText(node.textContent);	
	dragInfo.startX = ev.clientX;
	dragInfo.startY = ev.clientY;
	dragInfo.icon = $(holder).find("img").attr("src");

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
	if(dragInfo.dropNode && dragInfo.hoverBrowser){
		tl_log("captured by "+dragInfo.dropNode.textContent+" after="+dragInfo.after);
		var newitem = makeDragItem(dragInfo);
		if(dragInfo.after){
			newitem.insertAfter(dragInfo.dropNode);
		}else{
			newitem.insertBefore(dragInfo.dropNode);
		}
		if(dragInfo.hoverBrowser == dragInfo.browser || dragInfo.moveMode){
			$(dragInfo.holder).remove();			
		}
		
		makeFixedOrder(newitem);
		var dragorder = getDragOrder(dragInfo.dropNode);
		$.post("/node/"+dragInfo.id+"/order.json",{order:makeJSONString(dragorder)});
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
			if(thisorder.length > 0){
				ordermap[verb] = thisorder;
			}
			ordermap = [];
			verb = child.getAttribute("tl_verb");
		}else{
			var hasorder = child.getAttribute("tl_pos");
			if(hasorder){
				thisorder.push(child);
			}			
		}
	}
	if(thisorder.length > 0){
		ordermap[verb] = thisorder;
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

function dragOver(ev,node,id){
	if(isParent(ev.relatedTarget,dragInfo.logo)) return;
	var holder = findHolder(node);
	if(holder == dragInfo.spacer || node == dragInfo.node) return;
	if(dragInfo.id && dragInfo.id != id && (dragInfo.dropNode != node || dragInfo.fromPreview) && dragInfo.logo){	
		var spacer = makeSpacer();
		spacer.css("opacity","0");

		var cinfo = clone(dragInfo);
		var noff = node.offsetTop;

		if(dragInfo.spacer && dragInfo.spacer.get(0).offsetTop < holder.offsetTop){
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
		dragInfo.spacer = spacer;
		var browser = findBrowser(node);
		dragInfo.dropNode = node;
		dragInfo.fromPreview = false;
	}
}

function dragOut(ev,node,id){
	if(isParent(ev.relatedTarget,dragInfo.logo)) return;
	var holder = findHolder(node);
	if(holder == dragInfo.spacer || node == dragInfo.node || node == dragInfo.dropNode){
		dragInfo.fromPreview = true;
		return;
	}
}



function browseDragIn(ev,browser){
	if(ev.target == browser || dragInfo.hoverBrowser != browser){
		dragInfo.hoverBrowser = browser;

		if(dragInfo.holder && dragInfo.browser == browser){
			dragInfo.holder.style.display = "none";
		}else if(dragInfo.holder){
			dragInfo.holder.style.display = "";
			if(dragInfo.spacer){
				dragInfo.spacer.remove();
				dragInfo.spacer = null;
			}
		}
	}
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

function browseDragOut(ev,browser){
	if(!isParent(ev.relatedTarget,browser)){
		if(isParent(ev.relatedTarget,dragInfo.logo) || isParent(ev.target,dragInfo.logo)) return;
		if(dragInfo.hoverBrowser == browser){
			dragInfo.hoverBrowser = null;
			if(dragInfo.holder){
				dragInfo.holder.style.display = "";
				if(dragInfo.spacer){
					dragInfo.spacer.remove();
					dragInfo.spacer = null;
				}
			}
		}
	}
}

function setClaim(snipid){
	var claimid = $("#browser-1").attr("tl_id");
	$.post("/node.json",{type:"link",info:makeJSONString({subject:snipid,verb:"states",object:claimid})},function(){
		closePopupWindow();
	});	
}