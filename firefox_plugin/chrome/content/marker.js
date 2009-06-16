
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

function mark_snippets(doc){
	var targeturl = doc.location.href;
	var apipath = get_api_path();
	var url = apipath+"/apianon/search.json?url="+encodeURIComponent(targeturl);	
//	ajaxRequest(url,function(snippets){
    snippetsForUrl(targeturl,function(snippets){
		snippets = filter_snippets(snippets);
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
				highlightMessage(global_marked,doc);
			}else{
				// TODO: cope better when can't find disputed claim
				claimMessage(snippets[0].claimtext,snippets[0].claimid,doc);
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
	loadIgnored(function(){
		mark_snippets(content.document);
	});
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
	if(isIgnored(claimid)) return;
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



// CRC code from: http://noteslog.com/post/crc32-for-javascript/
// released under the MIT license
var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";     
 
/* Number */ 
function crc32(str) { 
    var crc = 0; 
	var n = 0; //a number between 0 and 255 
	var x = 0; //an hex number 

	crc = crc ^ (-1); 
	for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
		n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
		x = "0x" + table.substr( n * 9, 8 ); 
		crc = ( crc >>> 8 ) ^ x; 
	} 
	return crc ^ (-1); 
}; 


var thinklink_globals = null;

function getGlobals(){
	if(thinklink_globals){
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

var thinklink_shortdom = /\w*\.(?:com|org|net)/;
var thinklink_longdom = /(\w+\.\w+.\w+)[^\w\.]/;
var thinklink_otherdom = /(\w+\.\w+\.)[^\w\.]/;
var thinklink_localhostdom = /.*localhost.*/

function getUrlDomain(url){
	if(!url) return "undefined";
    var m = url.match(thinklink_shortdom);
	if(m) return m[0];
	var m = url.match(thinklink_longdom);
	if(m) return m[1];
	var m = url.match(thinklink_otherdom);
	if(m) return m[1];
	var m = url.match(thinklink_localhostdom);
	if(m) return "localhost";
	return "undefined";
}

function clearCache(){
	var globals = getGlobals();
	var apipath = get_api_path();
	globals.cache = {};		
	globals.ignored = null;
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

function snippetsForUrl(url,callback){
	var apipath = get_api_path();
	var domain = getUrlDomain(url);

	if(domain == "cs.berkeley.edu" || domain == "localhost"){
		clearCache(); // they may be aware of very recent data
		callback([]);
		return; // otherwise it loops round trying to reload data for cs.berkeley.edu
	}

	var globals = getGlobals();
	if(!globals.cache){
		globals.cache = {}
	}
	var cache = globals.cache;
	var domaincrc = crc32(domain);
    var urlcrc = crc32(url);

	if(!globals.ignored){
		loadIgnored(function(){
			snippetsForUrl(url,callback);
		});
	}else if(!cache[domaincrc]){	// haven't loaded info for this domain yet
		ajaxRequest(apipath+"/apianon/domaininfo.json?domain="+domaincrc,function(domaininfo){
			cache[domaincrc] = emptyMap(domaininfo);			
			snippetsForUrl(url,callback);
		})
	}else if(cache[domaincrc] && !cache[domaincrc][urlcrc]){ // page is not marked
		callback([]);
	}else if(cache[domaincrc] && cache[domaincrc][urlcrc] == true){ // pageinfo not loaded
		ajaxRequest(apipath+"/apianon/pageinfo.json?domain="+domaincrc+"&page="+urlcrc,function(pageinfo){
			cache[domaincrc][urlcrc] = pageinfo;
			snippetsForUrl(url,callback);
		})
	}else if(cache[domaincrc] && cache[domaincrc][urlcrc]){
		callback(cache[domaincrc][urlcrc]);
	}else{
		callback([]);
	}	
}
