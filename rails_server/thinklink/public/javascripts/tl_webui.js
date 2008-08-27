
var oldselection = null;

function getel(id){
	return document.getElementById(id);
}

var selectedId;
var selectedDivId;
var selectedCls;

function selectItem(div,itemid,divid,cls){
	if(renameItem && divid != selectedDivId){
		editFinished();
	}
	if(oldselection){
		if(selectedCls == "Oppose" || selectedCls == "Support"){
			oldselection.className = "relationtitle";
		}else{
			oldselection.className = "dragitem";		
		}
	}

	selectedId = itemid;
	selectedDivId = divid;
	selectedCls = cls;
	
	if(selectedCls == "Oppose" || selectedCls == "Support"){
		div.className = "relationtitle relationtitle_selected";
	}else{
		div.className = "dragitem dragitem_selected";
	}
	oldselection = div;
	
	var preview_panel = getel("preview_panel");
	var preview_title = getel("preview_title");
	var pointname = getel("pointname");
	var foldername = getel("foldername");

	if(pointname){	// in the new snippet dialog
		tl_log(cls);
		if(cls == "Point"){
			enableInput("pointname");
			pointname.value = getTextOfSelected();
		}else if(cls == "Topic"){
			// foldername.textContent = getTextOfSelected();
			// tl_log(getTextOfSelected());
			// tl_log(foldername);
		}else if(cls == "Support"){
		}else if(cls == "Oppose"){
		}
		
	}else{
	
		if(cls=="Topic"){
			getel("actions_point").className = "hidden";
			getel("actions_folder").className = "actions";	
			getel("preview_container").className = "hidden";
			getel("topics_title").textContent = "More General Folders";
			ajaxReplace("/topics/"+itemid+"/parents","topics_panel");
		}else if(cls=="Point"){
			getel("actions_point").className = "actions";
			getel("actions_folder").className = "hidden";
			getel("preview_container").className = "snippets";
			preview_title.textContent = "Snippets for Selected Point";
			getel("topics_title").textContent = "Topics for Selected Point";
			ajaxReplace("/points/"+itemid+"/snippets","preview_panel");
			ajaxReplace("/points/"+itemid+"/topics","topics_panel");
		}
	}
}

function enableInput(id){
	var input = getel(id);
	if(input.className == "pointinput_empty"){
		input.value = "";
		input.className = "pointinput";
	}
}

function clearButton(what,idnum){
	var but = getel(what+"-"+idnum);
	if(but){
		but.className = "browsetab";
	}
}

function clearSelect(idnum){
	clearButton("all",idnum);
	clearButton("recent",idnum);
	clearButton("scratch",idnum);
	clearButton("hot",idnum);
	clearButton("friends",idnum);
	clearButton("search",idnum);

	getel("searchbar-"+idnum).className = "hidden";
}

function searchMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "Search Points";
	getel("searchbar-"+idnum).className = "searchbar";
	getel("search-"+idnum).className = "browsetab browsetab_selected";
	getel("body-"+idnum).innerHTML = "<div class='msg'>Enter search terms above</div>";
}

function searchDo(idnum){
	var query = getel("searchbox-"+idnum).value;
	ajaxReplace("/points/searchajax?query="+query,"body-"+idnum);	
}

function recentMode(idnum){
	getel("title-"+idnum).textContent = "My Recent Folders";
	clearSelect(idnum);
	getel("recent-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/recent","body-"+idnum);
}

function topMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "All Folders";
	getel("all-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/toplevel","body-"+idnum);
}

function scratchMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "Scratch Points"; 
	getel("scratch-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/points/scratch","body-"+idnum);
}


var resizeBar = null;
var resizeBox = null;
var startHeight = 0;
var startY = 0;
function dragBar(ev,idnum){
	resizeBar = getel("dragbar-"+idnum);
	resizeBox = getel("container-"+idnum);
	window.addEventListener("mousemove",resizeMove,false);
	window.addEventListener("mouseup",resizeStop,false);
	resizeBar.addEventListener("mouseup",resizeStop,false);
	startY = ev.clientY;
	startHeight = resizeBox.offsetHeight;
	ev.preventDefault();
}

function resizeMove(ev){
	var dragDiff = ev.clientY	- startY;
	resizeBox.style.height = (startHeight + dragDiff) + "px";
	ev.preventDefault();
}

