
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
		$("<div></div>").attr("id",this.divID).addClass("tl_dialog").appendTo($("body")); // add dialog element to DOM
		$("#"+this.divID).hide();		// hide the dialog
			
	}
	
	this.newChildBrowser = function(parent,parentPointId) {
		var pointid = parentPointId;
		var that = this;
		var node = document.createElement("div");
		node.id = "childof"+parentPointId; node.align="center";
		//node.appendChild(document.createTextNode("Relate to another point"));
		parent.appendChild(node);
		parent.appendChild(document.createElement("br"));
		//parent.appendChild(document.createElement("hr"));
		
		// get a search results object
		var mySearch = new tl_search_results_child(node);
		
		// make form
		var menu = $("<select></select>")
				.attr("name","relation")
				.append("<option value=\"related\">is related to</option>")
				.append("<option>asserts</option>")
				.append("<option>supports</option>")
				.append("<option>opposes</option>");
		var button = document.createElement("input");
			button.type="button";  button.value= "link to statement";
			button.addEventListener('click',function(){
				that.createPointLink(pointid, document.thinklink_point_child.relation.value, document.thinklink_point_child.searchText.value);
			}, false);	

		var formNode = document.createElement("form");
		formNode.name = "thinklink_point_child";
		node.appendChild(formNode);
		formNode.appendChild(document.createTextNode("this statement: "));
		var textBox = document.createElement("input");
		var defaultVal = "<Enter statement search text>";
		textBox.type = "text"; textBox.name = "searchText"; textBox.size="50"; textBox.value = defaultVal;
		textBox.addEventListener('keyup',function(e){
			if (e.keyCode==32) {// space bar
				mySearch.runQuery(document.thinklink_point_child.searchText.value);
			}
		},false);
		textBox.addEventListener('focus',function(e){
			if (textBox.value == defaultVal) {textBox.value = "";}
		},false);
		
		$(formNode).append(menu);
		formNode.appendChild(textBox);
		formNode.appendChild(button);
	
		
	}
	
	this.createPointLink = function(destid, relation,sourcetext) {
		var scriptID = "tl_newpointlink_ajax";
		var thinklink_callback;
		var fieldString = "?destid="+ encodeURIComponent(destid)+"&rel="+encodeURIComponent(relation)+"&text="+encodeURIComponent(sourcetext);
		doAJAX(scriptID,this.newPointLinkURL+fieldString,function(result){
			tl_log("new point link: "+ result);
			//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
			myBrowser.getPointData(destid);
		});
		
	}
	
	this.getPointData = function(pointID,snipID) {
		this.pointID = pointID;
		this.snipID = snipID;
		var that = this;
		var scriptID = "tl_point_ajax";
		var thinklink_callback;
		
		// make dimensions relative to user's window size
		var multiplier = 2/3;
		$("#"+this.divID).width(window.innerWidth*multiplier);
		$("#"+this.divID).height(window.innerHeight*multiplier);
		
		var mainTable = $("<table></table>").attr("width","100%").attr("id","tl_pb_main");
		$('<tr><td width="75%"><u>Snippets</u></td><td width="25%">Rate</td></tr>').appendTo($(mainTable)); 
		var snippetRowPro = $("<tr></tr>"); 
		snippetRowPro.appendTo($(mainTable));
		$('<tr><td><u>Related Points</u></td></tr>').appendTo($(mainTable));
		var pointRow = $("<tr></tr>");
		pointRow.appendTo($(mainTable));
		
		// add subtables to the main table
		var snippetProTable = $("<table></table>").attr("width","100%"); 	
		var pointTable = $("<table></table>").attr("width","100%"); 
		
		//var pointProTable = $("<table></table>").attr("width","100%");	var pointConTable = $("<table></table>").attr("width","100%");	
		$("<td></td>").attr("valign","top").attr("colspan","2").append($(snippetProTable)).appendTo($(snippetRowPro));
		$("<td></td>").attr("valign","top").attr("colspan","2").append($(pointTable)).appendTo($(pointRow));
		//$("<td></td>").attr("valign","top").append($(pointProTable)).appendTo($(pointRow));
		//$("<td></td>").attr("valign","top").append($(pointConTable)).appendTo($(pointRow));
		
		// make sections for point information
		var pointInfoRow = $("<tr></tr>");
		var pointRel = $('<td width="34%"><em>Related</em></td>').attr("valign","top");;
		pointRel.appendTo($(pointInfoRow));
		var pointPro = $('<td width="33%"><em>Supporting</em></td>').attr("valign","top");;
		pointPro.appendTo($(pointInfoRow));
		var pointCon = $('<td width="33%"><em>Opposing</em></td>').attr("valign","top");;
		pointCon.appendTo($(pointInfoRow));
		pointInfoRow.appendTo($(pointTable))
		
		// get view point information
		var args = "?id="+pointID;
		if (this.snipID != null) { args += "&snippet="+this.snipID; }
		doAJAX(scriptID,this.pointsURL+args,function(result){
			that.resultsObj = result;
			that.pointText = that.resultsObj['point_info'][0].txt;
			// determine number and ranges of snippet pages
			/*that.numPerPage = parseInt($("#"+that.divID).height()/100);
			var numPages;
			if (that.resultsObj['snip_links'].length%that.numPerPage ==0) { numPages = that.resultsObj['snip_links'].length/that.numPerPage;}
			else { numPages = that.resultsObj['snip_links'].length/that.numPerPage +1; }
			var startIndex = 0;
			*/
			/*
			// show first page of snippets
			that.getSnippetPage(startIndex,that.numPerPage,snippetProTable);
		
			// show links to other pages
			var snippetPages = $('<td></td>').attr("colspan","2").text("page: ");
			
			
			for (var page=1; page<= numPages; page++) {
				var link = $("<a></a>");
				$(link).text(" "+page+ " ")
						.attr("id",startIndex)
						.click(function(e) {
							var e=e? e : window.event;
							var el=e.target? e.target : e.srcElement;
							var end = parseInt(el.id) + that.numPerPage;
							that.getSnippetPage(el.id,end,snippetProTable); 
						});
				$(snippetPages).append(link);
				startIndex += that.numPerPage;
			}
			
			$("<tr></tr>").append($(snippetPages)).insertAfter($(snippetProTable));
			*/
			
			// get points
			for (var point=0; point<that.resultsObj['point_links'].length; point++) {
				var rel = that.resultsObj['point_links'][point].howlinked;
				var element = $("<li></li>");
				$("<a></a>").text(that.resultsObj['point_links'][point].txt)
					.attr("id",that.resultsObj['point_links'][point].id)
					.click(that.showPointHandler)
					.appendTo(element);

				if (rel=='asserts' || rel=='supports') { element.appendTo($(pointPro)); }
				else if ( rel=='related') { element.appendTo($(pointRel)); }
				else {element.appendTo($(pointCon));}
			}
			
			
			// now display the point
			document.getElementById(that.divID).style.display = "block";
			that.viewPoint(mainTable);
			
			// get available used space and fill it with snippets
			var usedSpace = document.getElementById("tl_pb_main").offsetHeight + document.getElementById("tl_pb_title").offsetHeight+ document.getElementById("childof"+that.pointID).offsetHeight;
			tl_log(document.getElementById("tl_pb_title").offsetHeight +" document.getElementById('tl_pb_title').offsetHeight");
			tl_log(document.getElementById("childof"+that.pointID).offsetHeight+ " document.getElementById('childof"+that.pointID+"').offsetHeight");
			tl_log(document.getElementById("tl_pb_main").offsetHeight+ " document.getElementById('tl_pb_main'').offsetHeight"); 
			var spaceAvail = document.getElementById(that.divID).offsetHeight - usedSpace;
			var result = that.addSnippetsToDisplay(snippetProTable,0,0,spaceAvail-100); // hack on available space
			that.pageStart[0]=0; // first page starts at index 0
				
			// clean up
			document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
		});
		
	}

	
	this.getRatingStars = function(rating,ratingElement) {
		var that = this;
		var fullSrc = thinklink_imagebase+"star.png";
		var halfSrc = thinklink_imagebase+"star_half.png";
		var emptySrc = thinklink_imagebase+"star_empty.png";
		var ratingDescrip = $("<div> </div>").css("font-size","10pt");
		var descrips = ["awful support","poor support","ok support","good support","excellent support"];

		// round to nearest half point
		var count=1;
		while (count <=5) {
			var elem = $("<img />").attr("id",count)
				.hover(function(){ 
					$(this).addClass("highlight");
					$(ratingDescrip).text(descrips[$(this).attr("id")-1]);
					}, function(){ 
					$(this).removeClass("highlight"); 
					$(ratingDescrip).text("");
				})
				.click(that.rateSnippetHandler);
				
			if (rating >=count) { elem.attr("src",fullSrc).appendTo($(ratingElement)); }
			else { 
				if (rating > (count-1) ) { elem.attr("src",halfSrc).appendTo($(ratingElement)); }
				else { elem.attr("src",emptySrc).appendTo($(ratingElement)); } 
			}
			count++;
		}
		$(ratingElement).append($(ratingDescrip));
	}

	this.addSnippetsToDisplay = function(tableElement,startIndex,page,spaceAvail) {
		$(tableElement).empty();
		var that = this;
		var spaceLeft = spaceAvail;
		tl_log("starting space: "+spaceLeft);
		
		for (var snip=startIndex; snip<that.resultsObj['snip_links'].length; snip++) {
			// add a snippet
			var row = $("<tr></tr>");
			var snipobj = that.resultsObj['snip_links'][snip];
			
			var snip_id = snipobj.snippet;
			tl_log("snippet id " +snip_id);
			if (this.snipID !=null && snip_id==this.snipID) { row.css("background","#DDEEEE"); }
			
			var snipTitle = snipobj.url;
			if (snipobj.title != "") { 
				snipTitle = snipobj.title; 
			}else if (snipobj.pagetitle != "") { 
				snipTitle = snipobj.pagetitle; 
			}
			if(snipTitle.length > 50){
				snipTitle = snipTitle.substring(0,50)+"...";
			}
			var snipSource;
			if (snipobj.sourcename != "") { 
				snipSource = snipobj.sourcename; 
			}else{
				var m = snipobj.url.match(/\/([\w\.]+)/);
				if(m && m[1]){
					snipSource = m[1];
				}
			}
			if(snipSource){
				snipTitle += " - " + snipSource;
			}

			var rel = snipobj.howlinked;
			
			// get rating if one exists
			var rating = 0;
			if (that.resultsObj['snip_links'][snip].rating != null) { rating = that.resultsObj['snip_links'][snip].rating}

			// set up the snippet text, source, and rating html
			var element = $("<td></td>").attr("valign","top").attr("width","75%").css("padding-bottom","4px");
			var snipDiv = $("<div></div>");//.attr("class","tl_browser_item");
			$(snipDiv).appendTo(element);
			var snipTitleElem = document.createTextNode("\""+that.resultsObj['snip_links'][snip].txt.substring(0,200)+"\"");
			snipDiv.append($(snipTitleElem));
			$("<a></a>")
				.attr("href",that.resultsObj['snip_links'][snip].url)
				.text(" - "+snipTitle)
				.appendTo(element);
			var ratingChoice = $("<td></td>").attr("id",snip_id).attr("valign","top").attr("height","35");
			that.getRatingStars(rating,ratingChoice);

			// add the dom element
			$(row).append($(element));	
			$(row).append($(ratingChoice));	
			//if (rel=='asserts' || rel=='supports') { $(row).appendTo($(tableElement)); }
			$(row).appendTo($(tableElement));
			
			spaceLeft = spaceAvail - tableElement.height();
			tl_log("tableheight = "+tableElement.height()+" spaceleft = "+spaceLeft);
			if (spaceLeft <=0 ) {
				// remove offending snippet and stop adding more
				//$(tableElement).remove($(row));
				break;
			}
		}
		that.pageStart[page+1] = snip+1;
		tl_log("snippets left: "+ (that.resultsObj['snip_links'].length-1-snip) );
		
		// show pagination links
		var prevNextRow = document.createElement("tr");
		var prevNextData = document.createElement("td");
		prevNextRow.appendChild(prevNextData);
		tableElement.append($(prevNextRow));
		
		// previous snippets, if any
		tl_log("snippets page: "+ page);
		if (page >0) {
			var prevLink = document.createElement("a");
			$(prevLink).text("[previous] ");
			prevLink.addEventListener('click',function(){ that.addSnippetsToDisplay(tableElement,that.pageStart[page-1],page-1,spaceAvail) },false);
			prevNextData.appendChild(prevLink);
			//prevNextData.appendChild(document.createTextNode(" | "));
		}
				
		// are there more snippets to show?  show next page link
		if (snip < that.resultsObj['snip_links'].length-1) {
			var nextLink = document.createElement("a");
			$(nextLink).text("[next]");
			nextLink.addEventListener('click',function(){ that.addSnippetsToDisplay(tableElement,that.pageStart[page+1],page+1,spaceAvail) },false);
			var nextData = document.createElement("td");
			prevNextData.appendChild(nextLink);
		}
		
		return {begin:startIndex, end:snip} ;	
			
	}
