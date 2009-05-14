
var global_claimtab;
var global_marktab;
var global_evtab;
var global_subtab;
var global_body;



function makeTurkUi(){
	var tabs = $("<div class='tabs'/>");
	var header = $("<div class='header'/>").appendTo(tabs);
	global_claimtab = $("<a id='tab-create' class='active'>1. Create Disputed Claim</a>").appendTo(header);
	global_marktab = $("<a id='tab-mark'>2. Find Snippets</a>").appendTo(header);
	global_evtab = $("<a id='tab-evidence'>3. Add Opposing Evidence</a>").appendTo(header);
	global_subtab = $("<a id='tab-submit'>4. Submit</a>").appendTo(header);
	global_body = $("<div id='#body' class='body'/>").appendTo(tabs);
	$(document.body).append(tabs);
	showClaimPanel();
	
	global_claimtab.click(showClaimPanel);
	global_marktab.click(showMarkPanel);
	global_evtab.click(showEvPanel);
	global_subtab.click(submitData);
}

// DEBUG HACK
// var global_claim = "global warming does not exist";
var global_claim = null;
var global_snippets = [];
var global_urls = {};
var global_evurl = null;
var global_evquote = null;



var url_base = "/thinklink";

var url_search_claims = url_base+"/claim/search.json"
var url_search_snippets = url_base+"/turk/searchboss.json"
var url_submit = url_base+"/turk/submit"

function loadTurkUi(){
	$.getJSON(url_base+"/turk/"+global_turk_id+".json",function(data){
		if(data){
			global_claim = data.claim;
			global_snippets = parseJSON(data.jsonsnips);
			global_evquote = data.evquote;
			global_evurl = data.evurl;
			global_urls = mkUrlHash(global_snippets);
		}
		makeTurkUi();
	});
}



function mkUrlHash(snippets){
	var hash = {};
	for(var i = 0; i < snippets.length; i++){
		hash[snippets[i].url] = true;
	}
	return hash;
}

function resetTabStatus(){
	global_claimtab.attr("class","");
	global_marktab.attr("class","");
	global_evtab.attr("class","");
	global_subtab.attr("class","");
}

function setActiveTab(tab,panel){
	resetTabStatus();
	global_body.empty();
	tab.attr("class","active");
	global_body.append(panel);
}

//function resetTabStatus(){
	//if(global_claim){
		//global_marktab.attr("class","");
	//}
	//if(global_snippets.length >= 10){
		//global_evtab.attr("class","");
	//}	
	//if(global_evidence){
		//globa
	//}
	
//}

function showClaimPanel(){
	var panel = $("<div class='panel'/>");
	$("<div class='message'>Enter a disputed claim that is not currently in our database</div>").appendTo(panel); 	
	var bigsearch = $("<div id='claimsearch'/>").appendTo(panel);
	var textbox = $("<input id='claiminput' class='query' type='text'/>").appendTo(bigsearch);
	var search = $("<button>Search</button>").appendTo(bigsearch);
	var submit = $("<button class='submit'>Create Claim</button>").appendTo(bigsearch);
		
	if(global_claim){
		textbox.val(global_claim);
	}else{
		textbox.css("color","gray");
		textbox.val("Enter a disputed claim");
		textbox.focus(function(){ungrey(textbox.get(0))});
	}
	
	submit.click(function(){
		submit.remove();
		global_claim = textbox.val();		
		showMarkPanel();
	});
	
	var suggestions = $("<div id='claimlist'/>").appendTo(panel);	
	suggestions.text("existing claims will appear here when you enter a claim above");

	panel.append(makeHelpPanel());

	//$("<div class='message'>As you enter words, the list box above will show similar claims that we already know. Try a couple of alternative wordings to make sure we haven't got the claim already</div>").appendTo(panel); 

	onInput(textbox,updateClaimSuggestions);
	search.click(function(){updateClaimSuggestions(textbox.val())});
	setActiveTab(global_claimtab,panel);
}


function makeHelpPanel(){
	var help = $("<div id='help'/>");
	$("<p>"+
		"<b>For this HIT we need you to do three things</b>:"+
		"<ol> "+
		"  <li>Identify a factual claim that is often made on web pages, but which may not be true</li>"+
		"  <li>Use our Yahoo search tool to mark 10 snippets on the web that make this claim</li> "+
		"  <li>Give us a URL for a web site that argues that the claim is false, and include a representative quote from that page</li>"+
		"</ol>"+
		"</p>").appendTo(help); 
				
	$("<p>A disputed claim can be about anything. Examples include "+
		"'global warming does not exist', 'margarine is healthier than butter', "+
		"'capital punishment deters crime', 'NASA is a waste of money', "+
		"'firefox is more secure than internet explorer', or 'the existance of jesus is a historical fact'.</p>").appendTo(help);
	$("<p>"+
		"To perform multiple HITs in this group efficiently we recommend that you "+
		"choose disputed claims in an area that you have a personal interest in. "+
		"We also recommend that you start with a trustworthy source document that you can use as "+
		"evidence against several claims.</p>").appendTo(help);			

	return help;
}


