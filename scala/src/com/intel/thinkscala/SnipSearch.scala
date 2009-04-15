package com.intel.thinkscala
import java.util.regex._;
import javax.servlet.http._;
import java.io._;
import java.net._;
import com.intel.thinklink._;
import com.intel.thinkscala.Util._;
import scala.xml._;
import scala.xml.parsing._;
import scala.io._;
import org.apache.commons.lang._;
import scala.concurrent.ops._;

class SnipInfo(val snip: String, val context: String, success : Boolean){
  def show = {
    if(success){
      System.out.println("found: "+snip)
    }else{
      System.out.println("not found:"+snip)
    }
  }
}

class SnipUrlRes(val snips: Array[SnipInfo], val url: String){
  def show = {
    System.out.println("-- "+url+" --")
    snips.foreach(x => x.show)
  }
}

class SnipSearch extends HttpServlet {
  override def doGet(req : HttpServletRequest, res : HttpServletResponse) {
    val claim = req getParameter "claimstr"
    SnipSearch.searchYahoo(claim)
  }
}    
  // TODO: make HTTP requests concurrently using Futures
 
object SnipSearch {
  val bossKey = "NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E";
  val bossSvr = "http://boss.yahooapis.com/ysearch/web/v1";
  
  def searchYahoo(claim : String) : Seq[SnipUrlRes] = {
    val url = bossSvr + "/"+encode(claim)+"?appid="+bossKey+"&format=xml&abstract=long"
    val parser = ConstructingParser.fromSource(Source fromURL url,false)
    val doc = parser.document   
    val results = doc \\ "result"
    val futures = results map (x => future(snipForResult(x)))
    val snips = futures.map(f => f())
    snips.foreach(x => x.show)
    return snips;   
  }
 
  def snipForResult(result : Node) = {
    var fragments = ((result \ "abstract").text).split("<b>...</b>").map(cleanString)    
//    var abstext = cleanString((result \ "abstract").text)
//    var fragments = abstext.split("""\.""").filter(a => a.length > 15)
    val url = (result \ "url").text
//    System.out.println(" --- "+url+" ---")
    try{
	    val pagetext = htmlToString(download(url))
	    var expanded = fragments.flatMap(frag => expandSentence(pagetext,trimEnds(frag)))
	    new SnipUrlRes(expanded,url)
    }catch{
      case e => e.printStackTrace(); null
    }
  }

  def expandSentence(pagetext : String, fragment : String) : Array[SnipInfo] = {
    var start = reduceUnicode(pagetext).indexOf(reduceUnicode(fragment))
    if(start == -1){
//      System.out.println(">> splitting: "+fragment);
      var parts = fragment.split("\\.").filter(a => a.length > 15)
      if(parts.length > 1){
        return parts.flatMap(frag => expandSentence(pagetext,frag))
      }else{
//        System.out.println("not found: "+fragment);
        return Array(new SnipInfo(fragment,null,false))
      }
    }
    var end = start + fragment.length - 1
    while(!isStop(pagetext(start)) && start > 0){
      start-=1
    }
    while(!isStop(pagetext(end)) && end <= pagetext.length){
      end+=1
    }
    if(isStop(pagetext(start))){
      start+=1;
    }
    val quote = pagetext.substring(start,end)
//    System.out.println("found: "+fragment)
    return Array(new SnipInfo(fragment,quote,true))
  }
    
  def isStop(c : Char) = c == '.' || c == '!' || c == '?' || c == '*' || c == '|' || c == ')'
  
  def firstQuote(str : String) = str.replaceAll("""\.\.\..*""","");
  
  def trimEnds(str : String) = str.replaceAll("^\\s+","").replaceAll("\\s+$","")
  
  def cleanString(str : String) = 
    str.replace("<b>","").replace("</b>","").replace("<wbr>","");
 
  def htmlToString(html : String) : String = {
    var str = html;
    str = str.replaceAll("(?s:<script.*?>.*?</script>)","");
    str = str.replaceAll("(?s:<style.*?>.*?</style>)","");
    str = str.replaceAll("</title>",". ");
    str = str.replaceAll("</h.>",". ");
    str = str.replaceAll("</?p>",". ");
    str = str.replaceAll("(?s:<![.*?]]>)","");
    str = str.replaceAll("(?s:<.*?>)","");
    str = str.replaceAll("\\s+"," ");
    str = str.replaceAll("\\.[\\.\\s]+",". ");
    str = str.replaceAll("\\?[\\.\\s]+","? ");
    str = str.replaceAll("\\![\\.\\s]+","! ");
    str = str.replaceAll("\\,[\\.\\s]+",", ");
    str = StringEscapeUtils.unescapeHtml(str);     
    return str;
  }

  def htmlToNewlineString(html : String) : String = {
    var str = html;
    str = str.replaceAll("(?s:<script.*?>.*?</script>)","");
    str = str.replaceAll("(?s:<style.*?>.*?</style>)","");
    str = str.replaceAll("\\s+"," ");
    str = str.replaceAll("</title>","\n");
    str = str.replaceAll("</h.>","\n");
    str = str.replaceAll("</?p>","\n");
    str = str.replaceAll("(?s:<![.*?]]>)","");
    str = str.replaceAll("(?s:<.*?>)","");
    str = str.replaceAll("\\.[\\.\\s]+",". ");
    str = str.replaceAll("\\?[\\.\\s]+","? ");
    str = str.replaceAll("\\![\\.\\s]+","! ");
    str = str.replaceAll("\\,[\\.\\s]+",", ");
    str = StringEscapeUtils.unescapeHtml(str);     
    return str;
  }
  
//  def stringForURL(url : String) : String = {
//    var source = Source.fromURL(url,"UTF-8");
//    var buf = new StringBuffer;
//    try{
//      source.foreach(line => buf append line);
//    }catch{
//      case e => buf.toString;
//    }
//    buf.toString;
//  }
}

