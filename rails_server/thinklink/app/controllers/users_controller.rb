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
