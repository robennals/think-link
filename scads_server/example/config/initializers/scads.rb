[Thing, SubThing]

SCADS_SERVER.registerType(:Thing)
SCADS_SERVER.registerType(:SubThing)

t = Thing.new
t[:name] = "thing1"
t.save

s1 = SubThing.new
s1[:name] = "sub thing 1"
s1[:thing] = t
s1.save

s2 = SubThing.new
s2[:name] = "sub thing 2"
s2[:thing] = t
s2.save