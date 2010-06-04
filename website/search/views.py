from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404
import websearch.parallel_io as p
from urlcheck.simplematch import urlcheck_fork

from boss import get_boss

def search(request):
	if "q" in request.GET:
		results = get_boss(request.GET["q"],(int(request.GET.get("page",1))-1)*10)
		for result in results:
			urlcheck_fork(result['url'])
		return render_to_response('search/results.html',
			{'results':results,'query':request.GET["q"],
				'page':int(request.GET.get("page",1)),
				'otherpages':range(1,10)})
	else:
		return render_to_response('search/frontpage.html')
