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
		//$("<div></div>").attr("id",this.divID).addClass("tl_dialog").appendTo($("body")); // add dialog element to DOM
		//$("#"+this.divID).draggable();
		//$("#"+this.divID).hide();		// hide the dialog
		var elem = document.createElement("div"); elem.id = this.divID;  elem.className = "tl_dialog";
		elem.style.zIndex="-1";
		document.body.appendChild(elem);
		tl_hideDiv(this.divID);
		elem.style.zIndex="2147483647";
	}
	
	this.showMe = function(){
		//$("#"+this.divID).animate({ width: 'show', opacity: 'show' }, 'fast');
		tl_showDiv(this.divID);
	}

	this.close = function(){
		$("#tl_snippet_win").animate({ height: 'hide', opacity: 'hide' }, 'slow');
		var dialog = document.getElementById("tl_snippet_win");
		if(dialog){dialog.parentNode.removeChild(dialog)};
		removeSpans(this.sourceSpans);
		this.margin.itemsLoaded=false;
		this.margin.refresh();
	}

	this.hideMe = function(){
		$("#"+this.divID).animate({ height: 'hide', opacity: 'hide' }, 'slow');
		this.searchSuggest.close();
		this.topicSuggest.close();
	}
	
	this.new = function(sourceText){
		if (sourceText=="" || sourceText == null) {
			 alert("You need to select some text before clicking this button");
			 return; 
		}
		this.sourceText = sourceText;
		
		// determine last dom node to aid in finding associated permalink
		var sourceSpans = mark_snippet(this.sourceText);
		if(!sourceSpans) return;
		this.sourceSpans = sourceSpans;
		
		var pivotSpan = sourceSpans[sourceSpans.length-1];
		var that = this;
		this.permaLink = this.margin.normTool.findPermalinkForNode(pivotSpan,this.sourceText,function(url){
			tl_log("permalink is :"+url);
			that.permaLink = url;
			that.gotPermaLink = true;
		});
		that.makeNewSnippetDialog(sourceSpans);
	};
		
	this.makeNewSnippetDialog = function(sourceSpans){
		var that = this;
		var mk = function(tag) {return document.createElement(tag);};
		
		var url = this.margin.normTool.normalizeUrl(this.margin.url);
		if (this.permaLink != null) { // use the determined perma link if available
			tl_log("permalink is : "+this.permaLink);
			url = this.margin.normTool.makeAbsoluteUrl(this.margin.url,this.permaLink);
			url= this.margin.normTool.normalizeUrl(url);
		} 
		var url_real = this.margin.url;
		
		var frame = mk("iframe");
		frame.setAttribute("src",thinklink_mainhome+
			"snippets/newsnippet?txt="+encodeURIComponent(this.sourceText)
			+"&url="+encodeURIComponent(url)+"&realurl="+encodeURIComponent(url_real)
			+"&title="+encodeURIComponent(document.title));
		frame.className = "tl_snippet_frame";
		frame.setAttribute("id","tl_snippet_frame");
		frame.style.width = "500px";
		frame.style.height = "400px";
		frame.style.overflow = "hidden";
//		frame.style.padding = "6px";
		frame.style.backgroundColor = "white";
		var title = mk("div");
		title.className = "tl_dialog_title";
		title.textContent = "Save Snippet in Folder";
		title.addEventListener("mousedown",function(e){tl_dragStart(e,"tl_snippet_win","tl_snippet_frame");},false);
		var win = mk("div");
		win.className = "tl_dialog";
		win.setAttribute("id","tl_snippet_win");
		win.style.position = "fixed";
		win.style.left = "100px";
		win.style.top = "0px";
		win.appendChild(title);
		win.appendChild(frame);
		thinklink_activeDivId = "tl_snippet_win";
		document.body.appendChild(win);
	};	
		
	this.makeNewSnippetDialog_old = function(sourceSpans){
		var that = this;
		
//		removeSpans(sourceSpans);
		tl_log("make new snippet dialog");
		
		$("#"+this.divID).css("left","100px");
		$("#"+this.divID).css("top","0px");
//		$("#"+this.divID).css("width",max(window.clientWidth * 0.6,window.clientWidth - 100,));
		$("#"+this.divID).empty(); // clear out old html
		
		
		var title = $("<div>New Snippet </div>")
			.addClass("tl_dialog_title")
			.mousedown(function(e) { tl_dragStart(e,that.divID) }) // use title bar to drag browser;
		$(title).appendTo($("#"+this.divID)); // add title to dialog
		var buttonBox = $("<span/>").css("position","absolute").css("right","4px").appendTo(title);
		var close = $("<img/>")
			.attr("src",thinklink_imagebase+"cancel.png").appendTo(buttonBox)
			.click(function(){ removeSpans(sourceSpans); that.hideMe(); });

		// create the form to add to the dialog
		var newform = $('<form name="thinklink_snippet"></form>').appendTo($("#"+this.divID));
		$(newform).append('<input type="hidden" name="pointID" />');
		$(newform).append('<input type="hidden" name="topicID" />');
		$(newform).append('<input type="hidden" name="pointText" />'); // hold text of existing point
		$(newform).append('<input type="hidden" name="topicText" />'); // hold text of existing point
		$(newform).append('<input type="hidden" name="relation" value="supports" />');
		
		newform.addClass("tl_dialog_body");
		
		// show snippet text
		$("<div class='tl_dialog_subtitle_first'>selected snippet:</div><div class='snippet_text'>\""+this.sourceText+"\"</div>")
			.appendTo($(newform));
		$("<div/>").addClass("tl_dialog_subtitle")
		  .text("this snippet is about:")
			.appendTo($(newform));

		var topicSuggest = new tl_suggest(newform.get(0),true,"search_topics.php","text");
		this.topicSuggest = topicSuggest;
		var topicboxPtr = topicSuggest.init();
		topicSuggest.hideButton();
		topicSuggest.setWidth("490px");
		topicSuggest.setSelectCallback( function(elem) {
			document.thinklink_snippet.topicText.value = $(elem).text();
			document.thinklink_snippet.topicID.value = elem.id;
			that.topicID = elem.id;
			that.topicText = $(elem).text();
		});
		topicSuggest.unselectCallback = function(){
			that.topicID = null;
		}
		topicSuggest.getSuggestUrl = function(){
			var text = topicSuggest.getValue();
			if(!text) text = "";
			var title 
			if(text){
				title = "Topics matching '"+text+"'";
			}else{
				title = "Recent topics you added points to";
			}
			return {url: "search_topics.php?text="+encodeURIComponent(text),title: title};
		};
		
		topicSuggest.setResultCallback(function(item){ 
			var row = document.createElement("div");  row.id = item.id;
			row.appendChild(document.createTextNode(item.txt));
			return row;
		});
		topicSuggest.setDefaultText("<Enter a topic. e.g. 'Apples'>");

		$("<div/>").text("this snippet claims:").addClass("tl_dialog_subtitle")
			.appendTo($(newform));

		var searchSuggest = new tl_suggest(newform.get(0),true,"search_points.php","text");
		this.searchSuggest = searchSuggest;
		var textboxPtr = searchSuggest.init();
		searchSuggest.hideButton();
		searchSuggest.setWidth("490px");
		searchSuggest.setSelectCallback( function(elem) {
			document.thinklink_snippet.pointText.value = $(elem).text();
			document.thinklink_snippet.pointID.value = elem.id;
		});
		searchSuggest.getSuggestUrl = function(){
			var text = searchSuggest.getValue();
			var url; var title;
			if(text && that.topicID){
				url = "search_points.php?text="+encodeURIComponent(text)+"&topic="+that.topicID;
				title = "Points matching '"+text+"' in the topic '"+topicSuggest.getValue()+"'";
			}else if(text){
				url = "search_points.php?text="+encodeURIComponent(text);
				title = "Points matching '"+text+"'";			
			}else if(that.topicID){
				url = "search_points.php?topic="+that.topicID;
				title = "Recent points in the topic '"+topicSuggest.getValue()+"'";
			}else{
				url = "search_points.php?";
				title = "Recent points you identified";
			}
			return {url: url, title: title};
		}
		searchSuggest.setResultCallback(function(item){ 
			var row = document.createElement("div");  row.id = item.id;
			row.appendChild(document.createTextNode(item.txt));
			return row;
		});
		searchSuggest.setDefaultText("<Enter a statement this snippet makes. e.g. 'Apples taste good'>");

		var button = $("<input type='button' value='Create Snippet'/>");
		button.css("float","right");
		button.css("margin","4px");
		button.click(function (){
			if (document.thinklink_snippet.pointID.value =="" || 
				textboxPtr.value != document.thinklink_snippet.pointText.value) { // no existing point selected, create new one first										
				that.createPoint(textboxPtr.value,topicSuggest.getValue(),that.topicID);
			} 
			else { // use existing point
				that.createSnippet(that.sourceText,
								document.thinklink_snippet.relation.value,
								document.thinklink_snippet.pointID.value);
			}
			removeSpans(sourceSpans);
		});
		button.appendTo(newform);

		this.showMe();
	}
	
	this.createSnippet = function(sniptext,relation,pointID) {
		var that = this;	
		var scriptID = "tl_snippet_ajax";
		var thinklink_callback;
		if(!this.gotPermaLink){
			tl_log("waiting for permalink");
			setTimeout(function(){
				that.createSnippet(sniptext,relation,pointID);
			},200);
			return;
		}
		var title = encodeURIComponent(document.title);
		var url = this.margin.normTool.normalizeUrl(this.margin.url);
		if (this.permaLink != null) { // use the determined perma link if available
			tl_log("permalink is : "+this.permaLink);
			url = this.margin.normTool.makeAbsoluteUrl(this.margin.url,this.permaLink);
			url= this.margin.normTool.normalizeUrl(url);
		} 
		var url_real = this.margin.url;
		
		doAJAX(scriptID,this.postURL+"?point="+pointID+"&rel="+encodeURIComponent(relation)+"&urlreal="+encodeURIComponent(url_real)+"&url="+encodeURIComponent(url)+"&title="+title+"&sniptxt="+encodeURIComponent(sniptext),function(result){
			tl_log("snippet sent for point "+ pointID+ " : "+result);
			//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
			tl_log("about to refresh margin");
			// refresh items in margin and clean up
			that.margin.itemsLoaded=false;
			that.margin.refresh();
			that.margin.showMarginPull();
			tl_log("refreshed margin");
			that.hideMe();
		});
	

	}
	
	this.createPoint = function(text,topic,topicID) {
		if (text == "<Enter a statement this snippet makes. e.g. 'Apples taste good'>") { this.hideMe();} // hack
		else {
			var that = this;
			var scriptID = "tl_newpoint_ajax";
			var thinklink_callback;
			if(!topicID) topicID = "";
			doAJAX(scriptID,this.newPointURL+"?text="+encodeURIComponent(text)+"&topicid="+topicID+"&topic="+encodeURIComponent(topic),function(result){
				tl_log("created point: "+result);
				//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
				that.createSnippet(that.sourceText.toString(),document.thinklink_snippet.relation.value,result); // global var
			});
		}
	}
	
}