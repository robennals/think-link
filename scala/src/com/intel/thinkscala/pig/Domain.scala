package com.intel.thinkscala.pig
import org.apache.pig._
import org.apache.pig.data._
import com.intel.thinkscala.Util._
import java.io.IOException

class Domain extends EvalFunc[String] with StringFunc[String]{
	override def func(str : String) = hostForUrl(str)
}

class Hash extends EvalFunc[Int] with StringFunc[Int]{
	override def func(str : String) = str.hashCode
}


trait StringFunc[A] extends EvalFunc[A] {
	def func(str : String) : A
	
	def exec(tuple : Tuple) : A = 
		if(tuple != null && tuple.size > 0 && tuple.get(0) != null){
			func(tuple.get(0).toString)
		}else{
			throw new IOException
		}
}