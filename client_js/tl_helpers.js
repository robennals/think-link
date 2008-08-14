
function tl_log(msg){		
	if(typeof console !== "undefined"){
		console.log(msg);
	}
}

function tl_hideDiv(divid) {
	var elem = document.getElementById(divid);
	elem.style.visibility = "hidden";
	elem.style.display = "none";	
}

function tl_showDiv(divid) {
	var elem = document.getElementById(divid);
	elem.style.visibility = "visible";
	elem.style.display = "block";
}

function doAJAX(scriptID,url,callback) {
	//if (typeof thinklink_callback !== "undefined") { tl_log("callback: "+thinklink_callback); }
	var url = thinklink_urlbase + url;
	var doc = document;
	var scripttag = doc.createElement("script");
    thinklink_callback = callback;
    scripttag.src = url+"&cb=thinklink_callback";
    scripttag.type = "text/javascript";
	scripttag.id = scriptID;
    doc.getElementsByTagName("head")[0].appendChild(scripttag);
}

function mark_snippet(snippet) {
	if(snippet[snippet.length-1] == " "){
		snippet = snippet.substring(0,snippet.length-1);
	}
	var text = document.body.textContent.replace(/\s+/g," ");
	var offset = text.indexOf(snippet);
	if(offset == -1) return null;

	var snipspans = [];
	
	addspans(document.body,offset,snippet.length,snippet,snipspans,false,false);
	return snipspans;
}

function addspans(node,start,length,snipText,snipspans,sawSpace,ispre) {
	var nodeText = node.textContent.replace(/\s+/g," ");
	
	if (start+length < nodeText.length) {
		start = nodeText.indexOf(snipText);
	}
	
	if (node.nodeName == "PRE"){
		ispre = true;
	}
	if (node.nodeName == "#text") {
		if(ispre){
			var white = identify_whitespace(node.textContent);
			nodeText = white.txt;
			start = nodeText.indexOf(snipText);			
		}
		// before snippet
		if (start != 0) {
			var beforeTxt = nodeText.substring(0,start);
			if(ispre){ beforeTxt = expand_whitespace(beforeTxt,0,white.white); }
			var beforeNode = document.createTextNode(beforeTxt);
			node.parentNode.insertBefore(beforeNode,node);
		}
		// during snippet
		var newSpan = document.createElement("span");
		newSpan.className = "highlight";
		
		var middleTxt = nodeText.substring(start,start+length);
		if(ispre) {middleTxt = expand_whitespace(middleTxt,start,white.white);	}	
		var middleNode = document.createTextNode(middleTxt);
		node.parentNode.insertBefore(newSpan,node);
		newSpan.appendChild(middleNode);
		snipspans.push(newSpan);
		
		
		// after snippet
		if (start+length < nodeText.length) {
			var afterTxt = nodeText.substring(start+length);
			if(ispre) {afterTxt = expand_whitespace(afterTxt,start+length,white.white);}
			var afterNode = document.createTextNode(afterTxt);
			node.parentNode.insertBefore(afterNode,node);
		}
		node.parentNode.removeChild(node);
	}
	else {
		var nodeList = [];
		var alltext = "";
		var done = 0;
		for (var k=0; k<node.childNodes.length; k++) {
			if(node.childNodes[k].nodeName != "#comment" ){//&& node.childNodes[k].nodeName != "SCRIPT"){
				nodeList.push(node.childNodes[k]);
				alltext += node.childNodes[k].textContent.replace(/\s+/g," ");
			}
		}
		for (var i=0; i<nodeList.length;i++) {
			var childText = nodeList[i].textContent.replace(/\s+/g," ");
			if (childText[0] && childText[0].match(/^\s$/) && sawSpace) {start++;}
			if (start < childText.length) {
				var newLength = Math.min(childText.length,length);
				addspans(nodeList[i], start,newLength,snipText.substring(0,newLength),snipspans,false,ispre);
				length -= childText.length - start;
				snipText = snipText.substring(newLength);
			}
			if (childText != "") { sawSpace = childText[childText.length-1].match(/^\s$/); }
			start -= childText.length;
			if (start <0) start=0;
			if (length <=0) return;
			done += childText.length;
		}
	}
}

