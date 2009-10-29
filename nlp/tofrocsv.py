#!/usr/bin/python
# tofrocsv.py
#   This python utility converts back and forth to human
#   readible csv files
#
#   Part of project:	Confront
#
#   Author and date:	JMA   12 Sept 2009
#
"""Pass in either a csv or pkl file to convert it to the other  kind. 
Accepts thetraining format used by extract_training, of two lists,
one positive examples, one negative examples.

Usage:
python tofrocsv.py training_data.pkl | training_data.tab [-d]
"""

import pickle,  re, sys, time
import csv
from extract_training import *


dbg = 0

########################################################################
#-----------------------------------------------------------------------
def read_claims(fn):
    try:
        cl_fd = file(fn)
        cl_pt = pickle.load(cl_fd)
    except Exception, e:
        print "Error: ", e, "\nCould not read from", fn
        exit(-1)
    return cl_pt

#-----------------------------------------------------------------------
def pkl2csv(the_claims):
    csved = ''
    csved += str(the_claims.claim_id) + '\t' + the_claims.text.encode('latin-1', 'ignore') +'\n'

                
    for (id, txt) in zip(the_claims.yes_id, the_claims.yes_abstract):
        csved += str(id) + '\tyes\t' + txt.encode('latin-1', 'ignore') + '\n'

    for (id, txt) in zip(the_claims.yes_id, the_claims.no_abstract):
        csved += str(id) + '\tno\t' + txt.encode('latin-1', 'ignore') + '\n'

    return csved


#-----------------------------------------------------------------------
def time_rand():
    "Tenths of a second from some fixed convention."
    return str(int(10*time.time() - 12530000000))
 

#-----------------------------------------------------------------------
def read_csv(the_csvf):
    csv_fd = open(the_csvf+'.tab', 'rb')
    return csv.reader(csv_fd, delimiter = '\t')

#-----------------------------------------------------------------------
def csv2pkl(the_iter):

    json_obj= build_json_data()
    header_row = the_iter.next()
    json_obj.claim_id = header_row[0]
    json_obj.text     = header_row[1]
    if dbg: print header_row

    sample_ct = 0
    for row in the_iter:
        sample_ct += 1
        if dbg: print row
        if row[1] == 'yes':
            json_obj.yes_id.append(row[0])
            json_obj.yes_abstract.append(row[2])
        elif row[1] == 'no':
            json_obj.no_id.append(row[0])
            json_obj.no_abstract.append(row[2])

    json_obj.instance_count = sample_ct
    print "pkled ", sample_ct, " samples"

    return json_obj




########################################################################
def main(fname):
    csv_match = re.match('(.*)\.tab', fname)
    pkl_match = re.match('(.*)\.pkl', fname)
    
    if csv_match:
        csv_root = csv_match.groups()[0]
        csv_iter = read_csv(csv_root)
        json = csv2pkl(csv_iter)

        pkl_file = csv_root+'.pkl'
        print >> sys.stderr, "converted to ", pkl_file
        fd = open(pkl_file, 'wb')
        pickle.dump(json, fd)
        fd.close()

        
    elif pkl_match:
        file_root =  pkl_match.groups()[0]
        claim_obj = read_claims(fname)
        csved = pkl2csv(claim_obj)  

        cvs_file = file_root+'_'+time_rand()+'.tab'
        print >> sys.stderr, "converted to ", cvs_file
        fd = open(cvs_file, 'wb')
        fd.write(csved)
        fd.close()


    else:
        print >> sys.stderr, "Error: unrecognized file type: ", fname
    

########################################################################
if __name__ == '__main__':

    ## If invoked with no args, just print the usage string
    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    ## copy args
    args = [z for z in sys.argv]

    if '-d' in args:
        del(args[args.index('-d')])
        dbg = 1


    time.clock()
    args = args[1:]
    main(args[0])
    print >> sys.stderr, sys.argv, "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation


