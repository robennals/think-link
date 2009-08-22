package com.intel.thinkscala
import scala.collection.mutable.HashMap
//import scala.concurrent.ops.spawn
import java.io.File
import Util._

object PageContext {
	
	// HACK until Scala trunk fixes future
  def future(f : => Unit){
	  object foo extends Thread{
		  override def run(){
			  try{
			  f
			  }catch{
				  case e : Exception => {
					  e.printStackTrace
					  System.out.println(e)
				  }
			  }
		  }		  
	  }
	  foo.start()	  
  }
	
  def getPageContext(resultid : Int, store : Datastore) : Option[String] = {
     val row = store.getSearchResult(resultid)
     getPageContext(row.int("url_id"),row.str("url"),row.str("abstract"),store)
  }
	
  def getPageContext(urlid : Int, url : String, abstr : String, store : Datastore) : Option[String] = {
	  store.getPageText(urlid) match {
		  case Some(row : SqlRow) => Some(row.str("text"))
		  case None if pending.isDefinedAt(url) => None   // already fetching this one
		  case None => {
			  pending(url) = future(fetchUrl(url,urlid,abstr)); None
		  }
	  }
  }
	
  val pending = new HashMap[String,Any]  // currently loading

  def backgroundFetchSnippet(row : SqlRow){
	  val url = row.str("url")
	  if(!pending.isDefinedAt(url)){
		  pending(url) = future(fetchUrl(url,row.int("url_id"),row.str("abstract")))
	  }
  }
                            
  def fetchUrl(url : String, urlid : Int, abstr : String){
    var store : Datastore = null
    try{
    	val article = util.HTML.bodyForUrl(url)
	    store = Pool.get
	    store.setPageText(urlid,article)
//	    SnipSearch.findSnipContext(article,abstr,2000) match {
//	    	case Some(text) => store.setPageText(resultid,text)
//	    	case None => store.setPageText(resultid,article.substring(0,2000))
//	    }
    }finally{
    	// TODO: set pagetext to NULL to avoid repeated fetches
        pending.remove(url)    
        Pool.release(store)
    }
  }
}