function identify_whitespace(rawtxt){
	var whitespace = [];
	var simptxt = "";
	var whitechars = [" \t\n\r\f"];
	var wasspace = false;
	var j = 0;
	for(var i = 0; i < rawtxt.length; i++){
		var c = rawtxt[i];
		if(c == " " || c=="\t" || c=="\n" || c=="\f"){
			if(whitespace[j] === undefined){
				whitespace[j] = "";
			}
			whitespace[j] += c;
			wasspace = true;
		}else{
			if(wasspace){
				simptxt+=" ";
				j++;
				wasspace = false;
			}
			wasspace = false;
			simptxt+=c;
			j++;
		} 
	}	
	return {txt:simptxt,white:whitespace};
}

function expand_whitespace(text,off,spaces){
	var bigtext = "";
	for(var i = 0; i < text.length; i++){
		if(spaces[i+off] !== undefined){			
			bigtext += spaces[i+off];
		}else{
			bigtext += text[i];
		}
	}
	return bigtext;
}

function removeSpans(spanList) {
	var textNodes = []; // list of corresponding text nodes in in span
	for (var i=0; i<spanList.length;i++) {
		var text = spanList[i].textContent;
		var textChild = document.createTextNode(text);
		textNodes.push(textChild);
	}
	// do the replacing
	for (var i=0; i<textNodes.length;i++) {
		spanList[i].parentNode.insertBefore(textNodes[i],spanList[i]);
		spanList[i].parentNode.removeChild(spanList[i]);		
	}

}

function getText()
{
	// make sure selection is not in margin or annotate dialog
	
	var text = null;
	if (window.getSelection)
		{ text = window.getSelection();}
	else if (document.getSelection)
	    { text = document.getSelection(); }
	else if (document.selection)
	    { text = document.selection.createRange().text; }
	
	var inDoc = inDocument(text.anchorNode);
	if (inDoc) { return text; }
	else { return null; }
}

function inDocument(element) {
	// check if this element is within the margin or annotation dialog
	var num = $(element).parents().filter("#tl_snippet_dialog").length;
	num += $(element).parents().filter("#tl_margin").length;
	if (num < 1) return true; // this element is within the main document
	else return false; // this element is in one of the thinklink dialogs
}

function normalizeString(text) {
	return text.replace(/\s+/g," ");
}

/*
function setSpan(id, parentElem, firstIndex, firstOffset, lastIndex, lastOffset) {
	//var foo = document.getElementById("foo");
	
	var oldbegin = parentElem.childNodes[firstIndex];
	var oldend = parentElem.childNodes[lastIndex];
	var child;

	
	// first part: text node
	var first = document.createTextNode(parentElem.childNodes[firstIndex].nodeValue.substring(0,firstOffset));
	
	// second part, wrap in <span>
	var second = document.createElement("span");
	second.setAttribute("class","highlight");
	second.setAttribute("id",id);
	var secondText = document.createTextNode(parentElem.childNodes[firstIndex].nodeValue.substring(firstOffset));
			
	// third part: wrap in <span>
	var third = document.createElement("span");
	third.setAttribute("class","highlight");
	var thirdText = document.createTextNode(parentElem.childNodes[lastIndex].nodeValue.substring(0,lastOffset));
	
	// fourth part: text node
	var fourth = document.createTextNode(parentElem.childNodes[lastIndex].nodeValue.substring(lastOffset));
	
	// get middle part cloned and placed with span tag
	var middle = document.createElement("span");
	middle.setAttribute("class","highlight");
	for(child=firstIndex+1; child< lastIndex; child++)
	{
		middle.appendChild(parentElem.childNodes[child].cloneNode(true));
	}
	
	// add elements in first child node
	parentElem.insertBefore(first,oldbegin);
	parentElem.insertBefore(second,oldbegin);
	second.appendChild(secondText);
	parentElem.removeChild(oldbegin);
	
	// add elements in last child node
	parentElem.insertBefore(third,oldend);
	parentElem.insertBefore(fourth,oldend);
	third.appendChild(thirdText);
	parentElem.removeChild(oldend);
	

	// add span around entired middle nodes
	for(child=firstIndex+2; child< lastIndex-1; child++)
	{
		parentElem.removeChild(parentElem.childNodes[child]);
	}
	parentElem.insertBefore(middle,third);

}
*/


