register /home/rob/git/thinklink/scala/thinklink.jar;
records = LOAD 'output/claimfinder/urlphrases_all' AS (url:chararray);
uniq = DISTINCT records;
STORE uniq INTO 'output/claimfinder/urlphrases_unique';
hashed = FOREACH uniq GENERATE url,com.intel.thinkscala.pig.Hash(url) AS hash;
random = ORDER hashed BY hash;
ranurls = FOREACH random GENERATE url;
STORE ranurls INTO 'output/claimfinder/urlphrases_random';

