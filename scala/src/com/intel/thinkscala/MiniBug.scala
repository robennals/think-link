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

class MiniBug {
  def search(claim : String) : Seq[Int] = {
    val url = "foo";
    val doc = ConstructingParser.fromSource(Source.fromURL(url),false).document;
    val results = doc \\ "result"
    results.map (result => process(result))
  }
 
  def process(result : Node) = 3
}
