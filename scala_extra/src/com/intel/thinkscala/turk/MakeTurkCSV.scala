package com.intel.thinkscala.turk
import com.intel.thinkscala.Util._
import com.intel.thinkscala._
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import java.io.FileWriter

object MakeTurkCSV {
  val filename = "v4_tye_third"
  
  val store = Pool.get

  // questions per task
  val PERTASK = 10
 
  val cols = List("claim") ++ ((1 to PERTASK) flatMap 
    (n => List("snip","url","title","searchtext") map (v => v+n)))

  def makeWorkUnits(claim : String) : ArrayBuffer[HashMap[String,String]] = {
    val turkdata = new ArrayBuffer[HashMap[String,String]]
    var thisreq = new HashMap[String,String]
    var nthitem = 1

    log("= "+claim+" =")      
    val claimid = store.getClaim(claim,User.autoimport)
    val results = store.resultsForClaim(claimid)
    results.foreach(r => {
      if(nthitem == PERTASK+1){
        thisreq("claim") = claim
        turkdata.append(thisreq) 
        thisreq = new HashMap[String,String]
        nthitem=1
      }

      thisreq("snip"+nthitem) = r.str("abstract")        
      thisreq("url"+nthitem) = r.str("url")
      thisreq("title"+nthitem) = r.str("title")
      thisreq("searchtext"+nthitem) = r.str("searchtext")
      thisreq("position"+nthitem) = r.int("position").toString
      nthitem+=1
    })
    return turkdata
  }
  
  def mkFileName(claim : String) = "/home/rob/git/thinklink/turk/input/"+claim+".csv"
  
  def main(args : Array[String]){
    val outfile = new FileWriter(mkFileName(filename))
    val requests = GenerateTurkData.requests
    requests.foreach(req => {
      val turkdata = makeWorkUnits(req.claim)
      outfile.write(printCSV(turkdata,cols))
    })
    outfile.close()
  }
}