/*
	// view snippets in range [startIndex,stopIndex)
	this.getSnippetPage = function(startIndex,stopIndex,tableElement) {
		$(tableElement).empty();
		var that = this;
		if (stopIndex > that.resultsObj['snip_links'].length) { stopIndex = that.resultsObj['snip_links'].length;}

		for (var snip=startIndex; snip<stopIndex; snip++) {
			var row = $("<tr></tr>");
			var snipTitle = that.resultsObj['snip_links'][snip].url.substring(0,50);
			if (that.resultsObj['snip_links'][snip].pagetitle != "") { 
				snipTitle = that.resultsObj['snip_links'][snip].pagetitle.substring(0,50); 
			}
			var rel = that.resultsObj['snip_links'][snip].howlinked;
			
			// get rating if one exists
			var rating = 0;
			if (that.resultsObj['snip_links'][snip].rating != null) { rating = that.resultsObj['snip_links'][snip].rating}

			// set up the snippet text, source, and rating html
			var element = $("<td></td>").attr("valign","top").attr("width","75%");
			var snipDiv = $("<div></div>").attr("class","tl_browser_item");
			$(snipDiv).appendTo(element);
			var snipTitleElem = document.createTextNode("\""+that.resultsObj['snip_links'][snip].txt+"\"");
			snipDiv.append($(snipTitleElem));
			$("<a></a>")
				.attr("href",that.resultsObj['snip_links'][snip].url)
				.text(" - "+snipTitle)
				.appendTo(element);
			var ratingChoice = $("<td></td>").attr("id",snip_id).attr("valign","top").attr("height","35");
			that.getRatingStars(rating,ratingChoice);

			// add the dom element
			$(row).append($(element));	
			$(row).append($(ratingChoice));	
			//if (rel=='asserts' || rel=='supports') { $(row).appendTo($(tableElement)); }
			$(row).appendTo($(tableElement));
		}
		
	}
*/	
	this.setHover = function(item,hovermsg,defaultText){		
		var explainSpan = $("<span></span>").css("padding",10);
		item.hover(function(){ 
				$(this).addClass("highlight");
				$(explainSpan).text(hovermsg);
				}, function(){ 
				$(this).removeClass("highlight");
				$(explainSpan).text(defaultText); 
		})
		
	}
	
	this.viewFrame = function(pointID) {
		this.pointID = pointID;
		var that = this;

		// remove any existing point browser content... this should be changed eventually to allow multiple browsers?
		$("#"+this.divID).empty();

		// if mouse is not currently positioned inside of an open point browser, position point browser using mouse coords
		var height =  $("#"+this.divID).height();
		var width = $("#"+this.divID).width();
		var position = findPos(document.getElementById(this.divID));
		if ( (mouseX > position[0] && mouseX < (position[0]+width)) &&
			(mouseY > position[1] && mouseY < (position[1]+height)) ) {
			// stay in same spot	
		}
		else { // position in Y direction 
			$("#"+this.divID).css("top",mouseY);
		}

		var titleBar = $("<div/>").appendTo($("#"+this.divID))
			.attr("id","tl_pb_title")
			//.mousedown(function(e) { tl_dragStart(e,that.divID) }) // use title bar to drag browser
			.addClass("tl_dialog_title");

		var buttonBox = $("<span/>").css("position","absolute").css("right","4px").appendTo(titleBar);
		var titleBox = $("<nobr>").text("Statement Browser").appendTo(titleBar);
/*

		var defaultText ="";
		if (that.resultsObj['point_info'][0].agree=="1") { defaultText="I agree"; }
		else if (that.resultsObj['point_info'][0].agree=="0") {defaultText="I disagree"; }

		var explainSpan = $("<span/>").css("padding-left","10px");

		var thumbup = $("<img/>")
			.attr("src",thinklink_imagebase+"thumb_up.png").appendTo(titleBox).css("padding-left","4px")
			.click(this.ratePointHandler).attr("id",1)
			.hover(function(){ 
				$(this).addClass("highlight");
				$(explainSpan).text("I agree");
			}, function(){ 
				$(this).removeClass("highlight");
				$(explainSpan).text(defaultText); 
			});

		var thumbdown = $("<img/>")
			.attr("src",thinklink_imagebase+"thumb_down.png").appendTo(titleBox)
			.click(this.ratePointHandler).attr("id",0)
			.hover(function(){ 
				$(this).addClass("highlight");
				$(explainSpan).text("I disagree");
			}, function(){ 
				$(this).removeClass("highlight");
				$(explainSpan).text(defaultText); 
			});

		explainSpan.appendTo(titleBox);	
*/
		var help = $("<img/>")
			.attr("src",thinklink_imagebase+"help.png").appendTo(buttonBox)
			.click(that.showHelpBox)
			.appendTo(buttonBox);	
		var close = $("<img/>")
			.attr("src",thinklink_imagebase+"cancel.png").appendTo(buttonBox)
			.click(function(){
				that.hideMe();
			});
			
		// add actual content
		var pointframe = document.createElement("iframe");
		pointframe.src = "http://mashmaker.intel-research.net:3001/points/showmini/"+pointID;
		pointframe.style.width="100%";
		pointframe.style.height="100%";
		$("#"+this.divID).append($(pointframe));

		this.showMe();	
	}

	this.viewPoint = function(element) {
		var that = this;
		
		// remove any existing point browser content... this should be changed eventually to allow multiple browsers?
		$("#"+this.divID).empty();
		
		
		// if mouse is not currently positioned inside of an open point browser, position point browser using mouse coords
		var height =  $("#"+this.divID).height();
		var width = $("#"+this.divID).width();
		var position = findPos(document.getElementById(this.divID));
		if ( (mouseX > position[0] && mouseX < (position[0]+width)) &&
			(mouseY > position[1] && mouseY < (position[1]+height)) ) {
			// stay in same spot	
		}
		else { // position in Y direction 
			$("#"+this.divID).css("top",mouseY);
		}
		
		var titleBar = $("<div/>").appendTo($("#"+this.divID))
			.attr("id","tl_pb_title")
			.mousedown(function(e) { tl_dragStart(e,that.divID) }) // use title bar to drag browser
			.addClass("tl_dialog_title");

		var buttonBox = $("<span/>").css("position","absolute").css("right","4px").appendTo(titleBar);
		var titleBox = $("<nobr>").text(this.pointText).appendTo(titleBar);

		var defaultText ="";
		if (that.resultsObj['point_info'][0].agree=="1") { defaultText="I agree"; }
		else if (that.resultsObj['point_info'][0].agree=="0") {defaultText="I disagree"; }

		var explainSpan = $("<span/>").css("padding-left","10px");
		
		var thumbup = $("<img/>")
			.attr("src",thinklink_imagebase+"thumb_up.png").appendTo(titleBox).css("padding-left","4px")
			.click(this.ratePointHandler).attr("id",1)
			.hover(function(){ 
				$(this).addClass("highlight");
				$(explainSpan).text("I agree");
			}, function(){ 
				$(this).removeClass("highlight");
				$(explainSpan).text(defaultText); 
			});

		var thumbdown = $("<img/>")
			.attr("src",thinklink_imagebase+"thumb_down.png").appendTo(titleBox)
			.click(this.ratePointHandler).attr("id",0)
			.hover(function(){ 
				$(this).addClass("highlight");
				$(explainSpan).text("I disagree");
			}, function(){ 
				$(this).removeClass("highlight");
				$(explainSpan).text(defaultText); 
			});
		
		explainSpan.appendTo(titleBox);	
			
		var help = $("<img/>")
			.attr("src",thinklink_imagebase+"help.png").appendTo(buttonBox)
			.click(that.showHelpBox)
			.appendTo(buttonBox);	
		var close = $("<img/>")
			.attr("src",thinklink_imagebase+"cancel.png").appendTo(buttonBox)
			.click(function(){
				that.hideMe();
				var search = document.getElementById("tl_search_results_child");
				if (search != null) { document.body.removeChild(search); }
			});

		
		//$("#"+this.divID).draggable({handle: $(titleBar)}); // use title bar to drag
		

		// add the title area to document and add content!
//		var title = $("<div></div>").addClass("tl_dialog_title").append($(titleTable));
//		$(title).appendTo($("#"+this.divID)); // add title to dialog
//		$("#"+this.divID).draggable({handle: $(title)}); // use title bar to drag
//		
		
		// add point relation stuff
		this.newChildBrowser(document.getElementById(this.divID),this.pointID);
		
		// add actual content
		$("#"+this.divID).append($(element));
		
		
		this.showMe();
		
//			
//		// make title area
//		var titleTable = document.createElement("table"); titleTable.setAttribute("width","100%"); titleTable.setAttribute("id","tl_pb_title"); 
//		var titleRow = document.createElement("tr");
//		titleTable.appendChild(titleRow);
//		var titleData = document.createElement("td"); titleData.appendChild(document.createTextNode(this.pointText));
//		titleRow.appendChild(titleData);
//		
//		// add thumbs up/down stuff to title area
//		var defaultText ="";
//		if (that.resultsObj['point_info'][0].agree=="1") { defaultText="I agree"; }
//		else if (that.resultsObj['point_info'][0].agree=="0") {defaultText="I disagree"; }
//		var thumbData = document.createElement("td"); thumbData.setAttribute("width","150"); thumbData.setAttribute("align","right");
//		var thumbDiv = $("<div></div>").css("font-size","10pt").css("text-align","right").attr("id",this.pointID);
//		var explainSpan = $("<span></span>").css("padding",10);
//		$(explainSpan).text(defaultText);
//		$(thumbDiv).append($(explainSpan));
//		$("<img />").attr("src","http://mashmaker.intel-research.net/beth/images/thumb_up.png").attr("id","1")
//			.hover(function(){ 
//				$(this).addClass("highlight");
//				$(explainSpan).text("I agree");
//				}, function(){ 
//				$(this).removeClass("highlight");
//				$(explainSpan).text(defaultText); 
//			})
//			.click(that.ratePointHandler)
//			.appendTo($(thumbDiv));
//		$("<img />").attr("src","http://mashmaker.intel-research.net/beth/images/thumb_down.png").attr("id","0")
//			.hover(function(){ 
//				$(this).addClass("highlight");
//				$(explainSpan).text("I disagree");
//				}, function(){ 
//				$(this).removeClass("highlight");
//				$(explainSpan).text(defaultText); 
//			})
//			.click(that.ratePointHandler)
//			.appendTo($(thumbDiv));
//		$(thumbData).append(thumbDiv);
//		titleRow.appendChild(thumbData);
//		
//		// add close buttong and help button
//		var closeData = document.createElement("td");
//		$('<input type="button" value="close" />')
//			.click(function(){
//				that.hideMe(); 
//				var search = document.getElementById("tl_search_results_child");
//				if (search != null) { document.body.removeChild(search); }
//			})
//			.appendTo($(closeData));
//		titleRow.appendChild(closeData);
//		
//		var helpData = document.createElement("td"); helpData.setAttribute("width","50"); helpData.setAttribute("align","right");
//		$("<img />").attr("src","http://mashmaker.intel-research.net/beth/images/help.png")
//			.click(that.showHelpBox)
//			.appendTo($(helpData));
//		titleRow.appendChild(helpData);
		

	}
	
	
	this.showMe = function(){
		$("#"+this.divID).animate({ width: 'show', opacity: 'show' }, 'fast');
	}

	this.hideMe = function(){
		$("#"+this.divID).animate({ height: 'hide', opacity: 'hide' }, 'slow');
	}
	
	this.showHelpBox = function() {
		var helpDiv = document.createElement("div");
		helpDiv.className = "help_box";
		$(helpDiv).css("top",mouseY);
		$(helpDiv).css("left",mouseX-200);
		
		var closeButton = document.createElement("input");
		closeButton.setAttribute("type","button");
		closeButton.setAttribute("value","x");
		closeButton.addEventListener("click",function(){ document.body.removeChild(helpDiv); },false);
		helpDiv.appendChild(document.createTextNode("Statement Browser Information "));
		helpDiv.appendChild(closeButton);
		
		var text1 = document.createTextNode("The statement browser shows a summary of a statement's supporting source text snippets and related statements.");
		var p1 = document.createElement("p"); p1.appendChild(text1);
		helpDiv.appendChild(p1);
		
		var text2 = document.createTextNode("You can click the thumbs up/down icons to indicate your agreement or disagreement with the statement.");
		var p2 = document.createElement("p"); p2.appendChild(text2);
		helpDiv.appendChild(p2);
		
		var text3 = document.createTextNode("Source text snippets that assert/support the statement are listed with user ratings. Click a snippet's text to view its source document, or click a star rating to vote on how well that snippet supports the statement.");
		var p3 = document.createElement("p"); p3.appendChild(text3);
		helpDiv.appendChild(p3);
		
		var text4 = document.createTextNode("Related statements are listed below the snippets. You can relate the statement to another by entering statement text into the search box.");
		var p4 = document.createElement("p"); p4.appendChild(text4);
		helpDiv.appendChild(p4);
		
		document.body.appendChild(helpDiv);
	}
	
	this.rateSnippetHandler = function(e) {
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
		
		var scriptID = "tl_rating_ajax";
		var thinklink_callback;				
		var fieldString = "?snippet_id=" + $(el).parent().attr("id") + "&point_id=" + myBrowser.pointID+ "&rating=" + el.id;
		doAJAX(scriptID,myBrowser.newRatingURL+fieldString,function(result){
			tl_log("rating: " + result);
			myBrowser.getPointData(myBrowser.pointID);
		});
	}
	
	this.ratePointHandler = function(e) {
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;

		var scriptID = "tl_agreeing_ajax";
		var thinklink_callback;
		var fieldString = "?point_id=" + myBrowser.pointID + "&agree=" + el.id;
		tl_log(fieldString);
		doAJAX(scriptID,myBrowser.newAgreeURL+fieldString,function(result){
			tl_log("point agreement: " + result);
			myBrowser.getPointData(myBrowser.pointID);
		});
	}
	
	this.showPointHandler = function(e) { // add click event to each result item
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
			
			myBrowser.getPointData(el.id);
	}
	
	this.showSnipHandler = function(e) { // add click event to each result item
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
			document.location.href=el.id; // navigate to page snippet is from
	}
	
}

