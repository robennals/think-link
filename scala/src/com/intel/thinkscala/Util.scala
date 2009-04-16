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

object Util {
 def encode(claim : String) = URLEncoder.encode(claim,"UTF-8");
 
 def readToString(reader : BufferedReader) : String = {
   val buf = new StringBuffer("");
   var line = reader.readLine(); 
   while(line != null){
     buf.append(line);
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

 def getPath(req : HttpServletRequest) = req.getServletPath() + req.getPathInfo()
 
 def formatpat = """[^\?]\.(\w+)""".r
 
 def getFormat(req : HttpServletRequest) = {
   val m = formatpat.findAllIn(getPath(req))
   if(m.hasNext) m.group(1) else null
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
       (m.keySet.map (k => "'"+k+"' : " + printJSON(m(k)))).mkString("{",",","}") 
     case l : Iterable[_] => (l map printJSON).mkString("[",",","]")
     case d : HasData => printJSON(d.data)
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
}
