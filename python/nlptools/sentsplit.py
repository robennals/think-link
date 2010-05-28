"""
split text into sentences.
Every full stop followed by whitespace is considered to end a sentence, 
unless it is proceeded by or part of a known non-full-stop phrase"
"""

notend = set(["sen","mt","mr","mrs"," dr"," sir"," u"," s"," a"," ms"])

notend1 = set(["u","s","a"])
notend2 = set(["mr","mt","dr","ms"])
notend3 = set(["sen","mrs","sir"])
notend4 = set(["prof","miss"])

def first_sentence(text):
	pos = text.find(".")
	while pos != -1:
		if not endswith_ender(text[:pos]):
			return text[:pos]
		pos = text.find(".",pos+1)
	return text
	
def endswith_ender(text):
	text = text.lower()
	for ender in notend:
		if text.endswith(ender):
			return True
	return False	
