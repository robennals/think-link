package com.intel.thinkscala.learn
import scala.collection.mutable.HashMap
import com.intel.thinkscala.Datastore

class WordInfo {
	var yescount = 0
	var nocount = 0
	var nextlevel = null : PrefixTree
	// P(x | y) = P(x and y)/P(x)
	override def toString = yescount + "/" + nocount + " - " + importance
	def importance = Math.max(yescount / (yescount+nocount+1.0),nocount / (yescount+nocount+1.0)) 
}

class PrefixTree extends HashMap[String,WordInfo] {
	def hello = 3
	
	def addString(s : Seq[String], length : Int, action : WordInfo => Unit, good : WordInfo => Boolean){
		if(s.isEmpty || length == 0) return;
		val wordinfo = getOrElseUpdate(s.head,new WordInfo)
		if(length == 1){
			action(wordinfo)
		}
		if(length > 1 && good(wordinfo)){
			if(wordinfo.nextlevel == null){
				wordinfo.nextlevel = new PrefixTree
			}
			wordinfo.nextlevel.addString(s.tail, length - 1, action, good)
		}
	}

	def getMatches(s : Seq[String]) : Option[WordInfo] = {
		if(s.isEmpty){
			None
		}else if(isDefinedAt(s.head)){
			val info = apply(s.head)
			if(info.nextlevel != null){
				info.nextlevel.getMatches(s.tail) match {
					case Some(subinfo) => Some(subinfo)
					case None => Some(info)
				}
			}else{
				Some(info)
			}
		}else{
			None
		}
	}
	
	def filterTree(cond : WordInfo => Boolean){
		keys foreach {key => 
			val obj = apply(key)
			if(cond(obj)){
				removeEntry(key)
			}else if(obj.nextlevel != null){
				obj.nextlevel.filterTree(cond)
			}
		}
	}
	
	def flatten(prefix : List[String]) : List[(List[String],WordInfo)] = {
		keys.toList flatMap {key => 
		 	val info = apply(key)
		 	if(info.nextlevel != null){
		 		(key :: prefix,info) :: info.nextlevel.flatten(key :: prefix) 
		 	}else{
		 		List((key :: prefix,info))
		 	}		 	
		}
	}

	def sortForBest(matchers : List[(List[String],WordInfo)]) = 
		matchers.sort((a,b) => a._2.importance > b._2.importance)
	
	def dumpBest = {
		val flat = sortForBest(flatten(List())) take 100
		flat foreach {x => 
			val info = x._2
			println(x._1.reverse.mkString(" ") + " " + info)
		}
	}
		
	def dumpContent(indent : String) : Unit = {
		keys foreach {key => 
			val info = apply(key)
			println(indent + key + " " + info.yescount + "/" + info.nocount + " - " + info.importance)
			if(info.nextlevel != null){
				info.nextlevel.dumpContent(indent+"  ")
			}
		}
	}
	
}

class SimpleLearner(val maxlength : Int) extends Learner {
	var tree = null : PrefixTree
	var probyes = 0.0
	var countyes = 0 : Double
	var countno = 0 : Double
	
	def train(yes : Seq[String], no : Seq[String]){
		tree = new PrefixTree
		val yeswords = yes map (_.split("\\s"))
		val nowords = no map (_.split("\\s"))
		countyes = yes.length
		countno = no.length
		probyes = (0.0 + countyes) / (countyes + countno)
		for(length <- 1 to maxlength){
			trainTree(tree,yeswords, length, _.yescount += 1)
			trainTree(tree,nowords, length, _.nocount += 1)
		}
//		tree.filterTree(x => x.yescount < 5 && x.nocount < 5)
	}		
	
	def trainTree(tree : PrefixTree, entries : Seq[Seq[String]], length : Int, action : WordInfo => Unit){
		entries.foreach(entry => trainTreeWords(tree,entry,length,action))
	}
	
	def trainTreeWords(tree : PrefixTree,words : Seq[String],length:Int,action : WordInfo => Unit){
		if(words.isEmpty) return;
		tree.addString(words, length, action, info => info.yescount + info.nocount > 5)
		trainTreeWords(tree,words.tail,length,action)
	}
	
