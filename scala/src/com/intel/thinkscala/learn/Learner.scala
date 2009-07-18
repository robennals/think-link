package com.intel.thinkscala.learn

class Entry (val url : String, val title : String, val highlight : String, val context : String)

abstract class Learner {
	def train(yes : Seq[Entry], no : Seq[Entry])
	def classify(context : String, title : String) : Option[String]
}
