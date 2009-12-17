package com.intel.thinkscala.claimfinder

import java.io._
import java.net._
import scala.collection.mutable.ListBuffer
import com.intel.thinkscala.Util._


class UrlClaim(val url : String, val title : String, val claim : String, val context : String){
	override def toString = claim
}

object ExtractClaims {
	def main(args : Array[String]){
		val claims = extractClaimsFromUrl("http://www.blogrunner.com/snapshot/D/0/5/wnd_falsely_claimed_alleged_fort_hood_shooter_advised_obama_transition/")
	}
	
	val phrase_regexps = ClaimFinder.phrases_that.map{phrase =>
		(phrase + " ([^.!?])").r
	}

	// we may have more than one match in the same file
	def extractClaimsFromUrl(url : String) : Seq[UrlClaim] = {
		var claims = new ListBuffer[UrlClaim]
		val html = downloadUrlStart(url).toLowerCase
		val content = htmlToSentences(html)
		val title = getTitle(html)
		ClaimFinder.phrases_nothat.foreach{prefix => 
			val phrase_claims = findPrefix(content,prefix,url,title)
			claims.appendAll(phrase_claims)
		}
		claims
	}
	
	val titleregexp = "<title[^\\>]*>([^\\<]*)</title>".r

	def findPrefix(content : String, prefix : String, url : String, title : String) : Seq[UrlClaim] = {
		var start = content.indexOf(prefix)
		val claims = new ListBuffer[UrlClaim]
		while(start != -1){
			val end = findStatementEnd(content,start+prefix.length+1)
			val statement = content.substring(start+prefix.length, end)
			val context = trimPartWords(fuzzySubstring(content,start-500,end+500))
			claims.append(new UrlClaim(url,title,statement,context))
			start = content.indexOf(prefix,start+1)
		}
		claims
	}
	
	
	val endTokens = List(".","!","?"," but "," despite "," although "," even though "," however ",
			";",":"," as opposed to "," in "," when ")
	
	def findStatementEnd(content : String, start : Int) = {
		val positions = endTokens.map{token => 
			val pos = content.indexOf(token,start) 
			if(pos != -1 && pos - start > 20) pos else content.length - 1
		}
		positions reduceLeft Math.min
	}

	
		
	def getTitle(content : String) = {
		titleregexp.findFirstMatchIn(content) match {
			case Some(m) => m.group(1)
			case _ => null
		}
	}

	def downloadUrlStart(url : String) : String = {
		val connection = new URL(url).openConnection
		val reader = new BufferedReader(new InputStreamReader(connection.getInputStream))
		val buf = new StringBuffer("")
		var line = reader.readLine()
		while(line != null && buf.length() < 100000){
			buf.append(line)
			buf.append("\n")
			line = reader.readLine()
		}
		reader.close()
		return buf.toString
	}
	
	
	
	def readToString(reader : BufferedReader) : String = {
   val buf = new StringBuffer("");
   var line = reader.readLine(); 
   while(line != null){
     buf.append(line);
     buf.append("\n")
     line = reader.readLine();
   }
   return buf.toString;   
 }
 
// def readToString(in : InputStream) : String = readToString(new BufferedReader(new InputStreamReader(in)))
 
 def readFileToString(in : java.io.File) : String = readToString(new BufferedReader(new FileReader(in)))
 
 def download(url : String) : String = {
   val connection = new URL(url).openConnection();
   val reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
   val str = readToString(reader);
   reader.close();
   return str;
 }	
 

}


