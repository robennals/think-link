package com.intel.thinkscala.turk
import com.intel.thinkscala._

import scala.io.Source
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import com.intel.thinkscala.Util
import scala.util.Sorting
import java.io.FileWriter


object ExpandTurkResults { 
  val filename = "/home/rob/git/thinklink/turk/output/carbon_dioxide_warming.csv"
  val outname = "/home/rob/git/thinklink/turk/output/carbon_dioxide_warming_expanded.csv"
  
  val PERTASK = 10
  
  val cols = List("Input.claim","WorkerId","HITId") ++ 
    ((1 to PERTASK) flatMap (n => List("Input.snip","Input.position","Input.url","Input.title","Input.searchtext") map (v => v+n))) ++
    ((1 to PERTASK) map (n => "Answer.Q"+n))

  val store = Pool.get
  
  def main(args : Array[String]){
    val rows = Util.parseCsvFile(filename)
    
    var missing = 0;
    
    rows.foreach(row => {
      val user = row("WorkerId")
      val claimstr = row("Input.claim")
      val claimid = store.getClaim(claimstr,User.turk)
            
      for(i <- 1 to 10){
        val snip = row("Input.snip"+i)
        store.infoForSnippet(claimid,snip) match {
          case Some(info) => 
          	row("Input.url"+i) =  info.str("url")
          	row("Input.title"+i) = info.str("title")
          	row("Input.searchtext"+i) = info.str("searchtext") 
            row("Input.position"+i) = info.int("position").toString
          case _ => // ignore this when we integrate
            row("Input.url"+i) = ""
            row("Input.title"+i) = ""
            row("Input.searchtext"+i) = ""
            row("Input.position"+i) = "-1"
            missing += 1
        } 
      }
    })
    
    System.out.println("missing = "+missing)
    
    val outfile = new FileWriter(outname)
    outfile.write(Util.printCSV(rows,cols))

  }
}
