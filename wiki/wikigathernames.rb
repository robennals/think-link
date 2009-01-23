#!/usr/bin/ruby

$count = 0
$bigcount = 0

$letters = "0123456789abcdefghijklmnopqrstuvwxyz";

#TODO: this one really wants to be run with counts as well

$letters.scan(/./).each do |x|
	infile = File.open "namelinks/#{x}"
	outfile = File.new("namegathered/#{x}","w")
	
	puts x
	
	names = Hash.new do |hash,key|
		hash[key] = Hash.new {|hash,key| hash[key] = 0}
	end
		
	infile.each do |line|
		links = line.scan(/(.+) -> (.+)/)
		$count += 1
		$bigcount += 1
		links.each do |link|
			name = link[0]
			target = link[1]
			next if target =~ /:/
			names[name][target] = names[name][target] + 1
		end
	
		if $count > 10000
			puts $bigcount
		$count = 0
	end

	end
	
	
	names.each do |name,targets|
		targets.each do |target,count|
			outfile.puts "#{name}->#{target}:#{count}"
		end
	end
	
	infile.close
	outfile.close
end
	

