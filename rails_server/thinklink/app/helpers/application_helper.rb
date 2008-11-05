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
	def get_user(email = cookies[:email], password=cookies[:password])
		user = $store.get_user email, password
		if !user
			user = {'id' => 0, 'name' => 'no user logged in'}
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
			format.js {
				if params[:callback]
					render :text => params[:callback]+"(" + obj.to_json(opts) + ")"
				else
					render :text => "thinklink_callback(" + obj.to_json(opts) + ")"
				end
			}
		end
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
