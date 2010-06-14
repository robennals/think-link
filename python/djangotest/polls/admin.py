from djangotest.polls.models import Poll, Choice
from django.contrib import admin

class ChoiceInline(admin.TabularInline):
	model = Choice
	extra = 3

class PollAdmin(admin.ModelAdmin):
	fieldsets = [
		(None,               {'fields': ['question']}),
		('Date information', {'fields': ['pub_date']}),
	]
	list_display = ['question','pub_date','was_published_today']
	inlines = [ChoiceInline]
	list_filter = ['pub_date']
	search_fields = ['question']
	date_hierachy = ['pub_date']
	
admin.site.register(Poll,PollAdmin)
