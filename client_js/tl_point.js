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
		//$("<div></div>").attr("id",this.divID).addClass("tl_dialog").appendTo($("body")); // add dialog element to DOM
		var elem = document.createElement("div"); elem.id = this.divID;  elem.className = "tl_dialog";
		elem.style.zIndex="-1";
		document.body.appendChild(elem);
		tl_hideDiv(this.divID);
		elem.style.zIndex="2147483647";
		//$("#"+this.divID).hide();		// hide the dialog
			
	}

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
	
	this.inProgress = false;
	
	this.viewFrame = function(pointID,snipID) {
		this.pointID = pointID;
		var that = this;
		
		if(this.inProgress) return; // HACK: avoid duplicate call back
		this.inProgress = true;

		// remove any existing point browser content... this should be changed eventually to allow multiple browsers?
		$("#"+this.divID).empty();

		var me = document.getElementById(this.divID);
		me.style.overflow = "hidden";
		me.style.position = "fixed";
		me.style.top = "50px";
		me.style.left = "200px";
//		me.style.width = (window.innerWidth * (2/3)) + "px";
		me.style.width = Math.min((window.innerWidth - 250),550) + "px";

		// if mouse is not currently positioned inside of an open point browser, position point browser using mouse coords
		var position = findPos(document.getElementById(this.divID));
		
		var scriptID = "tl_point_ajax";
		var thinklink_callback;
		doAJAX("tl_get_point_info",this.pointsURL+"?id="+this.pointID,function(result){
			that.resultsObj = result;
			that.pointText = that.resultsObj['point_info'][0].txt;

			var titleBar = $("<div/>").appendTo($("#"+that.divID))
				.attr("id","tl_pb_title")
				.css("margin-bottom","0px")
				.css("cursor","move")
				.mousedown(function(e){tl_dragStart(e,that.divID,"tl_point_frame");})

				//.mousedown(function(e) { tl_dragStart(e,that.divID) }) // use title bar to drag browser
				.addClass("tl_dialog_title");

			var buttonBox = $("<span/>").css("position","absolute").css("right","4px").appendTo(titleBar);
			var titleBox = $("<nobr>").text("Investigate Claim").appendTo(titleBar);
			var openButton = $("<input class='tl_openbutton' type='button' value='Open Full Interface'/>").appendTo(buttonBox);
			
			openButton.click(function(){
				window.open(thinklink_mainhome);
			});


			var defaultText ="";
			if (that.resultsObj['point_info'][0].agree=="1") { defaultText="I agree"; }
			else if (that.resultsObj['point_info'][0].agree=="0") {defaultText="I disagree"; }

			var explainSpan = $("<span/>").css("padding-left","10px").text(defaultText);
			explainSpan.appendTo(titleBox);	

			var close = $("<img/>")
				.css("padding-top","2px")
				.attr("src",thinklink_imagebase+"cancel.png").appendTo(buttonBox)
				.click(function(){
					that.hideMe();
				});
			
			// add actual content
			var frameholder = document.createElement("div");
			frameholder.style.height = (window.innerHeight * (2/3)) + "px";

			var pointframe = document.createElement("iframe");
			pointframe.src = thinklink_pointbase+pointID+"?snippet="+snipID;
			pointframe.style.width="100%";
			pointframe.style.height="100%";
			pointframe.style.overflow = "auto";
			pointframe.setAttribute("id","tl_point_frame");
			frameholder.appendChild(pointframe);
			frameholder.style.width="100%";
//			frameholder.style.height="100%";
			$("#"+that.divID).append($(frameholder));

			that.showMe();	
		});
	}


	
	this.showMe = function(){
		tl_showDiv(this.divID);
		//$("#"+this.divID).animate({ width: 'show', opacity: 'show' }, 'fast');
	}

	this.hideMe = function(){
		this.inProgress = false;
		$("#"+this.divID).animate({ height: 'hide', opacity: 'hide' }, 'slow');
	}

	this.showSnipHandler = function(e) { // add click event to each result item
		var e=e? e : window.event;
			var el=e.target? e.target : e.srcElement;
			document.location.href=el.id; // navigate to page snippet is from
	}
	
}