function tl_search_results_child(parent) {
	this.search_url = "search_points.php";
	// make any necessary <div>s
	this.divID = "tl_search_results_child";
	// store the search result
	this.resultsObj;
	this.parent = parent;
	
	
	this.runQuery = function(q){
		var scriptID = "tl_search_ajax";
		var thinklink_callback;
		var that = this;
		doAJAX(scriptID,this.search_url+"?text="+encodeURIComponent(q),function(result){	
			that.showResults(result);	
		});
	}


	this.showResults = function(result) {
		var that = this;
		var resultsPosition = findPos(document.thinklink_point_child.searchText); // location of search text box
		var parentPosition = findPos(document.getElementById($(this.parent).attr("id"))); // location of element being appended to
		
		$("<div></div>") // the dropdown search results <div>
			.attr("id",this.divID)
			.css("left",resultsPosition[0])
			//.css("top",resultsPosition[1]-parentPosition[1]+document.thinklink_point_child.searchText.offsetHeight)
			.css("top",resultsPosition[1]+document.thinklink_point_child.searchText.offsetHeight)
			.width($(document.thinklink_point_child.searchText).width())
			//.appendTo(this.parent);
			.appendTo(document.body);
		
		//$(document.thinklink_point_child.searchText).keydown(that.keyPressHandler);	// fix div id in helper methods first
		// for each point, add onto list and register click event to open point browser
		this.resultsObj = result;
		$("#"+this.divID).empty();
		$("#"+this.divID).show();
		var longestLength = 0; // which search result has most characters
		for (var item=0; item<this.resultsObj.length; item++) {
			var itemResult = $("<nobr id='"+this.resultsObj[item].id+"'>"+this.resultsObj[item].txt+"</nobr>");
			$("<div class='suggest_item'></div>") 	// add list item to list
				.mouseover(function(){ $(this).addClass("suggest_item_over"); })
				.mouseout(function(){ $(this).removeClass("suggest_item_over"); })
				.mousedown(that.selectResultHandler)
				.attr("id",this.resultsObj[item].id)
				.append(itemResult)
				.appendTo($("#"+this.divID));
			
			if (parseInt(itemResult.width()) > longestLength) { longestLength = parseInt(itemResult.width()); }
		}
		$("#"+this.divID).width(longestLength+10);
	}

	
	this.selectResultHandler =  function(e) {
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
			document.thinklink_point_child.searchText.value = $(el).text();
			$(this).parent().hide();

	}
	
	this.keyPressHandler = function(evt)
	{

	  // don't do anything if the div is hidden
	  var div = document.getElementById("tl_search_results_child");
	  if (div.style.visibility == "hidden")
	    return true;

	  // make sure we have a valid event variable
	  if(!evt && window.event) {
	    evt = window.event;
	  }
	  var key = evt.keyCode;

	  // if this key isn't one of the ones we care about, just return
	  var KEYUP = 38;
	  var KEYDOWN = 40;
	  var KEYENTER = 13;
	  var KEYTAB = 9;

	  if ((key != KEYUP) && (key != KEYDOWN) && (key != KEYENTER) && (key != KEYTAB))
	    return true;

	  // get the span that's currently selected, and perform an appropriate action
	  var selNum = getSelectedItemNum();
	  var selDiv = setSelectedItem(selNum);

	  if ((key == KEYENTER) || (key == KEYTAB)) {
	   	if (selDiv) {
			document.thinklink_point_child.searchText.value = $(selDiv).text();
			document.thinklink_point_child.pointID.value = $(selDiv).attr("id");
			$(div).hide();
		}	
	    evt.cancelBubble=true;
	    return false;
	  } else {
	    if (key == KEYUP)
	    	selDiv = setSelectedItem(selNum - 1);
	    if (key == KEYDOWN)
	    	selDiv = setSelectedItem(selNum + 1);
	    if (selDiv)
	      selDiv.className = "suggest_item_over";
	  }

	  return true;

	}

	
}



