package com.intel.thinkscala.runner

object ComputeDomainHashes {
  def main(args : Array[String]){
	  val store = Pool.get
	  try{
		  store.computeUrlDomainHashes
	  }
	  Pool.release(store)
   }
}
