package com.intel.thinkscala.crawl
import org.htmlcleaner._
import java.net.URL

// BUG: the Scala XML parser is not able to parse the XML for politifact

class Statement(val rating : String, val claim : String, val who : String, val url : String, val retort : String)

object Politifact {
	def crawl(page : Int) : Seq[Statement] = {
		val url = "http://politifact.com/truth-o-meter/statements/?page="+page
		val cleaner = new HtmlCleaner
		val doc = cleaner.clean(new URL(url))
		var scoretables = doc evaluateXPath "//div[@class='scoretableContainer']"
		val statements = scoretables map parseScoreTable
		return statements.filter(s => ratedFalse(s.rating))
	}
	
	def ratedFalse(s : String) = s match {
		case "False" => true
		case "Barely True" => true
		case "Pants on Fire!" => true
		case "Half-True" => true
		case _ => false
	}
	
	def parseScoreTable(statementobj : Any) : Statement = {
		val statement = statementobj.asInstanceOf[TagNode]
		val rating = xpathString(statement,"//div[@class='meter']//img/@alt")
		val claim = xpathString(statement,"//h2/text()")
		val url = "http://politifact.com"+xpathString(statement,"//div[@class='meter']/a/@href")
		val who = xpathString(statement,"//div[@class='mugshot']/img/@alt")
		val retort = xpathString(statement,"//p[@class='quote']/a/text()")
		new Statement(rating,claim,who,url,retort)
	}

	def xpathString(node : TagNode, path : String) : String =
		node.evaluateXPath(path)(0).toString
}
