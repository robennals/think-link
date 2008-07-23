class Point < ActiveRecord::Base
	has_many :snippets
	belongs_to :creator, :class_name => :user
	has_many :users, :through => :snippets, :uniq => true
	
	validates_presence_of :txt
end
