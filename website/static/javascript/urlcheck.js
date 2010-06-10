
var apiurl = "http://localhost:8000"

function highlight_context(claimtext,matchtext){
	var wordset = {};
}

function mk_button(icon,text,vote){
	var button = $("<a href='#' class='linkbutton'>"
			+ "<span class='ui-icon ui-icon-"+icon+"'/>"+text+"</a>");
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
	mk_button("trash","bad claim","bad").appendTo(votebox);
	mk_button("closethick","not relevant","mismatch").appendTo(votebox);
	mk_button("transferthick-e-w","no disagreement","agree").appendTo(votebox);
	mk_button("star","useful","good").appendTo(votebox);
	votebox.find(".linkbutton").click(function (){
		$(this).parent().find(".linkbutton").addClass("ui-state-disabled").removeClass("ui-state-highlight");
		$(this).removeClass("ui-state-disabled");
		$(this).addClass("ui-state-highlight");		
		dispute.vote = $(this).attr("data-vote");
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
		var sourcetitle = $("<h4/>").text("disputed by: ").appendTo(right);
		$("<a/>").attr("href",dispute.sourceurl).text(dispute.sourcetitle).appendTo(sourcetitle);
		sourcebox = $("<div class='sourcebox'/>").appendTo(right);
		$("<div class='sourcecontext'>"+dispute.sourcecontext+"</div>").appendTo(sourcebox);
		$("<div class='sourcedomain'/>").text(dispute.sourcedomain).appendTo(sourcebox);
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
