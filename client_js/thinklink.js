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

var tl_mymargin = null;

if (document.getElementById("tl_margin") == null) {

	// initialize margin object
	var myMargin = new tl_margin();
	tl_mymargin = myMargin;
	var mySnip = new tl_snippet_dialog(myMargin);
	myMargin.init();
	myMargin.refresh();

	// initialize snippet dialog box
	mySnip.init();
	// initialize point dialog box and browser box
	//var myPoint= new tl_point_dialog(myMargin);
	//myPoint.init();
	var myBrowser = new tl_point_browser();
	myBrowser.init();

	// add listener to recompute margin height if the browser is resized
	window.addEventListener('resize',function(){myMargin.setHeight();},true);
	
	window.addEventListener("load",function(){myMargin.refreshNoLoad();},true);
	
	// set some global vars for mouse coordinates
	var mouseX;
	var mouseY;
	document.addEventListener('mousemove',tl_getMouseXY,true);
	
	// set some global vars for creating draggable divs
	var tl_browserInfo = new getBrowserInfo();
	var tl_dragElement = new Object();

	if(document.onmousedown){
		document.onmousedown = null;
	}
	if(document.onmouseup){
		document.onmouseup = null;
	}
	
}
