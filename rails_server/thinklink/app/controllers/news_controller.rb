require 'ruby-debug'

class NewsController < ApplicationController
	layout 'standard'

	# TODO don't show points you have already seen
	# Allow ordering by time, etc
	# Bias according to friends
	def index
#		@title = "Recent Activity"
#		@mypoints = @user.mypoints
#		@notmypoints = @user.notmypoints
		emit(Snippet.all(:limit => 10))
	end	
end
