package com.intel.thinkscala.data

trait UrlCache extends BaseData {
  val check_url_file = stmt("SELECT id FROM url_cache WHERE url_hash = CRC32(?) AND url = ?")
  def getUrlFileId(url : String) = check_url_file.queryMaybe(url,url)
  
  def maybeUrlFileId(url : String) : Option[Int] = 
    getUrlFileId(url) match {
      case Some(row) => Some(row.int("id"))
      case None => None
    }
    
  
  val add_url_file = stmt("REPLACE INTO url_cache (url_hash,url) VALUES (CRC32(?),?)")
  def addUrlFile(url : String) = add_url_file.insert(url,url)  
}
