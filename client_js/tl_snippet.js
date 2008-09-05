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
	
	this.noSelection = function(){
		var dialog = $("<div/>").addClass("tl_dialog").attr("id","reldialog")
			.css("left",100).css("top",100).css("position","fixed").css("width","300px")
			.appendTo(document.body);
		var title = $("<div>").addClass("tl_dialog_title")
			.text("Think Link")
			.mousedown(function(e) { tl_dragStart(e,"reldialog") }) // use title bar to drag browser;
			.appendTo(dialog);	
		var cancel = $("<span style='position: absolute; right: 4px'/>").appendTo(title);
		var cancelbut = $("<img src='"+thinklink_imagebase+"cancel.png'/>").appendTo(cancel)
			.click(function(){
				$(dialog).animate({ height: 'hide', opacity: 'hide' }, 'slow');
				dialog.remove();
			});
		var body = $("<form/>").addClass("tl_dialog_body").appendTo(dialog);
		
		var first = $("<div>").addClass("point_text")
			.text("You don't have any text selected and so cannot create a new snippet. Would you like to browse Think Link?")
			.appendTo(body);

		var open = $("<input type='button'/>").attr("value","Browse Think Link")
		.appendTo(body).css("margin-left","75px")
		.click(function(){
			window.open(thinklink_mainhome);
			$(dialog).animate({ height: 'hide', opacity: 'hide' }, 'slow');
			dialog.parentNode.removeChild(dialog);			
		});
	}
	
	this.new = function(sourceText){
		if (sourceText=="" || sourceText == null) {
			this.noSelection();
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
		

	
}