
# CrapBase is a really crap implementation of an API similar to that used by
# Cassandra and BigTable

# CrapBase makes no attempt at performance, scalability, or reliability
# The intention of crapbase is to provide a straw man implementation of a SCADs
# API to allow us to play with using it before having to go to the effort of
# implementing it properly on something like Cassandra

$root_path = "C:/users/rob/git/thinklink/"

$log_file = $root_path+"store/log"
$data_file = $root_path+"store/data"

class CrapBase
	def hello
		puts "hello"
	end

	# TODO: batching of requests	
	def put(table,key,columnfamily,column,value)
		add_log_entry(table,key,columnfamily,column,value)
		memory_put(table,key,columnfamily,column,value)
	end
	
	# ensure the puts have actually been permanently committed
	def flush_puts
		@log.flush
	end
	
	def get(table,key,columnfamily,column)
		row_h = get_super_column(table,key,columnfamily)
		return row_h[column]
	end
	
	def get_super_column(table,key,columnfamily)
		table_h = hash_open(@data,table)
		family_h = hash_open(table_h,columnfamily)
		row_h = hash_open(family_h,key)
		return row_h
	end
		
	def dump_table(table)
		return @data[table].to_yaml
	end
	
	def update_disk
		save_tables
		@log.close
		@log = File.open($log_file,"w")
	end
	
	def close
		@log.fsync
		@log.close
	end	

private
		
	def hash_open(hash,key)
		if !hash.has_key? key
			hash[key] = {}
		end
		return hash[key]			
	end	
				
	def memory_put(table,key,columnfamily,column,value)
		table_h = hash_open(@data,table)
		family_h = hash_open(table_h,columnfamily)
		row_h = hash_open(family_h,key)
		row_h[column] = value
	end			
				
	def load_tables
		file = File.open($data_file)
		data = YAML.load(file)
		file.close
	end

	def save_tables
		file = File.open($data_file,"w")
		file.puts(@data.to_yaml)
		file.close
	end
	
	def escape(string)
		string = string.gsub("\\","\\\\")
		string = string.gsub("\n","\\n")
		string = string.gsub(":","\!")
		return string
	end
	
	def unescape(string)
		string = string.gsub("\!",":")
		string = string.gsub("\\n","\n")
		string = string.gsub("\\\\","\\")
		return string
	end

	def add_log_entry(table,key,columnfamily,column,value)		
		@log.puts(escape(table)+":"+escape(key)+":"+escape(columnfamily)+":"+escape(column)+":"+escape(value)+"\n")
	end

	def replay_log(logfile)
		logfile.each do |line|
			parts = line.split ":"
			memory_put(parts[0],parts[1],parts[2],parts[3],parts[4])
		end
	end

	def initialize
		@data = {}
		if File.exists?($data_file)
			load_tables
		end
		if File.exists?($log_file)
			log = File.open($log_file)
			replay_log(log)
			log.close
			save_tables
		end
		@log = File.open($log_file,"w")
	end	
end