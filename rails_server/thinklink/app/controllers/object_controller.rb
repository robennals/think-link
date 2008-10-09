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

  def showmini
		id = params[:id]
		$store.log_view id
		
		@object = $store.get_links id
  end

	def parents		
		paritems = $store.get_links_from(params[:id])
		render :partial => "paritems", :object => paritems
	end
  
  def expand
  	$store.log_view params[:id]
  	info = $store.get_info params[:id]
 		subitems = $store.get_links_to params[:id]
		render :partial => "subitems", :object => subitems, :locals => {:itemtxt => info['text']}
  end  
 

end
