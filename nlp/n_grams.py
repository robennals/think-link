#!/usr/bin/python
# n_grams.py
#   This python script builds ngrams from a ptree.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   29-May-2009
#
"""
classify a text by computing ngrams from a learned ptree.
Usage:
$ python n_grams.py ptree.pkl the_text
 -d debug
 -f read the text from file rather than cmd line
"""
csv_id =   '$Id: n_grams.py 62 2009-10-22 07:38:18Z jmagosta $'

dbg        = False
test_file   = None
profile_rpt = ''
########################################################################

import math, operator, pickle, time, sys

import word_dict
from ptree     import *
import turkdata

#----------------------------------------------------------------------
def find_match(seq, w_index_key):
    """Return the object in the list whose word index field matches the word
    index key. """
    w_indexes = [x.get_w_index() for x in seq]
    try:
        seq_index = w_indexes.index(w_index_key)
    except ValueError:
        return None
    return seq[seq_index]


# ngram tree #############################################################
class ng_tree:
    """ Copy over parts of the ptree that appear in the test text, by walking
    the ptree.
    """
    def __init__(self, the_ptree, smoother=1):
        self.ptree = the_ptree
        self.smoother=smoother
        self.root = ng_node(the_ptree.root)
        ## Keep track of our position in the tree.
        self.last_leaves = []

    def add_word_to_ng_tree(self,the_word):
        """Each word gets added at root, and at
        last_leaves, should there be a match."""
        ## Keep track of where the word appeared in the tree.
        self.new_leaves = []
        ## Place the word in the ngram tree
        self.append_if_not_null(self.root.find_sibling(the_word))

        for an_ng_node in self.last_leaves:
            ## Need to check depth limit first?
            self.append_if_not_null(an_ng_node.find_sibling(the_word))

        ## The places where the word was added
        self.last_leaves = self.new_leaves

    def print_ng_tree(self):
        print '\tTREE\n'
        self.print_ng_tree_aux(self.root)

    def print_ng_tree_aux(self, node):
        node.print_ng_node(self.ptree.words)
        [self.print_ng_node_aux(kids) for kids in node.kids]

    def print_both_trees(self):
        ## Recur down the ng tree -so lone ptree nodes
        ## will not be seen.
        print '\n\t NG-PT TREE'
        indent = ''
        self.print_both_trees_aux(self.root, indent)

    def print_both_trees_aux(self, node, indent):
        print indent,
        node.print_ng_node(w_dict=self.ptree.words)
        # node.pt_node.print_pt_node()
        indent += '    '
        [self.print_both_trees_aux(x, indent) for x in node.kids]

    def append_if_not_null(self, node):
        if node:
            self.new_leaves.append(node)

#____________________________________________________________________________
class ng_node:
    """ An ng_node has a pt_node. It embellishes it with ngram counts in
    the test data.
    """
    def __init__(self, my_pt_node):
        """"""
        self.pt_node = my_pt_node
        ## Count of times this ngram appears in the text ==1 the first time.
        self.appearances = 1
        ## Dont't use this ngram in the NB classifier (a text specific stop word)
        self.exclude = False
        self.kids = []  # of ng_nodes

    def get_w_index(self):
        return self.pt_node.w_index

    def find_sibling(self, word): #  ng_parent, word):
        """ If this node in the ptree contains this word
        Add the word to the ng_node (creating a new one if necessary.)
        Word - index to word string.
        """
        ## End recursion - if there are no kids, just stop
        # First if the word already exists in the ng treem inc its count
        found_ng_node = None
        found_word = find_match(self.kids, word)
        if found_word:
            found_ng_node = found_word
            if dbg: print 'ng_node', found_ng_node.print_ng_node()
            ## Increment word appearance count.
            found_word.appearances +=1
        else:
            ## If the word exists in the ptree, create the corresponding
            ## ng tree node.
            ## Go to the parent & Look in the ptree
            # print "test", self.pt_node.print_pt_node()
            found_word = find_match(self.pt_node.kids, word)
            if found_word:
                # Add node to ng tree
                found_ng_node = ng_node(found_word)
                if dbg: print 'pt_node', found_ng_node.print_ng_node()

                self.kids.append(found_ng_node)
            ## otherwise ignore words not in the tree.
            ## Return ng_node as a placeholder for the next word in the ngram.
        return found_ng_node

    def print_ng_node(self, w_dict = None):
        #print 10*'-'
        print 'NG',
        self.pt_node.print_pt_node(w_dict)
        print '# ', self.appearances


# ngram #################################################################
class ngram:
    "Just a struct to hold one fragment & its counts, extracted from the tree"
    def __init__(self, the_labels, smoother=1):
        # self.the_dict = the_dict
        self.smoother=smoother
        self.counts = the_labels  # ?? why bother to copy this?
        ## The ngram as a list of tokens
        self.text = []
        self.count_sum = 0
        ## The
        self.likelihood_msg = 1

    def copy(self, the_ngram):
        """Only the text is needed; the counts dont depend on
        parents. """
        self.counts = the_ngram.counts.copy()
        self.text = [x for x in the_ngram.text]
        # self.count_sum = the_ngram.count_sum

    def walk_one_node(self, the_node, collect_text=True):
        ## Collect the n gram sequence of tokens
        ## If no dictionary, just use the word indexes
        self.ng_node = the_node
        if collect_text:
            self.text.append(the_node.pt_node.w_index)
        ## Dont assume a binary state
        for (lbl, ct) in the_node.pt_node.counts.iteritems():
            self.counts[lbl] = ct
            self.count_sum += ct
        self.likelihood_msg = float(self.smoother + self.counts['yes'])/float(self.smoother + self.counts['no'])

        return self

    def display_likelihood(self):
        sm = self.smoother
        ct_vec = (sm+self.counts['yes'], sm+self.counts['no'])
        total_ct = float(sum(ct_vec))
        return [('%.2f' % (x/total_ct)) for x in ct_vec]

    def print_ngram(self, the_dict=None):
        print ('%5.0f' % self.count_sum), '\t',
        print self.display_likelihood(), '\t',
        print ('%.3f' % math.log(self.likelihood_msg)), '*', self.ng_node.appearances,'\t',
        if the_dict:
            print string.join([the_dict.index2word(x) for x in self.text])
        else:
            print string.join([( '%d' % (x)) for x in self.text])



