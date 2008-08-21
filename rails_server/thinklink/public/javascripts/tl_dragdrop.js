
function dragDropPoint(div){
	div.addEventListener("mousedown",dragStart,false);
	div.addEventListener("mouseup",pointCapture,false);
	div.addEventListener("mouseover",dragOver,false);
	div.addEventListener("mouseout",dragOut,false);
}

function makePointDiv(text){
	var div = document.createElement("div");
	div.className = "point_ref";
	div.appendChild(document.createTextNode(text));
	return div;
}

function makePoint(parent,id,text){
	div = makePointDiv(id,text);
	dragDropPoint(div);	
	parent.appendChild(div);
}



var startX;
var startY;
var dragStarted;
var dragId;

var dragText;
var dragId;
var dragClass;

function dragStart(ev,id,txt,cls){
	dragText = ev.target.textContent;
	dragId = id;
	dragClass = cls;
	
	ev.preventDefault();

	draggedPoint = null;	
		
	startX = ev.clientX;
	startY = ev.clientY;
	
	document.body.addEventListener("mousemove",dragMove,false);
	document.body.addEventListener("mouseup",dragStop,false);
}

function dragOver(ev,id){
//	ev.target.style.fontWeight = "bold";
	if(id != dragId){
		ev.target.style.backgroundColor = "#e2f5ff";
	}
}

function dragOut(ev){
//	ev.target.style.fontWeight = "normal";
	ev.target.style.backgroundColor = "";
}

function dragMove(ev){
	
	if(!draggedPoint){
		if((ev.clientX < startX - 16) || (ev.clientX > startX + 16)
		 || (ev.clientY < startY - 16) || (ev.clientY > startY + 16)){
			draggedPoint = makePointDiv(dragText);
			document.body.appendChild(draggedPoint);
			draggedPoint.style.opacity = "0.4";	
			var div = draggedPoint;
			div.style.position = "fixed";
			div.style.left = (ev.clientX+2)+"px";
			div.style.top = (ev.clientY+2)+"px";
		}
	}
	if(draggedPoint){
		var div = draggedPoint;
		div.style.position = "fixed";
		div.style.left = (ev.clientX+2)+"px";
		div.style.top = (ev.clientY+2)+"px";
	}
}

function dragStop(ev){
	document.body.removeEventListener("mousemove",dragMove,false);
	document.body.removeEventListener("mouseup",dragMove,false);
	if(draggedPoint){
		draggedPoint.parentNode.removeChild(draggedPoint);
		draggedPoint = null;
	}
}

function findHolderId(id){
	var node = document.getElementById(id);
	while(node && node.className != "dragholder"){
		node = node.parentNode;
	}
	if(node){
		return node.getAttribute("id");
	}
}

function dragCapture(ev,dropid,dropdivid,dropclass){
	if(!draggedPoint){
		return;
//				alert("'"+ev.target.textContent + "' captured '"+draggedPoint.textContent+"'");
	}

	var holderid = findHolderId(dropdivid);

	if(dropclass == "Point" && dragClass == "Point"){
	
		// NOTE: I think source and target are the wrong way round on the server
		
		var sourceId = dropid;		
		var targetId = dragId;
		
		if(sourceId == targetId){
			alert("Cannot related a point to itself");
			return;
		}
	
		var ypos = Math.min(ev.clientY,window.innerHeight - 100);
		ypos = Math.max(ypos,0);
		tl_log(ev.clientY+"-"+window.innerHeight+"-"+ypos);
		var dialog = $("<div/>").addClass("tl_dialog").attr("id","reldialog")
			.css("left",ev.clientX).css("top",ypos).css("position","fixed").css("width","300px")
			.appendTo(document.body);
		var title = $("<div>").addClass("tl_dialog_title")
			.text("How are these points related?")
			.mousedown(function(e) { tl_dragStart(e,"reldialog") }) // use title bar to drag browser;
			.appendTo(dialog);
	
		var cancel = $("<span style='position: absolute; right: 4px'/>").appendTo(title);
		var cancelbut = $("<img src='/images/cancel.png'/>").appendTo(cancel)
			.click(function(){
				$(dialog).animate({ height: 'hide', opacity: 'hide' }, 'slow');
				dialog.remove();
			});
		var body = $("<form/>").addClass("tl_dialog_body").appendTo(dialog);
		var first = $("<div>").addClass("point_text").text(draggedPoint.textContent).appendTo(body);
	
		var supports = $("<input type='button' value='Supports'/>")
			.appendTo(body).css("margin-left","75px")
			.click(function(){linkPoints(dialog,"supports",sourceId,targetId);});
		var opposes = $("<input type='button' value='Opposes'/>")
			.appendTo(body)
			.click(function(){linkPoints(dialog,"opposes",sourceId,targetId,holderid);});				
			
		var second = $("<div/>").addClass("point_text").text(ev.target.textContent).appendTo(body);
	}
	
	if(dropclass == "Topic" && dragClass == "Topic"){
		var fieldString = "?parentid="+dropid+"&childid="+dragId;
		doAJAX("tl_newtopiclink_ajax","new_topic_link.php"+fieldString,function(result){
			ajaxReplace('/topics/'+dropid+"/expand",holderid);
		});		
	}
}

function linkPoints(dialog,rel,sourceid,targetid,holderid){
		var fieldString = "?destid="+targetid+"&rel="+rel+"&sourceid="+sourceid;
		doAJAX("tl_newpointlink_ajax","new_point_link.php"+fieldString,function(result){
			tl_log("new point link: "+ result);
			if (result==false) { alert("A point cannot link to itself"); return;}
		
			ajaxReplace('/points/'+sourceid+'/expand',holderid);			
			
			$(dialog).animate({ height: 'hide', opacity: 'hide' }, 'slow');
			dialog.parentNode.removeChild(dialog);			
		});
}


function toggleShown(button,object){
	if(object.style.display == ""){
		button.src = "/images/tree_open.png";
		object.style.display = "none";
	}else{
		button.src = "/images/tree_close.png";
		object.style.display = "";
	}
}