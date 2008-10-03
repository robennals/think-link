require 'active_record'

	#TODO: allow multiple triggers to be attached to the same table
	#TODO: allow a trigger to be attached just to a particular column family?
	#TODO: new trigger approach that just walks though the list and sees what matches
	#				- allowing arbitrary criteria


module CrapBase
	def selectrows(table,key,family)
		return "SELECT value FROM #{table}_#{family} WHERE keyname='#{key}' "
	end

	def get_column(table,key,family,column)
		return sql_select_value(selectrows(table,key,family) + " AND columnname='#{column}'")
	end
	
	def get_all(table,key,family)
		return sql_select_all("SELECT column,value FROM #{table}_#{family} WHERE keyname='#{key}'")
	end

	def get_slice(table,key,family,start,count)
		return sql_select_all("SELECT column,value FROM #{table}_#{family} WHERE keyname='#{key}' LIMIT #{start},#{count}")
	end

	def get_column_count(table,key,family)
		return sql_select_value("SELECT COUNT(column) FROM #{table}_#{family} WHERE keyname='#{key}'")
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
				sql_insert("INSERT INTO #{table}_#{family} (keyname,columnname,value) VALUES ('#{key}','#{column}','#{value}')")
			end
		end
	end

	def batch_insert_blocking(table,key,valuemap)
		batch_insert(table,key,valuemap)
	end
	
	def add_trigger(options,&callback)
		@triggers.push :options => options, :callback => callback
	end
	
	def add_batch_trigger(options,&callback)
		@triggers.push :options => options, :callback => callback, :keys => []
	end	
	
	def get_column_json(table,key,family,column)
		JSON.parse(get_column(table,key,family,column))
	end
	
	def new_guid
		return sql_select_value("SELECT UUID()")
	end	

	def create_tables tables
		tables.each do |table,families|
			families.each do |family|
				sql_execute("
					CREATE TABLE IF NOT EXISTS #{table}_#{family} (
						keyname VARCHAR( 2048 ) NOT NULL ,
						columnname VARCHAR( 2048 ) NOT NULL ,
						value VARCHAR ( 204 ),
						INDEX ( keyname(64) ),
						INDEX ( columnname(64) )
						)")
			end
		end
	end
		
private	
	def run_triggers(table,key,valuemap)
		@triggers.each do |trigger|
			opts = trigger[:options]
			if opts[:table] == table 
				if opts.has_key?(opts[:family]) || valuemap.has_key?(opts[:family])
					if trigger[:keys]
						trigger[:keys].push key
						if !trigger[:thread]
							trigger[:thread] = Thread.new do
								if opts[:delay]
									sleep opts[:delay]									
								end
								trigger[:callback].call(trigger[:keys])
								trigger[:keys] = []
								trigger[:thread] = nil
							end
						end
					else
						trigger[:callback].call(table,key,valuemap)
					end
				end				
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
	
end