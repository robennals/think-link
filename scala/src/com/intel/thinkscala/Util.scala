package com.intel.thinkscala

import java.util.regex._;
import javax.servlet.http._;
import java.io._;
import com.intel.thinklink._;
import java.net._;
import scala.io._;
import scala.xml.parsing._;
import scala.xml._;
import org.apache.commons.lang._;
import scala.collection.Map;

object Util {
  
 def log(s : String) = System.out.println(s) 
  
 def encode(claim : String) = URLEncoder.encode(claim,"UTF-8")
 def decode(claim : String) = URLDecoder.decode(claim,"UTF-8")
 
 def mkUrl(path : String, args : Map[String,Any]) = 
    path + (args map {case (key,value) => key + "=" + encode(value.toString)}).mkString("?","&","")  

 
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
 
 def download(url : String) : String = {
   val connection = new URL(url).openConnection();
   val reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
   val str = readToString(reader);
   reader.close();
   return str;
 }	
 
 def getXML(url : String){
   val parser = ConstructingParser.fromSource(Source.fromURL(url),false);
   return parser.document();
 }

 def reduceUnicode(str_in : String) = {
   var str = str_in
   str = str.replace('\u2010','-');
   str = str.replace('\u2011','-');
   str = str.replace('\u2012','-');
   str = str.replace('\u2013','-');
   str = str.replace('\u2014','-');
   str = str.replace('\u2015','-');
   str = str.replace('\u2018','\'');
   str = str.replace('\u2019','\'');
   str = str.replace('\u201c','"');
   str = str.replace('\u201d','"');
   str = str.replace('\u201f','"');
   str
 }
 
 def normalizeString(str : String) = 
   str.replaceAll("\\s+"," ").replaceAll("^\\s*","").replaceAll("\\s*$","") 

 def getPath(req : HttpServletRequest) = req.getServletPath() + req.getPathInfo()
 
 def formatpat = """[^\?]\.(\w+)""".r
 
 def getFormat(req : HttpServletRequest) = {
   val m = formatpat.findAllIn(getPath(req))
   if(m.hasNext) m.group(1) else null
 }
 
 def trimString(s : String, maxlen : Int) = if(s.length > maxlen){
   s.substring(0,maxlen) + "..."
 }else{
   s
 }

 def flatMapWithIndex[A,B](l : Seq[A], f : (A,Int) => Iterable[B]) : Seq[B] = 
       zipWithIndex(l) flatMap {case (b,i) => f(b,i)}
 
 def zipWithIndex[A](l : Seq[A]) : Seq[(A,Int)] = {
   var res = List[(A,Int)]()
   var i = 0;
   l.foreach( x => {
     res = (x,i) :: res
     i+=1
   })
   res
 }
 
 // TODO: implement a generic output function
 def httpOutput(req : HttpServletRequest, res : HttpServletResponse, obj : Any){
   	res.setContentType("text/html; charset=UTF-8")
    req.setCharacterEncoding("UTF-8");

    val format = getFormat(req)
    val writer = res.getWriter
    format match {
      case "xml" => writer.append(printXML(obj))
      case "js" => {
		    var callback = req getParameter "callback" 
		    if(callback == null){
		      callback = "callback"
		    }
	        writer.append(callback + "(" + printJSON(obj) + ");")
        }
      case _ => writer.append(printJSON(obj))
    }   
    writer.close
 }
 
 def printJSON(obj : Any) : String = {
   obj match{
     case s : String => "\""+StringEscapeUtils.escapeJavaScript(s)+"\""
     case m : Map[_,_] => 
       (m.keySet.map (k => "\""+k+"\" : " + printJSON(m(k)))).mkString("{",",","}") 
     case l : Iterable[_] => (l map printJSON).mkString("[",",","]")
     case d : HasData => printJSON(d.data)
     case Some(s) => printJSON(s)
     case None => "null"
     case null => "null"
     case o => o.toString
   }
  }

  def printXML(obj : Any) : String = {
   obj match{
     case s : String => "\""+StringEscapeUtils.escapeJavaScript(s)+"\""
     case m : Map[_,_] => 
       (m.keySet.map (k => "<"+k+">" + printXML(m(k)) + "</"+k+">")).mkString("\n") 
     case l : Iterable[_] => 
       (l.map(x => "<item>"+printXML(x)+"</item>")).mkString("<list>","\n","</list>")
     case d : HasData => printXML(d.data)
     case null => ""
     case o => o.toString
    }
  }

  def printCSV(l : Iterable[Map[String,String]], keys : Iterable[String]) : String = 
    keys.mkString(",") + "\n" + 
    l.map(m => keys.map(k => StringEscapeUtils.escapeCsv(m(k))).mkString(",")).mkString("\n")
  
}
