function tl_suggest(parentElem,attached, url, textarg) {
//	this.parent = document.body;
	this.parent = parentElem; // div to put everything in
	this.queryURL = url;
	this.arg = textarg;
	this.attached = attached;
	this.argList="";
	this.resultsList;
	this.textBox;
	this.button;
	this.defaultText;
	this.resultsDiv;
	this.selectCallback = null; // function to run after selecting an item
	this.resultCallback = null; // returns dom element to put in each result item div, given single result item
	this.hasValue = false;
	
	this.init = function() {
		var that = this;
		this.mainDiv = document.createElement("div");
		this.mainDiv.className = "tl_suggest_maindiv";
		this.parent.appendChild(this.mainDiv);
		this.textBox = document.createElement("input");
		this.textBox.setAttribute("type","text");
		this.textBox.setAttribute("name","searchText");
		this.textBox.setAttribute("autocomplete","off");
		this.textBox.style.color = "grey";
		this.textBox.style.fontStyle = "italic";
		this.textBox.addEventListener('keydown',function(e){ that.keyPressHandler(e,that); },false);
		this.textBox.addEventListener('keyup',function(e) { if (e.keyCode==32) { that.runQuery(); }}, false); // fire on space bar
		this.mainDiv.appendChild(this.textBox);
		
		this.popbutton = document.createElement("img");
		this.popbutton.setAttribute("src",thinklink_imagebase+"popup.png");
		this.popbutton.style.padding = "4px";
		this.popbutton.addEventListener("mousedown",function(){
			that.runQuery();
		},false);
		this.mainDiv.appendChild(this.popbutton);
		
		this.button = document.createElement("input");
		this.button.setAttribute("type","button");
		this.button.setAttribute("value","submit"); 
		this.mainDiv.appendChild(this.button);
		this.resultsDiv = document.createElement("span");
		this.resultsDiv.className = "hidden";
		this.resultsDiv.style.position = "fixed";
		document.body.appendChild(this.resultsDiv);
//		this.parent.appendChild(this.resultsDiv);
		
		document.body.addEventListener("mousedown",that.hideResults,false);
		
		return this.textBox;
	}
		
	this.getValue = function(){
		if(this.hasValue){
			return this.textBox.value;
		}else{
			return null;
		}
	}
	
	this.setSize = function(size) {
		this.textBox.setAttribute("size",size);
	}
	this.setWidth = function(width){
		this.textBox.style.width = width;
	}
	
	
	this.setButtonText = function(txt) {
		this.button.setAttribute("value",txt); 
	}
	this.hideButton = function(){
		this.button.style.display = "none";
	}

	this.setSelectCallback = function(cb) {
		this.selectCallback = cb;
	}
	
	this.setButtonClickEvent = function(func) {
		this.button.addEventListener('click',func,false);
	}
	
	this.setResultCallback = function(cb) {
		this.resultCallback = cb;
	}
	
	this.setQueryKeyCaller = function(cb) {
		this.textBox.addEventListener('keyup',function(e) {
			cb(e);
		},false);
	}
	
	this.setDefaultText = function(text) {
		var that = this;
		this.textBox.value = text;
		this.defaultText = text;
		this.textBox.addEventListener('focus',function(){
			if (that.textBox.value == that.defaultText) { 
				that.textBox.value="";
				that.hasValue = true;
				that.textBox.style.color = "black";
				that.textBox.style.fontStyle = "";
			}			
		},false);
	}
	
	this.setQueryArgs = function(args) {
		this.argList = "";
		for (arg in args) { this.argList += encodeURIComponent(arg)+"="+encodeURIComponent(args[arg]); }
	}
	
	this.runQuery = function(q) {
		if (q==null) { q=this.getValue(); }
		if (q==null) { q = ""; }
		var scriptID = "tl_suggest_ajax";
		var thinklink_callback;
		var that = this;
		var requestUrl;
		var resultTitle;
		if(this.getSuggestUrl){
			var req = this.getSuggestUrl();
			requestUrl = req.url;
			resultTitle = req.title;
		}else{
			var args = "?"+this.arg+"="+encodeURIComponent(q);
			if (this.argList != "") { args += "&"+this.argList; }
			requestUrl = this.queryURL+args;	
		}
		
		doAJAX(scriptID,requestUrl,function(result){	
			//document.getElementsByTagName("head")[0].removeChild(document.getElementById(scriptID));
			this.argList = "";
			that.showResults(result,resultTitle);	
		});
	}
	
	this.close = function(){
		this.resultsDiv.parentNode.removeChild(this.resultsDiv);
	 	document.body.removeEventListener("mousedown",this.hideResults,false);
	}
	
	this.showResults = function(result,title) {
		var that = this;
		this.removeAll();
		this.resultsDiv.className = "tl_search_results";
		
		if(title){
			var titleDiv = document.createElement("div");
			titleDiv.className = "tl_suggest_title";
			titleDiv.appendChild(document.createTextNode(title));
			this.resultsDiv.appendChild(titleDiv);
		}
			
		this.resultsList = result;
		if (this.attached) {
			var resultsPosition = findPos(this.textBox); // location of search text box
			this.resultsDiv.style.position = "fixed";
			this.resultsDiv.style.zIndex = "2147483647";
			this.resultsDiv.style.left = resultsPosition[0] + "px";
			this.resultsDiv.style.top = (resultsPosition[1] + parseInt(this.textBox.offsetHeight)) + "px";
			this.resultsDiv.style.width = this.mainDiv.offsetWidth +"px"; 
			this.resultsDiv.style.overflow = "auto";
			this.resultsDiv.style.maxHeight = "300px";
			this.resultsDiv.addEventListener("mousedown",function(event){
			    event.preventDefault();
			    event.stopPropagation();
			},false);
		}
		
		if (this.resultCallback == null) {tl_log("tl_suggest: no result callback"); return; }
		for (var item=0; item<this.resultsList.length; item++) {
			var itemResult = document.createElement("div");
			var elem = this.resultCallback(this.resultsList[item]);
			itemResult.appendChild(elem); 
			itemResult.id = elem.id;
			itemResult.className = "suggest_item"; 
			itemResult.addEventListener('mouseover',function() {
				this.className="suggest_item_over"; 
			},false); 
			itemResult.addEventListener('mouseout',function() { 
				this.className = "suggest_item"; 
			},false); 
			itemResult.addEventListener('mousedown',function(e) { that.selectResultHandler(e,that); },false); 
			this.resultsDiv.appendChild(itemResult);
		}
	}
	
	var bigthat = this;
	this.hideResults = function(){
		if(bigthat.resultsDiv){
			bigthat.resultsDiv.className = "hidden";
		}
	}
	
	this.selectResultHandler =  function(e,classptr) {
		var e=e? e : window.event;
		var el=e.target? e.target : e.srcElement;
		
		classptr.hasValue = true;
		classptr.textBox.value = el.textContent;
		classptr.textBox.style.color = "black";
		classptr.textBox.style.fontStyle = "";

		if (this.selectCallback !=null) { this.selectCallback(el); }
		if (this.attached) { this.resultsDiv.className = "hidden"; }
		
	}
	this.keyPressHandler = function(evt,classptr) {
		
		// don't do anything if the div is hidden
		  var div = classptr.resultsDiv;
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

		  if ((key != KEYUP) && (key != KEYDOWN) && (key != KEYENTER) && (key != KEYTAB)){
		  	if(classptr.unselectCallback){
		  		classptr.unselectCallback();
		  	}
		  	return;
		  }

		  // get the span that's currently selected, and perform an appropriate action
		  var selNum = classptr.getSelectedItemNum();
		  var selDiv = classptr.setSelectedItem(selNum);

		  if ((key == KEYENTER) || (key == KEYTAB)) {
		   	if (selDiv) {
					classptr.textBox.value = selDiv.textContent;
					if (classptr.selectCallback !=null) { 
						classptr.selectCallback(selDiv); 
					}
					if (classptr.attached) { classptr.resultsDiv.className = "hidden"; }
				}else{
					classptr.hideResults();
				}	
		    evt.cancelBubble=true;
		    return false;
		  } else {
		    if (key == KEYUP)
		    	selDiv = classptr.setSelectedItem(selNum - 1);
		    if (key == KEYDOWN)
		    	selDiv = classptr.setSelectedItem(selNum + 1);
		    if (selDiv)
		      selDiv.className = "suggest_item_over";
		  }

		  //showDiv(true,index);
		  return true;
	}
	
	this.removeAll= function() {
		if ( this.resultsDiv.hasChildNodes() )
		{
		    while ( this.resultsDiv.childNodes.length >= 1 )
		    {
		        this.resultsDiv.removeChild( this.resultsDiv.firstChild );       
		    } 
		}
	}
	
	this.getSelectedItemNum = function() {
		var num = -1;
		var count = -1;
		var divs = this.resultsDiv.getElementsByTagName("div"); // get <div>s within suggest div
		if (divs) {
				for (var i = 0; i < divs.length; i++) {
					var div = divs[i];
					if(div.className == "suggest_item" || div.className == "suggest_item_over"){
			   		count++;
			     	if (divs[i].className == "suggest_item_over") {
						num = count; // stop counting up when have the highlighted item
				  	}
			 	}
			}
		}	
		return num;
	}
	
	this.setSelectedItem = function(itemNum) {
		if (itemNum <0) return null;
		var count = -1;
		var thisItem;
		var divs = this.resultsDiv.getElementsByTagName("div");
		if (divs) {
			for (var i = 0; i < divs.length; i++) {
					var div = divs[i];
					if(div.className == "suggest_item" || div.className == "suggest_item_over"){
			   		if (++count == itemNum) {
			     		divs[i].className = "suggest_item_over";
			        	thisItem = divs[i];
			     	} else {
			        	divs[i].className = "suggest_item";
			     	}
			     }
		 	}
		}
		return thisItem;
	}
}