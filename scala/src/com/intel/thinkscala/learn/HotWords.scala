package com.intel.thinkscala.learn
import scala.collection.mutable.HashMap
import scala.io.Source
import java.io._


object HotWords {
	def loadHotwords : HashMap[String,Int] = {
		var map = new HashMap[String,Int]
		val reader = new BufferedReader(new FileReader(new File("/home/rob/wiki_wordfreqs")))
		var line : String = reader.readLine
		while(line != null){
			val split = line.indexOf(":")
			if(split > 0){
				val word = line.substring(0,split)
				val count = Integer.parseInt(line.substring(split+1))
				map(word) = count
			}
			line = reader.readLine
		}
		reader.close()
		return map
	}

	val wordfreqs = loadHotwords

	def hotWords(str : String) : (String,String) = {
		val words = Paraphraser.textWords(str)	
		val scored : Seq[(String,Option[Int])]= words map (word => (word,wordfreqs.get(word)))
		val sorted = scored.toList.sortWith((x,y) => (x._2,y._2) match {
			case (Some(xf),Some(yf)) => xf < yf
			case (None,Some(yf)) => false
			case (Some(xf),None) => true
			case (None,None) => x._1 < y._1
		})
		if(sorted.length > 0){
			(sorted(0)._1,sorted(1)._1)
		}else{
			("","")
		}
	}	
}
