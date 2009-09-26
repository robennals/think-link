
var steps = [];
var lastid = 0;
var index = 0;

function nextStep(){
	if(steps.length > index){
		var step = steps[index];
		index++;
		replayStep(step.kind,JSON.parse(step.data));
	}else{
		$.getJSON("/thinklink/api/studytrack.json",{lastid:lastid},function(newsteps){
			steps = newsteps;
			index = 0;
			if(steps.length == 0){
				setTimeout(function(ev){
					nextStep();
				},200);
			}else{
				lastid = steps[steps.length-1].id
				nextStep();
			}
		})	
	}	
}

function replayStep(kind,data){
	try{
		switch(kind){
			case "click": return replayClick(data); 
			case "load": return replayLoad(data);
			case "unload": return replayUnload(data);
			case "windowfocus": return replayWindowFocus(data);
			case "focus": return replayFocus(data);
			case "resize": return replayResize(data);
			case "mouse": return replayMouse(data);
			case "click": return replayClick(data);
			default: nextStep();
		}
	}catch(e){
		nextStep();
	}
}

function replayLoad(data){
	var frdiv = $("<div class='holder'/>").attr("id",data.key)		
		.css("position","relative")
		.appendTo("#main");
	var iframe = $("<iframe/>").attr("src",data.url)
		.attr("width",data.width).attr("height",data.height)
		.load(function(ev){nextStep()}).appendTo(frdiv);	
	var mouse = $("<img class='mouse'/>")
		.attr("src","/images/pencil.png")
		.css("position","absolute")
		.appendTo(frdiv);
}

function replayUnload(data){
	frame(data).remove();
	nextStep();
}

function replayWindowFocus(data){
	$(".holder").css("border","none");
	frame(data).css("border","10px solid black").scrollIntoView();
	nextStep();
}

function replayFocus(data){
	nextStep();
}

function replayResize(data){
	frame(data).attr("width",data.width).attr("height",data.height);
	nextStep();
}

function replayMouse(data){
	mouse(data).css("left",data.x).css("top",data.y);
	nextStep();
}

function replayClick(data){
	mouse(data).attr("src","/images/star.png");
	setTimeout(function(){
		mouse(data).attr("src","/images/pencil.png");
	},500);
	nextStep();
}


function mouse(data){
	return frame(data).find(".mouse");	
}

function frame(data){
	return $("#"+data.key);
}

nextStep();
