#  Copyright 2008 Intel Corporation
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

class Store
	include Datastore
	def initialize
		initialize_datastore
	end
end

$store = Store.new

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
	
	
	def api_emit(obj,opts = {})
		respond_to do |format|
			format.html {}
			format.xml { render :xml => obj.to_xml(opts)}
			format.json { render :text => obj.to_json(opts)}
			format.js {render :text => "thinklink_callback(" + obj.to_json(opts) + ")"}
		end
	end
	
	
	def emit(obj,opts = {})
		respond_to do |format|
			format.html {}
			format.xml { render :xml => obj.to_xml(opts)}
			format.json { render :text => obj.to_json(opts)}
			format.js {render :text => "thinklink_callback(" + obj.to_json(opts) + ")"}
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
		return rand(100000000000)
	end
	
	def logTopicView(topic)
		Topic.connection.execute("INSERT INTO topicviews (user_id,topic_id) VALUES ('#{@user.id}','#{topic.id}');")
	end

	def logPointView(point)
		Topic.connection.execute("INSERT INTO pointviews (user_id,point_id) VALUES ('#{@user.id}','#{point.id}');")
	end


  def escape_single_quotes(str)
    return str.gsub(/[']/, '\\\'')
  end

	

end
