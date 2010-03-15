package com.intel.thinkscala.entailment

import scala.collection.mutable._
import scala.io.Source
import java.io.File

class TreeNode (var suffixes : Map[String,TreeNode], val claims : ListBuffer[String]){
	override def toString = suffixes.toString
}

object TreeMatch {
	def getWords(claim : String) = claim.split(" ")
	
	val stopwordsname = "/home/rob/git/thinklink/web_claim_finder/stopwords.txt"
	val stopwords = Set(Source.fromPath(stopwordsname).getLines("\n").toSeq : _*)
	
	val suffixtree = new HashMap[String,TreeNode]
	
	def add_claim_suffix(tree : Map[String,TreeNode], keywords : Seq[String], claim : String){
		if (keywords.length < 1) return
		val firstword = keywords(0)
		if (!(tree contains firstword)){
			tree(firstword) = new TreeNode(new ListMap(),new ListBuffer[String])
		}
		val entry = tree(firstword)
		if (entry.suffixes.isInstanceOf[ListMap[String,TreeNode]] && entry.suffixes.size > 100){
			entry.suffixes = HashMap(entry.suffixes.toSeq : _*)
		}
		if (keywords.length > 1){
			add_claim_suffix(entry.suffixes,keywords.tail,claim)
		}else{
			entry.claims.append(claim)
		}
	}
	
	def load_claims(filename : String){
		var count = 0
		for (claim <- Source.fromPath(filename).getLines("\n")){
			count += 1
			if (count % 1000 == 0){
				System.out.println("claim : "+count)
			}
			add_claim(claim)
		}
	}
	
	def add_claim(claim : String){
		val words = claim.replaceAll("[^\\w\\s]","").split(" ")
		val keywords = for (word <- words if !(stopwords contains word)) yield word
		add_claim_suffix(suffixtree,keywords,claim)
	}
}
