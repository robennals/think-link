from django.db import models

# Create your models here.

class SourcePage(models.Model):
	url = models.CharField(max_length=1000)
	date = models.DateTimeField('date published')
	
	def __unicode__(self):
		return self.url

class Dispute(models.Model):
	page = models.ForeignKey(SourcePage)
	claimtext = models.CharField(max_length=200)
	
	wordpair = models.ForeignKey("WordPair",null=True,blank=True)
	wordtriple = models.ForeignKey("WordTriple",null=True,blank=True)

	def __unicode__(self):
		return self.claimtext

class MatchPage(models.Model):
	url = models.CharField(max_length=1000)
	url_hash = models.IntegerField('hash of the URL',db_index=True)
	disputes = models.ManyToManyField(Dispute)
	
	
class DisputeMatch(models.Model):
	matchpage = models.ForeignKey(MatchPage)
	dispute = models.ForeignKey(Dispute)	
	
class WordPair(models.Model):
	firstword = models.CharField(max_length=20,db_index=True)
	pair = models.CharField(max_length=40)	

class WordTriple(models.Model):
	firstpair = models.ForeignKey(WordPair)
	triple = models.CharField(max_length=60)
