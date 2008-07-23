class NewsController < ApplicationController

	layout 'standard'

	# TODO don't show points you have already seen
	# Allow ordering by time, etc
	# Bias according to friends
	def index
		emit(Snippet.all(:limit => 10))
	end
	
	
	
	private
	
	
end
