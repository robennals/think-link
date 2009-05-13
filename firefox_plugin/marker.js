
function get_api_path(){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
	var apipath = "http://factextract.cs.berkeley.edu/thinklink";
	if(prefs.prefHasUserValue("extensions.thinklink.api")){
		apipath = prefs.getCharPref("extensions.thinklink.api");
	}	
}

function mark_snippets(){
	var targeturl = content.document.location.href;
	var apipath = get_api_path();
	var url = apipath+"/anonapi/search.json?url="+encodeURIComponent(targeturl);
	ajaxRequest(url,function(snippets){
		for(var i = 0; i < snippets.length; i++){
			var snip = snippets[i];
			mark_snippet(snip.text,snip.claimid,snip.claimtext,content.document.body);			
		}
	})
}

function mark_snippet(text,claimid,claimtext,node){
	if(node.nodeName == "#comment" || node.textContent.indexOf(text) == -1){
		return;			
	}else if (node.nodeName == "#text") {
		node.parentNode.style.backgroundColor = "#FFD3D3";
	}else{
		for(var i = 0; i < node.childNodes.length; i++){
			var child = node.childNodes[i];
			mark_snippet(text,claimid,claimtext,node);
		}
	}
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
