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

class UsersController < ApplicationController
	layout 'standard'
	def show
		@showuser = User.find(params[:id])
		@title = @showuser.displayname
	end
	def points
		@showuser = User.find(params[:id])
		@title = "Recent points read by #{@showuser.email}"		
		#render_points @showuser.points
		@points = @showuser.points
		render  :template => 'points/index'
		
	end
	def snippets
		@showuser = User.find(params[:id])
		@title = "Recent snippets read by #{@showuser.email}"
		render_snippets @showuser.snippets
	end
	def recent
		render :partial => 'topics/topics', :object => @showuser.recenttopics.slice(0,25)
	end
end
