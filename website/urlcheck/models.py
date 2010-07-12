import zlib
from django.db import models
from datetime import datetime

# Create your models here.

class SourcePage(models.Model):
	url = models.CharField(max_length=1000,db_index=True)
	date = models.DateTimeField('date published',null=True,blank=True,db_index=True)
	crawled = models.BooleanField(default=False)
	
	def short_url(self):
		return self.url[:60]
	
	def __unicode__(self):
		return self.url
		
		
		
class Dispute(models.Model):
	page = models.ForeignKey(SourcePage)
	claimtext = models.CharField(max_length=200)
#	snippet = models.CharField(max_length=1000)
	
	wordpair = models.ForeignKey("WordPair",null=True,blank=True)
	wordtriple = models.ForeignKey("WordTriple",null=True,blank=True)

	def __unicode__(self):
		return self.claimtext

class RawDispute(models.Model):
	url = models.CharField(max_length=1000)
	date = models.DateTimeField()
	prefix = models.CharField(max_length=200)
	sentence = models.CharField(max_length=1000)
	correcttrim = models.CharField(max_length=200)


class MatchPage(models.Model):
	url = models.CharField(max_length=1000)
	url_hash = models.IntegerField('hash of the URL',db_index=True)
	disputes = models.ManyToManyField(Dispute)
	loading = models.BooleanField(default=False)
	def short_url(self): return self.url[:60]


def url_hash(url): return zlib.crc32(url)

		
class MatchVote(models.Model):
	claimtext = models.CharField(max_length=200)
	claimurl = models.CharField(max_length=1000)
	claimcontext = models.CharField(max_length=1000, db_index=True)
	pageurl = models.CharField(max_length=1000)
	pagecontext = models.CharField(max_length=1000)
	claimdate = models.DateTimeField()
	pagedate = models.DateTimeField()
	votedate = models.DateTimeField(db_index=True)
	vote = models.CharField(max_length=10)
	voteraddr = models.CharField(max_length=100)
	
class SimpleMatch(models.Model):
	page = models.ForeignKey(MatchPage)
	claimtext = models.CharField(max_length=500)
	matchcontext = models.CharField(max_length=1000)
	vote = models.CharField(max_length=10)
	score = models.FloatField()
	def __unicode__(self): return self.claimtext

class SimpleContext(models.Model):
	url = models.CharField(max_length=1000)
	pagetitle = models.CharField(max_length=250)
	context = models.CharField(max_length=1000)
	claimtext = models.CharField(max_length=200, db_index=True)

class ClaimContext(models.Model):
	url = models.CharField(max_length=1000)
	date = models.DateTimeField()
	prefix = models.CharField(max_length=100)
	claimtext = models.CharField(max_length=200,db_index=True)
	sentence = models.CharField(max_length=1000)
	badvotes = models.IntegerField()
	goodvotes = models.IntegerField()

class DisputeMatch(models.Model):
	matchpage = models.ForeignKey(MatchPage)
	dispute = models.ForeignKey(Dispute)	

def parse_list(text):
	if len(text) == 0: return []
	else: return text.split("|")

"""Tables used to efficiently find claims by their rare words"""
class FirstWords(models.Model):
	firstword = models.CharField(max_length=20,db_index=True)
	secondwords = models.TextField()
	def secondwords_set(self): return set(parse_list(self.secondwords))
	
class WordPair(models.Model):
	pair = models.CharField(max_length=40,db_index=True)
	triples = models.TextField()
	claims = models.TextField()	
	def triples_set(self): return set(parse_list(self.triples))
	def claims_list(self): return parse_list(self.claims)
	def __unicode__(self): return self.pair
	
class WordTriple(models.Model):
	triple = models.CharField(max_length=60,db_index=True)
	claims = models.TextField()
	def claims_list(self): return parse_list(self.claims)
	def __unicode__(self): return self.triple
	

def load_sourcepages(infile):
	for line in infile:
		(date,url,query) = line.split("\t")
		#print url,date
		(page,created) = SourcePage.objects.get_or_create(url=url,
			defaults={'url':url,'date':datetime.strptime(date," %Y/%m/%d")})
		
def load_claims(infile):
	for line in infile:
		(date,url,claimtext) = line.split("\t")
		(page,created) = SourcePage.objects.get_or_create(url=url,
			defaults={'url':url,'date':datetime.strptime(date," %Y/%m/%d")})
		(dispute,created) = Dispute.objects.get_or_create(page=page,claimtext=claimtext,
			defaults={'page':page,'claimtext':claimtext})
