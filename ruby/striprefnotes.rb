
innote = false

ARGF.each do |line|
 	if line =~ /note =/
 	 	innote = true
	end
	if !innote 
		puts line
	end
	if line =~ /\},/
		innote = false
	end
end

