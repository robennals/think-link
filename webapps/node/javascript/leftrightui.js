
var big_right_arrow = null;
var panelbox = null;


function makeOrgUI(divid){
	panelbox = $("<tr class='panelbox'/>");
	$(document.body).append($("<table class='toptable'>").append(panelbox));
	
	getPanel(0,"recent.js");
	
	//var arrow = makeArrow();
	//big_right_arrow = arrow;
}

function getPanel(panelnum,nodeid){
	for(var i = panelnum; $("#panel-"+i).length != 0; i++){
		$("#panel-"+i).remove();		
	}
	panel = makePanel(panelnum,nodeid);
	panelbox.append(panel);
}

function makeArrow(panelnum,item){
	for(var i = panelnum; $("#arrow-"+i).length != 0; i++){
		$("#arrow-"+i).remove();		
	}

	var pos = getPos(item.get(0));
	var arrow = $("<td class='arrow'>")
		.attr("id","arrow-"+panelnum)
		.css("padding-top",pos.top + item.height()/2 - 40);
	arrow.append($("<img/>").attr("src",iconUrl("big_right_arrow")));
	return arrow;	
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
	var panel2 = $("#panel-1");
	var panpos = getPos(panel.get(0));
	//big_right_arrow.css('left',panpos.left + panel.width() + 2);
	//big_right_arrow.css('top',pos.top + node.height()/2 - big_right_arrow.height()/2);
	
	//if(panel2.height() < pos.top + node.height()){
		//panel2.css("top",pos.top + node.height() - panel2.height());
	//}else{
		//panel2.css("top",10);
	//}
}

//function makeArrow(){
	//var arrow = $("<img class='arrow'/>")
		//.attr("src",urlbase+"/images/big_right_arrow.png");
////		.css("position","absolute");
	//arrow.appendTo(document.body);
	//return arrow; 
//}


function makePanel(panelnum,nodeid){
	var panel = $("<td class='panel'/>").attr("id","panel-"+panelnum);
	if(nodeid){
		loadObject(panel,nodeid,panelnum);
	}else{
		panel.append($("<div class='info'><h2>Browser Panel</h2><div class='message'>Select a node</div></div>"));
	}
	return panel;
}

function loadObject(panel,nodeid,panelnum){
	var url;
	if(nodeid.indexOf("?") == -1){
		url = urlbase+"node/"+nodeid+"?callback=?";
	}else{
		url = urlbase+"node/"+nodeid+"&callback=?";
	}
	$.getJSON(url,function(obj){
		panel.empty();
		panel.append(makeInfo(obj,panelnum));
	});	
}

var verbs = ["supports","opposes","relates to","colitem"];

function makeInfo(obj,panelnum){
	var info = $("<div class='info'/>");
	var body = $("<div class='panelbody'>").appendTo(info);
	$("<h2/>").text(obj.text).appendTo(body);	
	
	switch(obj.type){
		case "snippet":
			
			break;
		case "topic":
			body.append(makeSubGroup("claims about this topic",obj.to.about,panelnum));
			body.append(makeSubGroup("related topics",obj.to['relates to'],panelnum));
			break;
		case "claim":
			body.append(makeSubGroup("supported by",obj.to.supports,panelnum));
			body.append(makeSubGroup("opposed by",obj.to.opposes,panelnum));
			body.append(makeSubGroup("related to",obj.to['relates to'],panelnum));
			break;
		default:
			body.append(makeSubGroup(null,obj.to.colitem,panelnum));
			break;

	}
	
	//for(var i = 0; i < verbs.length; i++){
		//verb = verbs[i];
		//var links = obj.to[verb];
		//if(links && links.length > 0){
			//if(verb != "colitem"){
				//$("<h3/>").text(invertVerb(verb)).appendTo(body);
			//}
			//var box = $("<div class='subgroup'>").appendTo(body);
			//for(var j = 0; j < links.length; j++){
				//box.append(makeLink(links[j],panelnum));
			//} 
		//} 
	//}
	return info;
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

function makeLink(obj,panelnum){
	var item = $("<a class='item'/>")
		.attr("href",urlbase+"node/"+obj.id)
		.attr("tl_id",obj.id)		// TODO: shouldn't need this
		.attr("tl_panel",panelnum)
		.click(function(ev){
			ev.preventDefault();
			selectItem(item,obj.id,panelnum);
			return false;
			})		
	var icon = $("<img class='icon'/>").attr("src",getIcon(obj));				
	var text = $("<span/>").text(obj.text);
	item.append(makeHBox([icon,text],"linkbox"));
	
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
		case "topic":
			return iconUrl("folder");
		case "user":
			return iconUrl("user");
	}
}
	

var selection = {};

function selectItem(item,id,panelnum){
	try{
		if(selection[panelnum] == item){
			return;
		}
		item.attr("class","item-selected");
		if(selection[panelnum]){
			selection[panelnum].attr("class","item");
		}
		selection[panelnum] = item;
		panelbox.append(makeArrow(panelnum,item));
		getPanel(panelnum+1,""+id+".js");
		var pos = getPos(item.get(0));
		$('html,body').animate({scrollLeft: pos.left},500);
	}catch(ex){
		console.error(ex);
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


function tl_log(msg){		
	if(typeof console !== "undefined"){
		console.log(msg);
	}
}

//function tl_error(ex){		
	//if(typeof console !== "undefined"){
		//console.error(ex);
	//}
//}
