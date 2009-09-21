package com.intel.thinkscala.wiki

import scala.collection.mutable.HashMap
import scala.io.Source
import java.io.File
import java.io.FileWriter

object WikiWordFreqs {
	val freqs = new HashMap[String,Int]
	                    
	def main(args : Array[String]){
//		val source = Source.fromFile(new File("/home/rob/Reference/Wikipedia/wikipedia_small.xml"))
		val source = Source.fromFile(new File("/home/rob/Reference/Wikipedia/enwiki-20081008-pages-articles.xml"))
		var linenumber = 0
		var ignore = true
		source.getLines("\n") foreach {rawline =>
			var line = rawline.replaceAll("\\[\\[[^\\]]*\\]\\]","")
			line = rawline.replaceAll("\\{\\{[^\\}]*\\}\\}","")
			line = rawline.replaceAll("\\[[^\\]]*\\]","")
			if(!ignore){
				val words = line.toLowerCase.split("[^a-zA-Z]")
				words foreach {word =>
					if(freqs contains word){
						freqs(word) += 1
					}else{
						freqs(word) = 1
					}
				}
			}
			if(line contains "<text"){
				ignore = false
			}
			if(line contains "</text"){
				ignore = true
			}
			linenumber += 1
			if(linenumber % 10000 == 0){
				System.out.println("line "+linenumber)
			}
		} 

		val writer = new FileWriter("/home/rob/Reference/Wikipedia/scala_wordfreqs")
		
		var keys = freqs.keys.toList.sort((x,y) => freqs(x) > freqs(y))
		keys foreach {key =>
			writer.write(key + ":" + freqs(key)+"\n")
		}		

		writer.close();	

	}
}
