
import csv

"""
To import such a file, execute 
LOAD DATA INFILE 'filename.csv' INTO TABLE tbl_name

This is the same as
LOAD DATA INFILE 'filename.csv' INTO TABLE tbl_name
   FIELDS TERMINATED BY '\t' ENCLOSED BY '' ESCAPED BY '\\'
   LINES TERMINATED BY '\n' STARTING BY ''
   
key1 is assumed to be the id. key2 is assumed to be null.
fields is assumed to be the fields to go into the database table.  
"""

def escape(txt):
	return txt.replace("\\","\\\\").replace("\t","\\t").replace("\n","\\n")

def unescape(txt):
	return txt.replace("\\t","\t").replace("\\n","\n").replace("\\\\","\\")

def create_mysql_dump(store,outfile,colorder):
	for (id,key2,fields) in store:
		cols = [escape(fields[fieldname]) for col in colorder]
		outfile.write("\t".join(cols)+"\n")
	outfile.close()		
	


#def create_claims_mysql_dump(store,outfile):
	#colorder = ["
	#for (url,key2,fields) in store:		
		
		
		
def urls_to_hack_dump(urlfile,outfile):
	nextid = 1
	for line in urlfile:
		(date,url,query) = line.strip().split("\t")
		outfile.write(str(nextid)+"\t"+url+"\t"+date+"\t"+"0"+"\n")
		nextid += 1
			
#def oldclaims_to_hack_dump(claimfile,outfile):
	#nextid = 1
	#for line in claimfile:
				
