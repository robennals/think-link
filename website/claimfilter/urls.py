from django.conf.urls.defaults import *

urlpatterns = patterns('website.claimfilter.views',
	(r'items', 'items'),
	(r'setlabel', 'setlabel'),
	(r'^$', 'items')
)

