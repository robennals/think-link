package com.intel.thinkscala
import scala.collection.mutable.HashMap
import scala.concurrent.ops.future
import java.io.File
import Util._

object UrlCache {
  val basedir = "/var/cache/disputefinder/urlcache/"
  
  val pending = new HashMap[String,Any]  // currently loading
  
  def getUrlContent(url : String, store : Datastore) : Option[String] = {
    if(pending.isDefinedAt(url)){
      None;
    }else{
      store.maybeUrlFileId(url) match {
        case Some(id : Int) => Some(readFile(idToFile(id)))
        case None => {
          pending(url) = future(startFetchingUrl(url,store)); None
        }
      }
    }
  }
  
  def idToFile(id : Int) : String = {
    val part1 = id % 100
    val part2 = (id / 100) % 100
    val part3 = (id / 10000) % 100
    val part4 = id / 1000000
    val filename = basedir + part1 + "/" + part2 + "/" + part3 + "/" + part4
    new File(filename).getParentFile.mkdirs
    return filename
  }
  
  def startFetchingUrl(url : String, store : Datastore){
    val id = store.addUrlFile(url)   
    try{
    val content = download(url)
    val filename = idToFile(id)
    writeFile(filename,content)
    }finally{
    }
    pending.remove(url)    
  }    
}
