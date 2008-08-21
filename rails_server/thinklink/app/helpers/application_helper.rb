# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
	def auth_correct?(email = cookies[:email], password = cookies[:password])
  	@user = User.find_by_email(email)
		if @user and @user.password == password
			return true
		else
			return false
		end
	end
	
	def check_auth(email = cookies[:email], password = cookies[:password])
		unless auth_correct?(email,password)
			flash[:error] = 'You need to be logged in to do this'
			redirect_to :controller => 'main', :action => 'login'
		end
	end
	
	def setup_auth
		auth_correct? #will set up @user param
	end
	
	def emit(obj,opts = {})
		respond_to do |format|
			format.html {}
			format.xml { render :xml => obj.to_xml(opts)}
			format.json { render :text => obj.to_json(opts)}
			format.js {render :text => "tl_callback(" + obj.to_json(opts) + ")"}
		end
	end
	
	def trim_string (string,length=400)
		if(string.length < length)
			return string
		else
			return string[0,length] + "..."
		end
	end
	
	def trim_url url
		matches = url.match(%r{http://([^/]*)});
		if matches && matches[1]
			return matches[1];
		else
			return url
		end
	end
	
	def render_points points
		render :partial => 'main/itemlist', 
					 :locals => {:itemlist => points, 
					 		:options => {:noauthor => true}, 
					 		:renderer => 'points/pointref'}, 
					 	:layout => 'standard'
	end
	def render_snippets snippets
		render :partial => 'main/itemlist', 
					 :locals => {:itemlist => snippets, 
					 		:options => {:noauthor => true}, 
					 		:renderer => 'snippets/snippet'}, 
				 	:layout => 'standard'
	end

	def initialize
		@uniq = 0
	end

	def getUniq
#		@uniq = @uniq+1
		return rand(100000)
	end

  def escape_single_quotes(str)
    return str.gsub(/[']/, '\\\'')
  end


end
