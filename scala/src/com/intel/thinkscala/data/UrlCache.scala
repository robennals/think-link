package com.intel.thinkscala.data

import com.intel.thinkscala.SqlQuery._

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
  
  def getPageText(resultid : Int) = 
	  select("text","pagetext") where ("result_id = ?",resultid) maybe
	  
  val set_page_text = stmt("REPLACE INTO pagetext (result_id,text) VALUES (?,?)")
  def setPageText(resultid : Int, text : String) = set_page_text.insert(resultid,new TruncString(text,2000))
  
  def getSearchResult(resultid : Int) = 
	  select("abstract","v2_searchresult").where("v2_searchresult.id = ?",resultid)
	  .leftjoin("url","v2_searchurl ON v2_searchurl.id = v2_searchresult.url_id") one
}
