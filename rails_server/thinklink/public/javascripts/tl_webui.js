
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
	selectedId = itemid;
	selectedDivId = divid;
	selectedCls = cls;
	if(oldselection){
		oldselection.className = "dragitem";		
	}
	div.className = "dragitem dragitem_selected";
	oldselection = div;
	
	var preview_panel = document.getElementById("preview_panel");
	var preview_title = document.getElementById("preview_title");

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

function clearSelect(idnum){
	getel("all-"+idnum).className = "browsetab";	
	getel("recent-"+idnum).className = "browsetab";	
	getel("scratch-"+idnum).className = "browsetab";	
	getel("hot-"+idnum).className = "browsetab";	
	getel("friends-"+idnum).className = "browsetab";	
	getel("search-"+idnum).className = "browsetab";	
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
	getel("title-"+idnum).textContent = "My Recent";
	clearSelect(idnum);
	getel("recent-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/recent","body-"+idnum);
}

function topMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "All Topics";
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

function actionEdit(idnum,id){
	var dragitem = getel(selectedDivId);
	renameItem = dragitem;
	var input = document.createElement("input");
	input.setAttribute("type","text");
	input.setAttribute("class","renamebox inputbox");
	var txt = dragitem.textContent.replace(/\s?/g," ");
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