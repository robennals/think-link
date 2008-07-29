class Topic < ActiveRecord::Base
  has_many :point_topics
  has_many :points, :through=> :point_topics
  belongs_to :users
end
