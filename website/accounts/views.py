# Create your views here.

from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from django.conf import settings
from django.template import RequestContext

def xd_receiver(request):
	return render_to_response('xd_receiver.html')
	
def profile(request):
	user = ""
	if request.user_is_authenticated():
		user = request.user.facebook_profile
		friendList = requset.user.facebook_profile.get_friends_profiles()
	else:
		return HttpResponseRedirect("/")
	return render_to_response("profile.html",
		{page:'profile','USER_LOGGED_IN':request.user.is_authenticated(),
		'user':user, 'friendList':friendList},
		context_instance=RequestContext(request))
		
		
