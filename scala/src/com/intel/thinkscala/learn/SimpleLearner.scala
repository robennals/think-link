package com.intel.thinkscala.learn
import scala.collection.mutable.HashMap
import com.intel.thinkscala.Datastore

class WordInfo(val parent : PrefixTree, val tailword : String) {
	var yescount = 0
	var nocount = 0
	var nextlevel = null : PrefixTree
	// P(x | y) = P(x and y)/P(x)
	override def toString = matchString + " : " + yescount + "/" + nocount + " - " + importance
	def importance = Math.max(yescount / (yescount+nocount+1.0),nocount / (yescount+nocount+1.0)) 

	// P(features | yes) - if class is yes, how likely this would be present
	def score(totalyes : Double, totalno : Double) = {
		val lfeatures = Math.log(yescount + nocount) - Math.log(totalno + totalyes)
		val k = (totalyes + totalno)/(0.0 + yescount + nocount) 
		(1.0+yescount)/(k + totalyes)
	}

	def scoreYes(totalyes : Double, totalno : Double) = {
		val lfeatures = Math.log(yescount + nocount) - Math.log(totalno + totalyes)
		val k = (totalyes + totalno)/(0.0 + yescount + nocount) 
		(1.0+yescount)/(k + totalyes)
	}

	def scoreNo(totalyes : Double, totalno : Double) = {
		val lfeatures = Math.log(yescount + nocount) - Math.log(totalno + totalyes)
		val k = (totalyes + totalno)/(0.0 + yescount + nocount) 
		(1.0+nocount)/(k + totalno)
	}
	
	def matchString = {
		var str = ""
		var wi = this
		while(wi != null){
			str = wi.tailword + " " + str
			wi = wi.parent.parent
		}
		str
	}
}

class PrefixTree(val parent : WordInfo) extends HashMap[String,WordInfo] {
	def hello = 3
	
	def addString(s : Seq[String], length : Int, action : WordInfo => Unit, good : WordInfo => Boolean){
		if(s.isEmpty || length == 0) return;
		val wordinfo = getOrElseUpdate(s.head,new WordInfo(this,s.head))
		if(length == 1){
			action(wordinfo)
		}
		if(length > 1 && good(wordinfo)){
			if(wordinfo.nextlevel == null){
				wordinfo.nextlevel = new PrefixTree(wordinfo)
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
			println(x._2)
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
	
	def dumpStatus = tree.dumpBest
	
	def train(yes : Seq[String], no : Seq[String]){
		tree = new PrefixTree(null)
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
	def classify(text : String) : Double = {
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
	// Using count of features 
	// P(makes-claim | has-features) = P(makes-claim) * P(has-features | makes-claim) / P(has-features)
	// can ignore P(has-features) as same for makes and doesn't make
	// so compare P(makes-claim) * PROD_i[p(feature_i | makes-claim)) 
	// vs P(not-claim) * PROD_i[p(feature_i | not-claim)]
		// log both sides
	// P(makes-claim) * PROD_i[p(feature_i | makes-claim)]
	//   = log(P(makes-claim)) + SUM_i[log(p(feature_i | makes-claim))]
	
	// how many total features match claims? 
	// P(feature_i | makes-claim) = count_ic + 1 / 
	
	// confidence figures? that matters is the difference between the two?
	// do we want to unlog and get back to percentage?
	
	def classifyLog2(text : String) : Double = {
		val features = getFeatures(text.split("\\s"))
		val pyes = countyes/(countyes + countno)
		var lfeatures = 0.0 : Double
		var lfeaturesclaim = 0.0 : Double
		features foreach {info => 
			if(info.yescount != 0){
				lfeaturesclaim += Math.log(info.yescount) - Math.log(countyes)
			}else{
				lfeaturesclaim += Math.log(1) - Math.log(countno + countyes)
			}
			lfeatures += Math.log(info.yescount + info.nocount) - Math.log(countno + countyes)
		}
		return Math.exp(Math.log(pyes) + lfeaturesclaim - lfeatures)
	}
	
	def textFeatures(text : String) = getFeatures(text.split("\\s"))
	
	def bestFeatures(text : String) = 
		textFeatures(text).sort((x,y) => x.score(countyes,countno) > y.score(countyes,countno)) 
	
	// P(makes-claim | features) = P(claim) * P(features | claim)/P(has-features)
    // = P(claim) * PROD_i[P(feature_i | claim)/p(feature_i)]
    // = P(claim) * exp(log(PROD_i[P(feature_i | claim)/p(feature_i)])
	// = P(claim) * exp(SUM[log(....)]))
	def classifyLog(text : String) : Double = {
		val features = textFeatures(text)
		val pclaim = countyes/(countyes + countno)
		var logsum = 0.0 
		var lfeaturesclaim = 0.0
		var lfeatures = 0.0
		features foreach {info => 
			lfeaturesclaim += Math.log(info.score(countyes,countno))
			lfeatures += Math.log(info.yescount + info.nocount) - Math.log(countno + countyes)
		}
		return Math.exp(Math.log(pclaim) + lfeaturesclaim - lfeatures)
	}

	def logYes(text : String) : Double = {
		val features = textFeatures(text)
		var logsum = 0.0
		var lfeatures = 0.0
		val pyes = countyes/(countyes + countno)
		features foreach {info =>
			logsum += Math.log(info.scoreYes(countyes,countno)) 
			lfeatures += Math.log(info.yescount + info.nocount) - Math.log(countno + countyes)
		}
		Math.log(pyes) + logsum - lfeatures
	}

	def logNo(text : String) : Double = {
		val features = textFeatures(text)
		var logsum = 0.0
		var lfeatures = 0.0
		val pno = countno/(countyes + countno)
		features foreach {info =>
			logsum += Math.log(info.scoreNo(countyes,countno)) 
			lfeatures += Math.log(info.yescount + info.nocount) - Math.log(countno + countyes)
		}
		Math.log(pno) + logsum - lfeatures
	}
	
	def logDiff(text : String) : Double = logYes(text) - logNo(text)
	
	def bestSentence(xs : Seq[String]) : String = {
		val scored = xs.toList map {x => (logDiff(x),x)}
		val sorted = scored sort {(x,y) => x._1 > y._1}
		sorted.head._2
	}
	
	def classifyBool(text : String) = logYes(text) > logNo(text)
	
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
