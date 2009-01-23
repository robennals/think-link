#!/usr/bin/ruby

# require 'ruby-debug'

$title = "";
$articles = {}

#function get_article(name)
#	if ! $articles.has_key? name 
#		$articles[name] = []
#	end
#end
#
#function add_link(from,to)
#	links = get_article from
#	links.each do |link|
#		if link == to
#			return
#		end
#	end
#	links.push to
#end

$files = {}

def get_file(from,to)
	filename = ("out/"+from[0,1]+to[0,1]).downcase
	if ! $files.has_key? filename
		$files[filename] = File.new(filename,"w")
		puts filename
	end
	return $files[filename]
end

def close_files()
	$files.each do |name,file|
		file.close
	end
end

ARGF.each do |line|
 	if line =~ /<title>.+<\/title>/
 		$title = line.gsub(/^.*<title>(.+)<\/title>.*\n?$/,"\\1") 		
# 		puts $title
	end
	links = line.scan /\[\[([^\]]*)\]\]/
	links.each do |link|
		target = link[0]
		target = target.gsub(/\|.*/,"")
		target = target.gsub(/^\s+/,"")
		if  target =~ /:/ || 
				$title =~ /:/ ||
				target[0,1] =~ /[^a-zA-Z 0-9]/ ||
				$title[0,1] =~ /[^a-zA-Z 0-9]/ 
			# do nothing
		else
			if ($title[0,1]+target[0,1]) =~ /^[a-zA-Z 0-9]*$/
				file = get_file($title,target)
				file.puts "#{$title}->#{target}"		
			end
		end
	end
end

close_files

