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

class ObjectController < ApplicationController
	layout 'mini'
	
	before_filter :setup_auth

  def showmini
		id = params[:id]
		$store.log_view @user['id'],id
		
		@object = $store.get_links id
  end

	def parents		
		paritems = $store.get_links_from(params[:id])
		render :partial => "paritems", :object => paritems
	end
  
  def expand
  	id = params[:id]
  	$store.log_view @user['id'],id
  	info = $store.get_info id
 		subitems = $store.get_links_to id
		render :partial => "subitems", :object => subitems, :locals => {:itemtxt => info['text'], :itemtype => info['type']}
  end  
 
 	def index
 		@object = recent_object
	end

	def recent
		render :partial => 'object/focusitem', :object => recent_object  
	end
	
	def search
		render :partial => 'object/focusitem', :object => search_object
	end
	

private
	def setup_auth
		@user = $store.get_user cookies[:email], cookies[:password]
		if !@user
			@user = {'id' => 0, 'name' => 'no user logged in'}
		end
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
