NOW="$(date +"%Y-%m-%d")"
FILE="backup-db/thinklink_$NOW.gz"
mysqldump -u thinklink -pthinklink thinklink | gzip -9 > $FILE

