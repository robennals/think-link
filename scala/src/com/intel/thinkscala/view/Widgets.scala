package com.intel.thinkscala.view
import scala.xml._
import scala.collection.mutable.HashMap

object Widgets {
  def greyInput(cls : String, id : String, previewtext : String) = 
    <input name={id} class={cls} style="color:gray" onfocus="ungrey(this)" value={previewtext}/>
    
  def action(row : SqlRow, action : String, name : String) =
    <a class={"action-"+action} href={"/thinklink/api/action?id="+row("id")}>{name}</a>

  
  def tabs(options : (String,() => NodeSeq)*)(implicit c : ReqContext) : NodeSeq = {
    var selected = c.arg("tab")
    if(selected == null){
    	selected = options.first._1
    }
    return {
		<div class="tabs">
		  <div class="header">
		    {options flatMap {
		      case (name,_) if name == selected => <span>{name}</span>
		      case (name,_) => <a href={c.modifiedUrl("tab" -> name, "page" -> 0)}>{name}</a>
		    }}
		  </div>
		  <div class="tabbody">
		    {options flatMap {
		      case (name,func) if name == selected => func()
		      case _ => NodeSeq.Empty 
		     }}
		  </div>
		</div>
    }
  }
  
  def ajaxTabs(options : (String,NodeSeq)*) = 
     <div class="tabs">
        <div class="header">                
            {options.first match {
		      case (name,_) => <span>{name}</span>
            }}
            {options.drop(1) flatMap {
		      case (name,_) => <a onclick="selectTab()">{name}</a>              
            }}                                
        </div>
        <div class="body">
          {options flatMap {
            case (name,content) => <div class="panel" id={"tab-"+name}>{content}</div> 
          }}
        </div>
     </div>
                 
//  def tabs(param : String, options : Array[String], selected : String) = 
//    <div class="tabs">
//      options map (s => if(s equals selected){
//        <a class="selected">s</a>
//      }else{
//        <a>s</a>
//      }) 
//    </div>  
    
  def ajaxSearch(id : String, fragurl : String, initquery : String, content : NodeSeq) =
    <div id={id}>
	  <form onsubmit={"ajaxSearch("+fragurl+","+id+")"}>        
        <input type="text" class="query" name="query" value={initquery}/>
        <input type="submit" class="submit" value="Search"/>
	  </form>
      <div class="ajaxcontent">
        {content}
      </div>
   </div>    
   
  def simpleSearch(url : String, initquery : String, emptytext : String) =
    <div>
	  <form id="search" method="GET" action={url}>     
        {if(initquery == null){
          greyInput("query","query",emptytext)
        }else{
        <input type="text" class="query" name="query" value={initquery}/>
        }}
        <input type="submit" class="submit" value="Search"/>
	  </form>
   </div>    

  def pageSelector(current : Int,cls: String)(implicit c : ReqContext) =
    <div class={cls}>
       <span>page {current+1}</span>
       {if(current > 0){<a href={c.modifiedUrl("page",current-1)}>prev</a>}else{}}
       <a href={c.modifiedUrl("page",current+1)}>next</a>      
    </div>
   
   def pagedList(content : Int => NodeSeq)(implicit c : ReqContext) : NodeSeq = {
     val current = c.argIntDflt("page",0)
     (<div class="pager">
        {pageSelector(c.argIntDflt("page",0),"selectortop")}
     	{content(current)}
     	{pageSelector(c.argIntDflt("page",0),"selectorbottom")}
     </div>)
     }
}