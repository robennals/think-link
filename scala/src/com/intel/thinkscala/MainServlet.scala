package com.intel.thinkscala
import java.util.regex._
import javax.servlet.http._
import java.io._
import com.intel.thinklink._
import scala.util.matching._
import scala.util.matching.Regex._
import com.intel.thinklink.ConnectionPool
import scala.xml._

class MainServlet extends HttpServlet {
  val store = Pool.get
  
  val posthandlers = List(
    new UrlHandler("/login",c => {
      val email = c.arg("email")
      val password = c.arg("password")
      val user = store.getUser(email,password)
      if(user.realuser){
        c.setCookie("email",email)
        c.setCookie("password",password)        
        c.redirect("/thinklink/node")					// TODO: remember where the login started
      }else{
        c.outputHtml(Template.normal("Login Failed - Please Try Again",login))
      }
    })    
  )
  
  val gethandlers = List(
    new UrlHandler("/login",c => {
      c.outputHtml(Template.normal("Login",login))
    }),
    new UrlHandler("/logout",c => {
      c.setCookie("email","")
      c.setCookie("password","")
      c.redirect("/thinklink/node")
    })
  )

  val login = 
    <div class="message">
      Enter the email address and password that you used to register with Think Link
    </div>
    <form action="login" method="POST">
        <label for="email">email</label><input type="text" id="email" name="email"/><br/>
        <label for="password">password</label><input type="password" id="password" name="password"/><br/>
        <input type="submit" value="Login"/>
    </form>;
 
  override def doPost(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(posthandlers,req,res)
  }
  
  override def doGet(req : HttpServletRequest, res : HttpServletResponse){
    UrlHandler.runMatchingHandler(gethandlers,req,res)
  }
}

object Template {
  def normal(title : String, body : NodeSeq) =
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title>{title}</title>
      <link href="/thinklink/stylesheets/thinklink.css" media="screen"/>
    </head>
    <body>
      <h1>{title}</h1>
      {body}
    </body>
    </html>
  
}