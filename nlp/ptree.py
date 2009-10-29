#!/usr/bin/python
# ptree.py
#   This python module to hash words.
#
#   Part of project:	Confront
#
#   Author and date:	JMA   27-May-2009
#
# def learn_ccc(yes_sample, no_sample, n_gram_length)
"""
  This prefix tree (ptree) stores sequences of string tokens up to a specified
  depth (default = 2), and their number of occurences. It can be used
  for multiple corpus' - typ labeled 'yes' and 'no'.

  The ptree can be converted into a list of ngrams of a specified depth.
  Smoothing for the likelihoods is done lazily, when the ngrams are built.

Usage:
$ python ptree.py file_of_test_tokens
"""
csv_id =   '$Id: ptree.py 62 2009-10-22 07:38:18Z jmagosta $'
########################################################################

import pprint, string, sys, time
import word_dict

dbg = True

#_______________________________________________________________________

class labels(dict):
    "Store counts for the set of class labels in this object as a dictionary."
    ## keys - the class label string
    ## values the count for that label.
    ## used both in the classes pt_nodes and ngram
    def __init__(self, labels_list = ('yes', 'no')):
        ## Add smoothing when the tree is converted to ngrams. .
        for label in labels_list:
            self[label] = 0

    def inc_class_count(self, the_class_label):
        self[the_class_label] +=1

    def print_class_count(self):
        for (keys, values) in self.iteritems():
            print keys, values,
 

#_______________________________________________________________________
class pt_node(object):
    """prefix tree node. Contains the word-token, its children
    and the counts for that sequence."""

    pt_node_ct = 0
    
    def __init__(self, words, token, lbls=None):

        pt_node.pt_node_ct +=1
        if dbg and pt_node.pt_node_ct % 100 == 0:
            print '.',
        self.w_index = words.add_word(token)
        ## position in the ngram (e.g. the first node seq_no == 1
        self.seq_no = 0
        if lbls:
            self.counts = labels(labels_list=lbls.keys()) # really?
        else:
            self.counts = labels()
        ## list of child nodes
        self.kids =[]

    def get_w_index(self):
        return self.w_index

    def make_me_a_child(self, parent, label):
        parent.kids.append(self)
        self.seq_no = 1 + parent.seq_no
        ## inc the class count for the sample.
        self.inc_count(label)

    def inc_count(self, label):
        self.counts[label] +=1

    def print_pt_node(self, words=None, kids_p = False):
        print self.w_index,
        if words:
            print ":'"+ words.index2word(self.w_index) + "' @", self.seq_no,
        else:
            print "' @", self.seq_no,
        #print 4*"%d\t" % (self.seq_no, self.yes_ct, self.no_ct, self.un_ct)
        self.counts.print_class_count()
        if kids_p:
            print [x.get_w_index() for x in self.kids]


#_______________________________________________________________________
### A tree of tokens, for text from multiple classes.
class ptree(object):

    def __init__(self, words, depth = 2, dent = '__', lbls = labels()):
        ## How deep a tree to build; the n in n-gram
        self.depth = depth
        ## Indent level for printing tree
        self.dent = dent
        ## The immutable list of class labels
        self.labels = lbls
        ## which dictionary to use, object of type word_dict
        self.words = words
        ## only root can be the word ''
        self.root = pt_node(self.words, '', self.labels)
        # a list of the last place pt_nodes were added.
        self.last_leaves = []


    def find_sibling_or_create(self, parent, word, which_class):
        # and don't duplicate it if it already exists.
        # if a node by that name already exists among the parent's kids
        old_node = None
        for x in parent.kids:
            if self.words.word2index(word) == x.get_w_index():
                old_node = x
                old_node.inc_count(which_class)
        # else create a new one
        if not old_node:
            new_node = pt_node(self.words, word, lbls = self.labels)
            new_node.make_me_a_child(parent, which_class)
            old_node = new_node
        return old_node

    def add_word_to_tree(self, word, which_class):
        ## remember where you added this word
        new_leaves = []
        ## create the node - only if none exists
        word_node = self.find_sibling_or_create(self.root, word, which_class)
        ## Increment or add a node at root
        # word_node.make_me_a_child(self.root, which_class)
        new_leaves.append(word_node)

        ## Increment nodes at current leaves
        for a_node in self.last_leaves:
            if a_node.seq_no <= self.depth:
                word_node = self.find_sibling_or_create(a_node, word, which_class)
                # word_node.make_me_a_child(a_node, which_class)
                new_leaves.append(word_node)

        self.last_leaves = new_leaves

    def print_tree(self):
        self.root.print_pt_node(self.words, kids_p=True)
        self.print_tree_aux(self.root, self.dent)
        if dbg:
            print '1-grams ', len(self.root.kids)
            print 'nodes   ', pt_node.pt_node_ct

    def print_tree_aux(self, node, indent):
        "Recur down the tree"
        for a_node in node.kids:
            ## terminates when kids lists are empty
            print indent,
            a_node.print_pt_node(self.words, kids_p=True)
            self.print_tree_aux(a_node, indent = indent + self.dent)