	var yes = null : Seq[String]
	var no = null : Seq[String]
		
	// P(A|B) = P(B|A)*P(A)/P(B)  - bayes theorem
	// P(claim | features) = P(features | claim)*P(claim)/P(features)
	                    
    // Want P(makes-claim | has-features)
	// P(makes-claim * has-features) / P(has-features)
	// P(makes-claim) * P(has-features | makes-claim) / P(has-features)
	// propyes * pfeaturesyes / pfeatures
	def classify4(text : String) : Double = {
		val features = getFeatures(text.split("\\s"))
		val pclaim = countyes/(countyes + countno)
		var cfeatures = 0
		var cfeaturesclaim = 0
		features foreach {info =>
			cfeatures += info.yescount + info.nocount
			cfeaturesclaim += info.yescount
		}
		if(features.isEmpty){
			return pclaim			
		}else{
			return (cfeaturesclaim+0.0)/cfeatures
		}
	}
	def classify2(text : String) : Double = {
		val features = getFeatures(text.split("\\s"))
		val pclaim = countyes/(countyes + countno)
		var pfeatures = 1.0 : Double
		var pfeaturesclaim = 1.0 : Double
		features foreach {info =>
			pfeaturesclaim *= (info.yescount + 1) / (countyes + 1)
		    pfeatures *= (info.yescount+info.nocount+1) / (countno+countyes+1)
		}
		if(features.isEmpty){
			return pclaim
		}else{
			pclaim * pfeaturesclaim / pfeatures
		}
	}
	def classify3(text : String) : Double = {
		val features = getFeatures(text.split("\\s"))
		val totalcount = countyes + countno
		val pyes = countyes/totalcount
		val pno = 1-pyes
		var pfeatures = 1.0 : Double
		var pfeaturesyes = 1.0 : Double
		features foreach {info =>
		    if(info.yescount == 0){
		    	pfeaturesyes *= (1/totalcount)
		    }else{
		    	pfeaturesyes *= info.yescount / countyes
		    }
		    pfeatures *= (info.yescount + info.nocount) / totalcount 
		}
		if(features.isEmpty){
			return pyes
		}else{
			pyes * pfeaturesyes / pfeatures
		}
	}
	
	// total hack
	def classify(text : String) : Double = {
		val features = getFeatures(text.split("\\s"))
		val totalcount = countyes + countno		
		var pfeaturesno = 1.0 : Double
		var pfeaturesyes = 1.0 : Double
		features foreach {info =>
			if(info.yescount == 0){
				pfeaturesyes *= (1/totalcount)
			}else{
				pfeaturesyes *= info.yescount / countyes
			}
			if(info.nocount == 0){
				pfeaturesno *= (1/totalcount)
			}else{
				pfeaturesno *= info.nocount / countno
			}
		}
		if(features.isEmpty){
			return countyes / (countyes + countno)
		}else{
			pfeaturesyes / (pfeaturesyes + pfeaturesno)
		}
	}
			
			
			
//		var pfeaturesno = 1.0 : Double
//		var pfeaturesyes = 1.0 : Double
//		features foreach {info =>
//			pfeaturesyes *= (info.yescount + 1) / countyes
//		    pfeaturesno *= (info.nocount+1) / countno
//		}
//		if(features.isEmpty){
//			return countyes / (countyes + countno)
//		}else{
//			pfeaturesyes / (pfeaturesyes + pfeaturesno)
//		}
//	}
	
	def testClassify(data : Seq[String], classifier : String => Double) = {
		var included = 0;
		data foreach {text => 
			if(classify(text) > 0.5){
				included += 1
			}
		}
		included
	}
	
	def getFeatures(text : Seq[String]) : List[WordInfo] = {
		if(text.isEmpty){
			List()
		}else{
			tree.getMatches(text) match {
				case None => getFeatures(text.tail)
				case Some(info) => info :: getFeatures(text.tail)
			}
		}
	}
	
}
