class UsersController < ApplicationController
	layout 'standard'
	def show
		@showuser = User.find(params[:id])
	end
	def points
		@showuser = User.find(params[:id])
		@title = "Recent points read by #{@showuser.email}"
		render_points @showuser.points
	end
	def snippets
		@showuser = User.find(params[:id])
		@title = "Recent snippets read by #{@showuser.email}"
		render_snippets @showuser.snippets
	end
end
