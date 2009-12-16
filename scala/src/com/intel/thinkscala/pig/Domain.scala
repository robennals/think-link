package com.intel.thinkscala.pig
import org.apache.pig._
import org.apache.pig.data._
import com.intel.thinkscala.Util._

class Domain extends EvalFunc[String] {
	def exec(tuple : Tuple) = 
		if(tuple != null && tuple.size > 0 && tuple.get(0) != null){
			hostForUrl(tuple.get(0).toString)
		}else{
			null
		}
}
