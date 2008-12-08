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


var thinklink_imagebase;

function tl_point_browser() {
	// make any necessary <div>s
	this.divID = "tl_point_browser";
	// text of point that will be viewing
	this.pointText;
	// point ID of point that will be viewing
	this.pointID;
	// snippet id used to view this point browser, if applicable
	this.snipID = null;
	// result of ajax searc
	this.resultsObj;
	// how many snippets per "page" to show
	this.numPerPage;
	// keep updating what snippet index each page started at
	this.pageStart = [];
	// where to get points and snippets links
	this.pointsURL = "get_links.php";
	// where to post new rating for snippet about point
	this.newRatingURL = "new_rating.php";
	// where to post agreement/disagreement about point
	this.newAgreeURL = "new_agreement.php";
	// where to create new point link
	this.newPointLinkURL = "new_point_link.php";
	
	this.init = function() {
	}
		
	this.viewFrame = function(snippet) {
		var url;
		if(snippet.claim){
			title = "Investigate Claim";
			url = thinklink_pointbase+snippet.claim.id+"?snippet="+snippet.id;
		}else{
			title = "What does this Claim?";
			url = thinklink_pointbase+snippet.id+"/setclaim";
		}
		
		var that = this;
		
		if(document.getElementById("tl_point_browser")){
			return;
		}
		
		var win = document.createElement("div");
		win.setAttribute("id","tl_point_browser");
		win.className = "tl_dialog";
		win.style.zIndex = "214783647";
		document.body.appendChild(win);
		
		win.style.overflow = "hidden";
		win.style.position = "fixed";
		win.style.top = "50px";
		win.style.left = "200px";
		win.style.width = Math.min((window.innerWidth - 250),550) + "px";
		
		var titleBar = document.createElement("div");
		win.appendChild(titleBar);
		titleBar.setAttribute("id","tl_pb_title");
		titleBar.style.marginBottom = "0px";
		titleBar.style.cursor = "move";
		titleBar.addEventListener("mousedown",function(ev){
			tl_dragStart(ev,that.divID,"tl_point_frame");
		},true);
		titleBar.className = "tl_dialog_title";
		
		var buttonBox = document.createElement("span");
		buttonBox.style.position = "absolute";
		buttonBox.style.right = "4px";
		titleBar.appendChild(buttonBox);
		
		var titleBox = document.createElement("nobr");
		titleBox.textContent = title;
		titleBar.appendChild(titleBox);
		
		if(!snippet.clam){
			var searchButton = document.createElement("input");
			searchButton.className = "tl_openbutton";
			searchButton.setAttribute("type","button");
			searchButton.setAttribute("value","search");
			buttonBox.appendChild(searchButton);
		}

		var openButton = document.createElement("input");
		openButton.className = "tl_openbutton";
		openButton.setAttribute("type","button");
		openButton.setAttribute("value","Open Organizer");
		buttonBox.appendChild(openButton);
		openButton.addEventListener("click",function(){
			window.open(thinklink_mainhome);
		},true);

		var close = document.createElement("img");
		close.style.paddingTop = "2px";
		close.setAttribute("src",thinklink_imagebase+"cancel.png");
		buttonBox.appendChild(close);
		close.addEventListener("click",function(){
			that.hideMe();
		},true);
		
		// add actual content
		var frameholder = document.createElement("div");
		frameholder.style.height = (window.innerHeight * (2/3)) + "px";

		var pointframe = document.createElement("iframe");
		pointframe.src = url;
		pointframe.style.width="100%";
		pointframe.style.height="100%";
		pointframe.style.overflow = "auto";
		pointframe.setAttribute("id","tl_point_frame");
		frameholder.appendChild(pointframe);
		frameholder.style.width="100%";
		win.appendChild(frameholder);

		if(!snippet.claim){
			searchButton.addEventListener("click",function(){
				pointframe.src = url+"?view=search";
			},true);
		}
		
		that.showMe();	
	}
	
	this.showMe = function(){
		tl_showDiv(this.divID);
	}

	this.hideMe = function(){
		var node = document.getElementById("tl_point_browser");
		node.parentNode.removeChild(node);
	}

	this.showSnipHandler = function(e) { // add click event to each result item
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
			document.location.href=el.id; // navigate to page snippet is from
	}	
}

