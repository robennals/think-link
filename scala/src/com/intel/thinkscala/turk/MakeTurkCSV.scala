package com.intel.thinkscala.turk
import com.intel.thinkscala.Util._
import com.intel.thinkscala._
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import java.io.FileWriter

object MakeTurkCSV {
  val store = Pool.get

  // questions per task
  val PERTASK = 10

  val cols = List("claim") ++ ((1 to PERTASK) flatMap 
    (n => List("front","snip","back") map (v => v+n)))
  
  def splitContext(context : String, snip : String) : (String,String) = {
    val startpos = context indexOf snip
    if(startpos == -1) return ("","") 
    else
      return (context.substring(0,startpos),context.substring(startpos + snip.length))
  }
  
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
      val (front,back) = splitContext(r.str("pagetext"),r.str("abstract"))
      thisreq("front"+nthitem) = front
      thisreq("back"+nthitem) = back
      thisreq("snip"+nthitem) = r.str("abstract")        
      nthitem+=1
    })
    return turkdata
  }
  
  def mkFileName(claim : String) = "/home/rob/git/thinklink/turk/input/"+claim+".csv"
  
  def main(args : Array[String]){
    val requests = GenerateTurkData.requests
    requests.foreach(req => {
      val turkdata = makeWorkUnits(req.claim)
      val outfile = new FileWriter(mkFileName(req.claim))
      outfile.write(printCSV(turkdata,cols))
    })
  }
}
