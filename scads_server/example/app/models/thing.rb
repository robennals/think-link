class Thing < Scads::Entity::Base
  searchable_by :name
  has_many :sub_things
end
