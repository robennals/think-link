class Snippet < ActiveRecord::Base
	belongs_to :point
	belongs_to :user
	belongs_to :source
	has_many :ratings
	
	def avgrating
		return ratings.average("rating")
	end
end
