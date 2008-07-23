class Point < ActiveRecord::Base
	has_many :snippets
	belongs_to :creator, :class_name => :user
	has_many :users, :through => :snippets, :uniq => true
#	has_many :point_links_a, :class_name => 'PointLink', :source => 'point_a'
#	has_many :point_links_b, :class_name => 'PointLink', :source => :point_b
	
	def point_links_a
		return PointLink.find :all, :conditions => "point_a_id = #{self.id}"
	end
	def point_links_b
		return PointLink.find :all, :conditions => "point_b_id = #{self.id}"
	end

	
	validates_presence_of :txt
end
