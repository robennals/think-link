package com.intel.thinkscala.claimfinder
import scala.collection.mutable.HashMap
import scala.collection.mutable.HashSet
import scala.collection.immutable.ListMap
/*  Do some simple clustering of claims.
	Currently this is just a really dumb approach.
*/


trait ClusterFuncs[A]{
	def distance(x : A, y : A) : Double
	def merge(x : A, y : A) : A
}

class ClaimCluster (val claims : List[String], val features : HashMap[String,Double])

class ClaimFuncs extends ClusterFuncs[ClaimCluster]{
	def distance(x : ClaimCluster, y : ClaimCluster) : Double = {
		var distance = 0.0
		val keys = x.features.keySet union y.features.keySet		
		keys.foreach{key => 
			distance += Math.abs(x.features(key) - y.features(key))
		}
		distance		
	}
	
	def merge(x : ClaimCluster, y : ClaimCluster) : ClaimCluster = {
		val keys = x.features.keySet union y.features.keySet
		var map = new HashMap[String,Double]
		val xlen = x.claims.length
		val ylen = y.claims.length
		keys foreach {key => 
			map(key) = (x.features.getOrElse(key,0.0)*xlen + y.features.getOrElse(key,0.0)*ylen)/(xlen + ylen)
		}
		new ClaimCluster(x.claims ++ y.claims, map)
	}
}

object Cluster {
	// hierachial clustering is really slow, but a reasonable first start

	// cluster everything that is within /theshold/ of a cluster center
	// this is O(n^3) so should only be done for small sets or within a canopy
	def greedyCluster[A >: Object](data : HashSet[A], funcs : ClusterFuncs[A], threshold : Double) : HashSet[A] = {
		var closest = 0.0
		var closex : A = null
		var closey : A = null
		while(closest < threshold){
			closest = threshold + 1
			data foreach {x =>
				data foreach {y =>
					val distance = funcs.distance(x,y)
					if(distance < closest){
						closest = distance
						closex = x
						closey = y
					}
				}
			}
			if(closest < threshold){
				data.remove(closex)
				data.remove(closey)
				data.add(funcs.merge(closex,closey))
			}
		}
		data
	}
}

