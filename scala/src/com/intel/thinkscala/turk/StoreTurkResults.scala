package com.intel.thinkscala.turk
import scala.io.Source
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import com.intel.thinkscala.Util
import scala.util.Sorting
import Util._

object StoreTurkResults { 
  val filename = "/home/rob/git/thinklink/turk/output/tye_second_cut3_sorted.csv"
  
  val store = Pool.get
  
  var agreed = 0
  var disagreed = 0
  var added = 0
  var bothyes = 0
  var total = 0
  
  def main(args : Array[String]){
//    val rows = Util.parseCsvFile(filename)
    val rows = Util.parseCsvFile(args(0))

    var prevrow : HashMap[String,String] = null
    
    rows.foreach(row => {
      val user = row("WorkerId")
      val claimstr = row("Input.claim")
      val claimid = store.getClaim(claimstr,User.turk)
            
      for(i <- 1 to 10){
        val snip = row("Input.snip"+i)
        val url =  row("Input.url"+i)
        val title = row("Input.title"+i)
        val query = normalizeString(row("Input.searchtext"+i))
	    var vote = row("Answer.Q"+i)
        if(prevrow != null && prevrow("HITId") == row("HITId")){     
           val othervote = prevrow("Answer.Q"+i)
           if(othervote == vote){
             agreed += 1
           }else{
             disagreed += 1
           }
           if(othervote == "no"){
             vote = "no";             
           }
           if(vote == "yes"){
             bothyes += 1
           }           
        }

//	    val position = c.argInt("Input.position")  // update when generating data correctly
	    val searchid = store.mkSearch(claimid,query)
	    val urlid = store.mkUrl(url,title)
	    val resultid = store.mkResult(searchid,urlid,-1,snip,"",claimid)
	    store.setSnipVote(claimid,resultid,searchid,User.turk.userid,vote == "yes")
      }
      prevrow = row
    })    
    
    System.out.println("agreed: "+agreed)
    System.out.println("disagreed: "+disagreed)
    System.out.println("bothyes: "+bothyes)
  }
}
