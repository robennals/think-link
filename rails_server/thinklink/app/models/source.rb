class Source < ActiveRecord::Base
	has_many :snippets

	validates_length_of :name, :within => 1..30
	validates_uniqueness_of :domain, :message => "already exists"
end