var global_last_search = null;

var global_snipsearchbox = null;

function showMarkPanel(){	
	var panel = $("<div id='marksnippets'/>");

	if(!global_claim){
		$("<div class='message'>You need to create a disputed claim first</div>").appendTo(panel);	
		setActiveTab(global_marktab,panel);
		return;
	};

	$("<h1/>").text(global_claim).appendTo(panel);
	$("<div class='message'>Use the Yahoo search interface below to find ten snippets on the web that suggest or imply that this claim is true.</div>").appendTo(panel);

	if(!global_last_search){
		global_last_search = global_claim;
	}

	var bigbox = $("<div id='bigbox'/>").appendTo(panel);
	var searcher = $("<div id='searcher'/>").appendTo(bigbox);
	var searchbox = $("<div id='searchbox'/>").appendTo(searcher);
	var textbox = $("<input type='text'/>").appendTo(searchbox).val(global_last_search);	
	global_snipsearchbox = textbox;
		
	var button = $("<button>Search Yahoo</button>").appendTo(searchbox);
	var results = $("<div id='snipresults'/>").appendTo(searcher);
		
	var collection = $("<div id='collection'/>").appendTo(bigbox);
	//$("<h2>Snippets found so far</h2>").appendTo(collection);
	//var removeall = $("<button class='submit'>remove all</button>").appendTo(collection);
	var snippets = $("<div id='snippets'>Snippets will appear here when you add them</snippets>").appendTo(collection);
				
	global_body.empty();
	global_body.append(panel);
	global_marktab.css("class","active");	
	
	setActiveTab(global_marktab,panel);

	//removeall.click(function(){
		//removeAll();
	//});		

	button.click(function(){
		updateSnippetSuggestions();
	});
	textbox.keyup(function(ev){
		if(ev.keyCode == 13) updateSnippetSuggestions();
	});
	
	updateCurrentSnippets();
	updateSnippetSuggestions();
}


function showEvPanel(){
	var panel = $("<div id='addevidence'/>");
	setActiveTab(global_evtab,panel);

	if(!global_claim){
		$("<div class='message'>You need to create a disputed claim first</div>").appendTo(panel);	
		return;
	};

	$("<h1/>").text(global_claim).appendTo(panel);
	$("<div class='message'>Please provide evidence that this claim may not be true. Provide the URL of a page that argues against this claim being true, and a representative quote from that web page.</div>").appendTo(panel);
	var form = $("<div id='evform'/>").appendTo(panel);
	$("<label for='url'>url</label>").appendTo(form);
	var url = $("<input name='url' type='text'/>").appendTo(form);
	
	$("<label for='quote' id='quotelab'>quote</label>").appendTo(form);
	var quote = $("<textarea name='quote' rows=4/>").appendTo(form);

	if(global_evquote){
		quote.val(global_evquote);
	}else{
		quote.css("color","gray");
		quote.val("Copy and paste a short, representative, quote from the source web site");
		quote.focus(function(){ungrey(quote.get(0))});
	}

	if(global_evurl){
		url.val(global_evurl);
	}else{
		url.css("color","gray");
		url.val("Enter url for a page that provides evidence that this claim is false");
		url.focus(function(){ungrey(url.get(0))});
	}

	var submit = $("<button class='submit'>Submit HIT</button>").appendTo(form);

	var help = $("<div id='help'>"+
		"<p>It is okay to use the same evidence URL for several different claims that relate to the same topic, but the quote should be different.</p> "+
	  "</div>").appendTo(panel);

	
	url.focus(function(){ungrey(url.get(0))});
	quote.focus(function(){ungrey(quote.get(0))});	
	submit.click(function(){
		if(url.css("color") == "gray"){
			alert("You need to enter a URL");
			return;
		}
		if(quote.css("color") == "gray"){
			alert("You need to paste a quote from the evidence page");
			return;
		}
		global_evurl = url.val();
		global_evquote = quote.val();
		submitData();
	});
}

function submitData(){	
	var panel=$("<div id='submitted'/>");

	setActiveTab(global_subtab,panel);

	if(!global_claim){
		$("<div class='message'>You need to create a disputed claim first</div>").appendTo(panel);	
		return;
	};
	if(global_snippets.length < 10){
		$("<div class='message'>You need to find ten snippets that make the disputed claim first</div>").appendTo(panel);	
		return;
	};

	if(!global_evurl || !global_evquote){
		$("<div class='message'>You need to add evidence that the claim is disputed first</div>").appendTo(panel);	
		return;
	};
		
	var data = {};
	data.turkid = global_turk_id;
	data.claim = global_claim;
	data.evurl = global_evurl;
	data.evquote = global_evquote;
	data.jsonsnips = makeJSONString(global_snippets);
	for(var i = 0; i < global_snippets.length; i++){
		data["url-"+i]=global_snippets[i].url;
		data["title-"+i]=global_snippets[i].title;
		data["text-"+i]=global_snippets[i].text;
		data["query-"+i]=global_snippets[i].query;
		data["position-"+i]=global_snippets[i].position;
	}
	
	var sending = $("<div class='message'>Please wait while we submit your data to our server</div>").appendTo(panel);
	
	$.post(url_submit,data,function(){
		sending.remove();
		$("<div id='thanks'>Thank you!</div>").appendTo(panel);
		$("<div class='done'>This task has now been completed. Please click the Turk submit button to finish.</div>").appendTo(panel);
		
		$("<div class='message'>If you submitted in error, you can edit your submission and submit again</div>").appendTo(panel);
	});	
}


