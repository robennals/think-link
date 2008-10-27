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
	var hilite = getText();			
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
		$("#" + this.divID).append($(topfixed));
		
		$('<input type="button" value="Browse Think Link"/>').appendTo($(topfixed)).click(function(){
			window.open(thinklink_mainhome);
		});
				
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
			doAJAX(scriptID,that.docInfoURL+args,function(result){
				tl_log("sent: "+ args+ ", "+result);
				that.refresh();
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
			doAJAX(scriptID,that.docInfoURL+args,function(result){
				tl_log("sent: "+ args+ ", "+result);
				that.refresh();
			});
		}, false);
		authorForm.appendChild(authorInput);
		authorForm.appendChild(authorButton);
		
		var title = document.createElement("input");
		title.setAttribute("type","button"); title.setAttribute("value","set title"); 
		//title.className = "tl_fixed_button"; title.setAttribute("style","top:30px");
		title.addEventListener('click', function(e){
			titleInput.value = getText();
			document.body.appendChild(titleForm);
		},false);
		infoDiv.appendChild(title);
		
		var author = document.createElement("input");
		author.setAttribute("type","button"); author.setAttribute("value","set author"); 
		//author.className = "tl_fixed_button"; author.setAttribute("style","top:50px");
		author.addEventListener('click', function(e){
			authorInput.value = getText();
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
		$(pull).hover(function(){
			var msg;
			if (that.haveOpposedPoint) {msg = "There are \"controversial\" points on this page!"; }
			else { msg= "There are points on this page!"; }
			tooltip = tl_showTooltip(msg+" Click here to show/hide the margin!",mouseX+20,mouseY+20); 
		}, function(){
			tl_hideTooltip(tooltip);
		});
		
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

	this.showToolbarIcon = function(){
	  	var evt = document.createEvent("Events");
    	evt.initEvent("thinklink-showicon", true, false);
    	document.body.dispatchEvent(evt);

		// show lit lightbulb and arrow to pull out margin
		if (document.getElementById("tl_marginpull") == null) { this.createMarginPull(); }
		
	};

	this.hideToolbarIcon = function(){
	  var evt = document.createEvent("Events");
    evt.initEvent("thinklink-hideicon", true, false);
    document.body.dispatchEvent(evt);
	};


	this.refresh = function() {		
		tl_log("refresh");
		
		this.removeAllHighlights(); // in case we already have some
		var that = this;
		var scriptID = "tl_margin_ajax";
		var thinklink_callback;
		// add items to margin if they aren't there already
		if (!this.itemsLoaded) {
			this.items = [];
			var urls = ""; // list of url parameters to get snippets for
			for (var i=0; i<this.urlList.length; i++) {
				urls += "&url" + (i+1) + "="+ encodeURIComponent(this.urlList[i]);
			}
			urls = urls.substring(1); // trim preceding ampersand
			
			tl_log("doAjax");
			doAJAX(scriptID,this.snippetURL+"?"+urls,function(result){
				tl_log("doAjax callback");
				
				// for each result item, make a new tl_snippet and add it to the margin's array
				for (var item=0; item< result.length; item++) {
					tl_log("addItem");
					that.addItem(new tl_snippet(
						result[item].id,
						result[item].creator,
						unescape(result[item].text),
						unescape(result[item].claim.text),
						result[item].claim.id,
						result[item].opposed,
						result[item].date
					),result[item].bookmark);
					if (result[item].opposed != null) { that.haveOpposedPoint = true; }
				}
				
				if (that.haveOpposedPoint) {
					that.lightbulb_right = thinklink_imagebase+"lightbulb_right_red.png";
					that.lightbulb_left = thinklink_imagebase+"lightbulb_left_red.png";
				}
				
				if(result.length > 0){
						that.showToolbarIcon();
  				}else{
  					that.hideToolbarIcon();
  				}
				
				//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
				that.itemsLoaded=true;
//				that.highlightSnippets(); } // highlight everything by default
				
				// add set title/author buttons if this is thinklink pdf document
				if (that.url.search("http://mashmaker.intel-research.net/rob/server/pdfs") >=0) { 
					scriptID = "tl_get_doc";
					var shorturl = that.url.substring(0,that.url.lastIndexOf("/")+1); // shortened url
					doAJAX(scriptID,that.getdocInfoURL+"?url="+shorturl,function(result){
						tl_log(result);
						if (result.length >0) {
							that.docTitle = result[0]['title'];
							that.docAuthor = result[0]['author'];
						}
						that.showSetTitleAndAuthor(shorturl);
					});
				}

			});

		}
	}

	this.setHeight = function() {
		
		//$("#" + this.divID).hide(); // don't include margin in height evaluation
		var docHeight = this.findMaxHeight(document.body,document.body.offsetHeight); //$("body").height();//$("#tl_document").height();
		//$("#" + this.divID).show();
		
		$("#" + this.divID).height(docHeight);
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
			var position = findPos(snipspans[0]); // get position of the first span element
			position[1] = this.getSafeItemPosition(position,this.items[index].id);
			this.items[index].setPosition(position);
			$("#margin"+this.items[index].id).css("top",position[1])
		}
	}

	this.getSafeItemPosition = function(pos,snipID) {
		var vertPos = pos[1];
		
		// check for interference with document info div
		var docInfo = document.getElementById("tl_doc_info");
		if (docInfo != null) {
			var docInfoPos = docInfo.offsetHeight+docInfo.offsetTop;
			if (vertPos <= docInfoPos) { tl_log("adjustment made"); vertPos = docInfoPos+1; } // move downward
		}
		
		for (var index=0; index<this.items.length; index++) {
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
		$("#" + this.divID).animate({ width: 'fast', opacity: 'show' }, 'slow');
		$("body").css("padding-left",215); // scoot the main document to the right

		setTimeout(function(){
			that.setHeight();
		},50);
	}

	this.hideMargin = function(){
		$("body").css("padding-left",this.leftmargin); // scoot the main document back to the left
		$("#" + this.divID).animate({ width: 'hide', opacity: 'hide' }, 'slow');
	}
		
	this.removeAllHighlights = function() {
		for (var i=0; i<this.items.length; i++){
			var snippet = this.items[i];
			if (snippet.spanList == null) { continue; }
			removeSpans(snippet.spanList);
		}
	}
	
	this.addSnippetClickHandler = function(snippet){
		var that = this;
		var tool;
		for (var s=0; s <snippet.spanList.length; s++) {
//			snippet.spanList[s].id = i; // match each span to the index in snippets array that it belongs to
			$(snippet.spanList[s]).
			hover(
				function(){ 					
					if (snippet.opposed){
						var div = $("<div><span class='tl_claim_warn'>contentious claim: </span><span class='tl_claim_text'>"
								+snippet.pointText+"</span><span class='tl_claim_click'> (click snippet for more info)</span></div>").get(0);
					}else{
						var div = $("<div><span class='tl_claim_prefix'>this claims: </span><span class='tl_claim_text'>"
							+snippet.pointText+"</span><span class='tl_claim_click'> (click snippet for more info)</span></div>").get(0);
					}
					tool=
					tl_delayedShowTooltip(div,mouseX+10,mouseY-30); },
				function(){ tl_hideTooltip(tool); }
			)
			.click(function(){
				if(!getText() || !getText().toString()){
					myBrowser.viewFrame(snippet.pointID, snippet.id);
				}
			});
		}
	}
	
	this.setHighlightClass = function(snippet,enable){
		if(!snippet.spanList) return;
		highlightclass = "highlight";
		if(snippet.opposed){
			highlightclass += "_con";
		}
		if(enable){
			highlightclass += "_bright";
		}	
		for(var i = 0; i < snippet.spanList.length; i++){
			snippet.spanList[i].className = highlightclass;
		}
	}
	
	
	this.addItem = function(snippet,bookmarked){
		var that = this;
		
		var highlightclass;
		if(snippet.opposed != null){
			highlightclass = "highlight_con";
		}else{
			highlightclass = "highlight";
		}
		snippet.spanList = mark_snippet(snippet.sourceText,highlightclass);
		if(!snippet.spanList) return;
		this.addSnippetClickHandler(snippet);
		var position = findPos(snippet.spanList[0]); // get position of the first span element
//		removeSpans(snipspans);
		position[1] = this.getSafeItemPosition(position,snippet.id); // make sure vertical position is kosher
		snippet.setPosition(position);
		var numItems = this.items.push(snippet); // add to margin's array
		
		var margin_item = $("<div>"+snippet.displayText+"</div>")
			.css("top",snippet.position[1])
			.attr("id", "margin"+snippet.id)
			.hover(function(){ // highlight source text when the annotation is hovered over
				that.setHighlightClass(snippet,true);							
				$(margin_item).text(snippet.pointText);
				if(snippet.opposed){
					$(margin_item).addClass("tl_margin_item_info_con");
				}else{
					$(margin_item).addClass("tl_margin_item_info");
				}
				$(margin_item).prepend(buttonBox);
			}, function(){				
				that.setHighlightClass(snippet,false);	
				$(margin_item).text(snippet.displayText);
				if(snippet.opposed){
					$(margin_item).removeClass("tl_margin_item_info_con");
				}else{
					$(margin_item).removeClass("tl_margin_item_info");
				}
			})
			.click(function(){ // open point browse
				myBrowser.viewFrame(snippet.pointID, snippet.id);
			})
			.appendTo($("#" + this.divID));
		
		// make the margin item header
		var deleteButton = document.createElement("img"); deleteButton.setAttribute("src",thinklink_imagebase+"bin_closed.png");
		deleteButton.addEventListener('click', function(e){ 
			e.cancelBubble=true;
			doAJAX("tl_delete",that.deleteURL+"?snippet="+snippet.id,function(result){
				tl_log("mark deleted: "+ snippet.id+ ", "+result);
				removeSpans(snippet.spanList);
				snippet.spanList = null;
				document.getElementById(that.divID).removeChild(document.getElementById("margin"+snippet.id));
			});

			},true);
		var saveButton = document.createElement("img");
		saveButton.addEventListener('click', function(e){ 
			e.cancelBubble=true;
			if (bookmarked==null) {
				doAJAX("tl_bookmark",that.bookmarkURL+"?snippet="+snippet.id,function(result){
					tl_log("bookmarked: "+ snippet.id+ ", "+result);
					saveButton.setAttribute("src",thinklink_imagebase+"lightbulb.png");
					margin_item.addClass("tl_margin_item_bookmarked").removeClass("tl_margin_item");
					bookmarked=snippet.id;
				});
			}
			else {
				doAJAX("tl_bookmark",that.unbookmarkURL+"?snippet="+snippet.id,function(result){
					tl_log("unbookmarked: "+ snippet.id+ ", "+result);
					saveButton.setAttribute("src",thinklink_imagebase+"lightbulb_off.png");
					margin_item.addClass("tl_margin_item").removeClass("tl_margin_item_bookmarked");
					bookmarked=null;
				});	
			}
			},true);
			
			
		// show fancy shmancy stuff if the snippet has been bookmarked
		if (bookmarked == null) { 
			saveButton.setAttribute("src",thinklink_imagebase+"lightbulb_off.png"); 
			margin_item.addClass("tl_margin_item");
			if (snippet.opposed){
				margin_item.addClass("tl_margin_item_con");
			}else{
				margin_item.addClass("tl_margin_item");
			}
		}
		else { 
			saveButton.setAttribute("src",thinklink_imagebase+"lightbulb.png"); 
			if (snippet.opposed){
				margin_item.addClass("tl_margin_item_con");
			}else{
				margin_item.addClass("tl_margin_item_bookmarked");
			}
		}
		var buttonBox = $("<span/>").css("float","right").css("margin-left","2px");
		buttonBox.append($(saveButton)); buttonBox.append($(deleteButton));

	}

}