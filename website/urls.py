from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	(r'^search/', include('website.search.urls')),
	(r'^urlcheck/', include('website.urlcheck.urls')),
    (r'^admin/doc/', include('django.contrib.admindocs.urls')),
    (r'^admin/', include(admin.site.urls)),
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'static'}),
    (r'^js/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'jquery/js'}),
    (r'^css/(?P<path>.*)$', 'django.views.static.serve', {'document_root': 'jquery/css'})
)
