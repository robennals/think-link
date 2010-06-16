# Create your views here.

from claimfilter.models import RawClaim
from django.core.paginator import Paginator
from django.shortcuts import render_to_response, get_object_or_404
from urlcheck.api import apiresponse

def items(request):
	p = Paginator(RawClaim.objects.order_by('senthash'),20)
	pagenum = int(request.GET.get("page",1))
	page = p.page(pagenum)
	return render_to_response('claimfilter/items.html',
			{'items':page.object_list,'page':page})

def setlabel(request):
	obj = RawClaim.objects.get(id=request.POST['id'])
	obj.correcttrim = request.POST['correct']
	obj.save()
	return apiresponse("okay",request)