// hides things for which we already have a snippet for that URL

function updateSnippetSuggestions(){
	var query = global_snipsearchbox.val();
	$.getJSON(url_search_snippets,{query:query},function(snipurls){
				
		var results = $("<div class='searchcontent'/>");				
		
		for(var i = 0; i < snipurls.length; i++){
			var row = snipurls[i];
			if(global_urls[row.url]) continue;
			var bossurl = $("<div class='bossurl'/>").appendTo(results);
			$("<span class='title'/>").text(row.title).appendTo(bossurl);
			$("<a target='_blank'/>").attr("href",row.url).text(row.url).appendTo(bossurl);
			var snippets = $("<div class='snippets'/>").appendTo(bossurl);
			var snippet = $("<div class='snippet'/>").appendTo(snippets);
			
			$("<div class='text'>"+row.abstr+"</div>").appendTo(snippet);
			var add = $("<a class='add'>add</a>").appendTo(snippet);
			var ignore = $("<a class='ignore'>ignore</a>").appendTo(snippet);
			setupAdd(add,ignore,snippet,bossurl,row.abstr,row.url,row.title,query,i);
	

			//for(var j = 0; j < row.snips.length && j < 1; j++){
				//var snippet = $("<div class='snippet'/>").appendTo(snippets);
				//$("<div class='text'/>").text(row.snips[j]).appendTo(snippet);
				//var add = $("<a class='add'>add</a>").appendTo(snippet);
				//var ignore = $("<a class='ignore'>ignore</a>").appendTo(snippet);
				//setupAdd(add,ignore,snippet,bossurl,row.snips[j],row.url,row.title,query,i);
			//}			
		}

		var box = $("#snipresults");
		box.empty();
		box.append($("<h2>Web snippets matching '"+query+"'</h2>"));
		box.append(results);
	})
}

function setupAdd(add,ignore,snippet,bossurl,text,url,title,query,position){
	add.click(function(){
		global_snippets.push({text:text,url:url,title:title,query:query,position:position});
		global_urls[url] = true;
		//bossurl.addClass("snippet-added");
		//add.text("added");
		bossurl.remove();
		updateCurrentSnippets();
	});
	ignore.click(function(){
		bossurl.remove();
	});
}

function updateClaimSuggestions(text){
	$.getJSON(url_search_claims,{query:text},function(claims){		
		var box = $("#claimlist");
		box.empty();
		box.append($("<h2>Claims already in our database matching '"+text+"'</h2>"));
		box.append($("<h2 id='makesure'>Make sure your claim is not already in this list</h2>"));
		for(var i = 0; i < claims.length; i++){
			var row = claims[i];
			var claim = $("<div/>").appendTo(box);
			claim.text(row.text);
		}
	});
}

function updateCurrentSnippets(){
	var snippets = $("#snippets");
	snippets.empty();
	
	if(global_snippets.length < 10){
		$("<div class='snipstatus'>found <strong>"+global_snippets.length+"</strong> snippets</div>").appendTo(snippets);
		$("<div class='snipstatus'>add <strong>"+(10-global_snippets.length)+"</strong> more to complete</div>").appendTo(snippets);
	}else{
		$("<div class='snipstatus'>Snippet target reached</div>").appendTo(snippets);
		$("<button id='next'>Go To Next Step</button>").appendTo(snippets)
			.click(function(){
					showEvPanel();
			});				
	}
	
	for(var i = 0; i < global_snippets.length; i++){
		var row = global_snippets[i];
		var snippet = $("<div class='snippet'/>");
		$("<span class='title'>").text(row.title).appendTo(snippet);
		$("<a/>").attr("href",row.url).text(row.url).appendTo(snippet);
		$("<div class='text'>"+row.text+"</div>").appendTo(snippet);
		var remove = $("<a class='remove'>remove</a>").appendTo(snippet);
		setupRemove(remove,i);				
		snippets.append(snippet);
	}
}

function removeAll(){
	global_urls = {};
	global_snippets = [];
	updateCurrentSnippets();
}

function setupRemove(remove,i){
	remove.click(function(){
		global_urls[global_snippets[i].url] = false;
		global_snippets.splice(i,1);
		updateCurrentSnippets();		
	});
}

