
def has_license file
	
end

require 'find'

Find.find(".") do |path|
	puts path 
	if path.match(/.*\.txt$/)
		puts "text file"
	end
end