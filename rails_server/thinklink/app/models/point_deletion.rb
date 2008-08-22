class PointDeletion < ActiveRecord::Base
  belongs_to :point
  belongs_to :user
end
