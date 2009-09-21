package com.intel.thinkscala.turk

import com.intel.thinkscala._
import com.intel.thinkscala.Util._

class TurkRequest(val claim : String, val searches : List[String]){
  def this(claim : String) = this(claim,List(claim))
}

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

//// Batch 3
//  val requests = List(
//     new TurkRequest("Margarine is healthier than butter",List(
//     	"margarine is healthier than butter",
//        "margarine heart healthy",
//        "margarine saturated fat")
//     ),
//     new TurkRequest("The moon landings were faked",List(
//     	"the moon landings were faxed")
//     ),
//     new TurkRequest("Obama's stimulus package will not work",List(
//        "Obama's stimulus package will not work")
//     ),
//     new TurkRequest("9-11 was a hoax",List(
//                     "9-11 was a hoax")
//     ),
//     new TurkRequest("Marilyn Monroe was murdered",List(
//     				"Marilyn Monroe was murdered")
//     )
//  )
    
// Batch 4 - Travel                      
//  val requests = List(
//    new TurkRequest("It is rude to make eye contact in Japan"),
//    new TurkRequest("Venice is sinking"),
//    new TurkRequest("Toilet water swirls in the opposite direction in the southern hemisphere"),    
//    new TurkRequest("England gets a lot of rain",List(
//    		"England gets a lot of rain","England rains a lot","England is always raining"
//    )),
//    new TurkRequest("food is good in france"),
//    new TurkRequest("British food is bad")
//  )    

// Batch 5
//  val requests = List(
//    new TurkRequest("genetically modified foods are dangerous",List(
//    	"genetically modified foods dangerous","genetically modified food unsafe")),
//    new TurkRequest("addiction is just an excuse used by criminals"),
//    new TurkRequest("affirmative action is bad",List(
//    	"affirmative action is bad","affirmative action is immoral","affirmative action is racist")),
//    new TurkRequest("aid to Africa has failed"),
//    new TurkRequest("universal healthcare in the US would be bad",List(
//    	"socialized healthcare","government run healthcare")),
//    new TurkRequest("genetically modified foods are essential in order to feed the world",List(
//    	"genetically modified foods feed the world", 
//    	"genetically modified food starvation")),
//    new TurkRequest("birth control is a human right")    
//  )

//  val requests = SpeechTopics.requests.take(40)
  val requests = SpeechTopics.requests.drop(80).take(40)
  
  // Batch 6 - me. Politics
//  val topics = List(
//		  "Barack Obama is a socialist",
//		  "Guantanamo Bay should be closed",
//		  "The Iraq war war a mistake",
//		  "American politicians are corrupt",
//		  "
//  )
//  
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
      val claimid = store.getClaim(req.claim,User.turk)
      req.searches.foreach(search => doSearch(claimid,search))
    })
  }
}

  
 



