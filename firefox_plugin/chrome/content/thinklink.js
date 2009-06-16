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


var thinklink_name = "Think Link";


function thinklink_error(msg,e){
	thinklink_msg(msg);
	Components.utils.reportError(e);
}

function thinklink_msg(msg){
	var cs = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	cs.logStringMessage(thinklink_name + ": " + msg);
}

function thinklink_new_snippet(isdisputed){
	var text = content.document.getSelection();
	var apipath = get_api_path();
	viewFrame(apipath+"/mini/newsnippet?text="+encodeURIComponent(text)+
		"&url="+encodeURIComponent(content.document.location.href)+
		"&title="+encodeURIComponent(content.document.title)+
		"&isdisputed="+isdisputed)
}

function thinklink_setCookie(url,name,value){
	var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);   
	var uri = ios.newURI(url, null, null);
	var cookies = Components.classes["@mozilla.org/cookieService;1"].getService(Components.interfaces.nsICookieService);

	cookies.setCookieString(uri, null, name+"="+value+";",null)
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
	//thinklink_setCookies(encodeURIComponent(username),encodeURIComponent(password)); 
}

function initCookieCatcher(){
	var cookieCatcher = {
		  observe: function(subject,topic,state){
			  var ht = subject.QueryInterface(Components.interfaces.nsIHttpChannel);                       
			  if((ht.name.substring(0,42) == "http://factextract.cs.berkeley.edu/apianon")
			  || (ht.name.substring(0,40) == "http://thinklink.cs.berkeley.edu/apianon")
			  || (ht.name.substring(0,39) == "http://localhost:8180/thinklink/apianon")){
				 subject.setRequestHeader("Cookie","",false);
			 }
		  }
	  };

  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(cookieCatcher, "http-on-modify-request",false);
}


window.addEventListener("load", function(){
	thinklink_setCookie("http://factextract.cs.berkeley.edu/","extension","true");
	thinklink_setCookie("http://thinklink.cs.berkeley.edu/","extension","true");
	thinklink_setCookie("http://localhost:8180/","extension","true");
	initCookieCatcher();
    
	window.addEventListener("DOMContentLoaded",function(ev){
		thinklink_getLogin();
		mark_snippets(ev.target);
	},false);
	
	loadIgnored();
},false);

