package com.intel.thinkscala.turk
import scala.io.Source
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import com.intel.thinkscala.Util
import scala.util.Sorting
import Util._

object StoreTurkResults { 
  val filename = "/home/rob/git/thinklink/turk/output/carbon_dioxide_warming_expanded.csv"
  
  val store = Pool.get
  
  def main(args : Array[String]){
    val rows = Util.parseCsvFile(filename)
    
    rows.foreach(row => {
      val user = row("WorkerId")
      val claimstr = row("Input.claim")
      val claimid = store.getClaim(claimstr,User.turk)
            
      for(i <- 1 to 10){
        val snip = row("Input.snip"+i)
        val url =  row("Input.url"+i)
        val title = row("Input.title"+i)
        val query = normalizeString(row("Input.searchtext"+i))
	    val vote = row("Answer.Q"+i)
//	    val position = c.argInt("Input.position")  // update when generating data correctly
	    val searchid = store.mkSearch(claimid,query)
	    val urlid = store.mkUrl(url,title)
	    val resultid = store.mkResult(searchid,urlid,-1,snip,"",claimid)
	    store.setSnipVote(claimid,resultid,searchid,User.turk.userid,vote == "yes")
      }
    })    
  }
}
