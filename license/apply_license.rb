
require 'tempfile'

class File
	def self.prepend(path, string)
	  Tempfile.open File.basename(path) do |tempfile|
	    # prepend data to tempfile
	    tempfile << string
	
	    File.open(path, 'r+') do |file|
	      # append original data to tempfile
	      tempfile << file.read
	      # reset file positions
	      file.pos = tempfile.pos = 0
	      # copy all data back to original file
	      file << tempfile.read
      end
    end
  end
end

def get_file_as_string(filename)
  data = ''
  f = File.open(filename, "r") 
  f.each_line do |line|
    data += line
  end
  return data
end

def has_license filename
	file = File.open filename
	haslicense = false
	file.each do |line|
		if line.match(/.*Copyright 2008 Intel Corporation.*/)
			file.close
			return true
		end
	end
	file.close
	return false
end

def apply_license(license, filename)
	if !has_license filename
		puts "Applying license #{license} to #{filename}"
		license = get_file_as_string("license/"+license)
		File.prepend(filename,license)
	else
		puts "skipping - #{filename}"
	end
end

def contains_any (string,matches)
	matches.each do |substr|
		if string.include? substr
			return true
		end
	end
	return false
end

def skip_file_license? filename
	return contains_any(filename,["jquery","facebook","vendor","scads","ui.","railsjs"])	
end

require 'find'

Find.find(".") do |path|
	if skip_file_license? path
		# do nothing
	elsif path.match(/.*\.php$/)
		apply_license "license_php.txt", path
	elsif path.match(/.*\.rb$/)
		apply_license "license_ruby.txt", path
	elsif path.match(/.*\.js$/)
		apply_license "license_js.txt", path		
	end
end