//  Copyright 2008 Intel Corporation
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.


// these are the scripts that we inject into every page we load
thinklink_scriptUrls = [
	"tl_margin.js",
	"tl_snippet.js",
	"tl_point.js",
	"tl_helpers.js",
	"tl_suggest.js",
	"tl_url.js",
	"tl_config.js",
	"thinklink.js"
];

var thinklink_name = "ThinkLink";


function thinklink_error(msg,e){
	thinklink_msg(msg);
	Components.utils.reportError(e);
}

function thinklink_msg(msg){
	var cs = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	cs.logStringMessage(thinklink_name + ": " + msg);
}

function thinklink_new_snippet(){
	var doc = thinklink_winlistener.getDoc();
	doc.location.href = "javascript:thinklink_newSnippet()";
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
	thinklink_open = button.checked;
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

	registerFrameEventHandlers: function(frame){
		var doc = thinklink_winlistener.getDoc();
		frame.addEventListener("thinklink-close",function(){
			doc.location.href = "javascript:mySnip.close()";	
		},false);
	},
	
	onStateChange: function(progress, request, flags, status){
		try{
	
			try{
				thinklink_msg("flags="+flags+" status="+status);
				if(content.document && content.document.body && content.document.body.textContent){
					thinklink_msg("text loaded");
				}
			}catch(e){
			}
	
			var states = Components.interfaces.nsIWebProgressListener;

			var doc = this.getDoc();	
			
		  if(doc != progress.DOMWindow.document){
		  	this.registerFrameEventHandlers(progress.DOMWindow.document);
		  	return;
		  }

			
			if((flags & states.STATE_STOP) && (flags & states.STATE_IS_WINDOW)){
	 			this.injectScripts();
			}
							 
	 	}catch(e){
	 		thinklink_error("onStateChange",e);
	 	}
 
		return;
		
	},
	
	onLocationChange: function(progress){		
		if(!content.document.body && content.frames.length == 0) return;
	  var doc = this.getDoc();

	  if(doc != progress.DOMWindow.document){
	  	this.registerFrameEventHandlers(progress.DOMWindow.document);
	  	return;
	  }
	  if(!doc.thinklink_injected){
	  	this.injectScripts();
	  }
	},
	onProgressChange: function(){return 0;},
	onStatusChange: function(){return 0;},
	onSecurityChange: function(){return 0;},
	onLinkIconAvailable: function(){return 0;},
	
	injectScripts: function(){		
    var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		var apipath = "http://durandal.cs.berkeley.edu/tl";
		var scriptpath = "http://durandal.cs.berkeley.edu/tlbits";
		if(prefs.prefHasUserValue("extensions.thinklink.javascript")){
			scriptpath = prefs.getCharPref("extensions.thinklink.javascript");
		}
    if(prefs.prefHasUserValue("extensions.thinklink.api")){
			apipath = prefs.getCharPref("extensions.thinklink.api");
		}	

		var doc = this.getDoc();
		
		this.injectLiteralScript(
			"var thinklink_scriptpath = '"+scriptpath+"'\n"+
			"var thinklink_apipath = '"+apipath+"'\n",doc);

		for(var i in thinklink_scriptUrls){
			var scripturl = thinklink_scriptUrls[i];
			this.injectScript(scriptpath+"/client_js/"+scripturl,doc);
		}
		this.injectStyle(scriptpath+"/css/style.css",doc);

		
		doc.thinklink_injected = true;
	
		try{			
			if(doc.onmousedown){
				doc.onmousedown = null;
			}
			if(doc.onmouseup){
				doc.onmouseup = null;
			}
		}catch(e){
//			thinklink_error("Error clearing mouse events",e);
		}
	},

	getDoc: function(){
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
	},
	
	injectLiteralScript: function(text,doc){
		var scripttag = doc.createElement("script");
		scripttag.text = text;
		scripttag.type = "text/javascript";
		try{
			doc.getElementsByTagName("head")[0].appendChild(scripttag);
		}catch(e){
			thinklink_error("could not insert script tag",e);
		}		
	}	
};


function thinklink_setCookieWithPaths(cookieSvc,cookieUri,name,value,path){
  cookieSvc.setCookieString(cookieUri, null, name+"="+value+"; path=/node", null);
  cookieSvc.setCookieString(cookieUri, null, name+"="+value+"; path=/scripthack", null);
  cookieSvc.setCookieString(cookieUri, null, name+"="+value+"; path=/tl/node", null);
  cookieSvc.setCookieString(cookieUri, null, name+"="+value+"; path=/tl/scripthack", null);
  cookieSvc.setCookieString(cookieUri, null, name+"="+value+"; path=/thinklink/node", null);
  cookieSvc.setCookieString(cookieUri, null, name+"="+value+"; path=/thinklink/scripthack", null);
}


function thinklink_setCookieForUri(uri,username,password){
  var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);   
  var cookieUri = ios.newURI(uri, null, null);
  var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
  username = username.replace("@",".");
  thinklink_setCookieWithPaths(cookieSvc,cookieUri,"username",username);
  thinklink_setCookieWithPaths(cookieSvc,cookieUri,"email",username);
  thinklink_setCookieWithPaths(cookieSvc,cookieUri,"password",password);
  thinklink_setCookieWithPaths(cookieSvc,cookieUri,"pluginversion","firefox-1");
}

function thinklink_setCookies(username,password){
	var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);   
	var cookieUri = ios.newURI("http://mashmaker.intel-research.net/", null, null);
	var cookieSvc = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);
	cookieSvc.setCookieString(cookieUri, null, "username="+username, null);
	cookieSvc.setCookieString(cookieUri, null, "password="+password, null);
	thinklink_setCookieForUri("http://mashmaker.intel-research.net:3000/",username,password);
	thinklink_setCookieForUri("http://localhost:3000/",username,password);
	thinklink_setCookieForUri("http://localhost:8180/",username,password);
	thinklink_setCookieForUri("http://durandal.cs.berkeley.edu/",username,password);
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
	thinklink_setCookies(username,password); 
}

function thinklink_init(){
	gBrowser.addProgressListener(thinklink_winlistener,
	  	Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
	thinklink_getLogin();
}

function thinklink_login(){
	var username = document.getElementById("thinklink-username").value;
	var password = document.getElementById("thinklink-password").value;
	thinklink_setCookies(username,password);
}

window.addEventListener("load", function(){
		thinklink_init();
	},false);
	
