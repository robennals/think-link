# Create your views here.

import websearch.compute_rarewords as cr
import websearch.rareword_match as r
import websearch.search_engine as s
from django.shortcuts import render_to_response
import match
import json
from django.http import HttpResponse

def urlcheck(request):
	disputes = s.get_raw_disputes(request.GET["url"])
	processed = [{'claimtext':dispute[1],'matchtext':" ".join(dispute[2])} for dispute in disputes]
	return apiresponse(processed,request)
	
def apiresponse(data,request):
	if "callback" in request.GET:
		return HttpResponse(request.GET["callback"]+"("+json.dumps(data)+")",mimetype="text/javascript")
	else:
		return HttpResponse(json.dumps(data),mimetype="application/json")
