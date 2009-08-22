package com.intel.thinkscala.learn
import com.intel.thinkscala._


class Entry (val url : String, val title : String, val highlight : String, val context : String)

abstract class Learner {
	def train(yes : Seq[String], no : Seq[String])
	def classify(context : String) : Double
	                                                        
    def trainForSearch(store : Datastore,searchid : Int){
		val yes = store.snippetText(searchid,"true").map(_.str("abstract"))
        val no = store.snippetText(searchid,"false").map(_.str("abstract"))        
		train(yes,no)
	}
}

object EmptyClassifier extends Learner {
	def train(yes : Seq[String], no : Seq[String]) = {}
	def classify(context : String) = 0.5
}

object Learner{
	def getClassifier(store : Datastore, claimid : Int, query : String) = {
		store.getSearchId(claimid,query) match {
			case Some(searchid) => {
				val classifier = new SimpleLearner(6)
				classifier.trainForSearch(store,searchid)
				classifier				
			}
			case None => EmptyClassifier
		}
	}
}
