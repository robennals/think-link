package com.intel.thinkscala.apps

import java.net._
import java.io._

object WebServer {
  def port = 8000
  
  def pat = """GET ([^\s]+)""".r
  
  def workerThread() {
    val listener = new ServerSocket(port)
    while(true){
      val socket = listener.accept()
      val input = new BufferedReader(new InputStreamReader(socket.getInputStream))
      val output = new DataOutputStream(socket.getOutputStream)
      output.writeBytes("Hello\n")
      input.close()
      output.close()
    }
  }
  
  def main(args : Array[String]){
    
  }
}
