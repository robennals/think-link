package com.intel.thinkscala
import scala.collection.mutable.HashMap
import scala.concurrent.ops.future
import java.io.File
import Util._

object PageContext {
	
  def getPageContext(resultid : Int, store : Datastore) : Option[String] = {
     val row = store.getSearchResult(resultid)
     getPageContext(resultid,row.str("url"),row.str("abstract"),store)
  }
	
  def getPageContext(resultid : Int, url : String, abstr : String, store : Datastore) : Option[String] = {
	  store.getPageText(resultid) match {
		  case Some(row : SqlRow) => Some(row.str("text"))
		  case None if pending.isDefinedAt(url) => None   // already fetching this one
		  case None => {
			  pending(url) = future(fetchUrl(url,resultid,abstr)); None
		  }
	  }
  }
	
  val pending = new HashMap[String,Any]  // currently loading

  def backgroundFetchSnippet(row : SqlRow){
	  val url = row.str("url")
	  if(!pending.isDefinedAt(url)){
		  pending(url) = future(fetchUrl(url,row.int("id"),row.str("abstract")))
	  }
  }
                            
  def fetchUrl(url : String, resultid : Int, abstr : String){
    var store : Datastore = null
    try{
	    val fullpage = SnipSearch.htmlToString(download(url))	   
	    store = Pool.get
	    SnipSearch.findSnipContext(fullpage,abstr,2000) match {
	    	case Some(text) => store.setPageText(resultid,text)
	    	case None => store.setPageText(resultid,"")
	    }
    }finally{
    	// TODO: set pagetext to NULL to avoid repeated fetches
        pending.remove(url)    
        Pool.release(store)
    }
  }
}
