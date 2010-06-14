from django.conf.urls.defaults import *
from djangotest.polls.models import Poll

info_dict = {
	'queryset': Poll.objects.all()
}

urlpatterns = patterns('',
	(r'^$', 'django.views.generic.list_detail.object_list',info_dict),
	(r'^(?P<object_id>\d+)/$','django.views.generic.list_detail.object_detail',info_dict),
	url(r'^(?P<object_id>\d+)/results/$','django.views.generic.list_detail.object_detail',dict(info_dict,template_name='polls/results.html'),'poll_results'),
	(r'^(?P<poll_id>\d+)/vote/$','djangotest.polls.views.vote')
)

urlpatterns2 = patterns('djangotest.polls.views',
	(r'^$','index'),
	(r'^(?P<poll_id>\d+)/$','detail'),
	(r'^(?P<poll_id>\d+)/results/$','results'),
	(r'^(?P<poll_id>\d+)/vote/$','vote'),
)

#from django.conf.urls.defaults import *
#from djangotest.polls.models import Poll

#info_dict = {
    #'queryset': Poll.objects.all(),
#}

#urlpatterns = patterns('',
    #(r'^$', 'django.views.generic.list_detail.object_list',info_dict),
    #(r'^(?P<object_id>\d+)/$', 'django.views.generic.list_detail.object_detail', info_dict),
    #url(r'^(?P<object_id>\d+)/results/$', 'django.views.generic.list_detail.object_detail', dict(info_dict, template_name='polls/results.html'), 'poll_results'),
    #(r'^(?P<poll_id>\d+)/vote/$', 'django.polls.views.vote'),
#)

	#(r'^$','django.views.generic.list_detail.object_list',info_dict),
    #(r'^$','django.views.generic.list_detail.object_list',info_dict),
