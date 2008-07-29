class PointTopic < ActiveRecord::Base
  belongs_to :point
  belongs_to :topic
end
