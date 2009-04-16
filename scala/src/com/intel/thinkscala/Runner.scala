package com.intel.thinkscala
import Util._

object Runner extends Application {
  System.out.println("hello world\n");
  System.out.println("hello again\n");
  val snips = SnipSearch.searchYahoo("global warming is a scam");
  snips.foreach(x => System.out.println(printJSON(x)))
}
