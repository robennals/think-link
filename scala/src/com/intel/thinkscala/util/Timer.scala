package com.intel.thinkscala.util
import scala.collection.mutable.HashMap;

object Timer {
	val counters = HashMap("foo" -> 42.asInstanceOf[Long])//new HashMap[String,Long]                      	
	                           
	def time[A](counter : String, f : => A) : A = {
		val start = System.currentTimeMillis
		val res = f
		val end = System.currentTimeMillis
		val diff = end - start
		counters(counter) = counters.getOrElseUpdate(counter,0) + diff
		res
	}
}
