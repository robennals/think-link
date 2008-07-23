function tl_snippet(id,author,sourceText,pointText,pointID,date) {
	this.author = author;
	this.sourceText = sourceText;
	this.displayText = pointText;
	this.pointText = pointText;
	this.pointID = pointID;
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
	
	this.init = function() {
		$("<div></div>").attr("id",this.divID).addClass("tl_dialog").appendTo($("body")); // add dialog element to DOM
		//$("#"+this.divID).draggable();
		$("#"+this.divID).hide();		// hide the dialog
	}
	
	this.showMe = function(){
		$("#"+this.divID).animate({ width: 'show', opacity: 'show' }, 'fast');
	}

	this.hideMe = function(){
		$("#"+this.divID).animate({ height: 'hide', opacity: 'hide' }, 'slow');
	}
	
	this.new = function(sourceText){
		if (sourceText=="" || sourceText == null) { return; }
		this.sourceText = sourceText;
		
		// determine last dom node to aid in finding associated permalink
		var sourceSpans = mark_snippet(this.sourceText);
		if(!sourceSpans) return;
		
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
		
		removeSpans(sourceSpans);
		tl_log("make new snippet dialog");
		
		$("#"+this.divID).css("top",mouseY);
		//var mySearch = new tl_search_results($("#"+this.divID));
		$("#"+this.divID).empty(); // clear out old html
		//$("#tl_search_results").replaceWith(""); // get rid of any open search results
		
		var title = $("<div>New Snippet </div>")
			.addClass("tl_dialog_title")
			.mousedown(function(e) { tl_dragStart(e,that.divID) }) // use title bar to drag browser;
		$(title).appendTo($("#"+this.divID)); // add title to dialog
		//$("#"+this.divID).draggable({handle: $(title),containment: $("body").parent()});
		
		//$('<input type="button" value="close" />').click(function(){that.hideMe();}).appendTo($(title));
		//$("#"+this.divID).resizable({minHeight:100,minWidth:400});
		
		var buttonBox = $("<span/>").css("position","absolute").css("right","4px").appendTo(title);
		var close = $("<img/>")
			.attr("src",thinklink_imagebase+"cancel.png").appendTo(buttonBox)
			.click(function(){ that.hideMe(); });
/*		
		var menu = $("<select></select>")
				.attr("name","relation")
				//.append("<option>asserts</option>")
				.append("<option>supports</option>");
				//.append("<option>opposes</option>");
		
		var topicElem = $('<input type="button" value="link to statement" />')
			.css("clear","both")
			.css("float","left")
			.click(function(){
			if (document.thinklink_snippet.pointID.value =="" || 
				document.thinklink_snippet.searchText.value != document.thinklink_snippet.pointText.value) { // no existing point selected, create new one first
				that.createPoint(document.thinklink_snippet.searchText.value);
			} 
			else { // use existing point
				that.createSnippet(that.sourceText,
								document.thinklink_snippet.relation.value,
								document.thinklink_snippet.pointID.value);
			}
		});
*/		
		// create the form to add to the dialog
		var newform = $('<form name="thinklink_snippet"></form>').appendTo($("#"+this.divID));
		$(newform).append('<input type="hidden" name="pointID" />');
		$(newform).append('<input type="hidden" name="pointText" />'); // hold text of existing point
		$(newform).append('<input type="hidden" name="relation" value="supports" />');
		
		/*
		var topTable = $("<table></table>").attr("width","100%");
		var topRow = $("<tr></tr>");
		var bottomRow = document.createElement("tr");
		*/
		// show snippet text
		$("<p></p>")
			.append("<em>selected snippet</em>:<br /> \""+this.sourceText.substring(0,50)+"..."+"\"<br />")
			.appendTo($(newform));
		$("<em></em>")
			.text("this snippet is about:")
			.appendTo($(newform));

		//topicElem.appendTo($(newform));
		//menu.appendTo($(newform));
		
	
		
		//$("<td></td>").attr("valign","top").append($(menu)).appendTo($(bottomRow));
		//$(topTable).append($(topRow)).appendTo($(newform));
		
		/*var defaultVal = "<Enter statement search text>";
		var searchInput = $('<input type="text" name="searchText" />')
			.attr("value",defaultVal)
			.keyup(function(e){
				if (e.keyCode==32) {// space bar
					//mySearch.runQuery(document.thinklink_snippet.searchText.value,that.sourceText);
					searchSuggest.runQuery();
				}
			})
			.focus(function(e){
				if ($(searchInput).attr("value") == defaultVal) {$(searchInput).attr("value","");}
			})
			.width(300);

		
		$("<td></td>").append($(searchInput)).appendTo($(bottomRow));
		*/
		var searchSuggest = new tl_suggest(document.getElementById(this.divID),false,"search_points.php","text");
		var textboxPtr = searchSuggest.init();
		searchSuggest.setSize(40);
		searchSuggest.setButtonText("link to statement");
		searchSuggest.setButtonClickEvent(function(){
			if (document.thinklink_snippet.pointID.value =="" || 
				textboxPtr.value != document.thinklink_snippet.pointText.value) { // no existing point selected, create new one first
				that.createPoint(textboxPtr.value);
			} 
			else { // use existing point
				that.createSnippet(that.sourceText,
								document.thinklink_snippet.relation.value,
								document.thinklink_snippet.pointID.value);
			}
		});
		searchSuggest.setSelectCallback( function(elem) {
			document.thinklink_snippet.pointText.value = $(elem).text();
			document.thinklink_snippet.pointID.value = elem.id;
		});
		searchSuggest.setResultCallback(function(item){ 
			var row = document.createElement("nobr");  row.id = item.id;
			row.appendChild(document.createTextNode(item.txt));
			return row;
		});
		searchSuggest.setDefaultText("<Enter statement search text>");

		/*
		$("<td></td>").append($(topicElem)).appendTo($(bottomRow));
		$(topTable).append($(topRow));
		$(topTable).append($(bottomRow));
		$(topTable).appendTo($(newform));
*/
		this.showMe();
		//mySearch.runQuery(this.sourceText,this.sourceText);
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
		
		doAJAX(scriptID,this.postURL+"?point="+pointID+"&rel="+encodeURIComponent(relation)+"&url="+encodeURIComponent(url)+"&title="+title+"&sniptxt="+encodeURIComponent(sniptext),function(result){
			tl_log("snippet sent for point "+ pointID+ " : "+result);
			//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
			tl_log("about to refresh margin");
			// refresh items in margin and clean up
			that.margin.itemsLoaded=false;
			that.margin.refresh();
			tl_log("refreshed margin");
			that.hideMe();
		});
	

	}
	
	this.createPoint = function(text) {
		var that = this;
		var scriptID = "tl_newpoint_ajax";
		var thinklink_callback;
		doAJAX(scriptID,this.newPointURL+"?text="+encodeURIComponent(text),function(result){
			tl_log("created point: "+result);
			//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
			that.createSnippet(that.sourceText.toString(),document.thinklink_snippet.relation.value,result); // global var
		});
	}
	
}