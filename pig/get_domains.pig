-- group URLs by domain, and sort by the number of URLs in that domain

register /home/rob/git/thinklink/scala/thinklink.jar;
records = load 'output/claimfinder/urlphrases' AS (url:chararray);
grouped = GROUP records BY com.intel.thinkscala.pig.Domain(url);
counted = FOREACH grouped GENERATE $0,COUNT($1);
sorted = ORDER counted BY $1 DESC;
STORE sorted INTO 'output/claimfinder/sorteddomains';

filtered = FILTER sorted BY $1 > 1;
urls = FOREACH filtered GENERATE $0;
STORE urls INTO 'output/claimfinder/topdomains';

baddomains = load 'input/bad_domains.txt';
both = COGROUP baddomains BY $0, sorted BY $0;
good = FILTER both BY COUNT($1) == 0;

STORE good INTO 'output/claimfinder/goodtopdomains';


