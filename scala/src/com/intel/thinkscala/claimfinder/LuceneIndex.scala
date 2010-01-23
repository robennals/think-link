package com.intel.thinkscala.claimfinder
import com.intel.thinkscala.Util._
import org.apache.lucene.document._
import org.apache.lucene.index._
import org.apache.lucene.search._
import org.apache.lucene.queryParser.QueryParser
import org.apache.lucene.store.FSDirectory
import org.apache.lucene.util.Version
import org.apache.lucene.analysis.standard.StandardAnalyzer
import org.apache.lucene.analysis.snowball.SnowballAnalyzer 
import org.apache.lucene.analysis.TokenStream
import org.apache.lucene.analysis.StopAnalyzer
import org.apache.lucene.analysis.tokenattributes._
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.ListBuffer
import java.io._
import scala.io.Source

object LuceneIndex {
	def docForLine(line : String) : Document = {
		val doc = new Document
		doc.add(new Field("contents", line, Field.Store.YES, Field.Index.ANALYZED))
		doc
	}
	
	def addDocForFullLine(writer : IndexWriter, line : String){
		val cols = line.split("\t")
		if(cols.length != 4) return
		val doc = new Document
		doc.add(new Field("url", cols(0), Field.Store.YES, Field.Index.NO))
		doc.add(new Field("title", cols(1), Field.Store.YES, Field.Index.NO))
		doc.add(new Field("claim", cols(2), Field.Store.YES, Field.Index.ANALYZED))
		doc.add(new Field("contents", cols(3), Field.Store.YES, Field.Index.NO))
		writer.addDocument(doc)
	}
	
	def main(args : Array[String]){
		val infile = args(0)
		val outfile = args(1)
		val writer = new IndexWriter(FSDirectory.open(new File(outfile)),
			new SnowballAnalyzer(Version.LUCENE_CURRENT,"English"), true, IndexWriter.MaxFieldLength.LIMITED )
		
		Source.fromFile(new File(infile)).getLines("\n").foreach{line => 			
			addDocForFullLine(writer,line)
//			writer.addDocument(docForLine(line))
		}
		
		writer.optimize()
		writer.close
	}	
}

// how similar are these two phrases?
// used for clustering, and for determining if something is disputed
// ideally want to pick a good known paraphrase algorithm
object PhraseCompare {
	val anal = new SnowballAnalyzer(Version.LUCENE_CURRENT,"English",stopWords)	
	
	def stopWords : Array[String] = {
		val set = StopAnalyzer.ENGLISH_STOP_WORDS_SET
		val arr = new Array[String](set.size)
		set.toArray(arr)
		arr
	}
	
	// based on "A metric for paraphrase detection"
	def similarityLCP(phrase : String, other : String) : Double = {
		val phrasetokens = tokens(phrase)
		val othertokens = tokens(other)
		var bestscore = 0.0
		for(i <- 1 to 4){
			val phrasengrams = ngrams(phrasetokens,i)
			val otherngrams = ngrams(othertokens,i)			
			val overlap = phrasengrams.filter(ngram => otherngrams contains ngram)
			val count_match = overlap.length.asInstanceOf[Double]
			val count_total = phrasengrams.length + otherngrams.length - count_match
			if(count_total > 0){
				val score = count_match / count_total
				bestscore = Math.max(bestscore,score)
			}
		}		
		return bestscore
	}	

	// based on "A metric for paraphrase detection"
	// seems to give pretty poor results
	def similarityNgram(phrase : String, other : String) : Double = {
		val phrasetokens = tokens(phrase)
		val othertokens = tokens(other)
		var sumscore = 0.0
		val maxn = Math.min(4,phrasetokens.length)
		for(i <- 1 to maxn){
			val phrasengrams = ngrams(phrasetokens,i)
			val otherngrams = ngrams(othertokens,i)			
			val overlap = phrasengrams.filter(ngram => otherngrams contains ngram)
			val count_match = overlap.length.asInstanceOf[Double]
			val count_total = phrasengrams.length + otherngrams.length - count_match
			val score = count_match / count_total
			sumscore += score
		}		
		return sumscore / maxn
	}
	
	def similarityHasAll(phrase : String, other : String) : Boolean = {
		val phrasetokens = tokens(phrase)
		val othertokens = tokens(other)
		!phrasetokens.exists(token => !othertokens.contains(token))
	}
	
