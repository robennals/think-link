#!/usr/bin/python
# Hash all root urls, create a table of urls and claims
# Incidentally find the longest url to save

import glob, pickle, re, sys

url_dir = 'urlphrases/'
all_urls = {}
def add_to_hash(the_urls, the_file):

    ml = 0
    fd = open(the_file)
    for a_line in fd.readlines():
        ml = max(ml, len(a_line))

        root_url = re.findall('^http[s]?://([^/]+)', a_line)
       # print root_url

        if root_url:
            the_urls[root_url[0]] =  re.sub('\.url', '', re.sub('urlphrases/', '', the_file))
            
    print "max(len(url)", ml
    fd.close()
    return(the_urls)


for a_file in glob.glob(url_dir + sys.argv[1]):
    add_to_hash(all_urls, a_file)

fd  = open('all_root_urls.pkl', 'wb')
pickle.dump(all_urls, fd)