#########################################################################
### tokenization, removal of non-words, stemming etc.
def clean_word_list(word_str):
    ## input a string with multiple words.
    words = word_str.split()
    words = [ w.lstrip(string.punctuation) for w in words]
    words = [ w.rstrip(string.punctuation) for w in words]
    words = [ w.lower() for w in words]
    ## !! The dict appears to have words beginning with spaces
    ##  & this doesn't seem to remove them!
    words = [ w.strip() for w in words]
    return words
#_______________________________________________________________________
def build_tree(label, token_seq, the_tree):
    "Add to a tree a list of tokens belonging to one class label."
    ## reset the prefix tree to the top of the tree, so it doesn't add the next
    ## class sequence as a continuation of the first.
    the_tree.last_leaves = []
    for tok in token_seq:
        the_tree.add_word_to_tree(tok, label)
    return the_tree

def learn_ccc(yes_sample, no_sample, n_gram_length):
    "Return a prefix tree learned from two text samples"
    the_dict = word_dict.word_dict()
    the_tree = ptree(the_dict, n_gram_length)
    return build_tree('no', no_sample, build_tree('yes', yes_sample, the_tree))

def mult_sample_learn_ccc(yes_sample, no_sample, n_gram_length):
    "Add multiple samples to a prefix tree"
    tree_so_far = learn_ccc(clean_word_list(yes_sample.pop()),
                            clean_word_list(no_sample.pop()), n_gram_length)

    y = 1
    while yes_sample:
        tree_so_far= build_tree('yes', clean_word_list(yes_sample.pop()),
                                tree_so_far)
        y += 1
    while no_sample:
        tree_so_far = build_tree('no', clean_word_list(no_sample.pop()),
                                 tree_so_far)
        y +=1
    print >> sys.stderr, y, "samples trained"
    return tree_so_far

#_______________________________________________________________________
def main(args):

    a_dict = word_dict.word_dict()

    ### test class pt_node
    anode = pt_node(a_dict, "python")
    bnode = pt_node(a_dict, "zzxyz")
    anode.print_pt_node(a_dict)
    print

    ### test class ptree
    my_dict = word_dict.word_dict()
    a_ptree = ptree(my_dict)
    a_ptree.add_word_to_tree('equality', 'yes')
    a_ptree.add_word_to_tree('fraternity', 'yes')
    a_ptree.add_word_to_tree('liberty', 'no')
    a_ptree.print_tree()
    print 40*'*'

    sentence = "chuck could a wood chuck chuck if a wood chuck could chuck wood"
    sentence = sentence.split(' ')
    reversed_sentence = sentence
    reversed_sentence.reverse

    my_ptree = learn_ccc(sentence, reversed_sentence, 5)
    print 40*'_'

    some_text = open(args[0], 'r').read()
    some_text = some_text[:-1].split(' ')
    my_ptree = ptree(my_dict)
    build_tree('yes', some_text, my_ptree)
    my_ptree.print_tree()
    print 40*'-'

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
