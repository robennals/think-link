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
		cookies[:email] = {:value => params[:email], :path => "/api"}
		cookies[:password] = {:value => params[:password], :path => "/api"}
		user = get_user 
		if user['id'] != 0
			api_emit :result => 'success', :id => 'id', 'login'
		else
			api_emit :error => 'bad login', 'badlogin'
		end
	end
	
private

	def get_user(email = cookies[:email], password=cookies[:password])
		user = $store.get_user email, password
		if !user
			user = {'id' => 0, 'name' => 'no user logged in'}
		end
		return user
	end
		
end
