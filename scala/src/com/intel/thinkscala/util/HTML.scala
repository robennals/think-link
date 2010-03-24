package com.intel.thinkscala.util
import scala.collection.mutable.ArrayBuffer
import org.apache.commons.lang.StringEscapeUtils._;
import com.intel.thinkscala._
import Util.download

class Node
case class Text(val text : String) extends Node
case class Tag(val tag : String) extends Node

object HTML {
	def stripBadStuff(html : String) : String = {
		var str = html 
	    str = str.replaceAll("<!--.*-->","")
		str = str.replaceAll("(?s:<script.*?>.*?</script>)","")
		str = str.replaceAll("(?s:<style.*?>.*?</style>)","")
		str
	}
	
	def boing(hey : String) : String = hey
	
	
	def parse(html : String) : ArrayBuffer[Node] = {
	    val str = stripBadStuff(html)
		val nodes = new ArrayBuffer[Node]
		var pos = 0
		var startpos = 0
		var intag = false
		while(pos < str.length){
			val c = str(pos)
			c match {
				case '<' => {
					if(!intag){
						val text = unescapeHtml(str.substring(startpos,pos).replaceAll("\\s+"," "))
						if(text != " " && text != ""){
							nodes += new Text(text)
						}
					}
					nodes += new Tag(tagName(str,pos+1).toLowerCase)
					intag = true;
				}
				case '>' => {
					intag = false;
					startpos = pos+1;					
				}
				case _ => () // do nothing 
			}
			pos += 1
		}		                          
		nodes
	}
	
	def bodyForUrl(url : String) : String = getBody(parse(download(url)))
	
	def isArticleStart(lastlink : Boolean, len : Int) =
		(!lastlink && len > 70) || (len > 200)
	
	def getBody(nodes : ArrayBuffer[Node]) : String = {
		var started = false
		var body = false
		val buf = new StringBuffer
		var lastlink = false
		nodes.foreach {node => node match {
			case Tag("body") => {body = true}
			case Tag("a") => lastlink = true
			case Text(text) if (body && (isArticleStart(lastlink,text.length) || started)) => {
				started = true
				buf.append(text)
				if(buf.length > 10000){
					return buf.toString
				}
				lastlink = false
			}
			case Tag(tag) if(started && tagIsNewline(tag)) => {
				buf.append("\n")
				lastlink = false
			}
			case _ => lastlink = false
		}}
		buf.toString
	}
	
	def getBody2(nodes : ArrayBuffer[Node], foo : String) : String = {
		var started = false
		var body = false
		val buf = new StringBuffer
		var lastlink = false
		
		var trialfirst : String = null
		
		nodes.foreach {node => node match {
			case Tag("body") => body = true
			case Tag("a") => lastlink = true
			case Text(text) if(body) => {
				if(isArticleStart(lastlink,text.length)){
					if(trialfirst != null){
						buf.append(trialfirst)
						started = true							
					}else{
						trialfirst = text
					}
				}else{
					trialfirst = null
				}
				if(started){
					buf.append(text)
				}
				lastlink = false
			}
			case Tag(tag) if(tagIsNewline(tag)) => {
				buf.append("\n")
				lastlink = false
			}
			case _ => lastlink = false
		}}
		buf.toString.replaceAll("\n+","\n")
	}
		
	def tagIsNewline(tagname : String) = tagname match {
		case "p" => true
		case "br" => true
		case "h1" => true
		case "h2" => true
		case "h3" => true
		case "h4" => true
		case "div" => true
		case "blockquote" => true
		case "center" => true
		case _ => false
	}
	
	def tagName(html : String, start : Int) : String = {
		var buf = new StringBuffer
		var pos = start;
		if(html(pos) == '/'){
			pos += 1
		}
		while(pos < html.length && html(pos).isLetterOrDigit){
			buf.append(html(pos))
			pos += 1 
		}
		buf.toString		
	}
}
