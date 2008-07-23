class Rating < ActiveRecord::Base
	belongs_to :point
	belongs_to :snippet
end
