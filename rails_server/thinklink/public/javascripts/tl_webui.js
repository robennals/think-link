
var oldselection = null;
var defaultBrowser = null;

function getel(id){
	return document.getElementById(id);
}

var savemode = false;
var expandcommand = "expand";
var params = ""

function initParams(){
	if(getel("pointname")){
			savemode = true;
			expandcommand = "expandfolder";
			params = "savemode=true";
	}
}

initParams();
window.addEventListener("load",function(){initParams()},true);

function setDefaultBrowser(idnum){
	if(!defaultBrowser){
		defaultBrowser = idnum;
	}
}

function getDefaultBrowserNode() {
	return document.getElementById('container-'+defaultBrowser);
}

var selectedId;
var selectedDivId;
var selectedCls;

function findSiblings(node){
	var holder = findHolder(node);
	if(!holder) return [];
	var siblings = [];
	for(var i = 0; i < holder.parentNode.childNodes.length; i++){
		var child = holder.parentNode.childNodes[i];
		if(child.getAttribute && ((child.getAttribute("tl_id") != holder.getAttribute("tl_id")) || 
				(child.getAttribute("tl_cls") != holder.getAttribute("tl_cls")))){
			siblings.push(child);
		}
	}
	return siblings;
	
//	var parent = findParentHolder(holder);
//	var children = findChildHolders(parent);
//	var siblings = [];
//	for(var i = 0; i < children.length; i++){
//		var child = children[i];
//		if((child.getAttribute("tl_id") != holder.getAttribute("tl_id")) || 
//				(child.getAttribute("tl_cls") != holder.getAttribute("tl_cls"))){
//			siblings.push(child);
//		}
//	}	
	return siblings;
}

function expandItem(idnum){
	var holder = getel("holder-"+idnum);
	var id = holder.getAttribute("tl_id");
	var cls = holder.getAttribute("tl_cls");
	var subitems = getel("subitems-"+idnum);
	var button = getel("button-"+idnum);
	subitems.style.display = "";
	if(button.getAttribute("src") == "/images/tree_open.png"){
		button.setAttribute("src","/images/tree_close.png");
	}
	if(!subitems.tl_loaded){
		subitems.tl_loaded = true;			
		
		var requrl;
		if (cls == "Topic"){
			requrl = "/topics/";
		}else{
			requrl = "/points/";
		}		
		ajaxReplace(requrl+id+"/expand?"+params,'subitems-'+idnum);
	}
}

function closeItem(idnum){
	var subitems = getel("subitems-"+idnum);
	var button = getel("button-"+idnum);
	if(!button) return;
	if(button.getAttribute("src") == "/images/tree_close.png"){
		button.setAttribute("src","/images/tree_open.png");
	}
	subitems.style.display = "none";	
}

function toggleExpanded(idnum){
	var subitems = getel("subitems-"+idnum);
	if(subitems.style.display == "none"){
		expandItem(idnum);
	}else{
		closeItem(idnum);
	}
}

function findSectionHeader(node){
	while(node){
		if(node.className == "relationtitle"){
			return node;
		}
		node = node.previousSibling;
	}
	return null;
}
		
function hideSiblings(node){
//	var header = findSectionHeader(findHolder(node));
	var siblings = findSiblings(node);
	for(var i = 0; i < siblings.length; i++){
		var sibling = siblings[i];
//		if(sibling != header){
			$(sibling).animate({height:'hide'},500);
//		}
	}
}

function showSiblings(node){
	var siblings = findSiblings(node);
	for(var i = 0; i < siblings.length; i++){
		var sibling = siblings[i];
		$(sibling).animate({height:'show'},500);
	}
}

function findChildren(idnum){
	var subsection = getel("subitems-"+idnum);
	var children = [];
	for(var i = 0; i < subsection.childNodes.length; i++){
		var child = subsection.childNodes[i];
		if(child.className == "dragholder" || child.className == "relationtitle"){
			children.push(child);
		}
	}
	return children;
}

