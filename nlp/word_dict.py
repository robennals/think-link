#!/usr/bin/python
# word_dict.py
#   This python module to hash words.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   27-May-2009
#
"""
  This python module hashes words in dictionary according to the
   accension sequence number. A vector makes available the inverse
   of the dictionary (word to sequence number).
Usage:
$ python word_dict.py file_of_test_line_of_tokens
"""
csv_id =   '$Id: word_dict.py 50 2009-10-13 16:35:08Z jmagosta $'
########################################################################


import pprint, sys, time

dbg  =  0

#_______________________________________________________________________
class word_dict(dict):
    ## If only the values of the dict were hashed also, this
    ## wouldn't be necessary.

    def __init__(self):

        dict.__init__(self)
        ## self is a dictionary of text token keys and index values
        ## Incidentally the index is the order in which the tokens
        ## were first seen.

        ## Text strings for the dictionary, for reverse lookup.
        ## Index this vector with the token index to get the string.
        self.word_vec = []
        # self.word_cts = {}

    def next_item(self):
        return len(self.word_vec)

    def add_word(self, word):
        ## Add it only if its not there already
        if word not in self:
            self[word] = self.next_item()
            self.word_vec.append(word)
            #self.word_cts[word] = 1

        return self[word]  # integer "pointer" to the token string


    def word2index(self, word):
        " Equivalent to <word_dict_object>[word]"
        return self.get(word, '')


    def index2word(self, index):
        " Equivalent to <word_dict_object>.word_vec[index]"
        return self.word_vec[index]


    def word_count(self, word):
        return self.word_cts.get(word, 0)


    def dump(self):
        print 'word_dict'
        pprint.pprint(self.items())
        print '-'*40
        self.word_vec.sort()
        pprint.pprint(self.word_vec)
        print '-'*40

#________________________________________________________________________
def main(args):

    #### test class word_dict
    my_dict = word_dict()
    my_dict.add_word('boo')

    some_text = file(args[0]).read().split()
    for a_word in some_text:
        my_dict.add_word(a_word)

    print my_dict.word2index('boo'), my_dict['boo']
    print my_dict.index2word(1), my_dict.word_vec[1]
    my_dict.dump()

 ########################################################################
if __name__ == '__main__':

    ## If invoked with no args, just print the usage string
    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    time.clock()
    args = sys.argv[1:]
    main(args)
    print  >> sys.stderr, sys.argv, "Done in ", '%5.3f' % time.clock(), " secs!"

### (c) 2009 Intel Corporation
