
function listToHash(list){
	var hsh = {};
	for(var i = 0; i < list.length; i++){
		hsh[list[i]] = true;
	}
	return hsh;
}

var global_wordcombos = {};

function find_phrases(doc){
	thinklink_msg("find phrases : "+doc.location.href);

	var url = doc.location.href;
	if(url.indexOf("cs.berkeley.edu") != -1 || url.indexOf("localhost") != -1){
		clearCache(); // they may be aware of very recent data
		return;
	}
	
	var words = doc.body.textContent.toLowerCase().split(/[^\w]+/);
	thinklink_msg("got words");
	
	var apipath = get_api_path();
	var globals = getGlobals();
	if(!globals.hotwords){		
		ajaxRequest(apipath+"/apianon/hotwords.json",function(hotwords){
			if(hotwords.version == 1){
				globals.hotwords = listToHash(hotwords.hotwords);		
				find_phrases(doc);
			}else{				
				upgradeMessage();
				globals.hotwords = {};
			}
		});
		return;
	}

	global_wordcombos = {};
	searchWords(doc,words,globals.hotwords,0);	
}


function searchWords(doc,words,hotwords,start){
	var apipath = get_api_path();
	
	for(var i = start; i < words.length; i++){
		if(!hotwords[words[i]]){
			// do nothing: common case
		}else if(hotwords[words[i]] == true){
			ajaxRequest(apipath+"/apianon/hotwords/"+words[i]+".json",function(secondwords){
				hotwords[words[i]] = listToHash(secondwords);
				searchWords(doc,words,hotwords,i);
			});
			return;
		}else{
			var secondwords = hotwords[words[i]];
			var r_start = Math.max(0,i-20);
			var r_end = Math.min(words.length-1,i+20);
			for(var j = r_start; j < r_end; j++){
				if(!secondwords[words[j]]){
					// do nothing			
				}else if(secondwords[words[j]] == true){
					ajaxRequest(apipath+"/apianon/hotwords/"+words[i]+"/"+words[j]+".json",function(claims){
						secondwords[words[j]] = claims;
						searchWords(doc,words,hotwords,i);
					})
					return;
				}else{
					global_wordcombos[words[i]+"-"+words[j]] = secondwords[words[j]]
				}
			}
		}
	}
	
	// only want to check for any given phrase on the page once
	for(var combo in global_wordcombos){
		var claims = global_wordcombos[combo];
		for(var k = 0; k < claims.length; k++){
			markClaimPhrases(doc,claims[k]);
		}
	}		
}

function markClaimPhrases(doc,claim){
	var normtext = doc.body.textContent.toLowerCase().replace(/[^\w]+/g," ");
	var phrases = claim.phrases;
	global_marked = [];
	for(var i = 0; i < phrases.length; i++){
		var normphrase = phrases[i].toLowerCase().replace(/[^\w]+/g," ");
		if(normtext.indexOf(normphrase) != -1){
			mark_snippet(phrases[i],normalise(phrases[i]),claim.claim_id,claim.id,claim.claimtext,doc.body);			
		}
	}
	var normphrase = claim.text.toLowerCase().replace(/[^\w]+/g," ");
	if(normtext.indexOf(normphrase) != -1){
		mark_snippet(claim.text,normalise(claim.text),claim.claim_id,claim.id,claim.claimtext,doc.body);			
	}
	
	if(global_marked.length > 0){
		claimMessageMove(global_marked,claim.claimtext,claim.claim_id,claim.id,doc);
	}
}
