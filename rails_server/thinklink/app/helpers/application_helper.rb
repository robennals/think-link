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

require 'rexml/document'

class Store
	include Datastore
	def initialize
		initialize_datastore
	end
end

$store = Store.new

# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
	def get_user(email = cookies[:email], password=cookies[:password])
		user = $store.get_user email, password
		if !user
			user = {'id' => 0, 'name' => 'no user logged in'}
			if email
				user['error'] = "login failed"
			end
		end
		if cookies[:pluginversion]
			user['pluginlogin'] = true
		end
			
		return user
	end

	def api_emit(action,obj)
		emit(obj,action)
	end

	def emit(obj,action = 'object', opts = {})
		respond_to do |format|
			format.html { render :action => action }
			format.xml { render :xml => obj.to_xml(opts)}
			format.json { render :text => obj.to_json(opts)}
			format.rss { render :text => make_rss(obj)}
			format.js {
				if params[:callback]
					render :text => params[:callback]+"(" + obj.to_json(opts) + ")"
				else
					render :text => "thinklink_callback(" + obj.to_json(opts) + ")"
				end
			}
		end
	end
	
	def get_urlbase
		hostname = Socket.gethostname
		if hostname == "rob"
			return "http://localhost:3000"
		else
			return "http://durandal.cs.berkeley.edu/tl"
		end
	end
	
	def make_rss(obj)
		urlbase = get_urlbase
		doc = REXML::Document.new("<rss version='2.0'/>");
		channel = doc.root.add_element("channel");
		xml_prop channel,"title",obj['text']
		xml_prop channel,"link",urlbase+"/node/"+obj['id']
				
		obj['to'].each do |verb,things|
			if verb != 'states'
				things.each do |link|
					item = channel.add_element "item"
					xml_prop item,"title",link['text']
					if link['date']
						xml_prop item,"pubDate",link['date']
					end
					xml_prop item,"link",urlbase+"/node/"+link['id'].to_s				
					xml_prop item,"guid",urlbase+"/node/"+link['id'].to_s
					summary = $store.get_summary_text link['id'].to_s
	#				snippet = $store.get_first_snippet link['id'].to_s
	#				if snippet && snippet['text'] 
						xml_prop item,"description",summary
						# + trim_string(snippet['title'],40) + " - " + trim_string(snippet['url'],40)
	#				end
				end
			end
		end 
		return doc.to_s
	end
	
	def xml_prop(parent,name,text)
		txt = parent.add_element(name);
		txt.add_text text
	end

	def json_decode(json)
		return ActiveSupport::JSON.decode(json)
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
	
	def initialize
		@uniq = 0		
	end

	def getUniq
#		@uniq = @uniq+1
		return rand(100000000000)
	end
end
