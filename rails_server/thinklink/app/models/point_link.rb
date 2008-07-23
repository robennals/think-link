class PointLink < ActiveRecord::Base
	belongs_to :point_a, :class_name => 'Point'
	belongs_to :point_b, :class_name => 'Point'
	
#	def point_a 
#		Point.find self.point_a_id
#	end
	
#	def point_b
#		Point.find self.point_b_id
#	end
end
