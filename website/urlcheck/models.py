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



class MatchPage(models.Model):
	url = models.CharField(max_length=1000)
	url_hash = models.IntegerField('hash of the URL',db_index=True)
	disputes = models.ManyToManyField(Dispute)
	loading = models.BooleanField(default=False)
	def short_url(self): return self.url[:60]


def url_hash(url): return zlib.crc32(url)

	

class SimpleMatch(models.Model):
	page = models.ForeignKey(MatchPage)
	claimtext = models.CharField(max_length=500)
	def __unicode__(self): return self.claimtext
	
class DisputeMatch(models.Model):
	matchpage = models.ForeignKey(MatchPage)
	dispute = models.ForeignKey(Dispute)	
	
class WordPair(models.Model):
	firstword = models.CharField(max_length=20,db_index=True)
	pair = models.CharField(max_length=40)	

class WordTriple(models.Model):
	firstpair = models.ForeignKey(WordPair)
	triple = models.CharField(max_length=60)


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
