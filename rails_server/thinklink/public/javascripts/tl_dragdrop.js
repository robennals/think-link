
function dragDropPoint(div){
	div.addEventListener("mousedown",dragStart,false);
	div.addEventListener("mouseup",pointCapture,false);
	div.addEventListener("mouseover",dragOver,false);
	div.addEventListener("mouseout",dragOut,false);
}


var startX;
var startY;
var dragStarted;
var dragId;

function dragStart(ev){
	ev.preventDefault();
	
	draggedPoint = makePointDiv(ev.target.id,ev.target.textContent);
	document.body.appendChild(draggedPoint);
	draggedPoint.style.opacity = "0.4";	
	dragId = ev.target.id;
	if(!dragId){
		dragId = ev.target.parentNode.id;
	}
	
	var div = draggedPoint;
	div.style.position = "fixed";
	div.style.left = (ev.clientX+2)+"px";
	div.style.top = (ev.clientY+2)+"px";
	
	startX = ev.clientX;
	startY = ev.clientY;
	dragStarted = false;
	
	document.body.addEventListener("mousemove",dragMove,false);
	document.body.addEventListener("mouseup",dragStop,false);
	draggedPoint.removeEventListener("mouseup",pointCapture,false);
}

function dragOver(ev){
//	ev.target.style.fontWeight = "bold";
	ev.target.style.backgroundColor = "#e2f5ff";
}

function dragOut(ev){
//	ev.target.style.fontWeight = "normal";
	ev.target.style.backgroundColor = "";
}

function dragMove(ev){
	if((ev.clientX < startX - 16) || (ev.clientX > startX - 16)
	 || (ev.clientY < startY - 16) || (ev.clientY > startY - 16)){
	 	dragStarted = true;
	}
	if(dragStarted){
		var div = draggedPoint;
		div.style.position = "fixed";
		div.style.left = (ev.clientX+2)+"px";
		div.style.top = (ev.clientY+2)+"px";
	}
}

function dragStop(ev){
	document.body.removeEventListener("mousemove",dragMove,false);
	document.body.removeEventListener("mouseup",dragMove,false);
	draggedPoint.parentNode.removeChild(draggedPoint);
}

function pointCapture(ev){
	if(!draggedPoint || !dragStarted){
		return;
//				alert("'"+ev.target.textContent + "' captured '"+draggedPoint.textContent+"'");
	}


	// NOTE: I think source and target are the wrong way round on the server
	
	var sourceId = ev.target.id;
	if(!sourceId){
		sourceId = ev.target.parentNode.id;
	}
	
	var targetId = dragId;

	var dialog = $("<div/>").addClass("tl_dialog").attr("id","reldialog")
		.css("left",ev.clientX).css("top",ev.clientY).css("position","fixed").css("width","300px")
		.appendTo(document.body);
	var title = $("<div>").addClass("tl_dialog_title")
		.text("How are these points related?")
		.mousedown(function(e) { tl_dragStart(e,"reldialog") }) // use title bar to drag browser;
		.appendTo(dialog);

	var cancel = $("<span style='position: absolute; right: 4px'/>").appendTo(title);
	var cancelbut = $("<img src='/images/cancel.png'/>").appendTo(cancel)
		.click(function(){
			$(dialog).animate({ height: 'hide', opacity: 'hide' }, 'slow');
			dialog.parentNode.removeChild(dialog);
		});
	var body = $("<form/>").addClass("tl_dialog_body").appendTo(dialog);
	var first = $("<div>").addClass("point_text").text(draggedPoint.textContent).appendTo(body);

	var supports = $("<input type='button' value='Supports'/>")
		.appendTo(body).css("margin-left","75px")
		.click(function(){linkPoints(dialog,"supports",sourceId,targetId);});
	var opposes = $("<input type='button' value='Opposes'/>")
		.appendTo(body)
		.click(function(){linkPoints(dialog,"opposes",sourceId,targetId);});				
		
	var second = $("<div/>").addClass("point_text").text(ev.target.textContent).appendTo(body);
}

function linkPoints(dialog,rel,sourceid,targetid){
		var fieldString = "?destid="+targetid+"&rel="+rel+"&sourceid="+sourceid;
		doAJAX("tl_newpointlink_ajax","new_point_link.php"+fieldString,function(result){
			tl_log("new point link: "+ result);
			if (result==false) { alert("A point cannot link to itself"); return;}
		
			ajaxReplace('/points/'+sourceid+'/expand','holder-'+sourceid);			
			
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