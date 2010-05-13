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


var thinklink_name = "Dispute Finder";


function thinklink_error(msg,e){
	thinklink_msg(msg);
	Components.utils.reportError(e);
}

function thinklink_msg(msg){
	var cs = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
	cs.logStringMessage(thinklink_name + ": " + msg);
}

function thinklink_is_disputed(){
	var text = content.document.getSelection();
	if(!text){
		window.open("http://disputefinder.cs.berkeley.edu/pages/claims.html");
	}else{
		window.open("http://disputefinder.cs.berkeley.edu/thinklink/search?query="+encodeURIComponent(text));
	}
}

function thinklink_new_snippet(isdisputed,supports){
	var text = content.document.getSelection();
	if(!text){
		alert("You might first select some text that makes the disputed claim");
		return;
	}
	if(content.document.location.href.indexOf("disputefinder") != -1){
		alert("This feature should be applied to external web sites, not to the dispute finder site");
		return;
	}
	var apipath = get_api_path();
	viewFrame(apipath+"/mini/newsnippet?text="+encodeURIComponent(text)+
		"&url="+encodeURIComponent(content.document.location.href)+
		"&title="+encodeURIComponent(content.document.title)+
		"&supports="+supports+
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
			  if(typeof(Components) !== 'undefined'){  // I don't know why I need this, but I get errors otherwise
				  var ht = subject.QueryInterface(Components.interfaces.nsIHttpChannel);                       
				  if((ht.name.substring(0,42) == "http://factextract.cs.berkeley.edu/apianon")
				  || (ht.name.substring(0,40) == "http://thinklink.cs.berkeley.edu/apianon")
				  || (ht.name.substring(0,39) == "http://localhost:8180/thinklink/apianon")){
					 subject.setRequestHeader("Cookie","",false);
			  	}
			 }
		  }
	  };

  var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
  observerService.addObserver(cookieCatcher, "http-on-modify-request",false);
}

// it turns out that the security model doesn't let us do this :-(
//function allowSelect(){
	//if(content.document.onmousedown){
		//content.document.onmousedown = null;
	//}
	//if(content.document.onmouseup){
		//content.document.onmouseup = null;
	//}
	//if(content.document.onselectstart){
		//content.document.onselectstart = null;
	//}
//}

function thinklink_readClaimFile2(){
	// the extension's id from install.rdf  
	var MY_ID = "thinklink@intel.com";  
	var em = Components.classes["@mozilla.org/extensions/manager;1"].  
         getService(Components.interfaces.nsIExtensionManager);  
	// the path may use forward slash ("/") as the delimiter  
	// returns nsIFile for the extension's install.rdf  
	
//	var file = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "disputed.txt");  
	var file = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "claimdata.json");  
	var filestring = file.path; 
	alert(filestring)

	// |file| is nsIFile  
	var data = "";  
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
							createInstance(Components.interfaces.nsIFileInputStream);  
	var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].  
							createInstance(Components.interfaces.nsIConverterInputStream);  
	fstream.init(file, -1, 0, 0);  
	cstream.init(fstream, "UTF-8", 0, 0); // you can use another encoding here if you wish  
	  
	var str = {}	  
    cstream.readString(-1, str); // read the whole file and put it in str.value  
    data = str.value;  
	cstream.close(); // this closes fstream  
	
	alert("claims loaded: "+data.length)
	  
	var jobj = JSON.parse(data)
	  
	  
	alert("JSON decoded")	  
//	alert(data);  
}

function thinklink_readClaimFile(){
	var globals = getGlobals();
	if(globals.claim_corpus){
		alert("Already loaded")
	}else{
		var script = content.document.createElement("script");
		script.setAttribute("type","application/x-javascript");
		script.setAttribute("src","chrome://thinklink/content/claimdata4.js");
		content.document.head.appendChild(script);
	}
}

function thinklink_claimFileLoaded(data){
	var globals = getGlobals();
	globals.claim_corpus = data;
	alert("claim file loaded");
}

function thinklink_readClaimFile3(){
	//var claimfilepath = "chrome://thinklink/content/claimdata.json"
	//var claimfilepath = "chrome://thinklink/content/claimdata2.json"
	//var claimfilepath = "chrome://thinklink/content/disputed.txt"
	var claimfilepath = "http://factextract.cs.berkeley.edu/"

	var claimfilepath = "chrome://thinklink/content/disputed.txt"
	thinklink_msg("starting to read claim file");

	ajaxGetText(claimfilepath,function(data){
		thinklink_msg("claim file read");
		alert("loaded")
	})
}

window.addEventListener("load", function(){
	thinklink_setCookie("http://factextract.cs.berkeley.edu/","extension","0.35");
	thinklink_setCookie("http://thinklink.cs.berkeley.edu/","extension","0.35");
        thinklink_setCookie("http://disputefinder.cs.berkeley.edu/","extension","0.35");
	thinklink_setCookie("http://localhost:8180/","extension","0.35");

	initCookieCatcher();
    
	window.addEventListener("DOMContentLoaded",function(ev){
		thinklink_getLogin();
		try{
			find_phrases(ev.target);
		}catch(e){
			thinklink_error("error in find_phrases: "+e.message,e);
		}
	},false);
		
	loadIgnored();
},false);

function ajaxGetText(url,callback){
	var req = new XMLHttpRequest();
	req.open("GET",url,true);
	req.onreadystatechange = function(){
		if(req.readyState == 4 && req.status == 200){
			try{
				callback(req.responseText)
			}catch(e){
				thinklink_error("exception in callback: "+e.message,e);
			}
		}
	}
	req.overrideMimeType("application/json")
	req.send(null);
}
