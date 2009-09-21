package com.intel.thinkscala.learn
import com.intel.thinkscala._
import com.intel.thinkscala.Util._
import scala.xml.NodeSeq;
import scala.xml.Node;
import scala.xml.parsing._;
import scala.io.Source;
import org.apache.commons.lang._;
import scala.collection.mutable.HashSet;
import scala.collection.mutable.HashMap;


object Paraphraser {
    val bossKey = "NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E";
    val bossSvr = "http://boss.yahooapis.com/ysearch/web/v1";

	def searchBoss(text : String, page : Int) : NodeSeq = {
	    val url = bossSvr + "/"+encode(text)+"?appid="+bossKey+"&format=xml&abstract=long&start="+(page*50)+"&count=50"
	    val xmltext = download(url).replaceAll("\\]\\]+>","]]>")
	    val parser = ConstructingParser.fromSource(Source.fromString(xmltext),false)
	    parser.document \\ "result"
	}
	
	def searchBigBoss(text : String) : NodeSeq = 
		searchBoss(text,0) ++ searchBoss(text,1) ++ searchBoss(text,2) ++ searchBoss(text,3)

//		searchBoss(text,0) ++ searchBoss(text,1) ++ searchBoss(text,2) ++ searchBoss(text,3) ++ searchBoss(text,4) ++ searchBoss(text,5) ++ searchBoss(text,6) ++ searchBoss(text,7)

			
	def getSentences(xml : NodeSeq) : Seq[String] = {
		val abstracts : Seq[Node] = xml \\ "abstract"
		(abstracts flatMap (abs => splitSentences(abs.text.replaceAll("</?b>","")))) map (_.replaceAll("[^\\s\\w]"," ").replaceAll("\\s+"," ").toLowerCase)
	}

	def textWords(sentence : String) : Seq[String] = (sentence toLowerCase) split "\\s+"
	
	def wordSet(words : Seq[String]) : HashSet[String] = {
		val set = new HashSet[String]()
		words foreach (set += _)
		set		                      
	}
//		
	def sentenceScore(sentence : String, phraseset : HashSet[String]) : Int = {
		val words = textWords(sentence)
		val goodwords = words filter (phraseset contains _) 
		goodwords.length		
	}
	
	def trimSentence(sentence : String, phraseset : HashSet[String]) : String = {
		val words = textWords(sentence)
		if(words.length == 0) return ""
		var start = 0
		var end = words.length - 1
		while(!phraseset.contains(words(start)) && start < words.length - 1) start+= 1
		while(!phraseset.contains(words(end)) && end > 0) end -= 1
		val goodwords = words.slice(start,end+1)
		return goodwords.mkString(" ")
	}
	
	def makeUnique[A](xs : List[A]) : List[A] = {
		val set = new HashSet[A]()
		xs foreach {x => set += x}
		set toList
	}
	
	def hasAll(sentence : String, phraseset : HashSet[String]) : Boolean = {
		phraseset foreach {word =>
			if(!sentence.contains(word)){
				return false;
			}
		}
		return true;
	}
	
	var scores : HashMap[String,Int] = null
	var counts : HashMap[String,Int] = null
	         
	def printList(xs : Seq[String]) = xs foreach {x =>
		System.out.println(counts(x) + ":" + x) 
	}
	
	def paraphrases(phrase : String, extrawords : String) : Seq[String] = {
		val bossxml = searchBigBoss(phrase)
		val phraseset = wordSet(textWords(phrase) filter (s => !Data.stopwords.contains(s)))
		var sentences = getSentences(bossxml) filter (s => !s.contains(phrase))
		if(!phrase.contains("not")){
			sentences = sentences filter (s => ! s.contains("not"))
		}
		sentences = sentences map (s => trimSentence(s,phraseset))
//		sentences = sentences filter (s => hasAll(s,phraseset))
		counts = new HashMap[String,Int]()
		scores = new HashMap[String,Int]()
		sentences foreach {sentence => 
			if(counts contains sentence){
				counts(sentence) += 1
			}else{
				counts(sentence) = 1
				scores(sentence) = sentenceScore(sentence,phraseset)
			}		
		}
//		def weight(s : String) = scores(s) * scores(s) * counts(s) 
		makeUnique(sentences.toList) sort {(x,y) => 
			if(scores(x) > scores(y)) true
			else counts(x) > counts(y)
		}
	}
}