# text lkhd #################################################################
class text_lkhd(list):
    ## A list of matched ngrams
    def __init__(self, the_ng_tree, depth, smoothings, add_words=False, prior = 0):
        ## e,g self[n] = ngram
        self.ng_tree = the_ng_tree
        self.depth = depth
        self.smoothings = smoothings
        self.add_words = add_words
        self.sum_log_likelihood = prior

    #def ngram_eql(one_ng, two_pt):
        ### Compare their text lists
            ### Is this found node at the end of the ngram tokens?
        #return (one_ng.text[-1] == two_pt.w_index)

    #____________________________________________________________________________
    ### Generate one copy of all possible n-grams by walking the tree.
    def walk_ng_tree(self, the_labels = labels()):
        """List n-grams by descending the tree depth first to level n;
        sorted by frequency. Assume every node in the ng_tree creates
        one ngram. """

        for nd in self.ng_tree.root.kids:
            a_ngram = ngram(the_labels.copy())
            a_ngram.walk_one_node(nd, self.add_words )
            self.sum_log_likelihood += math.log(a_ngram.likelihood_msg) * nd.appearances
            self.append(a_ngram)
            self.extend(self.walk_ng_tree_aux(nd, a_ngram))
        return self


    def walk_ng_tree_aux(self, the_ng_node, its_ngram):
        "Return a list of n_grams"
        n_grams = []
        if the_ng_node.pt_node.seq_no < self.depth:
            for nd in the_ng_node.kids:
                a_ngram = ngram(labels().copy)
                a_ngram.copy(its_ngram)  #only to accumulate word seq
                a_ngram.walk_one_node(nd, self.add_words )
                self.sum_log_likelihood += math.log(a_ngram.likelihood_msg) * nd.appearances
                n_grams.append(a_ngram)
                self.extend(self.walk_ng_tree_aux(nd, a_ngram))
        else:
            return []
        return n_grams

    #_______________________________________________________________________
    ### Utility to reverse sort contents by the order of key_list
    def sort_by_keys (self, key_list):
        pairs = zip(key_list, self)
        pairs.sort(reverse=True)
        self.sorted = [ x[1] for x in pairs ]

def n_grams_prior(ngrams):
    "Compute the log likelihood of the ngrams that occur in the training set"
    ## Compute a dot product
    if not ngrams:
        print >> sys.stderr, "No n-grams found"
        return 0
    counts = [x.count_sum for x in ngrams]
    replicated_lks_rations = zip(class_likelihood(ngrams), counts)
    replicates = map(lambda x:x[0]* x[1], replicated_lks_rations)
    total_ct = reduce(operator.add, counts)
    if total_ct == 0:
        print "n_grams_prior: no n_gram count found"
        sum_product= 1
    else:
        sum_product = reduce(operator.add, replicates)/total_ct
    return math.log(sum_product)


# #######################################################################

def embellish_tree(token_seq, pt_tree_to_classify_with):
    """Create the ng_tree from the test text sequence.
    Tokenize the words before passing in the token_seq.
    """
    the_tree = ng_tree(pt_tree_to_classify_with)
    token_index_seq = [pt_tree_to_classify_with.words.word2index(w) for w in token_seq]
    ## remove blank entries for words not found.
    token_index_seq = [x for x in token_index_seq if x]
    for tok in token_index_seq:
        the_tree.add_word_to_ng_tree(tok)
    return the_tree


#
#_______________________________________________________________________
def main(args):

    global profile_rpt

    try:
        cl_fd = file(args[0])
        cl_pt = pickle.load(cl_fd)
    except:
        print "Could not read from", args[0].split()
        exit(-1)

    if test_file:
        tst_txt = open(test_file).read().split()
    else:
        tst_txt = args[1].split()
    time.clock()
    ## create ngram tree
    ## Classification occurs here:
    tree = embellish_tree(tst_txt, cl_pt)
    if dbg:
        profile_rpt = "classify in ", '%5.3f' % time.clock(), " secs!"
        tree.print_both_trees()

    all_ngrams = text_lkhd(tree, 2, 1, add_words=True)
    all_ngrams.walk_ng_tree()

    if dbg:
        multiplicity = [z.likelihood_msg for z in all_ngrams]
        all_ngrams.sort_by_keys(multiplicity)
        [ng.print_ngram(cl_pt.words) for ng in all_ngrams.sorted]
        print '\nLOG LIKELIHOOD: ',
    print all_ngrams.sum_log_likelihood



########################################################################
if __name__ == '__main__':

    ## If invoked with no args, just print the usage string
    if len(sys.argv) == 1:
        print __doc__
        sys.exit(-1)

    if '-d' in sys.argv:
        del(sys.argv[sys.argv.index('-d')])
        dbg = 1

    if '-f' in sys.argv:
        n_arg = sys.argv.index('-f')
        test_file = (sys.argv[n_arg+1])
        del(sys.argv[n_arg:(n_arg+2)])

    # time.clock()
    args = sys.argv[1:]
    main(args)
    print >> sys.stderr, sys.argv, profile_rpt #, "Done in ", '%5.3f' % time.clock(), " secs!"


### (c) 2009 Intel Corporation
