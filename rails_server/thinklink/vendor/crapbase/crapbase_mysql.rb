require 'active_record'

	#TODO: allow multiple triggers to be attached to the same table
	#TODO: allow a trigger to be attached just to a particular column family?
	#TODO: new trigger approach that just walks though the list and sees what matches
	#				- allowing arbitrary criteria


module CrapBase
	def selectrows(table,key,family)
		return "SELECT value FROM #{table}_#{family} WHERE keyname='#{esc key}' "
	end

	def get_column(table,key,family,column)
		return sql_select_value(selectrows(table,key,family) + " AND columnname='#{esc column}'")
	end
	
	def get_all(table,key,family)
		rows = sql_select_all("SELECT columnname,value FROM #{table}_#{family} WHERE keyname='#{esc key}'")
		hsh = {}
		rows.each do |row|
			hsh[row['columnname']] = row['value']
		end
		return hsh
	end

	def get_slice(table,key,family,start,count)
		return sql_select_all("SELECT columnname,value FROM #{table}_#{family} WHERE keyname='#{esc key}' LIMIT #{start},#{count}")
	end

	def get_column_count(table,key,family)
		return sql_select_value("SELECT COUNT(columnname) FROM #{table}_#{family} WHERE keyname='#{esc key}'")
	end
	
	def insert(table,key,family,column,value)
		batch_insert(table,key,{family => {column => value}})
	end

	def batch_insert(table,key,valuemap)
		run_triggers(table,key,valuemap)
		valuemap.each do |family, familymap|
			familymap.each do |column, value|
				if value.class == Hash
					value = value.to_json
				end
				sql_insert("REPLACE DELAYED INTO #{table}_#{family} (keyname,columnname,value) VALUES ('#{esc key}','#{esc column}','#{esc value}')")
			end
		end
	end

	def batch_insert_blocking(table,key,valuemap)
		run_triggers(table,key,valuemap)
		valuemap.each do |family, familymap|
			familymap.each do |column, value|
				if value.class == Hash
					value = value.to_json
				end
				sql_insert("REPLACE INTO #{table}_#{family} (keyname,columnname,value) VALUES ('#{esc key}','#{esc column}','#{esc value}')")
			end
		end
	end
	
	def add_trigger(options,&callback)
		@triggers.push :options => options, :callback => callback
	end
	
	def add_batch_trigger(options,&callback)
		@triggers.push :options => options, :callback => callback, :keys => {}
	end	
	
	def get_column_json(table,key,family,column)
		JSON.parse(get_column(table,key,family,column))
	end
	
	def new_guid
		return sql_insert("INSERT INTO scads_ids () VALUES ()")
#		return sql_select_value("SELECT UUID()")
	end	

	def flush_tables
		sql_execute("flush tables")
	end

	def create_tables tables
		tables.each do |table,families|
			families.each do |family|
				sql_execute("
					CREATE TABLE IF NOT EXISTS #{table}_#{family} (
						keyname VARCHAR( 2048 ) NOT NULL ,
						columnname VARCHAR( 2048 ) NOT NULL ,
						value VARCHAR ( 4096 ),
						UNIQUE INDEX (keyname(64),columnname(64))  
						) ENGINE = MYISAM")
			end
		end
		
		sql_execute("CREATE TABLE IF NOT EXISTS scads_ids (
			id int(11) unsigned NOT NULL auto_increment,
			PRIMARY KEY (id)			
			) ENGINE = MYISAM")
	end
	
	def delete_tables tables
		tables.each do |table,families|
			families.each do |family|
				sql_execute "DROP TABLE IF EXISTS #{table}_#{family}"
			end
		end
		sql_execute("DROP TABLE IF EXISTS scads_ids")
	end
	
	#fake write to cause a batch trigger to run	
	def dirty_object table,key,mode
		run_triggers table,key,{},mode
	end			
		
private	
	def matches(table,valuemap,mode,opts)
		if opts[:table] != table
			return false
		elsif opts[:family] && !valuemap.has_key?(opts[:family])
			return false
		elsif opts[:column] && !valuemap[opts[:family]].has_key?(opts[:column])
			return false
		elsif opts[:mode] && !opts[:mode] == mode
			return false
		else
			return true
		end		
	end

	def run_triggers(table,key,valuemap,mode=nil)
		@triggers.each do |trigger|
			if matches(table,valuemap,mode,trigger[:options])
				if trigger[:keys]
					trigger[:keys][key] = true
#					if !trigger[:thread]
#						trigger[:thread] = Thread.new do
#							if opts[:delay]
#								sleep opts[:delay]									
#							end
#							trigger[:callback].call(trigger[:keys])
#							trigger[:keys] = []
#							trigger[:thread] = nil
#						end
#					end
				else
					trigger[:callback].call(table,key,valuemap)
				end
			end
		end
  end
		
	def run_batch_triggers
		@triggers.each do |trigger|
			if trigger[:keys] && trigger[:keys].length != 0
				keys = trigger[:keys]
				trigger[:keys] = {}
				trigger[:callback].call(keys)
			end
		end
	end		
		
	def initialize_crapbase
		@triggers = []
		@batch_triggers = []
	end
	
	def sql_select_value(sql) 
		return ActiveRecord::Base.connection.select_value(sql)
	end
	
	def sql_select_all(sql)
		return ActiveRecord::Base.connection.select_all(sql)
	end
	
	def sql_insert(sql)
		return ActiveRecord::Base.connection.insert(sql)
	end
	
	def sql_execute(sql)
		ActiveRecord::Base.connection.execute(sql)
	end
	
	def esc(str)	
		return Mysql::escape_string(str.to_s)
	end
	
end