function setTextPos(currentElement, depth, text, id, annoteObj)
{
	if (currentElement)
	{
    	var j;
    	var tagName=currentElement.tagName;

    	// Traverse the tree
    	var i=0;
    	var currentElementChild=currentElement.childNodes[i];
    	while (currentElementChild)
    	{
			/*
			var elemText = normalizeString(currentElementChild.textContent);
			if (inDocument(currentElementChild) && elemText!= null && elemText.indexOf(text,0) >=0) // have text and the text matches
			{
				var exists = document.getElementById(id);
				//if (exists != null) return; // don't recreate the span!

				var snipLocation = find_snippet(currentElementChild, text);
				setSpan(id,currentElementChild,snipLocation.f,snipLocation.fi,snipLocation.l,snipLocation.li);

				var position = findPos(document.getElementById(id));
				annoteObj.setPosition(position); // set the position once we've found it
			}
      		// Recursively traverse the tree structure of the child node
      		setTextPos(currentElementChild, depth+1,text,id,annoteObj);
      		i++;
      		currentElementChild=currentElement.childNodes[i];
			*/
			
			if (inDocument(currentElementChild) && currentElementChild.nodeValue!= null && currentElementChild.nodeValue.indexOf(text,0) >=0) // have text and the text matches
			{
				var exists = document.getElementById(id);
				if (exists != null) return; // don't recreate the span!
				
				var spanText = '<span id="' + id + '">'+ text +'</span>';
				$(currentElementChild).replaceWith(currentElementChild.nodeValue.replace(text,spanText));
				var position = findPos(document.getElementById(id));
				annoteObj.setPosition(position); // set the position once we've found it
			}
      		// Recursively traverse the tree structure of the child node
      		setTextPos(currentElementChild, depth+1,text,id,annoteObj);
      		i++;
      		currentElementChild=currentElement.childNodes[i];
			
    	}

  	}
}

function findPos(element) {
	var curleft = curtop = 0;
	if (element.offsetParent) {
		curleft = element.offsetLeft;
		curtop = element.offsetTop; 
		while (element= element.offsetParent) {
			curleft += element.offsetLeft;
			curtop += element.offsetTop;
		}
	}
	return [curleft,curtop];
}

