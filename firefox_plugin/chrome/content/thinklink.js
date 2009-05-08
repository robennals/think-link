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

//function thinklink_show(button){
	//var doc = thinklink_winlistener.getDoc();
	//if(button.checked){
		//doc.location.href = "javascript:myMargin.hideMargin()";
	//}else{
		//doc.location.href = "javascript:myMargin.showMargin()";
	//}
	//button.checked = !button.checked;
	//doc.thinklink_checked = button.checked;
	//thinklink_open = button.checked;
//}

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
	
	injectStricts: function(){
		// DEBUG
		this.injectScript("http://localhost:8180/thinklink/client_js/showsnippet.js",doc);
		// this.injectFetchedScript("showsnippet.js");		
	},
	
	//injectScripts: function(){
		//var doc = this.getDoc();
		//if(doc.thinklink_injected){
			//return;
		//}
	   	//var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		//var apipath = "http://factextract.cs.berkeley.edu/thinklink";
	    //if(prefs.prefHasUserValue("extensions.thinklink.api")){
			//apipath = prefs.getCharPref("extensions.thinklink.api");
		//}	
		
		//this.injectLiteralScript("var thinklink_apipath = '"+apipath+"'\n",doc);
		//// DEBUG
		
		//for(var i in thinklink_scriptUrls){
			//this.injectScript("http://localhost:8180/thinklink/client_js/"+thinklink_scriptUrls[i],doc);
		//}
		
		////for(var i in thinklink_scriptUrls){
			////this.injectFetchedScript(thinklink_scriptUrls[i]);
		////}
		//this.injectStyleSheet();
		
		//doc.thinklink_injected = true;
		//try{			
			//if(doc.onmousedown){
				//doc.onmousedown = null;
			//}
			//if(doc.onmouseup){
				//doc.onmouseup = null;
			//}
		//}catch(e){
////			thinklink_error("Error clearing mouse events",e);
		//}

	//},
	
	injectFetchedScript: function(file){
		var doc = this.getDoc();
		var req = new XMLHttpRequest();
		req.overrideMimeType("text/javascript");
		req.open("GET","chrome://thinklink/content/client_js/"+file,false);
		req.send(null);
		this.injectLiteralScript(req.responseText,doc);
	},

	//injectStyleSheet: function(){
		//var doc = this.getDoc();
		//var req = new XMLHttpRequest();
		//req.overrideMimeType("text/css");
		//req.open("GET","chrome://thinklink/content/css/style.css",false);
		//req.send(null);
		//this.injectLiteralStyle(req.responseText,doc);
	//},

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

	//injectLiteralStyle: function(text,doc){
		//var tag = doc.createElement("style");
		//tag.textContent = text;
		//tag.type = "text/css";
		//try{
			//doc.getElementsByTagName("head")[0].appendChild(tag);
		//}catch(e){
			//thinklink_error("could not insert style tag",e);
		//}
	//},	
	
	injectLiteralScript: function(text,doc){
		var scripttag = doc.createElement("script");
		scripttag.text = text;
		scripttag.type = "text/javascript";
		try{
			doc.getElementsByTagName("head")[0].appendChild(scripttag);
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
	thinklink_setCookieForUri("http://factextract.cs.berkeley.edu/",username,password);
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
	thinklink_setCookies(encodeURIComponent(username),encodeURIComponent(password)); 
}

function thinklink_login(){
	var username = document.getElementById("thinklink-username").value;
	var password = document.getElementById("thinklink-password").value;
	thinklink_setCookies(username,password);
}

window.addEventListener("load", function(){
	window.addEventListener("DOMContentLoaded",function(){
		thinklink_getLogin();
		mark_snippets();
//		thinklink_winlistener.injectScripts();
	},false);
},false);
