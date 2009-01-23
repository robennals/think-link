#!/usr/bin/ruby

$title = "";
$articles = {}

$names = {}

$count = 0
$bigcount = 0

$files = {}

def get_file(name)
	filename = "namelinks/"+name[0,1].downcase
	if ! $files.has_key? filename
		$files[filename] = File.new(filename,"w")
		puts filename
	end
	return $files[filename]
end

ARGF.each do |line|
	links = line.scan /\[\[([^\]]*)\]\]/
	links.each do |link|
		target = link[0]
		target = target.gsub(/^\s+/,"")
		bits = target.split '|'		
		if bits[1]
			target = bits[0]
			name = bits[1]
		else		
			name = target
			target = "Y"
		end

		if name[0,1] =~ /^[a-zA-Z0-9]$/
			outfile = get_file name
			outfile.puts "#{name} -> #{target}" 			
		end
		$count = $count + 1
		$bigcount = $bigcount + 1
	end
	if $count > 10000
		puts $bigcount
		$count = 0
	end
end


