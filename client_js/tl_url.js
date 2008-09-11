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


function tl_normurl(){	
	this.essentialArg = function(str){
		var str = str.toLowerCase();
		if(str.match("id") || 
			 str.match("article") || 
			 str.match("post") || 
			 str.match("story") || 
			 str.match("title") ||
			 str.match("m")){
			return true;
		}else{
			return false;
		}	
	};
	
	this.normalizeUrl = function(url){
		var urlinfo = this.getFormArgs(url);
		var request = "";
		for(var i in urlinfo.args){
			if(this.essentialArg(i)){						
				if(request != ""){
					request += "&";
				}else{
					request += "?";
				}
				request += i + "=" + urlinfo.args[i];
			}
		}
		return urlinfo.base + request;
	};
	
	this.getFormArgs = function(url){
    if(!url) return {};
    var formmatch = url.match(/\?([^\#]*)/);
    if(!formmatch || !formmatch[1]){
    	 return {base:url};
    };
    var formstr = formmatch[1];
    
    var basematch = url.match(/([^?#]*)/);
    if(!basematch) return {};
    var baseurl = basematch[1];
    
    var argstrs = formstr.match(/[^=\&]+=[^=\&]*/g);
    var formargs = {};
    if(argstrs){
	    for(var i = 0; i < argstrs.length; i++){
	        var parts = argstrs[i].match(/(.*)=(.*)/);
	        formargs[parts[1]] = parts[2];
	    }
    }
        
    return {base:baseurl,args:formargs};
	};
	
	this.permstr = function(str){
		if(!str){
			return false;
		}
		str = str.toLowerCase();
		return str.match("permalink") || str.match("permanent link");
	};

	// returned in document order	
	this.findPermalinks = function(){
		var links = document.getElementsByTagName("a");
		
		var permalinks = [];				
		for(var i = 0; i < links.length; i++){
			var link = links[i];
			if(this.permstr(link.className) ||
				this.permstr(link.textContent) ||
				link.getAttribute("rel") == "bookmark" ||
				this.permstr(link.getAttribute("title"))){		
					var url = link.getAttribute("href");
					if(!url.match("oldid") && !link.textContent.match("version")){
						permalinks.push(link);
					}
			}
		}
		return permalinks;
	};
		
	this.getPos = function(node){
    var left = 0;
    var top = 0;
    while(node){
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent;
    }
    return {left:left,top:top};
  };
	
	this.findPermalinkForNode = function(node,snippet,callback){
		tl_log("looking for permalink for: "+snippet);
		var ypos = this.getPos(node).top;
		var links = this.findPermalinks();
		for(var i = 0; i < links.length; i++){
			var link = links[i];
			var linkypos = this.getPos(link).top;
			if(linkypos > ypos){
				var afterurl = link.getAttribute("href");
				var beforeurl = null;
				if(i > 0){
					beforeurl = links[i-1].getAttribute("href");
				}
				return this.findMatchingPermalink(snippet,beforeurl,afterurl,callback);
			}
		}
		if(link){
			return this.findMatchingPermalink(snippet,link.getAttribute("href"),null,callback);
		}
		callback(null);
	};
	
	this.findMatchingPermalink = function(snippet,beforeurl,afterurl,callback){
		var that = this;
		this.getUrlText(beforeurl,function(beforetxt){
			if(beforetxt.indexOf(snippet) > -1){
				callback(beforeurl);
			}else{
				that.getUrlText(afterurl,function(aftertext){
					if(aftertext.indexOf(snippet) > -1){
						callback(afterurl);
					}else{
						callback(null);
					}
				});
			}
		});
	};
		
	this.makeAbsoluteUrl = function(base,relative){
	    if(!relative || relative.substring(0,4) == "http" || !base) return relative;
	    if(relative.charAt(0) == '/'){
	        var stub = base.match(/https?\:\/\/[^\?\/]*/);
	        return stub + relative;
	    }else{
	        var stub = base.match(/[^\?]*\//);
	        return stub + relative;
	    }
	};
	
	this.getUrlText = function(url, callback){
		if(!url){
			callback("");
			return;
		}
		var url = this.makeAbsoluteUrl(document.location.href,url);
		this.ajaxGet(url,function(txt){
			txt = txt.replace(/<[^>]*>/g," ");
			callback(txt.replace(/\s+/g," "));
		});
	};
	
	this.ajaxGet = function (url, callback) {
		try{
		  var request =  new XMLHttpRequest();
		  request.open("GET", url, true);
		  request.setRequestHeader("Content-Type",
		                           "application/x-javascript;");
		  request.onreadystatechange = function() {
		    if (request.readyState == 4 && request.status == 200 && request.responseText) {
		      callback(request.responseText);
		    }else if(request.readyState == 4){
		    	callback("");
		    }
		  };
		  request.send("");
 		}catch(e){ // likely a cross-site issue
			callback("");
		}
	};	

};


