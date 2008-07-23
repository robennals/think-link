class Point < ActiveRecord::Base
	has_many :snippets
	
	validates_presence_of :title
end
