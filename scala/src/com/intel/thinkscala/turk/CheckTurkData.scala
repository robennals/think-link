package com.intel.thinkscala.turk
import scala.io.Source
import scala.collection.mutable.ArrayBuffer
import scala.collection.mutable.HashMap
import com.intel.thinkscala.Util
import scala.util.Sorting

class Result(val user : String, val hit : String, val votes : Seq[Boolean])

class User(val id : String, val total : Int, val agree : Int, val disagree : Int, val ratio : Float)


object CheckTurkData { 
  val filename = "/home/rob/git/thinklink/turk/output/hoaxes.csv"

  def main(args : Array[String]){
    val rows = Util.parseCsvFile(filename)
    
    val userResults = new HashMap[String,ArrayBuffer[Result]]
    val hitResults = new HashMap[String,ArrayBuffer[Result]]
    
    rows.foreach(row => {
    	val user = row("WorkerId")
    	val hit = row("HITId")
        val votes = (1 to 10) map (i => row("Answer.Q"+i) == "yes")
        val result = new Result(user,hit,votes)
    	userResults.getOrElseUpdate(user,new ArrayBuffer[Result]) += result
    	hitResults.getOrElseUpdate(hit,new ArrayBuffer[Result]) += result
    })
    
    val users = new ArrayBuffer[User]()
    userResults.keys foreach (userid => {
      val total = userResults(userid).length * 10
      var agree = 0
      var disagree = 0
      userResults(userid).foreach (result => {
        hitResults(result.hit).foreach (other => {
          if(other.user != userid){
            for(i <- 0 until 10){
              if(result.votes(i) == other.votes(i)){
                agree+=1                
              }else{
                disagree+=1
              }
            }            
          }          
        })
      })
      val user = new User(userid,total,agree,disagree,disagree.asInstanceOf[Float] / total)
      user +: users
    })
  
    val sorted = Sorting.stableSort(users,(x : User,y : User) => x.ratio > y.ratio);
    
    sorted.foreach (user => {
    	System.out.println(user.id + "("+user.total+") - "+user.ratio+" - "+user.disagree+" vs "+user.agree)
    }) 
  }
}
