package com.intel.thinkscala.turk

import com.intel.thinkscala._
import com.intel.thinkscala.Util._

class TurkRequest(val claim : String, val searches : List[String])

object GenerateTurkData {
  val store = Pool.get
  
  val requests = List(
    new TurkRequest("global warming does not exist",
                    List(
                      "global warming does not exist",
                      "global warming is a scam",
                      "global warming is a hoax",
                      "global warming is a con",
                      "I don't believe global warming is real",
                      "global warming is a made-up crisis",
                      "don't believe in global warming",
                      "global warming lie"
                    )),
    new TurkRequest("there is no scientific consensus on global warming",
                    List(
                    "there is no scientific consensus on global warming",
                    "no scientific consensus on global warming"
                    )                    
    )
  )   

  def doSearch(claimid : Int, search : String){
    log(search)
    val searchid = store.mkSearch(claimid,search)
//    val urlsnips = SnipSearch.searchYahoo(search)
    val urlsnips = SnipSearch.searchBoss(search,0,50) ++ SnipSearch.searchBoss(search,1,50)
    urlsnips.foreach(us => {
      var position = 0
      var urlid = store.mkUrl(us.url, us.title)
      if(us.snips != null){
	      us.snips.foreach(snip => {        
	        store.mkResult(searchid,urlid,position,snip,"",claimid)
	        position += 1
	      })
      }
    })
  }
  
  def main(args : Array[String]){
    requests.foreach(req => {
      log("= "+req.claim+" =")
      val claimid = store.getClaim(req.claim,User.autoimport)
      req.searches.foreach(search => doSearch(claimid,search))
    })
  }
}

  
 



