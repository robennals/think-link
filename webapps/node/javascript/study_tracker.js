
var key = Math.floor(Math.random()*1000000)

var lasttime = 0;

function sendAction(kind,data){
	data.kind = kind;
	data.key = key
	$.post("/thinklink/api/studytrack",data,function(){
		// do nothing
	});	
}

var delayeddata = {};

function sendDelayed(delay,delaykey,kind,data){
	if(!delayeddata[delaykey]){
		setTimeout(function(){
			sendAction(kind,delayeddata[delaykey])
			delayeddata[delaykey] = null;
		},200);
	}
	delayeddata[delaykey] = data;	
}	


$(document.body).mousemove(function(ev){
	sendDelayed(100,"mouse","mouse",{x:ev.pageX,y:ev.pageY-16})
})

$(window).scroll(function(ev){
	sendDelayed(100,"scroll","scroll",{x:document.body.scrollLeft,y:document.body.scrollTop});
})

$(window).focus(function(ev){
	sendAction("windowfocus",{url:document.location.href});
})

$(window).load(function(ev){
	sendAction("load",{url:document.location.href,width:$(window).width(),height:$(window).height()})
	
	$("input").focus(function(ev){
		sendAction("focus",{id:ev.originalTarget.id})
	})
})

$(window).unload(function(ev){
	sendAction("unload",{url:document.location.href});
})

$(window).resize(function(ev){
	sendAction("resize",{width:$(window).width(),height:$(window).height()});
})

$(window).click(function(ev){
	sendAction("click",{x:ev.pageX,y:ev.pageY})
})

$(window).keyup(function(ev){
	sendAction("keyup",{id:ev.originalTarget.id,text:ev.originalTarget.value})
})

$(window).change(function(ev){
	sendAction("change",{id:ev.originalTarget.id,text:ev.originalTarget.value})
})
