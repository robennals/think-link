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

function thinklink_newSnippet(){
	var hilite = tl_getText();			
	mySnip.new(hilite.toString().replace(/\s+/g," "));
}

function tl_margin()
{
	// set user information
	this.userName="test";
	// set <div> id
	this.divID = "tl_margin";
	// make holder for snippets
	this.items = [];
	// have the snippets been loaded already?
	this.itemsLoaded = false;
	// keep the page url handy
	this.url = document.location.href;
	this.urlList = [];
	// default left margin of page
	this.leftmargin = window.getComputedStyle(document.body,"").marginLeft; //$("body").css("margin-left");
	// where to get snippets for this margin
	this.snippetURL = "apianon/search.js";
	// url normalization tool
	this.normTool = new tl_normurl();
	// let user set title and author
	this.docTitle = "";
	this.docAuthor = "";
	this.docInfoURL = "new_document.php";
	this.getdocInfoURL = "get_document.php";
	// where to set snippet bookmarking and removals
	this.bookmarkURL = "new_bookmark.php";
	this.unbookmarkURL = "new_unbookmark.php";
	this.deleteURL = "new_deletion.php";
	this.highlightAll = true;
	this.haveOpposedPoint = false;
	this.lightbulb_right = thinklink_imagebase+"lightbulb_right.png";
	this.lightbulb_left = thinklink_imagebase+"lightbulb_left.png";
	
	this.init = function() {
		tl_log("margin init");
		var that = this;
		this.urlList.push(this.url);
		this.urlList.push(this.normTool.normalizeUrl(this.url));
		var permaLinks = this.normTool.findPermalinks();
		for (var link=0; link<permaLinks.length; link++) {
			this.urlList.push(this.normTool.normalizeUrl(permaLinks[link].href));
		}

		var elem = document.createElement("div"); elem.id = this.divID; 
		document.body.appendChild(elem);
		
		var topfixed = document.createElement("div");
		topfixed.id = "tl_snippet_activate";
		document.getElementById("tl_margin").appendChild(topfixed);
//		$("#" + this.divID).append($(topfixed));
		
		var button = document.createElement("input");
		button.setAttribute("type","button");
		button.setAttribute("value","Browse Mind Mix");
		topfixed.appendChild(button);
		button.addEventListener("click",function(){
			window.open(thinklink_mainhome);
		},true);
//		$('<input type="button" value="Browse Think Link"/>').appendTo($(topfixed)).click(function(){
//			window.open(thinklink_mainhome);
//		});
				
		this.setHeight(); 		// match margin height to document height
		tl_hideDiv(this.divID);
	}
	
	this.showSetTitleAndAuthor = function(url) {
		var that=this;
		var thinklink_callback;
		var scriptID = "tl_new_doc";
		
		var infoDiv = document.createElement("div"); infoDiv.id = "tl_doc_info";
		document.getElementById(this.divID).appendChild(infoDiv);
		
		var titleForm = document.createElement("div"); titleForm.appendChild(document.createTextNode("Document Title"));
		titleForm.className = "tl_dialog"; titleForm.setAttribute("style","position:absolute; top:100px; left: 100px; z-index:106");
		var titleInput = document.createElement("input"); titleInput.setAttribute("type","text"); titleInput.setAttribute("name","pdf_title");
		var titleButton = document.createElement("input"); titleButton.setAttribute("type","button"); titleButton.setAttribute("value","set");
		titleButton.addEventListener('click',function(){
			that.docTitle = titleInput.value;
			document.body.removeChild(titleForm);
			var args = "?url="+encodeURIComponent(url)+"&title="+encodeURIComponent(that.docTitle)+"&author="+encodeURIComponent(that.docAuthor);
			tl_doAJAX(scriptID,that.docInfoURL+args,function(result){
				tl_log("sent: "+ args+ ", "+result);
//				that.refresh();
			});
		}, false);
		titleForm.appendChild(titleInput);
		titleForm.appendChild(titleButton);
		
		var authorForm = document.createElement("div"); authorForm.appendChild(document.createTextNode("Document Author"));
		authorForm.className = "tl_dialog"; authorForm.setAttribute("style","position:absolute; top:150px; left: 100px; z-index:106");
		var authorInput = document.createElement("input"); authorInput.setAttribute("type","text"); authorInput.setAttribute("name","pdf_title");
		var authorButton = document.createElement("input"); authorButton.setAttribute("type","button"); authorButton.setAttribute("value","set");
		authorButton.addEventListener('click',function(){
			that.docAuthor = authorInput.value;
			document.body.removeChild(authorForm);
			var args = "?url="+encodeURIComponent(url)+"&title="+encodeURIComponent(that.docTitle)+"&author="+encodeURIComponent(that.docAuthor);
			tl_doAJAX(scriptID,that.docInfoURL+args,function(result){
				tl_log("sent: "+ args+ ", "+result);
//				that.refresh();
			});
		}, false);
		authorForm.appendChild(authorInput);
		authorForm.appendChild(authorButton);
		
		var title = document.createElement("input");
		title.setAttribute("type","button"); title.setAttribute("value","set title"); 
		title.addEventListener('click', function(e){
			titleInput.value = tl_getText();
			document.body.appendChild(titleForm);
		},false);
		infoDiv.appendChild(title);
		
		var author = document.createElement("input");
		author.setAttribute("type","button"); author.setAttribute("value","set author"); 
		author.addEventListener('click', function(e){
			authorInput.value = tl_getText();
			document.body.appendChild(authorForm);
		},false);
		infoDiv.appendChild(author);
		
		// show current info
		var currentVals = document.createElement("p");
		infoDiv.appendChild(currentVals);
		if (this.docTitle != "") { currentVals.appendChild(document.createTextNode("\""+this.docTitle+"\"")); }
		if (this.docAuthor != "") { 
			currentVals.appendChild(document.createElement("br"));
			currentVals.appendChild(document.createTextNode("- "+this.docAuthor));
		}

	}
			
	this.createMarginPull = function() {
		var that = this;
		var pull = document.createElement("div");
		pull.id = "tl_marginpull";
		arrowimg = document.createElement("img"); arrowimg.setAttribute("src",this.lightbulb_right);
		arrowimg.id = "tl_marginpull_img";
		pull.appendChild(arrowimg);
		document.body.appendChild(pull);
		pull.addEventListener('click',function(){
			if (arrowimg.getAttribute("src")==that.lightbulb_right) {
				that.showMarginPull();
			}
			else {
				that.hideMarginPull();
			}
		},false);
		
		var tooltip = null;
		pull.addEventListener("mouseover",function(ev){
			var msg;
			if (that.haveOpposedPoint) {msg = "There are \"controversial\" points on this page!"; }
			else { msg= "There are points on this page!"; }
			tooltip = tl_showTooltip(msg+" Click here to show/hide the margin!",ev.clientX+20,ev.clientY+20); 
		},true);
		pull.addEventListener("mouseout",function(){
			tl_hideTooltip(tooltip);
		},true);		
	}
	
	this.showMarginPull = function(){
		if (document.getElementById("tl_marginpull") == null) { this.createMarginPull(); }
		var pull = document.getElementById("tl_marginpull");
		var pullimg = document.getElementById("tl_marginpull_img");
		this.showMargin();
		pull.style.left = "200px";
		pullimg.setAttribute("src",this.lightbulb_left);
	}
	
	this.hideMarginPull = function(){
		if (document.getElementById("tl_marginpull") == null) { this.createMarginPull(); }
		var pull = document.getElementById("tl_marginpull");
		var pullimg = document.getElementById("tl_marginpull_img");
		this.hideMargin();
		pull.style.left = "0px";
		pullimg.setAttribute("src",this.lightbulb_right);
	}

	this.refreshNoLoad = function(){
		var that = this;
		tl_log("refreshNoLoad");
		var result = this.snippets;
		if(!result){
			tl_log("no snippets");
			return;
		}
		this.removeAllHighlights(); // in case we already have some
		
				// for each result item, make a new tl_snippet and add it to the margin's array
		for (var item=0; item< result.length; item++) {
			if(!that.marginVisible && !result[item].opposed) continue;
			tl_log("addItem");
			that.addItem(result[item]);
			if (result[item].claimid && result[item].opposed) {
				that.haveOpposedPoint = true; 
			}
		}
		
		if (that.haveOpposedPoint) {
			that.lightbulb_right = thinklink_imagebase+"lightbulb_right_red.png";
			that.lightbulb_left = thinklink_imagebase+"lightbulb_left_red.png";
		}
								
		//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
		that.itemsLoaded=true;
//				that.highlightSnippets(); } // highlight everything by default
		
		// add set title/author buttons if this is thinklink pdf document
		if (that.url.search("http://mashmaker.intel-research.net/rob/server/pdfs") >=0) { 
			scriptID = "tl_get_doc";
			var shorturl = that.url.substring(0,that.url.lastIndexOf("/")+1); // shortened url
			tl_doAJAX(scriptID,that.getdocInfoURL+"?url="+shorturl,function(result){
				tl_log(result);
				if (result.length >0) {
					that.docTitle = result[0]['title'];
					that.docAuthor = result[0]['author'];
				}
				that.showSetTitleAndAuthor(shorturl);
			});
		}
	}

	this.refresh = function(force) {		
		tl_log("refresh");
		
		this.removeAllHighlights(); // in case we already have some
		var that = this;
		var scriptID = "tl_margin_ajax";
		var thinklink_callback;
		// add items to margin if they aren't there already
		if (!this.itemsLoaded || force) {
			this.items = [];
			var urls = ""; // list of url parameters to get snippets for
			for (var i=0; i<this.urlList.length; i++) {
				urls += "&url" + (i+1) + "="+ encodeURIComponent(this.urlList[i]);
			}
			urls = urls.substring(1); // trim preceding ampersand
			
			tl_doAJAX(scriptID,this.snippetURL+"?"+urls,function(result){
				tl_log("doAjax callback");
				that.snippets = result;
				that.refreshNoLoad();
				
				if(result.length > 0 && !force){
					that.createMarginPull();
				}

				//// for each result item, make a new tl_snippet and add it to the margin's array
				//for (var item=0; item< result.length; item++) {
					//if(!that.marginVisible && !result[item].opposed) continue;
					//tl_log("addItem");
					//that.addItem(result[item]);
					//if (result[item].claimid && result[item].opposed) {
						//that.haveOpposedPoint = true; 
					//}
				//}
				
				//if (that.haveOpposedPoint) {
					//that.lightbulb_right = thinklink_imagebase+"lightbulb_right_red.png";
					//that.lightbulb_left = thinklink_imagebase+"lightbulb_left_red.png";
				//}
				
				//if(result.length > 0 && !force){
					//that.createMarginPull();
				//}
								
				////document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
				//that.itemsLoaded=true;
////				that.highlightSnippets(); } // highlight everything by default
				
				//// add set title/author buttons if this is thinklink pdf document
				//if (that.url.search("http://mashmaker.intel-research.net/rob/server/pdfs") >=0) { 
					//scriptID = "tl_get_doc";
					//var shorturl = that.url.substring(0,that.url.lastIndexOf("/")+1); // shortened url
					//tl_doAJAX(scriptID,that.getdocInfoURL+"?url="+shorturl,function(result){
						//tl_log(result);
						//if (result.length >0) {
							//that.docTitle = result[0]['title'];
							//that.docAuthor = result[0]['author'];
						//}
						//that.showSetTitleAndAuthor(shorturl);
					//});
				//}

			});

		}else{
			tl_log("items already loaded");
		}
	}

	this.setHeight = function() {
		tl_log("set height");
		
		//$("#" + this.divID).hide(); // don't include margin in height evaluation
		var docHeight = this.findMaxHeight(document.body,document.body.offsetHeight); //$("body").height();//$("#tl_document").height();
		//$("#" + this.divID).show();
		
		document.getElementById(this.divID).style.height = docHeight + "px";
		
//		$("#" + this.divID).height(docHeight);
		this.setItemPositions();

	}

	this.findMaxHeight = function(element,max) {
		if (element) {
			var childMax = max;
			for (var i=0; i<element.childNodes.length; i++) {
				var child=element.childNodes[i];
				
				// see if this child's height is larger
				if (child.offsetHeight > childMax) { childMax=child.offsetHeight; }
				
				// recursively check if any of this child's children have larger height
			    var oneMax = this.findMaxHeight(child,childMax);
				if (oneMax > childMax) { childMax=oneMax; }
			}
		}
		return childMax;
	}
	
	this.setItemPositions = function() {
		for (var index=0; index<this.items.length; index++) {			// set the positions of the annotations within the margin
			var snipspans = this.items[index].spanList;
			if(!snipspans) continue;
			var position = tl_findPos(snipspans[0]); // get position of the first span element
			position[1] = this.getSafeItemPosition(position,this.items[index].id,index);
			this.items[index].position = position;
			document.getElementById("margin"+this.items[index].id).style.top = position[1]+"px";
//			$("#margin"+this.items[index].id).css("top",position[1])
		}
	}

	this.getSafeItemPosition = function(pos,snipID,idx) {
		var vertPos = pos[1];
		
		// check for interference with document info div
		var docInfo = document.getElementById("tl_doc_info");
		if (docInfo != null) {
			var docInfoPos = docInfo.offsetHeight+docInfo.offsetTop;
			if (vertPos <= docInfoPos) { tl_log("adjustment made"); vertPos = docInfoPos+1; } // move downward
		}
		
		for (var index=0; index<this.items.length && index < idx; index++) {
			if (this.items[index].id==snipID) continue; // don't check against self
			var itemPos = this.items[index].position[1];
			var itemPosRange = itemPos + document.getElementById("margin"+this.items[index].id).offsetHeight;
			// check if suggested position falls within a taken range
			// if collision, first try to reduce height of item above
			// then if necessary change pos to be underneath, and check again
			if (vertPos >= itemPos && vertPos <= itemPosRange) {
				var itemAbove = document.getElementById("margin"+this.items[index].id);
//				if(!itemAbove.tl_squeezed){
//					itemAbove.textContent = itemAbove.textContent.substr(0,20) + "...";
//					this.items[index].displayText= itemAbove.textContent;				
//					itemAbove.tl_squeezed = true;
//					itemPosRange = itemPos + itemAbove.offsetHeight;
//					if (vertPos >= itemPos && vertPos <= itemPosRange) {
//						vertPos = itemPosRange + 1;
//					}					
//				}else{
					vertPos = itemPosRange+1;
//				}
			}
		}
		return vertPos;
	}
	
	this.setItemHeights = function() {
		for (var index=0; index<this.items.length; index++) {		
			var id = this.items[index].id;
			var height = document.getElementById(id).offsetHeight;
			this.items[index].setHeight(height);
		}
	}

	this.showMargin = function(){
		var that = this;
		tl_showDiv(this.divID);
		document.body.style.paddingLeft = "215px";
		this.marginVisible = true;
		this.refresh(true);
		
//		$("#" + this.divID).animate({ width: 'fast', opacity: 'show' }, 'slow');
//		$("body").css("padding-left",215); // scoot the main document to the right

		setTimeout(function(){
			that.setHeight();
		},50);
	}

	this.hideMargin = function(){
		document.body.style.paddingLeft = this.leftmargin;
		tl_hideDiv(this.divID);
		this.marginVisible = false;
		this.refresh(true);
//		this.refresh();
//		$("body").css("padding-left",this.leftmargin); // scoot the main document back to the left
//		$("#" + this.divID).animate({ width: 'hide', opacity: 'hide' }, 'slow');
	}
		
	this.removeAllHighlights = function() {
		for (var i=0; i<this.items.length; i++){
			var snippet = this.items[i];
			if (snippet.spanList == null) { continue; }
			tl_removeSpans(snippet.spanList);
		}
	}
	
	this.addSnippetClickHandler = function(snippet){
		var that = this;
		var tool;
		for (var s=0; s <snippet.spanList.length; s++) {
			var span = snippet.spanList[s];
			span.addEventListener("mouseover",function(ev){
					that.setHighlightClass(snippet,true);
					var div = document.createElement("div");
					if (snippet.claimid && snippet.opposed){
						div.innerHTML = "<span class='tl_claim_warn'>disputed claim: "+
								"</span><span class='tl_claim_text'>"+
								snippet.claimtext+"</span><span class='tl_claim_click'>"+
								"(click snippet for more info)</span>";
					}else if(snippet.claimid){
						div.innerHTML = "<span class='tl_claim_prefix'>this claims: </span><span class='tl_claim_text'>"
							+snippet.claimtext+"</span><span class='tl_claim_click'> (click snippet for more info)</span>";
					}else{
						div.innerHTML = "<span class='tl_claim_prefix'>this snippet has not been associated with a claim</span><span class='tl_claim_text'>"+
							"</span><span class='tl_claim_click'> (click snippet to attach to a claim)</span>";
					}
					tool=
					tl_delayedShowTooltip(div,ev.clientX+10,ev.clientY-30);
			},true);
			span.addEventListener("mouseout",function(){
				that.setHighlightClass(snippet,false);
				tl_hideTooltip(tool);
			},true);
			span.addEventListener("click",function(){
				if(!tl_getText() || !tl_getText().toString()){
					myBrowser.viewFrame(snippet);
				}				
			},true);
		}
	}
	
	this.setHighlightClass = function(snippet,enable){
		if(!snippet.spanList) return;
		highlightclass = "tl_highlight";
		if(snippet.opposed){
			highlightclass += "_con";
		}
		if(!snippet.claimid){
			highlightclass += "_free";
		}
		if(enable){
			highlightclass += "_bright";
		}	
		for(var i = 0; i < snippet.spanList.length; i++){
			snippet.spanList[i].className = highlightclass;
		}
	}
	
	
	this.addItem = function(snippet){
		var that = this;
		tl_log("EK!!!");
		tl_log("addItem : "+snippet.text);
		
		var highlightclass;
		if(snippet.claimid && snippet.opposed){
			highlightclass = "tl_highlight_con";
		}else if(!snippet.claimid){
			highlightclass = "tl_highlight_free";
		}else{
			highlightclass = "tl_highlight";
		}
		snippet.spanList = tl_mark_snippet(snippet.text,highlightclass);
		if(!snippet.spanList){
			tl_log("could not find snippet: "+snippet.text);
			return;
		}
		tl_log("marked");
		this.addSnippetClickHandler(snippet);
		var position = tl_findPos(snippet.spanList[0]); // get position of the first span element
		position[1] = this.getSafeItemPosition(position,snippet.id,this.items.length); // make sure vertical position is kosher
		snippet.position = position;
		var numItems = this.items.push(snippet); // add to margin's array
		
		var showtxt;
		if(snippet.claimid){
			showtxt = snippet.claimtext;
		}else{
			showtxt = "no claim associated - click to pick a claim";
		}
		var opposed= false;
		var claimid = null;
		if(snippet.claimid){
			opposed = snippet.opposed;		
			claimid = snippet.claimid;
		}
		snippet.opposed = opposed;
		
		var margin_item = document.createElement("div");
		margin_item.textContent = showtxt;
		margin_item.style.top = snippet.position[1] + "px";
		margin_item.setAttribute("id","margin"+snippet.id);
		margin_item.addEventListener("mouseover",function(){
			that.setHighlightClass(snippet,true);
			if(opposed){
				margin_item.className = "tl_margin_item tl_margin_item_con tl_margin_item_info_con";
			}else{
				margin_item.className = "tl_margin_item tl_margin_item_info";
			}
		},true);
		margin_item.addEventListener("mouseout",function(){
			that.setHighlightClass(snippet,false);
			if(opposed){
				margin_item.className = "tl_margin_item tl_margin_item_con";
			}else{
				margin_item.className = "tl_margin_item";
			}
		},true);
		margin_item.addEventListener("click",function(){
			myBrowser.viewFrame(snippet);
		},true);
		document.getElementById(this.divID).appendChild(margin_item);
				
		// make the margin item header
		var deleteButton = document.createElement("img"); deleteButton.setAttribute("src",thinklink_imagebase+"bin_closed.png");
		deleteButton.addEventListener('click', function(e){ 
			e.cancelBubble=true;
			tl_doAJAX("tl_delete",that.deleteURL+"?snippet="+snippet.id,function(result){
				tl_log("mark deleted: "+ snippet.id+ ", "+result);
				tl_removeSpans(snippet.spanList);
				snippet.spanList = null;
				document.getElementById(that.divID).removeChild(document.getElementById("margin"+snippet.id));
			});

			},true);
		var saveButton = document.createElement("img");
		saveButton.addEventListener('click', function(e){ 
			e.cancelBubble=true;
			if (bookmarked==null) {
				tl_doAJAX("tl_bookmark",that.bookmarkURL+"?snippet="+snippet.id,function(result){
					tl_log("bookmarked: "+ snippet.id+ ", "+result);
					saveButton.setAttribute("src",thinklink_imagebase+"lightbulb.png");
					margin_item.addClass("tl_margin_item_bookmarked").removeClass("tl_margin_item");
					bookmarked=snippet.id;
				});
			}
			else {
				tl_doAJAX("tl_bookmark",that.unbookmarkURL+"?snippet="+snippet.id,function(result){
					tl_log("unbookmarked: "+ snippet.id+ ", "+result);
					saveButton.setAttribute("src",thinklink_imagebase+"lightbulb_off.png");
					margin_item.addClass("tl_margin_item").removeClass("tl_margin_item_bookmarked");
					bookmarked=null;
				});	
			}
			},true);
			
			
		// show fancy shmancy stuff if the snippet has been bookmarked
		if (snippet.bookmarked == null) { 
			saveButton.setAttribute("src",thinklink_imagebase+"lightbulb_off.png"); 
//			margin_item.addClass("tl_margin_item");
			if (opposed){
				margin_item.className = "tl_margin_item_con";
			}else{
				margin_item.className = "tl_margin_item";
			}
		}
		else { 
			saveButton.setAttribute("src",thinklink_imagebase+"lightbulb.png"); 
			if (opposed){
				margin_item.className = "tl_margin_item_con";
			}else{
				margin_item.className = "tl_margin_item_bookmarked";
			}
		}
		var buttonBox = document.createElement("span");
		buttonBox.style.float = "right";
		buttonBox.style.marginLeft = "2px";
//		var buttonBox = $("<span/>").css("float","right").css("margin-left","2px");
		buttonBox.appendChild(saveButton);
		buttonBox.appendChild(deleteButton);
//		buttonBox.append($(saveButton)); buttonBox.append($(deleteButton));
	}

}
