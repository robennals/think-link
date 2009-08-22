package com.intel.thinkscala.pages
import com.intel.thinkscala._


object Login {
  def login(title : String, path : String) =
    <div class="content">
    	<h1>{title}</h1>
		<div class="message">
	      Enter the email address and password that you used to register with Dispute Finder.
	    </div>		
	    <div class='message'>
          If you don't have a Dispute Finder account then <a href={Urls.signup}>sign up</a>
        </div>
 	    <div class='message'>
          If you have lost your password then we can <a href={Urls.emailpass}>retreive your password</a>
        </div>

	    <form class='form' id="login" action="login" method="POST">	   
            <input class='hidden' type='hidden' name='url' value={path}/>
	        <label for="email">email</label>
	        <input type="text" name="email"/>
	        <p><label for="password">password</label>
	        	<input type="password" id="password" name="password"/></p>
	        <input class='submit' type="submit" value="Login"/>
	    </form>
    </div>
    
    // TODO: sign up with facebook connect
  def signup = 
    <div class='content'>
    	<h1>Sign up for a Dispute Finder Account</h1>
           <p>Reasons to sign up for a Dispute Finder account:
             <ul>
               <li>Add new claims to Dispute Finder</li>
               <li>Find more snippets that make disputed claims</li>
               <li>Tell Dispute Finder what claims you don't want it to highlight again</li>
             </ul>
           </p>
    	<form class='form' id='signup' action="signup" method="POST">
            <p>
               <label for="name">name</label>
               <input type="text" id="name" name="name"/>
            </p>
            <p>
               <label for="email">email</label>
               <input type="text" id="email" name="email"/>
            </p>
            <p>
               <label for="password">password</label>
               <input type="password" id="password" name="password"/>
            </p>
            <input class='submit' type="submit" value="Create Account"/>
    	</form>
    </div>
    
  def emailpass = 
    <div class='content'>
      <h1>Retreive your password</h1>
 	  <div class="message">
       Enter the email address you used to sign up and we will email you your password.
     </div>		

      <form class='form' id='emailpass' action='emailpass' method ='POST'>
		<p>
		  <label for="email">email</label>
		  <input type="text" id="email" name="email"/>
		</p>
		<p>
		  <input class='submit' type='submit' value='Retrieve Password'/>
		</p>
      </form>
    </div>    
}
