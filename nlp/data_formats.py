Training data formats, python					10 Sept Aug 2009

### For the results of tokenization

class text_sample:
""" The output of the dictionary on text sample strings



class Entry {
 String url;
 String pagetitle;
 String sniptext;
 String pagetext;
}


interface ClaimClassifier {
 public void train(Vector<Entryyeslist, Vector<Entrynolist);
 public float classify(Entry);         // returns probability of entry being in the set
 public Vector<StringsuggestQueries(); // suggests BOSS queries, based on classifier
}


/* Need to recover also the claim text to complete this.
 */
class JSON_Entry {
int claim_id;
int id;
int url_id;
title;
pagetext;
abstract;  // text to classify
picktext;
url;
searchdate;
state;  // unknown, false, true
int search_id;
username;
position
}
