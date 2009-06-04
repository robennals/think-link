package com.intel.thinkscala.turk
import scala.io.Source
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import com.intel.thinkscala.Util


object ShowTurkUserData {
  val filename = "/home/rob/git/thinklink/turk/output/tye_second.csv"

  def main(args : Array[String]){
    val wanteduser = args(0)

    val rows = Util.parseCsvFile(filename)
   
    rows.foreach(row => {
    	val user = row("WorkerId")
    	val hit = row("HITId")
     
    	if(user == wanteduser){
  			System.out.println("-- "+row("Input.claim")+ " : " + hit + " --")
    		for(i <- 1 to 10){
    		  System.out.println(row("Answer.Q"+i).toUpperCase+": "+row("Input.snip"+i))
    		}
    	}
    })
  }

}
