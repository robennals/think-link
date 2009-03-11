
var big_right_arrow = null;

function makeOrgUI(divid){
	var left = makePanel(0,"recent.js");
	var right = makePanel(1);	
	var arrow = makeArrow();
	big_right_arrow = arrow;
	$(document.body).append(left).append(right).append(arrow);

	doLayout();
	window.addEventListener("resize",doLayout,true);
	
	setTimeout(doLayout,100);
}

function doLayout(){
	var width = window.innerWidth;	
	var panelwidth = (width - 60)/2;
	$("#panel-0").css("width",panelwidth);
	$("#panel-1").css("width",panelwidth).css("left",panelwidth+50);

	if(selection){
		moveArrow(selection);
	}else{
		moveArrow($("#panel-0"));
	}

	var height = window.innerHeight;
	$(".panelbody").css("height",height - 50);
}

function moveArrow(){
	var node;
	if(selection){
		node = selection;
	}else{
		node = $("#panel-0");
	}
	var pos = getPos(node.get(0));
	var panel = $("#panel-0");
	var panpos = getPos(panel.get(0));
	big_right_arrow.css('left',panpos.left + panel.width() + 2);
	big_right_arrow.css('top',pos.top + node.height()/2 - big_right_arrow.height()/2);
}

function makeArrow(){
	var arrow = $("<img class='arrow'/>")
		.attr("src",urlbase+"/images/big_right_arrow.png")
		.css("position","absolute");
	arrow.appendTo(document.body);
	return arrow; 
}


function doResize(){
	var nowheight = document.body.offsetHeight;
	var wantheight = window.innerHeight;
	var resizeBox = $(".panel_body");
	var bodyheight = resizeBox.get(0).offsetHeight;
	var pad = 20;
	resizeBox.css("height",bodyheight + wantheight - nowheight - pad);
	topheight = $(".helpmessage").get(0).offsetHeight + $(".browsetitle").get(0).offsetHeight;
	resizeBox.css("height",window.innerHeight - topheight);
}


function makePanel(panelid,nodeid){
	var panel = $("<div class='panel'/>").attr("id","panel-"+panelid);
	if(nodeid){
		loadObject(panel,nodeid);
	}else{
		panel.append($("<div class='info'><h2>Browser Panel</h2><div class='message'>Select a node</div></div>"));
	}
	return panel;
}

function loadObject(panel,nodeid){
	var url;
	if(nodeid.indexOf("?") == -1){
		url = urlbase+"node/"+nodeid+"?callback=?";
	}else{
		url = urlbase+"node/"+nodeid+"&callback=?";
	}
	$.getJSON(url,function(obj){
		panel.empty();
		panel.append(makeInfo(obj));
		doLayout();
	});	
}

var verbs = ["supports","opposes","relates to","colitem"];

function makeInfo(obj){
	var info = $("<div class='info'/>");
	var body = $("<div class='panelbody'>").appendTo(info);
	$("<h2/>").text(obj.text).appendTo(body);	
	for(var i = 0; i < verbs.length; i++){
		verb = verbs[i];
		var links = obj.to[verb];
		if(links && links.length > 0){
			$("<h3/>").text(invertVerb(verb)).appendTo(body);
			var box = $("<div class='subgroup'>").appendTo(body);
			for(var j = 0; j < links.length; j++){
				box.append(makeLink(links[j]));
			} 
		} 
	}
	return info;
}

function makeLink(obj){
	var item = $("<a/>")
		.attr("class","item")
		.attr("href",urlbase+"node/"+obj.id)
		.text(obj.text)
		.click(function(ev){ev.preventDefault();selectItem(item,obj.id);})
	return item;
}

var selection = null;

function selectItem(item,id){
	item.attr("class","item-selected");
	if(selection){
		selection.attr("class","item");
	}
	selection = item;
	moveArrow();
	loadObject($("#panel-1"),""+id+".js");
}

function shiftLeft(){
	
}

function shiftRight(){
}

function getParentWithClass(node,classname){
	while(node != null && node.getAttribute){
		if(node.className == classname){
			return node;
		}
		node = parentNode;
	}
}

function getPanel(node){
	return getParentWithClass(node,"panel");
}

function makeHBox(items,classname){
	var table = $("<table/>").attr("class",classname);
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
	return {left:left,top:top}
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
