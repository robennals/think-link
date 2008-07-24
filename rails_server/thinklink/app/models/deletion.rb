class Deletion < ActiveRecord::Base
  belongs_to :snippet
  belongs_to :user
end
