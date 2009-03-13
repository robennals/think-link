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

function tl_snippet(id,author,sourceText,pointText,pointID,pointOpposed,date) {
	this.author = author;
	this.sourceText = sourceText;
	this.displayText = pointText;
	this.pointText = pointText;
	this.pointID = pointID;
	this.opposed = pointOpposed;
	this.timestamp = date;
	this.id = id;
	this.position;
	this.height;
	this.spanList; // array of span nodes surrounding snippet text on page
	
	this.setPosition = function(pos){
		this.position = pos;
	}
	
	this.setGroupPosition = function(pos){
		this.groupPosition = pos;
	}
	
	this.setHeight = function(h) {
		this.height = h;
	}
}

function thinklink_close(){
	if(thinklink_activeDivId){
		var dialog = document.getElementById(thinklink_activeDivId);
		dialog.parentNode.removeChild(dialog);
		thinklink_activeDivId = null;
	}
}

function tl_snippet_dialog(margin) {
	// make any necessary <div>s
	this.divID = "tl_snippet_dialog";
	// set the associated margin
	this.margin = margin;
	// set the snippet source text looking at
	this.sourceText;
	// set the snippet permalink for the source text
	this.permaLink;
	this.gotPermaLink = false;
	// where to post new snippet link
	this.postURL = "new_snippet_link.php";
	// where to post new point
	this.newPointURL = "new_point.php";
	this.sourceSpans = [];	
		
	this.init = function() {
		var elem = document.createElement("div"); elem.id = this.divID;  elem.className = "tl_dialog";
		elem.style.zIndex="-1";
		document.body.appendChild(elem);
		tl_hideDiv(this.divID);
		elem.style.zIndex="2147483647";
	}
	
	this.removeNode = function(node){
		if(node.parentNode){
			node.parentNode.removeChild(node);
		}
	}
	
	this.showMe = function(){
		tl_showDiv(this.divID);
	}
	this.close = function(){
		tl_log("close");
		if(document.getElementById("tl_snippet_win")){
			var dialog = document.getElementById("tl_snippet_win");
			this.removeNode(document.getElementById("tl_snippet_win"));
			tl_removeSpans(this.sourceSpans);
		}else if(document.getElementById("tl_point_browser")){
			var dialog = document.getElementById("tl_point_frame");
			this.removeNode(document.getElementById("tl_point_browser"));
		}
		if(dialog){
			this.margin.itemsLoaded=false;
			this.margin.refresh();
		};
	}

	this.noSelection = function(){
		if(confirm("You don't have any text selected and so cannot create a new snippet.\n"
			+"Would you like to open the Think Link claim browser?")){
				window.open(thinklink_mainhome);
		}		
	}
	
	this.new = function(sourceText, origText){
		if (sourceText=="" || sourceText == null) {
			this.noSelection();
			 return; 
		}
		this.sourceText = sourceText;
		
		// determine last dom node to aid in finding associated permalink
		var sourceSpans = tl_mark_snippet(this.sourceText,"tl_highlight_free");
		if(!sourceSpans){
			alert("Think Link was not able to create a snippet from this selection.");
			return;
		}
		this.sourceSpans = sourceSpans;
		
		var pivotSpan = sourceSpans[sourceSpans.length-1];
		var that = this;
		this.permaLink = this.margin.normTool.findPermalinkForNode(pivotSpan,this.sourceText,function(url){
			tl_log("permalink is :"+url);
			that.permaLink = url;
			that.gotPermaLink = true;
		});
		that.makeReallySimpleSnippet(sourceSpans);
	};
	
	this.findPara = function(para){
		if(para.nodeName == "#text" || para.tagName == "A"){
			return this.findPara(para.parentNode);
		}else{
			return para;
		}
	};
	
	this.findPageText = function(sourceSpans){
		var para = this.findPara(sourceSpans[0].parentNode);
		node = para;
		
		var pagetext = "";
		while(pagetext.length < 1000){
			if(node.tagName == para.tagName){
				pagetext += node.textContent + " ";
			}
			node = node.previousSibling;
		}
		
		return pagetext.substring(0,1000);
		
		try{
			return sourceSpans[0].parentNode.parentNode.textContent.substring(0,500);
		}catch(e){
			return "";
		}		
	};
	
	this.makeReallySimpleSnippet = function(sourceSpans){
		var that = this;
		var url = this.margin.normTool.normalizeUrl(this.margin.url);
		if (this.permaLink != null) { // use the determined perma link if available
			tl_log("permalink is : "+this.permaLink);
			url = this.margin.normTool.makeAbsoluteUrl(this.margin.url,this.permaLink);
			url= this.margin.normTool.normalizeUrl(url);
		} 
		var url_real = this.margin.url;
		
		tl_doAJAX("tl_new","scripthack/newsnippet.js"
			+"?text="+encodeURIComponent(that.sourceText)
			+"&url="+encodeURIComponent(url)
			+"&realurl="+encodeURIComponent(url_real)				
			+"&title="+encodeURIComponent(document.title)
			+"&pagetext="+that.findPageText(sourceSpans)
		,function(result){
			if(result.error){
				tl_removeSpans(that.sourceSpans);
					alert("Login incorrect - set password in Tools/Options/Thinklink");
			}else{
				that.margin.itemsLoaded=false;
				tl_removeSpans(that.sourceSpans);
				that.margin.addItem({text:that.sourceText,id:result.id,claim:null});
				that.margin.createMarginPull();
			}
		});		
	}
}
