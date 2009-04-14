package com.intel.thinkscala

object Runner extends Application {
  System.out.println("hello world\n");
  System.out.println("hello again\n");
  val snips = SnipSearch.searchYahoo("global warming is a scam");
}
