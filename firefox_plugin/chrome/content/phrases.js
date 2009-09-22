
function listToHash(list){
	var hsh = {};
	for(var i = 0; i < list.length; i++){
		hsh[list[i]] = true;
	}
	return hsh;
}


function find_phrases(doc){
	thinklink_msg("find phrases : "+doc.location.href);

	var words = doc.body.textContent.toLowerCase().split(/[^\w]+/);
	thinklink_msg("got words");
	
	var apipath = get_api_path();
	var globals = getGlobals();
	if(!globals.hotwords){		
		ajaxRequest(apipath+"/apianon/hotwords.json",function(hotwords){
			globals.hotwords = listToHash(hotwords);		
			find_phrases(doc);
		});
		return;
	}

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
					var claims = secondwords[words[j]];
					for(var k = 0; k < claims.length; k++){
						markClaimPhrases(doc,claims[k]);
					}
				}
			}
		}
	}
}

function markClaimPhrases(doc,claim){
	var normtext = doc.body.textContent.toLowerCase().replace(/[^\w]+/g," ");
	var phrases = claim.phrases;
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
}
