if (document.getElementById("tl_margin") == null) {

	// initialize margin object
	var myMargin = new tl_margin();
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
	
	// set some global vars for mouse coordinates
	var mouseX;
	var mouseY;
	document.addEventListener('mousemove',getMouseXY,true);
	
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