function showChildren(idnum){
	var children = findChildren(idnum);
	for(var i = 0; i < children.length; i++){
		var child = children[i];
		if(child.style.display == "none"){
			$(child).animate({height:'show'},500);
		}
	}
}

function findNodeGroup(node){
	while(node){
		if(node.className == "item-parents" || node.className == "item-current" || node.className == "item-children"){
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

var selections = [];

function setSelectionOnStartup(idnum){
	if(!selections) selections = [];
	selections.push(idnum);
}

function processSelections(){	
	for(var i = 0; i < selections.length; i++){	
		var div = getel(selections[i]);
		if(!div) continue;
		var browser = findBrowser(div);
		browser.selectedDiv = div;
	}
	selections = null;
}

function hideLabel(holder){
	var idnum = getNodeIdNum(holder);
	var label = getel("label-"+idnum);
	$(label).animate({width:'hide'},500);
}

function updateSnippets(holder){
	var itemid = holder.getAttribute("tl_id");
	var cls = holder.getAttribute("tl_cls");
	var panel = getel("topics_panel");
	if(!panel) return;
	
	$("#topics_panel").animate({height:'hide'},500);
	
	if(cls == "Point"){
		ajaxReplace("/points/"+itemid+"/snippets","topics_panel",function(){
			$("#topics_panel").animate({height:'show'},500);			
		});
	}else if(cls == "Topic"){
		ajaxReplace("/topics/"+itemid+"/snippets","topics_panel",function(){
			$("#topics_panel").animate({height:'show'},500);			
		});
	}
}

function setupInitialSelection(browser,idnum){
	var div = getel(idnum);
	if(div){
		browser.selectedDiv = div;
	}
}

var selectedRelation = null;

function selectRelationTitle(div){
	if(selectedRelation){
		selectedRelation.className = "relationtitle";
	}
	div.className = "relationtitle relationtitle_selected";
	selectedRelation = div;

	
	var pointname = getel("pointname");
	var cls = div.getAttribute("tl_cls");
	if(pointname){
		if(cls == "Support"){
			disableInput("pointname","Enter claim that supports the selected claim");
		}
		if(cls == "Oppose"){
			disableInput("pointname","Enter claim that opposes the selected claim");
		}
	}
}

function selectItem(div){
	var browser = findBrowser(div);
	var holder = findHolder(div);
	var group = findNodeGroup(div);
	var idnum = getNodeIdNum(group);
	var current = getel("current-"+idnum);
	var parents = getel("parents-"+idnum);
	var children = getel("children-"+idnum);
	var propholder = getel("propholder-"+idnum);
	var cls = div.getAttribute("tl_cls");
	if(!cls){
		cls = holder.getAttribute("tl_cls");
	}
	var pointname = getel("pointname");

	if(pointname){ // in save dialog
		if(cls == "Support"){
			disableInput("pointname","Select a claim from the claim browser");
		}
		if(cls == "Oppose"){
			disableInput("pointname","Select a claim from the claim browser");
		}
		if(cls == "Point"){
			enableInput("pointname");
			pointname.value = normalizeText(div.textContent);
		}
		if(cls == "Topic"){
			disableInput("pointname","Select a claim from the claim browser");
		}
	}
	
	if(div.className == "relationtitle"){
		return;	
	}	

	browser.selectedDiv = div;

	selectedDivId = div.getAttribute("id");
	selectedId = holder.getAttribute("tl_id");
	selectedCls = holder.getAttribute("tl_cls");
	
	updateSnippets(holder);
	updateSnippetPanelTitle(selectedCls);

	clearSelect(getNodeIdNum(browser));
	
	if(!propholder.selectedDiv){
		propholder.selectedDiv = getel(idnum);
	}
	
	if(group.className == "item-parents"){
		current.setAttribute("id","children-"+idnum);
		children.setAttribute("id","dead-"+idnum);
		parents.setAttribute("id","current-"+idnum);
		var newparents = document.createElement("div");
		newparents.className = "item-parents";
		newparents.setAttribute("id","parents-"+idnum);
		group.parentNode.insertBefore(newparents,parents);
	 		 	
 		if(propholder.selectedDiv){
			$(propholder.selectedDiv).animate({fontSize:'13px'},500);
		}		
		hideSiblings(div);
		hideLabel(holder);


		$(current).animate({borderLeft:'1px dotted grey',marginLeft:"5px",paddingLeft:"5px"},500,function(){
			current.className = "item-children";
		});

		$(div).animate({fontSize:"20px"},500,function(){
			parents.className = "item-current";
		});				
		propholder.selectedDiv = div;
		
		var url = getHolderUrl(holder);
				
		smoothReplace(url+"expand?"+params,"children-"+idnum);
		smoothReplace(url+"parents?"+params,"parents-"+idnum);
		
		if(children){
			$(children).animate({height:'hide'},500,function(){
				children.parentNode.removeChild(children);
			});
		}				
	}else if (group.className == "item-children"){
		current.setAttribute("id","parents-"+idnum);
		children.setAttribute("id","current-"+idnum);
		parents.setAttribute("id","dead-"+idnum);
		var newchildren = document.createElement("div");
		newchildren.className = "item-children";
		newchildren.setAttribute("id","children-"+idnum);
		group.parentNode.appendChild(newchildren);	
		
		if(propholder.selectedDiv){
			$(propholder.selectedDiv).animate({fontSize:"13px"},500);
		}
		hideSiblings(div);
		$(div).animate({fontSize:"20px"},500,function(){
			current.className = "item-parents";
		});				
		
		$(group).animate({marginLeft:"0px",paddingLeft:"0px"},500,function(){
			group.className = "item-current";
		});

		var url = getHolderUrl(holder);
		
		smoothReplace(url+"expand?"+params,"children-"+idnum);
		smoothReplace(url+"parents?"+params,"parents-"+idnum);
		
		propholder.selectedDiv = div;
		if(parents){
			$(parents).animate({height:'hide'},500,function(){
				parents.parentNode.removeChild(parents);								
			});
		}
	}else if (group.className == "item-current"){
		// already selected. Do nothing 
		propholder.selectedDiv = div;
	}	
}

function refreshChildren(node){
	var browser = findBrowser(node);
	var holder = findHolder(browser.selectedDiv);
	var group = findNodeGroup(browser.selectedDiv);		
	var url = getHolderUrl(holder);
	var idnum = getNodeIdNum(group);
	smoothReplace(url+"expand","children-"+idnum);
}

function smoothReplace(url,id){
	var div = getel(id);
	var curheight = div.offsetHeight;
	div.style.height = curheight+"px";
	div.style.overflow = "hidden";
	ajaxReplace(url,id,function(){
		$(div).animate({height:div.scrollHeight},500,function(){
			div.style.height = "";
			div.style.overflow = "";
		});
	});
}

function updateSnippetPanelTitle(cls){
	var title = getel("topics_title");
	if(!title) return;
	if(cls == "Topic"){
		title.textContent = "Snippets in this Topic";
	}else if(cls == "Point"){
		title.textContent = "Snippets supporting this claim";
	}
}

function getHolderUrl(holder){
	var cls = holder.getAttribute("tl_cls");
	var id = holder.getAttribute("tl_id");
	if(cls == "Topic"){
		return "/topics/"+id+"/";
	}else if(cls == "Point"){
		return "/points/"+id+"/";
	}else if(cls == "Collection"){
		return null;  // TODO: work out what to do here...
	}
}

function adjustPreview(itemid,cls) {
	var preview_panel = getel("preview_panel");
	var preview_title = getel("preview_title");
	var pointname = getel("pointname");
	var foldername = getel("foldername");
	
	if(cls=="Topic"){
			getel("topics_title").textContent = "Folder Summary";
			ajaxReplace("/topics/"+itemid+"/summary","topics_panel");
	}else if(cls=="Point"){
			preview_title.textContent = "Snippets for Selected Point";
			getel("topics_title").textContent = "References to Selected Point";
			ajaxReplace("/points/"+itemid+"/places","topics_panel"); // containing topics and point relationships
	}

}

var inputstarted = false;

function enableInput(id){
	var input = getel(id);
	if(input.className == "pointinput_empty"){
		input.value = "";
		input.className = "pointinput";
	}
}

function disableInput(id,msg){
	if(inputstarted){
		return;
	}
	var input = getel(id);
	input.className = "pointinput_empty";
	input.value = msg;
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
	clearButton("hot",idnum);
	getel("searchbar-"+idnum).className = "hidden";
}

function searchMode(idnum){
	clearSelect(idnum);
//	getel("title-"+idnum).textContent = "Search Folders and Points";
	getel("searchbar-"+idnum).className = "searchbar";
	getel("search-"+idnum).className = "browsetab browsetab_selected";
	getel("body-"+idnum).innerHTML = "<div class='msg'>Enter search terms above</div>";
}

function searchDo(idnum){
	var query = getel("searchbox-"+idnum).value;
	ajaxReplace("/points/searchajax?query="+query+"&"+params,"body-"+idnum);	
}

function recentMode(idnum){
	// getel("title-"+idnum).textContent = "My Recent Folders";
	clearSelect(idnum);
	getel("recent-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/recent?"+params,"body-"+idnum);
}

function hotMode(idnum){
//	getel("title-"+idnum).textContent = "Hot Topics";
	clearSelect(idnum);
	getel("hot-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/hot?"+params,"body-"+idnum);
}

function topMode(idnum){
	clearSelect(idnum);
//	getel("title-"+idnum).textContent = "All Folders";
//	getel("all-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/toplevel?"+params,"body-"+idnum);
}


function topMode_expand(idnum,topicid){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "All Folders";
	getel("all-"+idnum).className = "browsetab browsetab_selected";
	
	// do this instead of traditional ajax replace
	ajaxPost("/topics/toplevel/"+topicid,function(response){
		var node = document.getElementById("body-"+idnum);
		node.innerHTML = response;
		var toppos = findPos(document.getElementById('primary_scrollElem'))[1];
		if (toppos < 80) {toppos=0;}
		else {toppos-=80; }
		document.getElementById("container-"+idnum).scrollTop = toppos;
	});
}

function scratchMode(idnum){
	clearSelect(idnum);
	getel("title-"+idnum).textContent = "Scratch Points"; 
	getel("scratch-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/points/scratch?"+params,"body-"+idnum);
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

function getNodeIdNum(node){
	var id = node.getAttribute("id");
	var m = id.match(/.*-(\d*)/);
	return m[1];
}

function gotoPoint(id){
	var browser = findSelectedBrowser();
	var idnum = getNodeIdNum(browser);
	ajaxReplace("/points/"+id+"/showajax","body-"+idnum);
}

function gotoParent(node){
	var browser = findBrowser(node);
	if(node.value == "0"){
		topMode(getNodeIdNum(browser));
	}else{
		var cls = node.options[node.selectedIndex].getAttribute("tl_cls");
		actionOpen(browser,node.value,cls);
	}
}

function dblClick(node,id,cls){
	var browser = findBrowser(node);
	actionOpen(browser,id,cls);
}

function actionOpen(browser,id,cls){
	if(!id){
		id = selectedId;
	}
	if(!browser){
		browser = findSelectedBrowser();
	}

	if(!cls){
		cls = selectedCls;
	}
	var idnum = getNodeIdNum(browser);
	
	clearSelect(idnum);

	if(cls == "Topic"){
		ajaxReplace("/topics/"+id+"/showajax?"+params,"body-"+idnum);
		ajaxReplace("/topics/"+id+"/pathajax?"+params,"title-"+idnum);
	}else if(cls == "Point"){
		ajaxReplace("/points/"+id+"/showajax?"+params,"body-"+idnum);
		ajaxReplace("/points/"+id+"/pathajax?"+params,"title-"+idnum);
	}	
}

function actionEdit(){
	var dragitem = getel(selectedDivId);
	renameItem = dragitem;
	var input = document.createElement("input");
	input.setAttribute("type","text");
	input.setAttribute("class","renamebox inputbox");
	input.setAttribute("value",normalizeText(dragitem.textContent));
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
	var myItem = renameItem;
	renameItem = null;
	try{ // HACK
		var txt = encodeURIComponent(normalizeText(renameInput.value));
		doAJAX("tl_rename","rename.php?cls="+selectedCls+"&id="+selectedId+"&txt="+txt,function(){
			myItem.textContent = renameInput.value;
			myItem.className = "dragitem";
			renameInput.parentNode.removeChild(renameInput);
			renameInput = null;
		});
	}catch(e){
	}

}

function pointKeyPress(ev){
	ev.stopPropagation();
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		clickSave();
	}else{
		inputstarted = true;
	}
}

function editKeyPress(ev){
	ev.stopPropagation();
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		editFinished();
	}
}

function searchKeyPress(ev,idnum){
	ev.stopPropagation();
	var KEYENTER = 13;
	if(ev.keyCode == KEYENTER){
		searchDo(idnum);
	}
}

function findParentHolder(node){
	if(!node) return null;
	var id = node.getAttribute("tl_id");
	while(node != null && node.getAttribute){
		var node_tl_id = node.getAttribute("tl_id");
		if(node_tl_id && node_tl_id != id){
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

function findSubPoints(holder){
	for(var i = 0; i < holder.childNodes.length; i++){
		var child = holder.childNodes[i];
		if(child.className == "subpoints_section"){
			return child;
		}
	}
	var subpoints = document.createElement("div");
	subpoints.className = "subpoints_section";
	holder.appendChild(subpoints);
	return subpoints;
}

function findSubSubPoints(holder){
	var subpoints = findSubPoints(holder);
	for(var i = 0; i < holder.childNodes.length; i++){
		var child = holder.childNodes[i];
		if(child.className == "subpoints"){
			return child;
		}
	}
	return null;
}

function findChildHolders(holder){
	var subsubpoints = findSubSubPoints(holder);
	var childholders = [];
	for(var i = 0; i < subsub.childNodes.length; i++){
		var child = subsub.childNodes[i];
		if(child.className == "dragholder"){
			childholders.push(child);
		}
	}
	return childholders;	
}

function findParentFolderHolder(node){
	if(!node) return null;
	var id = node.getAttribute("tl_id");
	while(node != null && node.getAttribute){
		var node_tl_cls = node.getAttribute("tl_cls");
		var node_tl_id = node.getAttribute("tl_id");
		if(node_tl_cls && node_tl_id && node_tl_cls == "Topic" && node_tl_id != id){
			return node;
		}
		node = node.parentNode;
	}
	return null;	
}

function findRelationTitle(node){
	while(node != null){
		if(node.className == 'relationtitle'){
			return node;
		}
		node = node.parentNode;
	}
	return null;	
}

function findHolder(node){
	while(node != null && node.getAttribute){
		var node_tl_id = node.getAttribute("tl_id");
		if(node_tl_id && node.className == "dragholder"){
			return node;
		}
		node = node.parentNode;
	}
	return null;	
}

function findSelectedHolder(node){
	if(node){
		var group = findNodeGroup(node);
		var idnum = getNodeIdNum(group);
		var propholder = getel("propholder-"+idnum);
		if(!propholder.selectedDiv){
			propholder.selectedDiv = getel(idnum);
		}
		return findHolder(propholder.selectedDiv);
	}else{
		if(selectedDivId && selectedId){
			return findHolder(document.getElementById(selectedDivId));
		}else{
			return null;
		}
	}
}

function findSelectedFolderHolder(){
	if(selectedDivId && selectedId){
		return findParentFolderHolder(document.getElementById(selectedDivId));
	}else{
		return null;
	}
}

function findBrowser(node){
	while(node != null && node.getAttribute){
		if(node.className == "browsetable"){
			return node;
		}
		node = node.parentNode;
	}
	return null;
}

function findSelectedBrowser(){
	if(selectedDivId && selectedId){
		var node = document.getElementById(selectedDivId);
		return findBrowser(node);
	}
	if(defaultBrowser){
		return getel("browser-"+defaultBrowser);	
	}
	return null;
}

function findSelectionInfo(node){
	var holder;
	if(node){
		holder = findHolder(node);
	}else{
		holder = findSelectedHolder();
	}
	var parent = findParentHolder(holder);
	var folder = findParentFolderHolder(holder);
	if(parent){
		var parentid = parent.getAttribute("tl_id");
		var parentcls = parent.getAttribute("tl_cls");
	}
	if(folder){
		var folderid = folder.getAttribute("tl_id");
	}
	var res = {
		holder: holder,
		'itemid': holder.getAttribute("tl_id"),
		cls: holder.getAttribute("tl_cls"),
		'parent': parent,
		parentid: parentid,
		parentcls: parentcls,
		folder: folder,
		folderid: folderid
	};
	return res;
}


function findTitle(childgroup,txt){
	for(var i = 0; i < childgroup.childNodes.length; i++){
		var child = childgroup.childNodes[i];
		if(child.className == "relationtitle" && normalizeText(child.textContent) == txt){
			return child;
		}
	}
	var newtitle = document.createElement("div");
	newtitle.className = "relationtitle";
	newtitle.textContent = txt;
	childgroup.appendChild(newtitle);
	return newtitle;
}

function newThing(div,what){
	var titlenode = findRelationTitle(div);
	var browser = findBrowser(titlenode);
	var holder = findSelectedHolder(div);
	
	var cls = holder.getAttribute("tl_cls");
	var id = holder.getAttribute("tl_id");	
		
	function mk(tag){return document.createElement(tag);}
	var uniq = Math.ceil(Math.random()*10000000);

	
	var holder = mk("div");
	holder.className = "dragholder";
	holder.setAttribute("id","holder-"+uniq);
	var dragtable = mk("table");
	dragtable.className = "dragtable";
	holder.appendChild(dragtable);
	var dragrow = mk("tr");
	dragtable.appendChild(dragrow);
	var dragfoldercol = mk("td");
	dragrow.appendChild(dragfoldercol);
	var foldericon = mk("img");
	dragfoldercol.appendChild(foldericon);
	if(what == 'subtopic'){
		foldericon.src = "/images/folder.png";
	}else{
		foldericon.src = "/images/lightbulb.png";
	}
	var dragmaincol = mk("td");
	dragrow.appendChild(dragmaincol);
	var drageditdiv = mk("div");
	dragmaincol.appendChild(drageditdiv);
	drageditdiv.className = "dragitem";
	var input = mk("input");
	input.setAttribute("type","text");
	drageditdiv.appendChild(input);

	var msg = mk("div");
	msg.className = "minimessage";
	if(what == "subtopic"){	
		msg.textContent = "Enter text to create a new topic. Use drag and drop to connect an existing topic.";
	}else{
		msg.textContent = "Enter text to create a new claim. Use drag and drop to connect an existing claim.";	
	}
	holder.appendChild(msg);

	titlenode.parentNode.insertBefore(holder,titlenode.nextSibling);

	input.addEventListener("blur",function(){
		createFinished(holder,input,id,what);
	},false);
	
	input.addEventListener("keypress",function(ev){
		ev.stopPropagation();
		var KEYENTER = 13;
		if(ev.keyCode == KEYENTER){
			createFinished(holder,input,id,what);
		}
	},false);
	
	activeCreation = true;
	
	input.focus();
}

function isVisible(el){
	if(el.offsetTop > el.parentNode.offsetHeight){
		return true;
	}
	return false;
}

function findSubTopics(idnum){
	var holder = getel(findHolderId(idnum));
	for(var i = 0; i < holder.childNodes.length; i++){
		var child = holder.childNodes[i];
		if(child.className == "subpoints_section"){
			return child;
		}
	}
	return null;
}

var activeCreation = null;
var saveCallback = null;

function createFinished(container,input,id,what){
	if(input.value != "" && !input.done){
		var nametxt = normalizeText(input.value);
		if(what == "subtopic"){
			phpurl = "new_topic.php?parentid="+id;
		}else if(what == "claim"){
			phpurl = "new_point.php?topicid="+id;			
		}else if(what == "support"){
			phpurl = "new_point.php?supportid="+id;
		}else if(what == "oppose"){
			phpurl = "new_point.php?opposeid="+id;
		}
		doAJAX("newfolder",phpurl+"&txt="+encodeURIComponent(nametxt),function(id){			
			var cls = "Point";
			if(what == "subtopic"){
				cls = "Folder";				
				refreshChildren(container);			
			}else{
				gotoPoint(id);
			}
			selectedCls = cls;
			selectedId = id;
			if(saveCallback){
				saveCallback(cls,id);
				saveCallback = null;
			}
			activeCreation = null;
		});
		input.done = true;
	}else{
		container.parentNode.removeChild(container);
		// refreshChildren(container);
	}
}

function clickSave(){
	if(activeCreation){
		saveCallback = function(cls,id){
			selectedCls = cls;
			selectedId = id;
			clickSave();
		};
		return;
	}
	
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
			alert("You must select the claim that this snippet is making");
			return;
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

function openOrganizer(){
	window.open("/");
}

function keyDownHandler(ev){
	if(window.draggedPoint !== undefined && draggedPoint){
//		if(ev.keyCode == 16){ // SHIFT
//			dragCopyMode = false;
//			dragCopyMsg.className = "hidden";
//			dragMoveMsg.className = "dragmovemsg";
//		}	
		if(ev.keyCode == 27){
			dragStop();
		}
	}
}

function keyUpHandler(ev){
	if(window.draggedPoint !== undefined && draggedPoint && dragCopyMsg){
//		if(ev.keyCode == 16){
//			dragCopyMode = true;
//			dragCopyMsg.className = "dragcopymsg";
//			dragMoveMsg.className = "hidden";
//		}
	}
}

function keyPressHandler(ev){
	var keycode = ev.keyCode;
	if(!selectedId){
		return;
	}
	
	if(keycode == 8 || keycode == 46){ // delete
		actionDelete(ev);
	}
	if(keycode == 113 || keycode == 13){ // F2 or enter
		actionEdit();
	}
}
		
function actionDelete(ev){
	var selinfo = findSelectionInfo();

	var what = "topic";
	if(selectedCls == "Point"){
		what = "claim";
	}
	var parentwhat = "folder";
	if(selinfo.parentcls == "Point"){
		parentwhat = "point";
	}

	choiceBox(ev,"Completely delete "+what+"?",
		"Are you sure you want to delete this "+what+"? Deleting it will completely remove it from our database",
		["Yes, Delete Completely","No, don't delete"],
		null,function(choice){
			if(choice == "Yes, Delete Completely"){
				action = "delete.php?cls="+selinfo.cls+"&id="+selinfo.itemid;
				doAJAX("tl_delete",action,function(result){
					selinfo.holder.parentNode.removeChild(selinfo.holder);
				})
			}
		}
	)
}

// unlink the currently selected node from it's location
function actionUnlink(selinfo){
	action = "unlink.php?cls="+selinfo.cls+"&id="+selinfo.itemid+"&parcls="+selinfo.parentcls+"&parentid="+selinfo.parentid;					
	doAJAX("tl_unlink",action,function(result){
		selinfo.holder.parentNode.removeChild(selinfo.holder);
	})		
}

function actionOrganize(){
	alert("To connect claims and topics together, open the second browser and then use drag and drop to connect claims and topics");
}