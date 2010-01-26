-- group URLs by domain, and sort by the number of URLs in that domain

records = load 'test/flatten_bug.txt' AS (x:long,y:chararray);
grouped = GROUP records BY x;
flat = FOREACH grouped GENERATE FLATTEN($1) AS (x:long,y:chararray);

