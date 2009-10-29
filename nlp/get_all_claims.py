#!/usr/bin/python
#   Part of project:	Confront
#
#   Author and date:	JMA   4 Sept 2009
#
"Pickle all claims in dispute finders web db"
import os, sys

min_claim = 1
max_claim = sys.argv[1]
if len(sys.argv) > 2:
    min_claim = sys.argv[2]
for k in xrange(int(min_claim), int(max_claim)):
    os.system("python ../extract_training.py -w "+str(k))
