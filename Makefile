JAVA = java
EXTRACTCLAIMS = $(JAVA) com.intel.thinkscala.claimfinder.ExtractClaims
DEDUP = python web_claim_finder/drop_duplicate_claims.py
# GOOD = python web_claim_finder/drop_bad_claims.py
GOODNOUNS = python web_claim_finder/good_nouns.py
NOUNFREQS = python web_claim_finder/noun_freqs.py

urls2009 = $(wildcard output/claimfinder/urlphrases_year/2009/*.urls)
urls2008 = $(wildcard output/claimfinder/urlphrases_year/2008/*.urls)
urls2007 = $(wildcard output/claimfinder/urlphrases_year/2007/*.urls)
urls2006 = $(wildcard output/claimfinder/urlphrases_year/2006/*.urls)
urlsyears = $(wildcard output/claimfinder/urlphrases_year/*/*.urls)
urlsdays = $(wildcard output/claimfinder/urlphrases_date/*/*.urls)

years = $(filter-out %.dedup %.good %.nouns,$(wildcard output/claimfinder/urlphrases_year/*))
days = $(filter-out %.dedup %.good %.nouns %.freqs,$(wildcard output/claimfinder/urlphrases_date/*))
jandays = $(filter-out %.dedup %.good %.nouns %.freqs,$(wildcard output/claimfinder/urlphrases_date/January_10_*))

claims2009 = $(urls2009:.urls=.claims)
claims2008 = $(urls2008:.urls=.claims)
claims2007 = $(urls2007:.urls=.claims)
claims2006 = $(urls2006:.urls=.claims)
claimsyears = $(urlsyears:.urls=.claims)
claimsdays = $(urlsdays:.urls=.claims)
yeardedups = $(addsuffix .dedup,$(years))
yeargood = $(addsuffix .good,$(years))
daydedups = $(addsuffix .dedup,$(days))
daygood = $(addsuffix .good,$(days))

%.claims : %.urls
	$(EXTRACTCLAIMS) $< $@

%.dedup : %
	$(DEDUP) $</*.claims > $@

%.nouns : %.dedup
	$(GOODNOUNS) $< > $@

%.good : %.dedup
	$(GOODNOUNS) $< > $@
	
%.freqs : %.good
	$(NOUNFREQS) $< > $@
	
vars : 
	echo vars
	echo $(claims2009)
	
testclaims : output/claimfinder/urlphrases_first.claims
2009claims : $(claims2009)
2008claims : $(claims2008)
2007claims : $(claims2007)
2006claims : $(claims2006)
yearclaims : $(claimsyears)
dayclaims : $(claimsdays)
yeardedups : $(yeardedups)
daydedups : $(daydedups)
yeargood : $(yeargood)
daygood : $(daygood)
allgood : $(yeargood) $(daygood)
yearfreqs : $(addsuffix .freqs,$(years))
dayfreqs : $(addsuffix .freqs,$(days))
janfreqs : $(addsuffix .freqs,$(jandays))

minigood = $(wildcard web_claim_finder/minidata/*.good)
minifreqs : $(addsuffix .freqs,$(miniyears))
