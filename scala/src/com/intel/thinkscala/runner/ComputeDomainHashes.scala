package com.intel.thinkscala.runner
import com.intel.thinkscala._


object ComputeDomainHashes {
  def main(args : Array[String]){
	  val store = Pool.get
	  try{
		  store.computeUrlDomainHashes
	  }
	  Pool.release(store)
   }
}
 