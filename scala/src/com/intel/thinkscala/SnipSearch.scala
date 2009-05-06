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

trait HasData {
  def data : Any
}

class SnipInfo(val snip: String, val context: String, success : Boolean) extends HasData{
  def data = Map("text" -> snip, "pagetext" -> context)
}

class SnipUrlRes(val snips: Array[SnipInfo], val url: String, val title : String, val errormsg: String) extends HasData {
  def this(snips : Array[SnipInfo], url: String) = this(snips,url,null,null)
  def this(ex : Exception, url : String) = this(null,url,null,ex.getMessage)
  def data = Map("url" -> url, "snips" -> snips, "title" -> title, "error" -> errormsg)
}

class BossUrl(val url : String, val title : String, val snips : Array[String])

class SnipSearch extends HttpServlet {
  override def doGet(req : HttpServletRequest, res : HttpServletResponse) {
    val claim = req getParameter "claimstr"
    val snips = SnipSearch.searchYahoo(claim)
    httpOutput(req,res,snips)
  }
}    
 
object SnipSearch {
  val bossKey = "NpeiOwLV34E5KHWPTxBix1HTRHe4zIj2LfTtyyDKvBdeQHOzlC_RIv4SmAPuBh3E";
  val bossSvr = "http://boss.yahooapis.com/ysearch/web/v1";

  def searchBoss(claim : String) : Seq[BossUrl] = {
    val url = bossSvr + "/"+encode(claim)+"?appid="+bossKey+"&format=xml&abstract=long"
    val xmltext = download(url)
    val parser = ConstructingParser.fromSource(Source.fromString(xmltext),false)
    val doc = parser.document   
    val results = doc \\ "result"
    return results map absForResult
  }  
  
  def searchYahoo(claim : String) : Seq[SnipUrlRes] = {
    val url = bossSvr + "/"+encode(claim)+"?appid="+bossKey+"&format=xml&abstract=long"
    val parser = ConstructingParser.fromSource(Source fromURL url,false)
    val doc = parser.document   
    val results = doc \\ "result"
    val futures = results map (x => future(snipForResult(x)))
    val snips = futures.map(f => f())
    // DEBUG
//    val snips = results map snipForResult                                                          
    return snips;   
  }
  
  def absForResult(result : Node) : BossUrl = {
    var fragments = ((result \ "abstract").text).split("""<b>\.\.\.</b>""").map(cleanString).filter(s => s.length > 10)    
    val url = (result \ "url").text
    val title = cleanString((result \ "title").text)
    return new BossUrl(url,title,fragments)
  }
 
  def snipForResult(result : Node) : SnipUrlRes = {
    var fragments = ((result \ "abstract").text).split("""<b>\.\.\.</b>""").map(cleanString).filter(s => s.length > 10)    
    val url = (result \ "url").text
    log("fetching: "+url)
    val title = cleanString((result \ "title").text)
    try{
	    val pagetext = htmlToString(download(url))
	    var expanded = fragments.map(frag => findSnipContext(pagetext,trimEnds(frag)))
	    new SnipUrlRes(expanded,url,title,null)
    }catch{
      case e : FileNotFoundException => {
        log("URL failed: "+e.getMessage);
        new SnipUrlRes(e,url)
      }
      case e : Exception => {
        e.printStackTrace(); 
        new SnipUrlRes(e,url)
       }
    }
  }

  val context_length = 200
  
  def findSnipContext(pagetext : String, fragment : String) : SnipInfo = {
    import java.lang.Math._;
    findSentence(pagetext,fragment) match {
      case null => new SnipInfo(fragment,null,false)
      case (start,end) => {
        val snip = pagetext.substring(start,end)
        val extra = (context_length - snip.length) / 2
        
        var cstart = max(0,start - extra)
        var cend = min(pagetext.length,end + extra)       
        while(cstart < start && pagetext(cstart).isLetterOrDigit) cstart+=1;
        while(cend > end && pagetext(cend).isLetterOrDigit) cend-=1;
        val context = pagetext.substring(cstart,cend)
        return new SnipInfo(snip,context,true)
      }
    }
  }
  
  
  
  def findSentence(pagetext : String, fragment : String) : (Int,Int) = {   
    var start = reduceUnicode(pagetext).indexOf(reduceUnicode(fragment))
    if(start == -1){
      for(i <- 0 until pagetext.length){
        val end = findFrom(i,pagetext,fragment)
        if(end != 0){
          return (i,end)          
        }
      }
      return null
    }else{
      return (start,start+fragment.length)
    }    
  }

  def findFrom(start : Int, bigstring : String, smallstring : String) : Int = {
    var bi = start
    var si = 0
    while(si < smallstring.length){
      if(bi >= bigstring.length) return 0;
      if(si != 0 && !bigstring(bi).isLetterOrDigit){
        bi+=1
      }else if(!smallstring(si).isLetterOrDigit){
        si+=1
      }else if(bigstring(bi) != smallstring(si)){
        return 0
      }else{
        bi+=1
        si+=1
      }
    }   
    return bi    
  }
  
  
  def expandSentence(pagetext : String, fragment : String) : Array[SnipInfo] = {
    var start = reduceUnicode(pagetext).indexOf(reduceUnicode(fragment))
    if(start == -1){
      var parts = fragment.split("\\.").filter(a => a.length > 15)
      if(parts.length > 1){
        return parts.flatMap(frag => expandSentence(pagetext,frag))
      }else{
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
    return Array(new SnipInfo(fragment,quote,true))
  }
    
  def isStop(c : Char) = c == '.' || c == '!' || c == '?' || c == '*' || c == '|' || c == ')'
  
  def firstQuote(str : String) = str.replaceAll("""\.\.\..*""","")
  
  def trimEnds(str : String) = str.replaceAll("^\\s+","").replaceAll("\\s+$","")
  
  def cleanString(str : String) = 
    str.replace("<b>","").replace("</b>","").replace("<wbr>","")
 
//  def htmlToString(html : String) : String = {
//    var str = html;
//    str = str.replaceAll("(?s:<script.*?>.*?</script>)","");
//    str = str.replaceAll("(?s:<style.*?>.*?</style>)","");
//    str = str.replaceAll("</title>",". ");
//    str = str.replaceAll("</h.>",". ");
//    str = str.replaceAll("</?p>",". ");
//    str = str.replaceAll("(?s:<![.*?]]>)","");
//    str = str.replaceAll("(?s:<.*?>)","");
//    str = str.replaceAll("\\s+"," ");
//    str = str.replaceAll("\\.[\\.\\s]+",". ");
//    str = str.replaceAll("\\?[\\.\\s]+","? ");
//    str = str.replaceAll("\\![\\.\\s]+","! ");
//    str = str.replaceAll("\\,[\\.\\s]+",", ");
//    str = StringEscapeUtils.unescapeHtml(str);     
//    return str;
//  }

  def htmlToString(html : String) : String = {
    var str = html;
    str = str.replaceAll("(?s:<script.*?>.*?</script>)","");
    str = str.replaceAll("(?s:<style.*?>.*?</style>)","");
    str = str.replaceAll("\\s+"," ");
    str = str.replaceAll("</title>","\n");
    str = str.replaceAll("</h.>","\n");
    str = str.replaceAll("</?p>","\n");
    str = str.replaceAll("(?s:<![.*?]]>)"," ");
    str = str.replaceAll("(?s:<.*?>)"," ");
    str = str.replaceAll("\n+","\n");
    str = StringEscapeUtils.unescapeHtml(str);     
    return str;
  }
}