function getMouseXY(e) {
	var posx = 0;
	var posy = 0;
	if (!e) var e = window.event;
	if (e.pageX || e.pageY) 	{
		posx = e.pageX;
		posy = e.pageY;
	}
	else if (e.clientX || e.clientY) 	{
		posx = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	// posx and posy contain the mouse position relative to the document
	mouseX = posx;
	mouseY = posy;
	return [posx,posy]; // also return?
}

function getDocumentElements() {
	var docs = [];
	var frames = document.getElementsByTagName("frame");
	if (frames.length < 1) { return [document]; } // no frameset, return the single document
	for (var i=0; i<frames.length;i++) {
		var doc = frames[i].contentWindow || frames[i].contentDocument;
	  	if (doc.document) { docs.push(doc.document); }
	}
	return docs;
}

function pickDocumentElement(docs) {
	var docIndex = -1;
	var maxLength = 0;
	for (var i=0; i<docs.length;i++) {
		if (docs[i].body.textContent.length>maxLength) { 
			maxLength = docs[i].body.textContent.length; 
			docIndex = i;
		}
	}
	if (docIndex >=0) { return docs[docIndex]; }
	else return null;
}


function getBrowserInfo() {
	var ua, s, i;
	this.isIE    = false;
	this.isNS    = false;
	this.version = null;
	
	ua = navigator.userAgent;

	s = "MSIE";
	if ((i = ua.indexOf(s)) >= 0) {
	  this.isIE = true;
	  this.version = parseFloat(ua.substr(i + s.length));
	  return;
	}

	s = "Netscape6/";
	if ((i = ua.indexOf(s)) >= 0) {
	  this.isNS = true;
	  this.version = parseFloat(ua.substr(i + s.length));
	  return;
	}

	// Treat any other "Gecko" browser as NS 6.1.

	s = "Gecko";
	if ((i = ua.indexOf(s)) >= 0) {
	  this.isNS = true;
	  this.version = 6.1;
	  return;
	}
	
}

function tl_dragStart(event, id) {

  var el;
  var x, y;

  // If an element id was given, find it. Otherwise use the element being
  // clicked on.

  if (id)
    tl_dragElement.elNode = document.getElementById(id);
  else {
    if (tl_browserInfo.isIE)
      tl_dragElement.elNode = window.event.srcElement;
    if (tl_browserInfo.isNS)
      tl_dragElement.elNode = event.target;

    // If this is a text node, use its parent element.

    if (tl_dragElement.elNode.nodeType == 3)
      tl_dragElement.elNode = tl_dragElement.elNode.parentNode;
  }
	// Get cursor position with respect to the page.

  if (tl_browserInfo.isIE) {
    x = window.event.clientX + document.documentElement.scrollLeft
      + document.body.scrollLeft;
    y = window.event.clientY + document.documentElement.scrollTop
      + document.body.scrollTop;
  }
  if (tl_browserInfo.isNS) {
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;
  }
	// Save starting positions of cursor and element.

  tl_dragElement.cursorStartX = x;
  tl_dragElement.cursorStartY = y;
  tl_dragElement.elStartLeft  = parseInt(tl_dragElement.elNode.style.left, 10);
  tl_dragElement.elStartTop   = parseInt(tl_dragElement.elNode.style.top,  10);

  if (isNaN(tl_dragElement.elStartLeft)) tl_dragElement.elStartLeft = 0;
  if (isNaN(tl_dragElement.elStartTop))  tl_dragElement.elStartTop  = 0;

	// Update element's z-index.

  tl_dragElement.elNode.style.zIndex = ++tl_dragElement.zIndex;

	// Capture mousemove and mouseup events on the page.

  if (tl_browserInfo.isIE) {
    document.attachEvent("onmousemove", tl_dragGo);
    document.attachEvent("onmouseup",   tl_dragStop);
    window.event.cancelBubble = true;
    window.event.returnValue = false;
  }
  if (tl_browserInfo.isNS) {
    document.addEventListener("mousemove", tl_dragGo,   true);
    document.addEventListener("mouseup",   tl_dragStop, true);
    event.preventDefault();
  }

}

function tl_dragGo(event) {

  var x, y;

  // Get cursor position with respect to the page.

  if (tl_browserInfo.isIE) {
    x = window.event.clientX + document.documentElement.scrollLeft
      + document.body.scrollLeft;
    y = window.event.clientY + document.documentElement.scrollTop
      + document.body.scrollTop;
  }
  if (tl_browserInfo.isNS) {
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;
  }
// Move drag element by the same amount the cursor has moved.

  tl_dragElement.elNode.style.left =
    (tl_dragElement.elStartLeft + x - tl_dragElement.cursorStartX) + "px";
  tl_dragElement.elNode.style.top  =
    (tl_dragElement.elStartTop  + y - tl_dragElement.cursorStartY) + "px";

	if (tl_browserInfo.isIE) {
	    window.event.cancelBubble = true;
	    window.event.returnValue = false;
	  }
	  if (tl_browserInfo.isNS)
	    event.preventDefault();


}
function tl_dragStop(event) {

  // Stop capturing mousemove and mouseup events.

  if (tl_browserInfo.isIE) {
    document.detachEvent("onmousemove", tl_dragGo);
    document.detachEvent("onmouseup",   tl_dragStop);
  }
  if (tl_browserInfo.isNS) {
    document.removeEventListener("mousemove", tl_dragGo,   true);
    document.removeEventListener("mouseup",   tl_dragStop, true);
  }
}

