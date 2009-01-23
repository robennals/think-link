#/usr/bin/ruby

#require 'ruby-debug'

out = File.new("redirects","w")

$title = ""
ARGF.each do |line|
 	if line =~ /<title>.+<\/title>/
 		$title = line.gsub(/^.*<title>(.+)<\/title>.*\n?$/i,"\\1") 		
	end
	redirs = line.scan /\#redirect\s*\[\[([^\]]+)\]\]/i
	redirs.each do |target|
	 	next if $title.downcase == target[0].gsub(/\s/,"").downcase
		out.puts "#{$title}->#{target}"
	end
end
out.close