function resizeStop(ev){
	window.removeEventListener("mousemove",resizeMove,false);
	window.removeEventListener("mouseup",resizeStop,false);
	resizeBar.removeEventListener("mouseup",resizeStop,false);
}

var renameItem;
var renameInput;

function normalizeText(txt){
	txt = txt.replace(/\s+/g," ");
	txt = txt.replace(/^\s*/,"");
	txt = txt.replace(/\s*$/,"");
	return txt;
}

function getTextOfSelected(){
	var item = getel(selectedDivId);
	return normalizeText(item.textContent);
}

function actionEdit(idnum,id){
	var dragitem = getel(selectedDivId);
	renameItem = dragitem;
	var input = document.createElement("input");
	input.setAttribute("type","text");
	input.setAttribute("class","renamebox inputbox");
	var txt = dragitem.textContent.replace(/\s+/g," ");
	txt = txt.replace(/^\s*/,"");
	txt = txt.replace(/\s*$/,"");
	input.setAttribute("value",dragitem.textContent.replace(/\s+/g," "));
	input.style.width = Math.max(150,dragitem.offsetWidth + 10) + "px";
	dragitem.textContent="";
	dragitem.parentNode.appendChild(input);
	dragitem.className = "hidden";
	renameInput = input;
	input.focus();
	input.addEventListener("blur",editFinished,false);
	input.addEventListener("keypress",editKeyPress,false);
}

function editFinished(){
	if(!renameItem) return;
	try{ // HACK
		renameItem.textContent = renameInput.value;
		renameItem.className = "dragitem";
		renameInput.parentNode.removeChild(renameInput);
	}catch(e){
	}
	renameItem = null;
	renameInput = null;

}

function editKeyPress(ev){
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		editFinished();
	}
}

function searchKeyPress(ev,idnum){
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		searchDo(idnum);
	}
}

function newFolder(idnum){
	function mk(tag){return document.createElement(tag);}
	
	var body = document.getElementById("body-"+idnum);
	
	var dragtable = mk("table");
	dragtable.className = "dragtable";
	var dragrow = mk("tr");
	dragtable.appendChild(dragrow);
	var dragsinglecol = mk("td");
	dragrow.appendChild(dragsinglecol);
	var singleicon = mk("img");
	dragsinglecol.appendChild(singleicon);
	singleicon.src = "/images/tree_single2.png";
	var dragfoldercol = mk("td");
	dragrow.appendChild(dragfoldercol);
	var foldericon = mk("img");
	dragfoldercol.appendChild(foldericon);
	foldericon.src = "/images/folder.png";
	var dragmaincol = mk("td");
	dragrow.appendChild(dragmaincol);
	var drageditdiv = mk("div");
	dragmaincol.appendChild(drageditdiv);
	drageditdiv.className = "dragitem";
	var input = mk("input");
	input.setAttribute("type","text");
	drageditdiv.appendChild(input);
	input.focus();

	body.appendChild(dragtable);	
	
	dragtable.scrollIntoView();
}

function clickSave(){
	//	TODO: save the snippet
	var pointnode = getel("pointname");
	var pointname = normalizeText(pointnode.value);
	var sniptxt = normalizeText(getel("snippet_text").textContent);
	
	var baseurl = "new_snippet.php?txt="+encodeURIComponent(sniptxt)
		+"&url="+encodeURIComponent(arg_url)
		+"&realurl="+encodeURIComponent(arg_realurl)
		+"&pointname="+encodeURIComponent(pointname)
		+"&title="+encodeURIComponent(arg_title);
	
	if(selectedCls == "Point"){
		doAJAX("tl_snippet",baseurl+"&pointid="+selectedId,function(result){
			clickClose();
		});
		return;
	}else{
		if(pointname == "" || pointnode.className == "pointinput_empty"){
			alert("You must enter the point that this snippet is making");
		}
	}
	
	if(selectedCls == "Topic"){
		doAJAX("tl_snippet",baseurl+"&topicid="+selectedId,function(result){
			clickClose();
		});		
	}else if(selectedCls == "Oppose"){
		doAJAX("tl_snippet",baseurl+"&opposeid="+selectedId,function(result){
			clickClose();
		});
	}else if(selectedCls == "Support"){
		doAJAX("tl_snippet",baseurl+"&supportid="+selectedId,function(result){
			clickClose();
		});
	}
}

function clickClose(){
	var evt = document.createEvent("Events");
  evt.initEvent("thinklink-close", true, false);
  document.body.dispatchEvent(evt);
}
