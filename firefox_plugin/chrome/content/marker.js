
var thinklink_imagebase = "http://thinklink.cs.berkeley.edu/thinklink/images/"

function tl_log(msg){
    var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
    consoleService.logStringMessage("Think Link: " + msg)
}

function get_api_path(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var apipath = "http://disputefinder.cs.berkeley.edu/thinklink";
	if(prefs.prefHasUserValue("extensions.thinklink.api")){
		apipath = prefs.getCharPref("extensions.thinklink.api");
	}	
	return apipath;
}

var global_marked = [];

function filter_snippets(snippets){
	var filtered = [];
	for(var i = 0; i < snippets.length; i++){
		if(isIgnored(snippets[i].claimid)){
		}else{
			filtered.push(snippets[i])
		}
	}
	return filtered;
}

function thinklink_test_performance(){
	var start = (new Date).getTime();
	var count = 0;
	var end = (new Date).getTime();
	while(end - start < 2000){
		//var marked = global_marked;
		//for(var i = 0; i < marked.length; i++){
			//unmark_snippet(marked[i]);
		//}
		find_phrases(content.document);
		count += 1.0;
		end = (new Date).getTime();
	}
	var one_time = (end-start)/count;
	alert("Time to mark page = "+one_time);
}

function update_highlights(){
	var marked = content.document.thinklink_marked;
	content.document.disputefinder_done = true;

	if(marked){
		for(var i = 0; i < marked.length; i++){
			unmark_snippet(marked[i]);
		}	
	}
	loadIgnored(function(){
		find_phrases(content.document);
	});
}

function findBrowser(doc){
	for(var i = 0; i < gBrowser.browsers.length; i++){
		if(gBrowser.browsers[i].contentDocument == doc){
			return gBrowser.browsers[i];
		}
	}
	return null;
}

function claimMessageMove(marked,claimtext,claimid,text,doc,paraphrase,paraid){
	var notificationBox = gBrowser.getNotificationBox(findBrowser(doc));
	var notification =
		notificationBox.getNotificationWithValue("thinklink-disputed");
	var buttons = [{
		label: "More Info",
		callback: function(){viewClaim(claimid,text,paraphrase,paraid);},
	accessKey: "I",
		popup: null
		},{
		label: "Goto Snippet",
		callback: function(){marked[0].scrollIntoView(true);},
		accessKey: "G",
		popup: null
		}];
	 
	var message = "disputed claim: "+claimtext;

	const priority = notificationBox.PRIORITY_INFO_MEDIUM;
	notificationBox.appendNotification(message, "thinklink-disputed",
	"chrome://thinklink/skin/lightbulb_red.png", priority, buttons);	
}

function upgradeMessage(doc){
	var notificationBox = gBrowser.getNotificationBox(findBrowser(doc));
	var notification =
		notificationBox.getNotificationWithValue("thinklink-disputed");
	var buttons = [{
		label: "Upgrade",
		callback: function(){window.open("https://addons.mozilla.org/en-US/firefox/addon/11712")},
		accessKey: "G",
		popup: null
		}];
	var message = "This version of Dispute Finder is no longer supported";

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
	return str.toLowerCase().replace(/[^\w]/g,"")
}

function unmark_snippet(node){
	node.style.backgroundColor = "";
	node.style.cursor = "";
	node.setAttribute("title","");
	node.removeEventListener("click",showClaimPopup,true);
	if(node.className == "disputefinder_highlight"){
		node.className = "";
	}
}

function joinNormStrings(arr){
	var buf = ""
	for(var i = 0; i < arr.length; i++){
		buf+=arr[i]+" ";
	}
	return buf;
}

function divideSnip(parent,realtext){
	realtext = realtext.replace(/^\s+/,"").replace(/\s$/,"")
	var words = realtext.split(/\s+/)
	for(var i = 1; i < words.length; i++){
		var first = joinNormStrings(words.slice(0,words.length - i))
		var second = joinNormStrings(words.slice(words.length - i,words.length))
		var foundfirst = false
		for(var j = 0; j < parent.childNodes.length; j++){
			var child = parent.childNodes[j];
			if(child.tagName != "SCRIPT" && child.textContent && normalise(child.textContent).indexOf(normalise(first)) != -1){
				return {first: first, second: second, node: child, index: j}
			}
		}		
	}
	return null;
}


