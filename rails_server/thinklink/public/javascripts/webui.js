
function clone(obj){
	var n = {};
	for(var i in obj){
		n[i] = obj[i];
	}
	return n;
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
	}
}

function makeSpacer(){
	return $("<div class='dragtable'>spacer</div>");
}

function makeDragItem(obj,label){
	var id = getId();
	var icon = $("<img/>").attr("src",getIcon(obj));	
	var holder = $("<div class='dragholder'/>")
		.attr("tl_id",obj.id).attr("tl_cls","obj.type")
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
		
	holder.click(function(){selectItem(this,obj.id)})
		.mouseup(function(ev){dragCapture(ev,this)})
		.mousedown(function(ev){dragStart(ev,this)})
		.mouseover(function(ev){dragOver(ev,this,id)})
		.mouseout(function(ev){dragOut(ev,this,id)});
		
	var tditem = $("<td/>").append(item).appendTo(tr);
	return holder;
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
	var url = snippet.url;
	var realurl = snippet.realurl;
	if(!realurl){
		realurl = url;
	}
	var holder = $("<div class='snipholder'>");
	var table = $(
		"<table class='dragtable'>"
			+"<tr><td><img/></td><div class='snipbody'/><td></td></tr>"
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
	return holder;
}	

function getVerbsTo(type){	
	switch(type){
		case "claim":	return ["supports","opposes","states"];
		case "topic": return ["refines","about"];
		case "snippet": return ["states"];
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
		case "snippet": return [];
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
	}	
}

function makeSubItems(div,obj){
	var verbs = getVerbsTo(obj.type);
	for(var i = 0; i < verbs.length; i++){
		var verb = verbs[i];		
		var newicon = $("<img class='newthing' src='/images/add.png' onclick='newThing(this,\""+verb+"\")'/>");
		var header = $("<div class='relationtitle'/>").text(invertVerb(verb,obj.text))
			.append(newicon).appendTo(div);	
			
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
	$.getJSON(thinklink_urlbase + "info.json",{id: id},function(obj){
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
	resizeBox = $(".browse_container");
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

function searchDo(idnum){
	var query = getel("searchbox-"+idnum).value;
	var id = makeMainGroups(idnum);
	var children = getel("children-"+id);
	$.getJSON("/api/search",{query:query},function(results){
		for(var i = 0; i < results.length; i++){
			$(children).append(makeDragItem(results[i]));
		}
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
	}
	dragStop(ev,node);
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
		tl_log("dragIn");
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
	while(node){
		if(node == parent) return true;
		node = node.parentNode;
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
		tl_log("dragout");
	}
}

