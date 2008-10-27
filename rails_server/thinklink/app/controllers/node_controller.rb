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

class NodeController < ApplicationController

	layout 'mini'

	def show
		user = get_user
		@user = user
		$store.log_view user['id'],params[:id]
		info = $store.get_links params[:id]
		info.delete 'password'
		info.delete 'email'
		@object = info
		emit info, 'object'
	end
	
	def create
		type = params[:type]
		info = json_decode(params[:info])
		user = get_user
		id = $store.add_node type,user['id'],info
		redirect_to "/api/#{id}"
	end
	
	def add_node
		user = get_user
		type = params[:type]
		info = json_decode(params[:info])
		id = $store.add_node type, user['id'], info
		api_emit id
	end
	
	def rating
		rating = params[:rating]
		id = params[:id]
		user = get_user
		$store.set_rating id,user['id'],rating
		api_emit :result => 'success'
	end
	
	def order
		order = params[:order]
		id = params[:id]
		user = get_user
		$store.set_order id,user['id'],order
		api_emit :result => 'success'
	end

	def search
		@user = get_user
		@object = search_object
		emit @object, 'object'
	end
	
	def recent
		@user = get_user
		@object = recent_object
		emit @object
	end
	
	def index
		@user = get_user
		@object = recent_object
	end
	
private

	def gather_urls
		count = 1
		urls = {}
		while params.has_key? "url#{count}".intern
			urls[params["url#{count}".intern]] = true
			count += 1
		end
		if params.has_key? :url
			urls[params[:url]] = true
		end
		return urls.keys
	end
	
	def get_user(email = cookies[:email], password=cookies[:password])
		user = $store.get_user email, password
		if !user
			user = {'id' => 0, 'name' => 'no user logged in'}
		end
		return user
	end
	
	def recent_object
		recent = $store.get_recent @user['id']
 		return {'id' => 0, 'text' => "Recent Claims and Folders", 'type' => "recent", 'from' => {}, 
	 		'to' => {"colitem" => recent}}
	end
	
	def search_object
		query = params[:query]
		results = $store.search query
		return {'id' => 0, 'text' => "Search results for '#{query}'", 'type' => "search", 'from' => {},
			'to' => {"colitem" => results}}
	end

	
end
