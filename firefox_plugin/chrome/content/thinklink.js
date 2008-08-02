
// this is the script that we inject into every page we load

var thinklink_base_rob = 
"http://mashmaker.intel-research.net/rob/scripts/";

var thinklink_base = 
"http://mashmaker.intel-research.net/beth/scripts/";


var thinklink_scriptUrls;

function thinklink_setScriptUrls(username){
	if(username == "rob@ennals.org"){
	 	thinklink_base = thinklink_base_rob;
	}
	
	thinklink_scriptUrls = 
		[thinklink_base+"jquery-1.2.3.js",
		thinklink_base+"ui.core.js",
		thinklink_base+"ui.draggable.js",
		thinklink_base+"ui.resizable.js",
		thinklink_base+"tl_margin.js",
		thinklink_base+"tl_snippet.js",
		thinklink_base+"tl_point.js",
		thinklink_base+"tl_helpers.js",
		thinklink_base+"tl_suggest.js",
		thinklink_base+"tl_url.js"];
		
	if(username == "rob@ennals.org"){
		thinklink_scriptUrls.push(thinklink_base+"tl_robconfig.js");	
	}else{
		thinklink_scriptUrls.push(thinklink_base+"tl_bethconfig.js");
	}
	
	thinklink_scriptUrls.push(thinklink_base+"thinklink.js");
}

// var thinklink_scriptUrl = "http://berkeley.intel-research.net/rennals/thinklink.js";
var thinklink_styleUrl = "http://mashmaker.intel-research.net/beth/css/style.css";

var thinklink_name = "ThinkLink";


function thinklink_error(msg,e){
	thinklink_msg(msg);
	Components.utils.reportError(e);
}

function thinklink_msg(msg){
	var cs = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	cs.logStringMessage(thinklink_name + ": " + msg);
}

function thinklink_show(button){
	var doc = thinklink_winlistener.getDoc();
	if(button.checked){
		doc.location.href = "javascript:myMargin.hideMargin()";
	}else{
		doc.location.href = "javascript:myMargin.showMargin()";
	}
	button.checked = !button.checked;
	doc.thinklink_checked = button.checked;
}

function thinklink_setIcon(image,doc){
	document.getElementById("thinklink-button").setAttribute("image",image);
	doc.thinklink_icon = image;
}

