$letters = "0123456789abcdefghijklmnopqrstuvwxyz";

def add_link(hsh,from,to)
	hsh[from] = [] if !hsh.has_key? from
	hsh[from].each do |other|
		return if other == to
	end
	hsh[from].push to
end

$letters.scan(/./).each do |x|
	$letters.scan(/./).each do |y|
		break if y > x 
		puts "processing - #{x}#{y}"
		fromfile = File.open "out/#{x}#{y}"
		linksfrom = {}
		fromfile.each do |line|
			links = line.scan(/(.+)->(.+)/)
			links.each do |link|
				add_link linksfrom,link[0],link[1]
			end		
		end
		fromfile.close
		linksto = {}
		tofile = File.open "out/#{y}#{x}"
		tofile.each do |line|
			links = line.scan(/(.+)->(.+)/)
			links.each do |link|
				add_link linksto,link[0],link[1]
			end
		end
		tofile.close
		outfile = File.new("filtered/#{x}#{y}","w")
		linksfrom.each do |from,links|
			links.each do |to|
				next if from == to
				next if to > from
				if linksto.has_key? to
					linksto[to].each do |other|
						if other == from
							outfile.puts "#{from}->#{to}"
#							puts "#{from}->#{to}"
						end
					end
				end
			end
		end
		outfile.close 
	end
end