#!/usr/bin/ruby

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

$names = {}

$count = 0
$bigcount = 0

outfile = File.new("names","w")

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
				
		target = target.gsub(/\|.*/,"")
		if  target =~ /:/ || 
				target[0,1] =~ /[^a-zA-Z 0-9]/ 
			# do nothing
		else
			if $names.has_key? name && $names[name] != target
				$names[name] = "X"		# mark as ambiguous
			else
				$names[name] = target
			end
			$count = $count + 1
			$bigcount = $bigcount + 1
		end
	end	
	if $count > 10000
		puts $bigcount
		$count = 0
	end
end

$names.each do |name,target|
	outfile.puts "#{name}->#{target}"
end


