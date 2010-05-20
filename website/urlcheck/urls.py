from django.conf.urls.defaults import *


urlpatterns = patterns('website.urlcheck.api',
	(r'^$', 'urlcheck')
)

