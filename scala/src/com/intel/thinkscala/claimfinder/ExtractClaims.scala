package com.intel.thinkscala.claimfinder

import java.io._
import java.net._
import scala.collection.mutable.ListBuffer
import scala.collection.mutable.HashMap
import scala.collection.mutable.HashSet
import com.intel.thinkscala.Util._
import com.intel.thinkscala.util.Dataflow._
import com.intel.thinkscala.util.TabData

class UrlClaim(val url : String, val title : String, val claim : String, val context : String) extends Object with TabData{
	override def toString = claim
	override def getTabLine = tabLine(url,title,claim,context) 
}

object ExtractClaims {
	def main(args : Array[String]){
		val infile = args(0)
		val outfile = args(1)
		extractAllClaims(infile,outfile)
	}
		
	val phrase_regexps = ClaimFinder.phrases_that.map{phrase =>
		(phrase + " ([^.!?])").r
	}

	// we may have more than one match in the same file
	def extractClaimsFromUrl(url : String) : Seq[UrlClaim] = {
		var claims = new ListBuffer[UrlClaim]
		val html = downloadUrlStart(url).toLowerCase
//		val content = htmlToSentences(html)
		val content = html.replaceAll("\\s+", " ")
		val title = getTitle(html)
		ClaimFinder.phrases_that.foreach{prefix => 
			val phrase_claims = findPrefix(content,prefix,url,title)
			claims.appendAll(phrase_claims)
		}
		removeDuplicates(claims)
	}
	
	def removeDuplicates(claims : Seq[UrlClaim]) : Seq[UrlClaim] = {
		val map = new HashMap[String,UrlClaim]
		claims foreach {x =>
			if(!map.isDefinedAt(x.claim)){
				map(x.claim) = x
			}
		}
		map.valuesIterator.toList
	}
		
	def extractAllClaims(infile : String,outfile : String) = 
		mapFile(infile,outfile,extractClaimsFromUrl)
			
	val titleregexp = "<title[^\\>]*>([^\\<]*)</title>".r

	def findPrefix(content : String, prefix : String, url : String, title : String) : Seq[UrlClaim] = {
		var start = content.indexOf(prefix)
		val claims = new ListBuffer[UrlClaim]
		while(start != -1){
//			val end = findStatementEnd(content,start+prefix.length+1)
			val end = content.indexOf('.',start+prefix.length+1)
			val statement = content.substring(start+prefix.length, end)
			val context = trimPartWords(fuzzySubstring(content,start-500,start+500))
			claims.append(new UrlClaim(url,title,normalizeString(statement),context))
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
			case Some(m) => m.group(1).replaceAll("\\s+"," ")
			case _ => null
		}
	}

	def downloadUrlStart(url : String) : String = {
		val connection = new URL(url).openConnection
		connection.setConnectTimeout(10000)
		connection.setReadTimeout(10000)
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

}


