require 'active_record'

class CrapBase
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
				return sql_insert("INSERT INTO #{table}_#{family} (keyname,columnname,value) VALUES ('#{key}','#{column}','#{value}')")
			end
		end
	end

	def batch_insert_blocking(table,key,valuemap)
		batch_insert(table,key,valuemap)
	end
	
	def add_trigger(table,policy,&callback)
		@triggers[table] = callback
	end
	
	def run_triggers(table,key,valuemap)
		if @triggers.has_key?(table)
			@triggers[table].call(table,key,valuemap)
		end
	end
	
	def initialize
		@triggers = {}
	end
	
private
	def sql_select_value(sql) 
		return ActiveRecord::Base.connection.select_value(sql)
	end
	
	def sql_select_all(sql)
		return ActiveRecord::Base.connection.select_all(sql)
	end
	
	def sql_insert(sql)
		ActiveRecord::Base.connection.insert(sql)
	end
end