
var thinklink_imagebase = "http://thinklink.cs.berkeley.edu/thinklink/images/"

function tl_log(msg){
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("Think Link: " + msg)
}

function get_api_path(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var apipath = "http://thinklink.cs.berkeley.edu/thinklink";
	if(prefs.prefHasUserValue("extensions.thinklink.api")){
		apipath = prefs.getCharPref("extensions.thinklink.api");
	}	
	return apipath;
}

var global_marked = [];

function mark_snippets(doc){
	var targeturl = doc.location.href;
	var apipath = get_api_path();
	var url = apipath+"/apianon/search.json?url="+encodeURIComponent(targeturl);	
	ajaxRequest(url,function(snippets){
		global_marked = [];
		for(var i = 0; i < snippets.length; i++){
			var snip = snippets[i];
			var frags = snip.text.split(/[\.\n\?\!]/)
			for(var j = 0; j < frags.length; j++){
				if(frags[j].length > 10){
					mark_snippet(normalise(frags[j]),snip.claimid,snip.claimtext,doc.body);			
				}
			}
		}
		if(snippets.length > 0){
			if(global_marked.length > 0){
//				showMessage("This page contains disputed claims (highlighted in pink)",doc);
				highlightMessage(global_marked,doc);
			}else{
				// TODO: cope better when can't find disputed claim
				claimMessage(snippets[0].claimtext,snippets[0].claimid,doc);
//				showMessage("This url was tagged with disputed claims, but we can't find them on the page anymore",doc);
			}
		}
		doc.thinklink_marked = global_marked;
	})
}

function update_highlights(){
	var marked = content.document.thinklink_marked;
	if(marked){
		for(var i = 0; i < marked.length; i++){
			unmark_snippet(marked[i]);
		}	
	}
	mark_snippets(content.document);
}

function findBrowser(doc){
	for(var i = 0; i < gBrowser.browsers.length; i++){
		if(gBrowser.browsers[i].contentDocument == doc){
			return gBrowser.browsers[i];
		}
	}
}

function claimMessage(claimtext,id,doc){
	var notificationBox = gBrowser.getNotificationBox(findBrowser(doc));
	var notification =
		notificationBox.getNotificationWithValue("thinklink-disputed");
	var buttons = [{
		label: "More Info",
		callback: function(){viewClaim(id);},
		accessKey: "I",
		popup: null
		}];
	 
	var message = "disputed claim: "+claimtext;

	const priority = notificationBox.PRIORITY_INFO_MEDIUM;
	notificationBox.appendNotification(message, "thinklink-disputed",
	"chrome://thinklink/skin/lightbulb_red.png", priority, buttons);	
}

function highlightMessage(marked,doc){
	var notificationBox = gBrowser.getNotificationBox(findBrowser(doc));
	var notification =
		notificationBox.getNotificationWithValue("thinklink-disputed");
	var buttons = [{
		label: "Goto First",
		callback: function(){marked[0].scrollIntoView(true);},
		accessKey: "G",
		popup: null
		}];
	var message = "This page contains disputed claims (highlighted in pink)";

	const priority = notificationBox.PRIORITY_INFO_MEDIUM;
	notificationBox.appendNotification(message, "thinklink-disputed",
	"chrome://thinklink/skin/lightbulb_red.png", priority, buttons);		
}

function showMessage(message,doc){
	var notificationBox = gBrowser.getNotificationBox(findBrowser(doc));
	var notification =
		notificationBox.getNotificationWithValue("thinklink-disputed");
	if (notification) {
		notification.label = message;
	}else {
		var buttons = [];
		//{
			//label: "ping",
			//accessKey: "K",
			//popup: "blockedPopupOptions",
			//callback: null
		 //}];

		const priority = notificationBox.PRIORITY_INFO_MEDIUM;
		notificationBox.appendNotification(message, "thinklink-disputed",
		"chrome://thinklink/skin/lightbulb_red.png", priority, buttons);	
	}
}

function normalise(str){
	return str.replace(/[^\w]/g,"")
}

function unmark_snippet(node){
	node.style.backgroundColor = "";
	node.style.cursor = "";
	node.setAttribute("title","");
	node.removeEventListener("click",showClaimPopup,true);
}

function mark_snippet(text,claimid,claimtext,node){
	if(node.nodeName == "#comment" || normalise(node.textContent).indexOf(text) == -1){
		return;					
	}	
	if(node.nodeName != "#text" && node.childNodes){
		var insub = false;
		for(var i = 0; i < node.childNodes.length; i++){
			var child = node.childNodes[i];
			if(child.tagName != "SCRIPT" && normalise(child.textContent).indexOf(text) != -1){
				mark_snippet(text,claimid,claimtext,child);
				return;
			}
		}		
	}
	if(node.nodeName == "#text"){
		node = node.parentNode;
	}
	
	node.style.backgroundColor = "#FFD3D3";
	node.style.cursor = "pointer";
	node.setAttribute("title","disputed: "+claimtext);
	node.setAttribute("thinklink_claimid",claimid);				
	node.addEventListener("click",showClaimPopup,true);
	global_marked.push(node);
}

function showClaimPopup(ev){
	var node = ev.currentTarget;
	var claimid = node.getAttribute("thinklink_claimid");
	viewClaim(claimid);
}

