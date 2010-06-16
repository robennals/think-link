from django.db import models
import trimoptions
from nlptools.html_to_text import html_to_segments, html_to_text

# Create your models here.

class RawClaim(models.Model):
	url = models.CharField(max_length=1000)
	date = models.DateTimeField()
	prefix = models.CharField(max_length=200)
	sentence = models.CharField(max_length=1000)
	correcttrim = models.CharField(max_length=200)
	urlhash = models.IntegerField()
	senthash = models.IntegerField()
	
	def __unicode__(self):
		return self.correcttrim

	def cleansentence(self):
		return html_to_segments(self.sentence)
	
	def is_crap(self):
		return trimoptions.is_crap(self.sentence)
	
	def trim_options(self):
		return trimoptions.trimoptions(self.sentence) 
