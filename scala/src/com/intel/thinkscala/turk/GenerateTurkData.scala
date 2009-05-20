package com.intel.thinkscala.turk

import com.intel.thinkscala._
import com.intel.thinkscala.Util._

class TurkRequest(val claim : String, val searches : List[String])

object GenerateTurkData {
  val store = Pool.get
  
// Batch 1 : Global Warming
//  val requests = List(
//    new TurkRequest("global warming does not exist",
//                    List(
//                      "global warming does not exist",
//                      "global warming is a scam",
//                      "global warming is a hoax",
//                      "global warming is a con",
//                      "I don't believe global warming is real",
//                      "global warming is a made-up crisis",
//                      "don't believe in global warming",
//                      "global warming lie"
//                    )),
//    new TurkRequest("there is no scientific consensus on global warming",
//                    List(
//                    "there is no scientific consensus on global warming",
//                    "no scientific consensus on global warming"
//                    )                    
//    )
//  )   

// Batch 2
//  val requests = List(
//    new TurkRequest("recent climate change is due to the sun",List(
//    		"recent climate change is due to the sun",
//    		"global warming caused by the sun",
//    		"sun responsible for global warming",
//    		"climate change sun"
//    )),
//    new TurkRequest("Carbon Dioxide does not cause global warming",List(
//    		"carbon dioxide does not cause global warming",
//            "carbon dioxide not responsible",
//            "carbon dioxide not cause warming"            
//    ))
//  )

// Batch 3
  val requests = List(
     new TurkRequest("Margarine is healthier than butter",List(
     	"margarine is healthier than butter",
        "margarine heart healthy",
        "margarine saturated fat")
     ),
     new TurkRequest("The moon landings were faked",List(
     	"the moon landings were faxed")
     ),
     new TurkRequest("Obama's stimulus package will not work",List(
        "Obama's stimulus package will not work")
     ),
     new TurkRequest("9-11 was a hoax",List(
                     "9-11 was a hoax")
     ),
     new TurkRequest("Marilyn Monroe was murdered",List(
     				"Marilyn Monroe was murdered")
     )
  )
  
  def doSearch(claimid : Int, search : String){
    log(search)
    val searchid = store.mkSearch(claimid,search)
//    val urlsnips = SnipSearch.searchYahoo(search)
    val urlsnips = SnipSearch.searchBoss(search,0,50) ++ SnipSearch.searchBoss(search,1,50)
    var position = 0
    urlsnips.foreach(us => {
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

  
 



