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
  
 def printJSON(obj : Any) : String = {
   obj match{
     case s : String => "\""+StringEscapeUtils.escapeJavaScript(s)+"\""
     case m : Map[_,_] => 
       (m.keySet.map (k => "'"+k+"' : " + printJSON(m(k)))).mkString("{",",","}") 
     case l : Iterable[_] => (l map printJSON).mkString("[",",","]")
     case o => o.toString
   }
 }
 
// def intersperse[A](l : Iterable[A], sep : A) : List[A] = {
//   var out : List[A]= List()
//   var first = true
//   l.foreach(x => {
//     if(first){
//       first = false
//     }else{
//       out = sep :: out
//     }
//     out = x :: out
//   })
//   out.reverse
// }
 
}
