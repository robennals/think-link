from website.urlcheck.models import Dispute, SourcePage, MatchPage, DisputeMatch, SimpleMatch, FirstWords, WordPair, WordTriple, ClaimContext
from django.contrib import admin

#class ChoiceInline(admin.TabularInline):
	#model = Choice
	#extra = 3

#class PollAdmin(admin.ModelAdmin):
	#fieldsets = [
		#(None,               {'fields': ['question']}),
		#('Date information', {'fields': ['pub_date']}),
	#]
	#list_display = ['question','pub_date','was_published_today']
	#inlines = [ChoiceInline]
	#list_filter = ['pub_date']
	#search_fields = ['question']
	#date_hierachy = ['pub_date']

class SourcePageAdmin(admin.ModelAdmin):
	list_display = ['short_url','date','crawled']
	list_filter = ['date']
	search_fields = ['url']

class SimpleMatchInline(admin.TabularInline):
	model = SimpleMatch

class MatchPageAdmin(admin.ModelAdmin):
	list_display = ['short_url']
	search_fields = ['url']
	inlines = [SimpleMatchInline]
	
class FirstWordsAdmin(admin.ModelAdmin):
	list_display = ['firstword','secondwords']	
	search_fields = ['firstword']
	
class WordPairsAdmin(admin.ModelAdmin):
	list_display = ['pair','triples','claims']
	search_fields = ['pair']
	
class WordTriplesAdmin(admin.ModelAdmin):
	list_display = ['triple','claims']
	search_fields = ['triple']

class ClaimContextAdmin(admin.ModelAdmin):
	list_display = ['claimtext','prefix','sentence']
	search_fields = ['claimtext']
		
admin.site.register(Dispute)
admin.site.register(SourcePage,SourcePageAdmin)
admin.site.register(MatchPage,MatchPageAdmin)
admin.site.register(DisputeMatch)
admin.site.register(FirstWords,FirstWordsAdmin)
admin.site.register(WordPair,WordPairsAdmin)
admin.site.register(WordTriple,WordTriplesAdmin)
admin.site.register(ClaimContext,ClaimContextAdmin)
