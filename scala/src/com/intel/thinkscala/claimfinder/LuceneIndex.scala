package com.intel.thinkscala.claimfinder
import org.apache.lucene.document._
import org.apache.lucene.index._
import org.apache.lucene.search._
import org.apache.lucene.queryParser.QueryParser
import org.apache.lucene.store.FSDirectory
import org.apache.lucene.util.Version
import org.apache.lucene.analysis.standard.StandardAnalyzer
import java.io._
import scala.io.Source

object LuceneIndex {
	def docForLine(line : String) : Document = {
		val doc = new Document
		doc.add(new Field("contents", line, Field.Store.YES, Field.Index.ANALYZED))
		doc
	}
	
	def main(args : Array[String]){
		val infile = args(0)
		val outfile = args(1)
		val writer = new IndexWriter(FSDirectory.open(new File(outfile)),
			new StandardAnalyzer(Version.LUCENE_CURRENT), true, IndexWriter.MaxFieldLength.LIMITED )
		
		Source.fromFile(new File(infile)).getLines("\n").foreach{line => 			
			writer.addDocument(docForLine(line))
		}
		
		writer.optimize()
		writer.close
	}	
}

object LuceneSearch {
	def main(args : Array[String]){
		val indexfile = args(0)
		val reader = IndexReader.open(FSDirectory.open(new File(indexfile)))
		val searcher = new IndexSearcher(reader);
		val analyser = new StandardAnalyzer(Version.LUCENE_CURRENT)
		val parser = new QueryParser(Version.LUCENE_CURRENT, "contents", analyser)

		val in = new BufferedReader(new InputStreamReader(System.in,"UTF-8"))
		
		while(true){
			System.out.println("Enter query:")
			val input = in.readLine().trim
			System.out.println("Searching for : "+input)
			val query = parser.parse(input)
			
			val collector = TopScoreDocCollector.create(10, false)
			searcher.search(query,collector)
			System.out.println(collector.getTotalHits + " results")
			val hits = collector.topDocs().scoreDocs
			hits foreach {hit =>
				val doc = searcher.doc(hit.doc)
				System.out.println(hit.score + " - " + doc.get("contents"))
			}
		}
	}
	
}