function ajaxRequest(url,callback){
	var req = new XMLHttpRequest();
	req.open("GET",url,true);
	req.onreadystatechange = function(){
		if(req.readyState == 4 && req.status == 200){
			callback(parseJSON(req.responseText))
		}
	}
	req.send(null);
}


function addFader(viewframe){
	var fader = content.document.createElement("div");
	with(fader.style){
		backgroundColor = "black";
		opacity = 0.3;
		display = "block";
		height = "100%";
		width = "100%";
		position = "fixed";
		left = "0px";
		top = "0px";
		zIndex = "1000";
	}
	fader.addEventListener("click",function(ev){
		content.document.body.removeChild(fader);
		content.document.body.removeChild(viewframe);
		update_highlights();
	},true);
	content.document.body.appendChild(fader);
	return fader;
}	

function viewClaim(id) {
	var apipath = get_api_path();
	viewFrame(apipath+"/mini/claim/"+id);
}

function dragPopup(ev,win,frame){
	var deltaX = win.offsetLeft - ev.screenX;
    var deltaY = win.offsetTop - ev.screenY;

	var dragMove = function(ev){
        var posx = Math.max(0,ev.screenX + deltaX);
        var posy = Math.max(0,ev.screenY + deltaY);
        win.style.left = posx + "px";
        win.style.top = posy + "px";
	}

	var dragStop = function(ev){
		content.document.removeEventListener("mousemove",dragMove,true);
		content.document.removeEventListener("mouseup",dragStop,true);
		frame.style.visibility = "visible";
	}

	content.document.addEventListener("mousemove",dragMove,true);
    content.document.addEventListener("mouseup",dragStop,true);
	
	frame.style.visibility = "hidden";
}

function viewFrame(url) {
	var doc = content.document;
	var that = this;
	
	if(doc.getElementById("tl_point_browser")){
		return;
	}
	
	var win = doc.createElement("div");
	win.setAttribute("id","tl_point_browser");
	win.className = "tl_dialog";
	win.style.zIndex = "214783647";
	doc.body.appendChild(win);
		
	var fader = this.addFader(win);
			
	win.style.overflow = "hidden";
	win.style.position = "fixed";
	win.style.top = "50px";
	win.style.left = "200px";
	win.style.width = "458px";
	
	var titleBar = doc.createElement("div");
	win.appendChild(titleBar);
	titleBar.setAttribute("id","tl_pb_title");
	titleBar.style.marginBottom = "0px";
	titleBar.style.cursor = "move";
	//titleBar.addEventListener("mousedown",function(ev){
		//tl_dragStart(ev,that.divID,"tl_point_frame");
	//},true);
	titleBar.className = "tl_dialog_title";
	
	var dragbar = doc.createElement("div");
	win.appendChild(dragbar);
	dragbar.style.position = "absolute";
	dragbar.style.top = "14px";
	dragbar.style.width = "240px";
	dragbar.style.height = "32px";
	dragbar.style.backgroundColor = "grey";
	dragbar.style.color = "white";
	dragbar.style.cursor = "move";
	dragbar.style.zIndex = "-1";
	dragbar.style.left = "170px";
	dragbar.style.paddingLeft = "8px";
	dragbar.style.paddingTop = "2px";
	dragbar.style.MozBorderRadius = "6px";
	dragbar.style.fontSize = "14px";
	dragbar.style.fontFamily = "arial,sans-serif";
	dragbar.style.textAlign = "left";
	dragbar.style.fontWeight = "normal";
	
	dragbar.textContent = "Think Link";
	
	var buttonBox = doc.createElement("span");
	buttonBox.style.position = "absolute";
	buttonBox.style.right = "4px";
	titleBar.appendChild(buttonBox);
	
	//var ignoreButton = doc.createElement("input");
	//ignoreButton.className = "tl_openbutton";
	//ignoreButton.setAttribute("type","button");
	//ignoreButton.setAttribute("value","Don't highlight again");
	//buttonBox.appendChild(ignoreButton);
	//ignoreButton.addEventListener("click",function(){
		//that.hideMe();
		//tl_doAJAX("tl_ignore","scripthack/ignoreclaim.js"+
			//"?claim="+snippet.claimid,function(){});					
	//},true);

	var close = doc.createElement("img");
	close.style.width = "64px";
	close.style.paddingTop = "2px";
	close.style.verticalAlign = "top";
	close.style.cursor = "pointer";
	close.setAttribute("src",thinklink_imagebase+"bigcancel.png");
	buttonBox.appendChild(close);
	close.addEventListener("click",function(){
		content.document.body.removeChild(win);
		content.document.body.removeChild(fader);
		update_highlights();
	},true);
	
	// add actual content
	var frameholder = doc.createElement("div");
	frameholder.style.height = "460px";
	frameholder.style.width = "424px";
	frameholder.style.marginTop = "34px";

	var pointframe = doc.createElement("iframe");
	pointframe.src = url;
	pointframe.style.width="100%";
	pointframe.style.height="100%";
	pointframe.style.overflow = "hidden";
	pointframe.style.border = "none";
	pointframe.setAttribute("id","tl_point_frame");
	pointframe.setAttribute("allowtransparency","true");
	frameholder.appendChild(pointframe);
//	frameholder.style.width="100%";
	win.appendChild(frameholder);

	dragbar.addEventListener("mousedown",function(ev){
		dragPopup(ev,win,pointframe);
	},true);


	win.style.visibility = "visible";
	win.style.display = "block";
}
