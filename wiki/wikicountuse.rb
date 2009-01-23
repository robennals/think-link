#!/usr/bin/ruby

$title = "";
$articles = {}

$names = {}

$count = 0
$bigcount = 0

# require 'ruby-debug'

$letters = "0123456789abcdefghijklmnopqrstuvwxyz";

#TODO: this one really wants to be run with counts as well

$prefixes = {}

#total links is 143 million. (if one byte each then 143 Mb)
#3.5 Gb of link data
#considering only common links reduces by a factor of 20 (so should fit in memory)
#small wiki is 1,409,479 lines and 142,606,336 bytes (142Mb)
#big wiki is thus ~ 207,657,654 lines
#actually turns out to be 313,320,000 lines

# $prefixes = {"premium service" => 0, "premium" => 0}

$letters.scan(/./).each do |x|
	infile = File.open "namepruned/#{x}"

	puts x
	
	# load the prefixes		
	infile.each do |line|
		links = line.downcase.scan(/(.+):(.+)/)
		links.each do |link|
			name = link[0]
			words = name.scan(/\w+/)

			(0..words.length).each do |length|
				prefix = words[0..length]
				$prefixes[prefix.join " "] = 0
			end
			
			$count+=1
			
			if $count % 10000 == 0
				puts "reading words:#{$count}"
			end
		end
	end
	
	infile.close		
end

$count = 0		
ARGF.each do |line|
	words = line.downcase.scan(/\w+/)
	(0..words.length-1).each do |start|
		(1..words.length - start).each do |length|
			prefix = words[start...start+length].join " "
			if $prefixes.has_key? prefix
				$prefixes[prefix]+=1
			else
				break
			end
		end
	end	
	$count+=1
	if $count % 10000 == 0
		puts "reading wiki:#{$count}"
	end
end

outfile = File.new "prefixfreqs", "w"
$prefixes.each do |prefix,count|
	outfile.puts "#{prefix}:#{count}"
end