var global_markcount = 0;

function mark_snippet(origtext,realtext,text,claimid,paraphrase,claimtext,node,childoff,paraid){
	if(isIgnored(claimid)) return;
	if(!childoff) childoff = 0
	var nodetext = node.textContent;
	if(node.nodeName == "#comment" || normalise(nodetext).indexOf(text) == -1){
		return;					
	}	
	if(node.tagName == "SPAN" && node.getAttribute("class") == "disputefinder_highlight") return;
	if(node.nodeName != "#text" && node.childNodes){
		var insub = false;
		for(var i = childoff; i < node.childNodes.length; i++){
			var child = node.childNodes[i];
			if(child.tagName != "SCRIPT" && normalise(child.textContent).indexOf(text) != -1){
				mark_snippet(origtext,realtext,text,claimid,paraphrase,claimtext,child,0,paraid);
				insub = true;
			}
		}		
		// TODO: make this work well so it doesn't highlight lots of crap
		if(!insub && node.nodeName != "#text"){
			var divided = divideSnip(node,realtext)			
			if(divided){
				mark_snippet(origtext,divided.first,normalise(divided.first),claimid,paraphrase,claimtext,divided.node,0,paraid);
				mark_snippet(origtext,divided.second,normalise(divided.second),claimid,paraphrase,claimtext,node,divided.index,0,paraid);			
			}
			return;
		}
	}
	if(insub){
		return;
	}
	
	var icon = content.document.createElement("img");
	icon.src = "http://disputefinder.cs.berkeley.edu/thinklink/images/lightbulb_red.png";
	
	if(node.nodeName == "#text"){
		var splitted = splitText(nodetext,text);
		if(splitted != false && node.tagName != "PRE"){
			var pre = splitted.pre;
			var post = splitted.post;
		
			var span = content.document.createElement("span");
			span.appendChild(content.document.createTextNode(splitted.snip));
			span.setAttribute("class","disputefinder_highlight");
			node.parentNode.insertBefore(content.document.createTextNode(pre),node);
			node.parentNode.insertBefore(span,node);
			node.parentNode.insertBefore(icon,node);
			node.parentNode.insertBefore(content.document.createTextNode(post),node);
			node.parentNode.removeChild(node);
			node = span;
			// node = node.parentNode
		}else{
			node = node.parentNode;
			node.parentNode.insertBefore(icon,node.nextSibling);
		}
	}else{
		return;
	}
	//if(node.nodeName == "#text"){
		//node = node.parentNode;
	//}

	node.style.backgroundColor = "#FFD3D3";
	icon.style.cursor = "pointer";
	icon.style.border = "none";
	icon.setAttribute("title","disputed: "+claimtext);
	icon.setAttribute("thinklink_claimid",claimid);				
    icon.setAttribute("thinklink_paraphrase",paraphrase);
	icon.setAttribute("thinklink_paraid",paraid);
	icon.setAttribute("thinklink_phrase",origtext);				
	icon.addEventListener("click",showClaimPopup,true);
	icon.addEventListener("mousedown",function(ev){ev.preventDefault(); ev.stopPropagation();return false},true);
	icon.addEventListener("mouseup",function(ev){ev.preventDefault(); ev.stopPropagation();return false},true);
	icon.addEventListener("mouseover",function(ev){ev.preventDefault(); ev.stopPropagation();return false},true);
	global_marked.push(node);
	global_markcount++;
}