	def similarityHasAllSameNeg(phrase : String, other : String) : Boolean 
		= similarityHasAll(phrase,other) && sameNeg(phrase,other)
	
	def isNeg(phrase : String) = words(phrase).contains("not") || phrase.contains("n't")	
	def sameNeg(phrase : String, other : String) : Boolean = isNeg(phrase) == isNeg(other)
	
	// based on "A word overlap baseline for the recognizing textual entailment task"
	// TODO: remove stopwords
	def similarityWordOverlap(phrase : String, other : String) : Double = {
		val phrasetokens = tokens(phrase)
		val othertokens = tokens(other)
		val overlap = phrasetokens.filter(word => othertokens contains word)
		val wordoverlap = overlap.length
		val p = wordoverlap.asInstanceOf[Double] / phrasetokens.length
		val r = wordoverlap.asInstanceOf[Double] / othertokens.length
		if(p + r > 0){
			(2.0 * p * r)/(p+r)
		}else{
			0.0
		}
	}
	
	def isSimilar(phrase : String, other : String) = similarityHasAllSameNeg(phrase,other)
	
	def words(phrase : String) : Seq[String] = phrase.split("\\s+")
	
	def ngrams(words : Seq[String], n : Int) : Seq[String] = {
		val ngrams = new ListBuffer[String]
		for(i <- 0 to words.length - n){
			ngrams += words.slice(i,i+n).mkString(" ")
		}
		ngrams
	}
			
	def tokens(phrase : String) : Seq[String] = {
		val r = new StringReader(phrase.replace("n't",""))
		val s = anal.tokenStream("contents",r)
		val b = new ArrayBuffer[String]
		while(s.incrementToken){
			b += s.getAttribute(classOf[TermAttribute]).term
		}
		b
	}
}

object LuceneSearch {
	def getResults(indexfile : String, query : String) : Array[Document] = {
		val reader = IndexReader.open(FSDirectory.open(new File(indexfile)))
		val searcher = new IndexSearcher(reader);
		val analyser = new SnowballAnalyzer(Version.LUCENE_CURRENT,"English")
		val parser = new QueryParser(Version.LUCENE_CURRENT, "claim", analyser)

		val input = query.trim
		val collector = TopScoreDocCollector.create(20, false)
		searcher.search(parser.parse(input),collector)
		val hits = collector.topDocs().scoreDocs
		val results = hits.map {hit =>
			searcher.doc(hit.doc)
		}
		reader.close
		results		
	}
	
	def isDisputed(indexfile : String, text : String) : Boolean = {
		val results = getResults(indexfile,text)
		results exists (doc => PhraseCompare.isSimilar(doc.get("claim"),text))
	}
	
	def main(args : Array[String]){
		val in = new BufferedReader(new InputStreamReader(System.in,"UTF-8"))
		while(true){
			System.out.println("Enter query:")
			val input = in.readLine()
			System.out.println("Searching for : "+input)
			val results = getResults(args(0),input)
			results foreach {doc =>
				System.out.println(doc.get("claim") + "\n\t" + domainForUrl(doc.get("url")) + " - "
						+ doc.get("title"))
			}
		}
//		
//		val indexfile = args(0)
//		val reader = IndexReader.open(FSDirectory.open(new File(indexfile)))
//		val searcher = new IndexSearcher(reader);
//		val analyser = new StandardAnalyzer(Version.LUCENE_CURRENT)
//		val parser = new QueryParser(Version.LUCENE_CURRENT, "contents", analyser)
//
//		val in = new BufferedReader(new InputStreamReader(System.in,"UTF-8"))
//		
//		while(true){
//			System.out.println("Enter query:")
//			val input = in.readLine().trim
//			System.out.println("Searching for : "+input)
//			val query = parser.parse(input)
//			
//			val collector = TopScoreDocCollector.create(20, false)
//			searcher.search(query,collector)
//			System.out.println(collector.getTotalHits + " results")
//			val hits = collector.topDocs().scoreDocs
//			hits foreach {hit =>
//				val doc = searcher.doc(hit.doc)
//				System.out.println(hit.score + " - " + doc.get("contents"))
//			}
//		}
	}
	
}
