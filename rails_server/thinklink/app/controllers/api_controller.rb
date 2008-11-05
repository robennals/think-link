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

#  This controller is used for API functions that don't really make sense as
#  operations on objects. Some of these should perhaps be somewhere else

class ApiController < ApplicationController
	layout 'mini'
		
	def login
		if request.post?
			cookies[:email] = {:value => params[:email], :path => "/api"}
			cookies[:password] = {:value => params[:password], :path => "/api"}
			cookies[:email] = {:value => params[:email], :path => "/scripthack"}
			cookies[:password] = {:value => params[:password], :path => "/scripthack"}
			cookies[:email] = {:value => params[:email], :path => "/node"}
			cookies[:password] = {:value => params[:password], :path => "/node"}

			user = get_user 
			if user['id'] != 0
				api_emit 'goodlogin',:result => 'success', :id => 'id'
			else
				api_emit 'badlogin',:error => 'bad login'
			end
		end
	end
	
	def logout
		if request.post?
			cookies[:password] = ""
			cookies[:email] = ""
		end
	end
		
private

	def get_user(email = cookies[:email], password=cookies[:password])
		if !email && cookies[:username]
			email = cookies[:username]
		end
		user = $store.get_user email, password
		if !user
			user = {'id' => 0, 'name' => 'no user logged in'}
		end
		return user
	end
		
end