/* find where the snippet starts and ends in the nodetext */
function splitText(nodetext,sniptext){
	var start = nodetext.indexOf(sniptext);
	if(start != -1){
		return {pre: nodetext.substring(0,start), post: nodetext.substring(start+sniptext.length), snip:sniptext}		
	}
	
	var nodetext_n = normalise(nodetext)
	var sniptext_n = normalise(sniptext)
	
	var ni = 0;	
	for(var nni = 0; nni < nodetext_n.length; nni++){
		while(nodetext_n[nni] != nodetext[ni].toLowerCase() && ni < nodetext.length) ni++;
		
		var pad = 0;
		for(var sni = 0; sni < sniptext_n.length; sni++){
			while(nodetext_n[nni+sni] != nodetext[ni+sni+pad].toLowerCase() && ni+sni+pad < nodetext.length) pad++;
			if(sniptext_n[sni] != nodetext_n[nni+sni]) break;
			if(sni == sniptext_n.length - 1){
				return {
					pre: nodetext.substring(0,ni),
					post: nodetext.substring(ni+sni+pad+1),
					snip: nodetext.substring(ni,sni+ni+pad+1),
					sni: sni
				}
			}	
		}
	}
	return false;
}

function showClaimPopup(ev){
	var node = ev.currentTarget;
	var claimid = node.getAttribute("thinklink_claimid");
	var text = node.getAttribute("thinklink_phrase");	
	var paraphrase = node.getAttribute("thinklink_paraphrase");
	var paraid = node.getAttribute("thinklink_paraid");
	viewClaim(claimid,text,paraphrase,paraid);
	ev.preventDefault();
	ev.stopPropagation();
	return false;
}

function ajaxRequest(url,callback){
	var req = new XMLHttpRequest();
	req.open("GET",url,true);
	req.onreadystatechange = function(){
		if(req.readyState == 4 && req.status == 200){
			try{
			callback(JSON.parse(req.responseText))
			}catch(e){
				thinklink_error("exception in callback: "+e.message,e);
			}
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

function viewClaim(claimid,text,paraphrase,paraid) {
	var apipath = get_api_path();
	viewFrame(apipath+"/mini/claim/"+claimid
		+"?text="+encodeURIComponent(text)
		+"&paraphrase="+encodeURIComponent(paraphrase)
		+"&paraid="+paraid
		+"&url="+encodeURIComponent(content.document.location.href));
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

function viewFrame(url){
	var win = window.open(url,"disputefinder_popup","menubar=false, toolbar=false, location=false, "+
		"all=no, width=400px, height=500px"
		+", left="+(window.screenX+100)+", top="+(window.screenY+100));
}


var thinklink_globals = null;

function getGlobals(){
	if(thinklink_globals){
		if(!thinklink_globals.ignored){
			loadIgnored();
		}
		return thinklink_globals;
	}
	var hiddenWindow = Components.classes["@mozilla.org/appshell/appShellService;1"]
            .getService(Components.interfaces.nsIAppShellService)
            .hiddenDOMWindow;
	if(!hiddenWindow.thinklink_global){
		hiddenWindow.thinklink_global = {}
	}	
	thinklink_globals = hiddenWindow.thinklink_global;
	if(!thinklink_globals.ignored){
		thinklink_globals.ignored = {};
		loadIgnored()
	}
	return hiddenWindow.thinklink_global
}


function clearCache(){
	var globals = getGlobals();
	var apipath = get_api_path();
	globals.cache = {};		
	globals.ignored = {};
	globals.hotwords = null;
}

function loadIgnored(callback){
	var globals = getGlobals();
	var apipath = get_api_path();
	ajaxRequest(apipath+"/api/ignored.json",function(ignored){
		globals.ignored = {};
		for(var i = 0; i < ignored.length; i++){
			globals.ignored[ignored[i]] = true;
		}
		if(callback){
			callback();
		}
	})
}

function isIgnored(claimid){
	var globals = getGlobals();
	return globals.ignored[claimid]
}

function emptyMap(keys){
	var map = {}
	for(var i = 0; i < keys.length; i++){
		map[keys[i]] = true;
	}
	return map;
}

function maybeClearCache(url){
	var domain = getUrlDomain(url);
	if(domain == "cs.berkeley.edu" || domain == "localhost"){
		clearCache(); // they may be aware of very recent data
	}
}
