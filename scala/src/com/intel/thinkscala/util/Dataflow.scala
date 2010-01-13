package com.intel.thinkscala.util

import scala.io.Source
import java.io._

trait TabData {
	def getTabLine : String
}

object Dataflow {
	// Given an input file, apply func to all lines in the file, and write the
	// results to a new file
	// This may be done in parallel, in which case the results may not be written in order
	def mapFile(infile : String, outfile : String, func : String => Seq[TabData]){
		val in = new BufferedReader(new FileReader(infile))
		val out = new PrintWriter(new FileWriter(outfile),true)
		var line = in.readLine()
		var linecount = 0
		while(line != null){
			try{
				val results = func(line)
				results foreach (result => out.println(result.getTabLine))
			}catch{
				case e : Exception => {
					System.err.println("error for line : "+linecount)
					System.err.println("exception: "+e.getMessage)
				}
			}
			line = in.readLine()
			linecount += 1
		}
		out.close
		in.close
	}	
	
	def tabLine(data : String*) = data.mkString("\t")
}
