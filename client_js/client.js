
function thinklink_viewClaim(id) {
	var apipath = get_api_path();
	var url = apipath+"/claim/"+id;	
	var that = this;
	
	if(content.document.getElementById("tl_point_browser")){
		return;
	}
	
	var win = document.createElement("div");
	win.setAttribute("id","tl_point_browser");
	win.className = "tl_dialog";
	win.style.zIndex = "214783647";
	content.document.body.appendChild(win);
	
	var fader = this.addFader(win);
			
	win.style.overflow = "hidden";
	win.style.position = "fixed";
	win.style.top = "50px";
	win.style.left = "200px";
	win.style.width = "435px";
		//Math.min((window.innerWidth - 250),550) + "px";
	
	var titleBar = content.document.createElement("div");
	win.appendChild(titleBar);
	titleBar.setAttribute("id","tl_pb_title");
	titleBar.style.marginBottom = "0px";
	titleBar.style.cursor = "move";
	titleBar.addEventListener("mousedown",function(ev){
		tl_dragStart(ev,that.divID,"tl_point_frame");
	},true);
	titleBar.className = "tl_dialog_title";
	
	var buttonBox = document.createElement("span");
	buttonBox.style.position = "absolute";
	buttonBox.style.right = "4px";
	titleBar.appendChild(buttonBox);
	
	var ignoreButton = document.createElement("input");
	ignoreButton.className = "tl_openbutton";
	ignoreButton.setAttribute("type","button");
	ignoreButton.setAttribute("value","Don't highlight this again");
	buttonBox.appendChild(ignoreButton);
	ignoreButton.addEventListener("click",function(){
		that.hideMe();
		tl_doAJAX("tl_ignore","scripthack/ignoreclaim.js"+
			"?claim="+snippet.claimid,function(){});					
	},true);
	
	var openButton = document.createElement("input");
	openButton.className = "tl_openbutton";
	openButton.setAttribute("type","button");
	openButton.setAttribute("value","Open Full Interface");
	buttonBox.appendChild(openButton);
	openButton.addEventListener("click",function(){
		window.open(thinklink_mainhome);
	},true);

	var close = document.createElement("img");
	close.style.width = "64px";
	close.style.paddingTop = "2px";
	close.setAttribute("src",thinklink_imagebase+"bigcancel.png");
	buttonBox.appendChild(close);
	close.addEventListener("click",function(){
		that.hideMe();
		content.document.body.removeChild(fader);
	},true);
	
	// add actual content
	var frameholder = document.createElement("div");
	frameholder.style.height = "430px";

	var pointframe = document.createElement("iframe");
	pointframe.src = url;
	pointframe.style.width="100%";
	pointframe.style.height="100%";
	pointframe.style.overflow = "hidden";
	pointframe.style.border = "none";
	pointframe.setAttribute("id","tl_point_frame");
	pointframe.setAttribute("allowtransparency","true");
	frameholder.appendChild(pointframe);
	frameholder.style.width="100%";
	win.appendChild(frameholder);

	win.style.visibility = "visible";
	win.style.display = "block";
}
