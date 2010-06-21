from django.conf.urls.defaults import *
import facebookconnect

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	(r'^search/', include('website.search.urls')),
	(r'^urlcheck/', include('website.urlcheck.urls')),
	(r'^claimfilter/',include('website.claimfilter.urls')),
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    (r'^admin/', include(admin.site.urls)),
    (r'^facebook/', include('facebookconnect.urls')),
    (r'^xd_receiver\.html','website.accounts.views.xd_receiver'),
    (r'^acounts/profile','website.accounts.views.profile'),    
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'static'}),
    (r'^js/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'jquery/js'}),
    (r'^css/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'jquery/css'}),
   	(r'^$', 'website.search.views.frontpage')
)
