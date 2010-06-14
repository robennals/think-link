from django.db import models

# Create your models here.

class RawClaim(models.Model):
	rawtext = models.CharField(max_length=1000)
	correcttrim = models.CharField(max_length=1000)	# "X" if bad, empty if not done yet

