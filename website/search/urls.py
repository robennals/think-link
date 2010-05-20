from django.conf.urls.defaults import *


urlpatterns = patterns('website.search.views',
	(r'^$', 'search')
)

