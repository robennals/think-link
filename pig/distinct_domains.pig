records = LOAD 'output/claimfinder/urlphrases_all' AS (url:chararray);
uniq = DISTINCT records;
STORE uniq INTO 'output/claimfinder/urlphrases_unique';

