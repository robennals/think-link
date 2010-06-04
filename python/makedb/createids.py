
"""
Merge together several stores and assign unique ids to elements that do not
yet have ids.

If an entity already has an id, this will be preserved.

If some properties should be unique, ignore new entities with the 
same unique properties as existing ones.
"""


import mapreduce

def make_unique(instores,unique_fields):
	tmpstore = mapreduce.OutStore("mergedstore.store")


		
