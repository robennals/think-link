package com.intel.thinkscala.claimfinder
import scala.xml.{Node,NodeSeq}
import scala.xml.parsing._
import scala.io._
import java.io._
import com.intel.thinkscala.Util._
import collection.mutable.ListBuffer
import runtime.NonLocalReturnException
 
object ClaimFinder {
	val bossKey = "NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E";
	val bossSvr = "http://boss.yahooapis.com/ysearch/web/v1";
	
	def bossUrl(phrase : String, page : Int) = 
		bossSvr + "/"+encode(phrase)+"?appid="+bossKey+"&format=xml&count=50&start="+(page*50)
	
	def getUrls(phrase : String, page : Int) : Seq[String] = {
	    val url = bossUrl(phrase,page) 
	    val xmltext = download(url).replaceAll("\\]\\]+>","]]>")
	    val parser = ConstructingParser.fromSource(Source.fromString(xmltext),false)
	    val doc = parser.document   
	    val results = doc \\ "result"
	    val realstart = doc \\ "resultset_web" \ "@start" text;
	    if(realstart == (page * 50).toString){
	    	results map {result => result \ "url" text}    
	    }else{
	    	null   // we reached the end
	    }
	}

	def getAllUrls(query : String) : Seq[String] = {
		var allurls = new ListBuffer[String]
		for(i <- 0 until 20){
			val urls = getUrls(query,i)
			if(urls == null) return allurls;
			allurls.appendAll(urls)
			if(urls.length < 50) return allurls
		}
		return allurls
	}
	
	def getPhraseUrls(phrase : String, page : Int) : Seq[String] = 
		getUrls('"'+phrase+'"',page)	

	var basepath = "/home/rob/git/thinklink/output/claimfinder"
		
	def urlFileForPhrase(phrase : String){
		val filename = basepath+"/urlphrases/"+phrase.replace(" ","_")+".urls"
		if(fileExists(filename)) return
		val writer = new PrintWriter(new FileWriter(filename))
		val urls = getAllUrls('"'+phrase+'"')
		urls.foreach(url => writer.println(url))
		writer.close		
	}
	
	def getUrlsForAllPhrases(){
		phrases_that.foreach{phrase => 
			System.out.print("getting urls for phrase: "+phrase+"...")
			urlFileForPhrase(phrase)
			System.out.println("DONE")
			Thread.sleep(2000)
		}
	}	

	def urlFileForPhraseYear(phrase : String, year : Int){
		val filename = new File(basepath+"/urlphrases_year/"+year+"/"+phrase.replace(" ","_")+".urls")
		filename.getParentFile.mkdirs()
		if(filename.exists) return
		val writer = new PrintWriter(new FileWriter(filename))
		val urls = getAllUrls('"'+phrase+'"'+" +"+year)
		urls.foreach(url => writer.println(url))
		writer.close		
	}
	
	def getUrlsForAllPhrasesYear(year : Int){
		phrases_that.foreach{phrase => 
			System.out.print("getting urls for phrase: "+phrase+"...")
			urlFileForPhraseYear(phrase,year)
			System.out.println("DONE")
			Thread.sleep(2000)
		}
	}	

	def urlFileForPhraseDate(phrase : String, date : String){
		val filename = new File(basepath+"/urlphrases_date/"+date.replace(" ","_")+"/"+phrase.replace(" ","_")+".urls")
		filename.getParentFile.mkdirs()
		if(filename.exists) return
		val writer = new PrintWriter(new FileWriter(filename))
		val urls = getAllUrls('"'+phrase+'"'+" +\""+date+"\"")
		urls.foreach(url => writer.println(url))
		writer.close		
	}
	
	def getUrlsForDateRange(year : Int, month : String, daystart : Int, dayend : Int){
		for(day <- daystart to dayend){
			getUrlsForAllPhrasesDate(month + " " + day + " " + year)
		}
	}
	
	def getUrlsForAllPhrasesDate(date : String){
		phrases_that.foreach{phrase => 
			System.out.print("getting urls for phrase: "+phrase+"...")
			urlFileForPhraseDate(phrase,date)
			System.out.println("DONE")
			Thread.sleep(2000)
		}
	}	

	
	
	def getDomains(filename : String){
		val source = Source.fromFile(new File(filename))		
		val outfile = basepath+"domains.doms"
		val writer = new PrintWriter(new FileWriter(outfile))
		source.getLines("\n").foreach{url =>
			val domain = domainForUrl(url)
			writer.println(domain)
		}
		writer.close
	}
	
	val bad_firstwords = List(
			"they","this","he","she","their","the","we")
		
	val phrases_that = List(
			"into believing that",
			"people who think that",
			"people who believe that",
			"the misconception that",
			"the delusion that",
			"the myth that",
			"the mistaken belief that",
			"the fallacy that",
			"the lie that",
			"the false belief that",
			"the deception that",
			"the misunderstanding that",
			"false claim that",
			"false claim is that",
			"mistakenly believe that",
			"mistaken belief that",
			"the absurd idea that",
			"the hoax that",
			"the deceit that",
			"falsely claimed that",
			"falsely claiming that",
			"erroneously believe that",
			"erroneous belief that",
			"the fabrication that",
			"falsely claim that",
			"bogus claim that",
			"urban myth that",
			"urban legend that",
			"the fantasy that",
			"incorrectly claim that",
			"incorrectly claimed that",
			"incorrectly believe that",
			"stupidly believe that",
			"falsely believe that",
			"wrongly believe that",
			"falsely suggests that",
			"falsely claims that",
			"falsely stated that",
			"absurdity of the claim that",
			"false ad claiming that",
			"crazies who believe that"
			)
			
	 val phrases_nothat = phrases_that map (phrase => phrase.replace(" that",""))
	
			
}