function tl_search_results(parent) {
	this.search_url = "search_points.php";
	// make any necessary <div>s
	this.divID = "tl_search_results";
	// store the search result
	this.resultsObj;
	// save the sniptext
	this.sniptext;
	this.parent = parent;
	
	
	this.runQuery = function(q, snippet){
		var scriptID = "tl_search_ajax";
		var thinklink_callback;
		this.sniptext = snippet; // save the snippet
		var that = this;
		doAJAX(scriptID,this.search_url+"?text="+encodeURIComponent(q),function(result){	
			document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
			that.showResults(result);	
		});
	}


	this.showResults = function(result) {
		var that = this;
		var resultsPosition = findPos(document.thinklink_snippet.searchText); // location of search text box
		var parentPosition = findPos(document.getElementById($(this.parent).attr("id"))); // location of element being appended to
		
		$("<div></div>") // the dropdown search results <div>
			.attr("id",this.divID)
			//.css("left",resultsPosition[0]-parentPosition[0])
			//.css("top",resultsPosition[1]-parentPosition[1]+document.thinklink_snippet.searchText.offsetHeight)
			//.width($(document.thinklink_snippet.searchText).width())
			.appendTo(this.parent);
		
		//$(document.thinklink_snippet.searchText).keydown(function(e) { that.keyPressHandler(e,that); });	
		// for each point, add onto list and register click event to open point browser
		this.resultsObj = result;
		$("#"+this.divID).empty();
		$("#"+this.divID).show();
		var longestLength = 0; // which search result has most characters
		for (var item=0; item<this.resultsObj.length; item++) {
			var itemResult = $("<nobr id='"+this.resultsObj[item].id+"'>"+this.resultsObj[item].txt+"</nobr>");
			$("<div class='suggest_item'></div>") 	// add list item to list
				.mouseover(function(){ $(this).addClass("suggest_item_over"); })
				.mouseout(function(){ $(this).removeClass("suggest_item_over"); })
				.mousedown(that.selectResultHandler)
				.attr("id",this.resultsObj[item].id)
				.append(itemResult)
				.appendTo($("#"+this.divID));
			
			if (parseInt(itemResult.width()) > longestLength) { longestLength = parseInt(itemResult.width()); }
		}
		$("#"+this.divID).width(longestLength+10); 
	}
	
	this.attachListener = function(id) {
		//this.formName
	}
	
	/*
	this.showResults_old = function(result){
		
		$("#"+this.divID).replaceWith("");
		var that = this;
		this.resultsObj = result; //eval('(' + result + ')');
		//$("<div></div>").attr("id",this.divID).addClass("tl_dialog").appendTo(this.parent);			// make results dialog
		$("<div>test</div>")
			.css("left",resultsPosition[0]-parentPosition[0])
			.css("top",resultsPosition[1]-parentPosition[1]+document.thinklink_snippet.searchText.offsetHeight)
			.appendTo(this.parent);
		$("<div>Search Results</div>").addClass("tl_dialog_title").appendTo($("#"+this.divID)); // add title to dialog
		var list = $("<p></p>");	// start list of results
		$("#"+this.divID).append($(list)); 
		
		// if there's sniptext, need a form to be able to choose which point is related
		var snip = this.sniptext !=""; // boolean
		if (snip) {
			var menu = $("<select></select>")
					.attr("name","relation")
					.append("<option>asserts</option>")
					.append("<option>supports</option>")
					.append("<option>opposes</option>");
			$(list).wrap('<form name="searchResults" />').append($(menu)).append("<br />");  // put the list within form 
		}
		
		// for each point, add onto list and register click event to open point browser
		for (item in this.resultsObj) {
			if (snip) { // also add radio element if there is sniptext
				$('<input type="radio" name="id" value="'+this.resultsObj[item].id+'" />').appendTo($(list));
			}
			$("<span>"+this.resultsObj[item].txt+"</span>") 	// add list item to list
				.attr("id",this.resultsObj[item].id)
				.click(that.showResultHandler) // hacky fix to register click event
				.appendTo($(list));
			$(list).append("<br />");
		}
		// add sniptext and button if this is a form for snippet
		if (snip) {
			$('<input type="button" value="relate snippet" />')
				.click(that.postHandler)
				.insertAfter($(list));
			$('<input type="hidden" name="sniptext" value="'+this.sniptext+'" />')
				.insertAfter($(list));
		}
	}
	*/
	this.showResultHandler = function(e) { // add click event to each result item
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
			
			myBrowser.getPointData(el.id);
	}
	
	this.selectResultHandler =  function(e) {
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
			document.thinklink_snippet.searchText.value = $(el).text();
			document.thinklink_snippet.pointText.value = $(el).text();
			document.thinklink_snippet.pointID.value = el.id;
			//$(this).parent().hide();

	}
	
	this.keyPressHandler = function(evt,classptr)
	{
		tl_log(classptr.divID);
	  // don't do anything if the div is hidden
	  var div = document.getElementById("tl_search_results");
	  if (div.style.visibility == "hidden")
	    return true;

	  // make sure we have a valid event variable
	  if(!evt && window.event) {
	    evt = window.event;
	  }
	  var key = evt.keyCode;

	  // if this key isn't one of the ones we care about, just return
	  var KEYUP = 38;
	  var KEYDOWN = 40;
	  var KEYENTER = 13;
	  var KEYTAB = 9;

	  if ((key != KEYUP) && (key != KEYDOWN) && (key != KEYENTER) && (key != KEYTAB))
	    return true;

	  // get the span that's currently selected, and perform an appropriate action
	  var selNum = getSelectedItemNum();
	  var selDiv = setSelectedItem(selNum);

	  if ((key == KEYENTER) || (key == KEYTAB)) {
	   	if (selDiv) {
			document.thinklink_snippet.searchText.value = $(selDiv).text();
			document.thinklink_snippet.pointText.value = $(selDiv).text();
			document.thinklink_snippet.pointID.value = $(selDiv).attr("id");
			$(div).hide();
		}	
	    evt.cancelBubble=true;
	    return false;
	  } else {
	    if (key == KEYUP)
	    	selDiv = setSelectedItem(selNum - 1);
	    if (key == KEYDOWN)
	    	selDiv = setSelectedItem(selNum + 1);
	    if (selDiv)
	      selDiv.className = "suggest_item_over";
	  }

	  //showDiv(true,index);
	  return true;

	}


	/*
	this.postHandler = function(e){
		var pointID;
		var radios = $(document.searchResults).find("input[@type='radio']")
		for (i in radios) {
			if (radios[i].checked) {
				pointID = radios[i].value;
			}
		}
		mySnip.createSnippet(document.searchResults.sniptext.value,document.searchResults.relation.value,pointID); // global var
	}
	*/
	
}

function getSelectedItemNum() {
	var num = -1;
	var count = -1;
	var divs = document.getElementById("tl_search_results").getElementsByTagName("div"); // get <div>s within suggest div
	if (divs) {
		for (var i = 0; i < divs.length; i++) {
	   		count++;
	     	if (divs[i].className == "suggest_item_over") {
				num = count; // stop counting up when have the highlighted item
		  	}
	 	}
	}	
	return num;
}

function setSelectedItem(itemNum) {
	if (itemNum <0) return null;
	var count = -1;
	var thisItem;
	var divs = document.getElementById("tl_search_results").getElementsByTagName("div");
	if (divs) {
		for (var i = 0; i < divs.length; i++) {
	   		if (++count == itemNum) {
	     		divs[i].className = "suggest_item_over";
	        	thisItem = divs[i];
	      	} else {
	        	divs[i].className = "suggest_item";
	      	}
	 	}
	}
	return thisItem;
}