var thinklink_winlistener = {
	QueryInterface: function(iid){
		var ifaces = Components.interfaces;

		if(iid.equals(ifaces.nsIWebProgressListener) || 
				iid.equals(ifaces.nsISupportsWeakReference) ||
				iid.equals(ifaces.nsISupports)){
			return this;
		}else{
			throw Components.results.NS_NOINTERFACE;
		}
	},	
	
	onStateChange: function(progress, request, flags, status){
		try{
	
			var states = Components.interfaces.nsIWebProgressListener;
	
			if((flags & states.STATE_STOP) && (flags & states.STATE_IS_WINDOW)){
				var doc = this.getDoc();
				document.getElementById("thinklink-button").checked = false;
				if(!doc.thinklink_iconon){
					thinklink_setIcon("chrome://thinklink/skin/lightbulb_off.png",doc);
				}
	      doc.addEventListener("thinklink-showicon", function(e){
	      		thinklink_setIcon("chrome://thinklink/skin/lightbulb.png",doc);
	      		doc.thinklink_iconon = true;
	      },false);
	 			this.injectScripts();
			}else if((flags & states.STATE_START) && (flags & states.STATE_IS_WINDOW)){
				thinklink_setIcon("chrome://thinklink/skin/lightbulb_wait.png",doc);
			}
	 
	 	}catch(e){
	 		thinklink_error("onStateChange",e);
	 	}
 
		return;
		
	},
	
	onLocationChange: function(progress){		
		if(!content.document.body && content.frames.length == 0) return;
	  var doc = this.getDoc();

	  if(doc != progress.DOMWindow.document) return;
	  if(doc.thinklink_icon){
	  	thinklink_setIcon(doc.thinklink_icon,doc); 	
	  }else{
  		document.getElementById("thinklink-button").setAttribute("image","chrome://thinklink/skin/lightbulb_wait.png");
	  }
	  if(!doc.thinklink_injected){
	      doc.addEventListener("thinklink-showicon", function(e){
	      	doc.thinklink_icon = "chrome://thinklink/skin/lightbulb.png";
      		doc.thinklink_iconon = true;
	      	if(doc == content.document){
	      		thinklink_setIcon("chrome://thinklink/skin/lightbulb.png",doc);
	      	}
	      },false);

	  	this.injectScripts();
	  }
  	document.getElementById("thinklink-button").checked = doc.thinklink_checked;
	},
	onProgressChange: function(){return 0;},
	onStatusChange: function(){return 0;},
	onSecurityChange: function(){return 0;},
	onLinkIconAvailable: function(){return 0;},
	
	injectScripts: function(){		
		var doc = this.getDoc();
		for(var i in thinklink_scriptUrls){
			var scripturl = thinklink_scriptUrls[i];
			this.injectScript(scripturl,doc);
		}
		this.injectStyle(thinklink_styleUrl,doc);
		doc.thinklink_injected = true;
		if(doc.onmousedown){
			doc.onmousedown = null;
		}
		if(doc.onmouseup){
			doc.onmouseup = null;
		}
	},

	getDoc: function(){
//		return content.document;
		if(content.document.body && content.document.body.tagName != "FRAMESET"){
			return content.document;
		}else if(content.frames.length > 0){
			var maxwidth = 0;
			var maxframe = null;
			for(var i = 0; i < content.frames.length; i++){
				var frame = content.frames[i];
				if(frame.document.body.offsetWidth > maxwidth){
					maxwidth = frame.document.body.offsetWidth;
					maxframe = frame;
				}
			}
			return frame.document;
		}else{
			return null;
		}
	},

	injectStyle: function(styleurl,doc){
		var tag = doc.createElement("link");
		tag.href = styleurl;
		tag.rel = "stylesheet";
		tag.type = "text/css";
		try{
			doc.getElementsByTagName("head")[0].appendChild(tag);
		}catch(e){
			thinklink_error("could not insert script tag",e);
		}
	},	

	injectScript: function(scripturl,doc){
		var scripttag = doc.createElement("script");
		scripttag.src = scripturl;
		scripttag.type = "text/javascript";
		try{
			doc.getElementsByTagName("head")[0].appendChild(scripttag);
		}catch(e){
			thinklink_error("could not insert script tag",e);
		}
	}
};


function thinklink_setCookieForUri(uri,username,password){
  var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);   
  var cookieUri = ios.newURI(uri, null, null);
  var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
  cookieSvc.setCookieString(cookieUri, null, "username="+username, null);
  cookieSvc.setCookieString(cookieUri, null, "email="+username, null);
  cookieSvc.setCookieString(cookieUri, null, "password="+password, null);
}


function thinklink_getLogin(){
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var username = null;
		var password = null;
		if(prefs.prefHasUserValue("extensions.thinklink.username")){
			username = prefs.getCharPref("extensions.thinklink.username");
		}
    if(prefs.prefHasUserValue("extensions.thinklink.password")){
			password = prefs.getCharPref("extensions.thinklink.password");
		}	
//    var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);   
//    var cookieUri = ios.newURI("http://mashmaker.intel-research.net/", null, null);
//    var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
//    cookieSvc.setCookieString(cookieUri, null, "username="+username, null);
//    cookieSvc.setCookieString(cookieUri, null, "password="+password, null);
		thinklink_setCookieForUri("http://mashmaker.intel-research.net/",username,password);
		thinklink_setCookieForUri("http://mashmaker.intel-research.net:3000/",username,password);
		thinklink_setCookieForUri("http://mashmaker.intel-research.net:3001/",username,password);
		thinklink_setCookieForUri("http://localhost:3000/",username,password);
		
    thinklink_setScriptUrls(username);

}

function thinklink_init(){
	gBrowser.addProgressListener(thinklink_winlistener,
	  	Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
	thinklink_getLogin();
}

window.addEventListener("load", function(){
		thinklink_init();
	},false);