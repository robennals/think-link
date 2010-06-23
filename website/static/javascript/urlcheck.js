
var apiurl = ""

function highlight_context(claimtext,matchtext){
	var wordset = {};
}

function mk_button(icon,text,vote,title){
	var button = $("<a href='#' class='linkbutton'>"
			+ "<span class='ui-icon ui-icon-"+icon+"'/>"+text+"</a>")
			.attr("title",title);
	button.attr("data-vote",vote);
	return button;
}

function trimurl(url){
	
}

function make_disputebox(dispute){
	var disputebox = $("<div class='disputed'/>");

	var maintable = $("<table/>").appendTo(disputebox);
	
	var tr = $("<tr/>").appendTo(maintable);
	
	var left = $("<td valign='top'/>").appendTo(tr);
	var right = $("<td valign='top'/>").appendTo(tr);


	var title = $("<h4/>").text("disputed: "+dispute.claimtext).appendTo(left);
	
	$("<div class='matchcontext'>"+dispute.displaycontext+"</div>").appendTo(left);
	
	var votebox = $("<div class='votebox'/>").appendTo(left);
	mk_button("trash","bad claim","bad",
			"This claim is malformed and should not be highlighted on any search result")
			.appendTo(votebox);
	mk_button("closethick","not relevant","mismatch",
			"The other page is talking about a different topic").appendTo(votebox);
	mk_button("transferthick-e-w","no disagreement","agree",
			"The pages are talking about the same topic but aren't in disagreement").appendTo(votebox);
	mk_button("star","useful","good",
			"This was useful. Show me more disputes like this.").appendTo(votebox);
	votebox.find(".linkbutton").click(function (){
		$(this).parent().find(".linkbutton").addClass("ui-state-disabled").removeClass("ui-state-highlight");
		$(this).removeClass("ui-state-disabled");
		$(this).addClass("ui-state-highlight");		
		dispute.vote = $(this).attr("data-vote");
		dispute.date = $(this).parents(".df-finddisputes").attr("data-date");
		$.post(apiurl+"/urlcheck/vote",dispute);
		return false;
	})
	
	if(dispute.vote){
		votebox.find(".linkbutton").each(function(){
			if($(this).attr("data-vote") == dispute.vote){
				$(this).addClass("ui-state-highlight");
			}else{
				$(this).addClass("ui-state-disabled");
			}
		})
	}
	
	if(dispute.sourcecontext){
		//var sourcetitle = $("<h4/>").text("disputed by: ").appendTo(right);
		//$("<a/>").attr("href",dispute.sourceurl).text(dispute.sourcetitle).appendTo(sourcetitle);
		$("<h4>&nbsp;</h4>").appendTo(right);
		sourcebox = $("<div class='sourcebox'/>").appendTo(right);
		$("<div class='sourcecontext'>"+dispute.sourceprefix+" "+dispute.sourcecontext+"</div>").appendTo(sourcebox);
		$("<a class='sourcedomain'/>").attr("href",dispute.sourceurl).text(dispute.sourcedomain).appendTo(sourcebox);
	}
	
	if(!dispute.sourcecontext || dispute.bad || dispute.badvotes > dispute.goodvotes){
		$("<div class='bad' style='color:red'>BAD</div>").appendTo(right);
	}
	
	return disputebox;	
}

function check_disputes(){
   $(".df-finddisputes").each(function(index,item){
   		var url = $(item).attr("data-url")
   		$.getJSON(apiurl+"/urlcheck/?format=json&callback=?",{url:url},function(data){
			$(item).empty()
			if(data.length > 0){
				var disputebox = $("<div class='df-dispute-box'><a class='df-dispute-toggle' href='#'><span class='ui-icon ui-icon-triangle-1-e'/>contains "+data.length+" disputed claims </a></div>");
				disputebox.find("> a").click(function(){
					$(this).toggleClass("dispute-open");
					$(this).find(".ui-icon").toggleClass("ui-icon-triangle-1-e");
					$(this).find(".ui-icon").toggleClass("ui-icon-triangle-1-s");
					$(this).next().toggle();
					return false;
				})
				var disputelist = $("<div style='display:none' class='df-dispute-list'></div>").appendTo(disputebox);				
				$(item).append(disputebox);
				for(i in data){
					make_disputebox(data[i]).appendTo(disputelist);
				}				
			}else{
				$("<div class='df-nodisputes'>no disputes found</div>").appendTo($(item))
			}
		})
   })	
}

$(document).ready(function(){
	check_disputes()
})
