"""
Analyse the answers turkers gave for data produced by "turk_data".
See if any of the users seem to have misbehaved.
"""

import csv
import turk_data as td
import claimfinder as cf


def load_data(filename):
	return [row for row in csv.DictReader(file(filename),delimiter=",",quotechar='"',quoting=csv.QUOTE_ALL,escapechar='\\')]

def print_workers(rows):
	workers = {}
	for row in rows:
		workerid = row["WorkerId"]
		if row["AssignmentStatus"] == "Rejected": continue
		workers[workerid] = workers.get(workerid,0) + 1
	sorted = cf.sorted_freqs(workers)
	for k,v in sorted:
		print k,v

def get_answers(rows,worker=None,workerset=None):
	answers = []
	for row in rows:
		workerid = row["WorkerId"]
		if worker and worker != workerid: continue
		if workerset and not worker in workerset: continue
		if row["AssignmentStatus"] == "Rejected": continue
		if row["AssignmentStatus"] == "Accepted": continue
		for i in range (1,11):
			snip = row["Input.snip"+str(i)]
			answer = row["Answer.Q"+str(i)]
			answers.append((workerid,snip,answer,row["HITId"]+str(i)))
	return answers
	
def print_answers(answers):
	for worker,snip,choice,hit in answers:
		print choice,"--",snip,"\n" 

def is_gold_wrong(answer):
	worker,snip,choice = answer
	if snip in td.good_gold and choice != "good": return True
	if snip in td.bad_gold and choice == "good": return True
	return False
	
def get_gold_wrong(answers): return [answer for answer in answers if is_gold_wrong(answer)]	

approved = set()
rejected = set()

def approve_workers(workers,rows):
	for worker in workers:
		approve_worker(worker,rows)

def approve_worker(workerid,rows):
	for row in rows:
		if row["WorkerId"] == workerid and row["AssignmentStatus"] == "Submitted":
			approved.add(row["AssignmentId"])

def reject_workers(workers,rows):
	for worker in workers:
		reject_worker(worker,rows)

def reject_worker(workerid,rows):
	for row in rows:
		if row["WorkerId"] == workerid and row["AssignmentStatus"] == "Submitted":
			rejected.add(row["AssignmentId"])


def get_worker_scores(rows):
	answers = get_answers(rows)

def writeHitsFile(filename,rows):
	hits = set([(row["HITId"],row["HITTypeId"]) for row in rows])
	writer = amazonDictWriter(filename,["HITId","HITTypeId"])
	for id,type in hits:
		writer.writerow({"HITId":id,"HITTypeId":type})
	
def writeAcceptFile(filename):
	writer = amazonDictWriter(filename,["assignmentIdToApprove","assigmentIdToApproveComment"])
	for hitid in approved:
		writer.writerow({"assignmentIdToApprove":hitid,"assigmentIdToApproveComment":"Thanks. Much appreciated."})	
	
def get_gold_workers(rows,skipdone=True):
	return [g for g in gold_score_workers(rows,skipdone)]

def is_good_worker(g):
	return g["wrong"] * 1.2 <= g["right"] or g["wrong"] < 4
			
def is_gold_worker(g):
	return g["wrong"] * 3 <= g["right"]			
			
def get_good_workers(rows,skipdone = False):
	return [g["worker"] for g in gold_score_workers(rows,skipdone) if is_good_worker(g)]			

def get_bad_workers(rows,skipdone = False):
	return [g["worker"] for g in gold_score_workers(rows,skipdone) if not is_good_worker(g)]			

def agree_score(userid,answers,goodworkers = None):
	useranswers = dict([(hit,choice == "good") for (worker,snip,choice,hit) in answers if worker == userid])
	samehit = [(hit,choice == "good") for (worker,snip,choice,hit) in answers if worker != userid and (not goodworkers or worker in goodworkers) and hit in useranswers]
	agreed = [hit for (hit,choice) in samehit if choice == useranswers[hit]]
	agreecount = len(agreed)
	disagreecount = len(samehit) - len(agreed)
	ratio = float(len(agreed)) / len(samehit)
	return {"agree":agreecount,"disagree":disagreecount,"ratio":ratio}
			
def gold_score_workers(rows,skipdone = False):
	right = {}
	wrong = {}
	for row in rows:
		workerid = row["WorkerId"]
		if skipdone and row["AssignmentStatus"] == "Rejected": continue
		if skipdone and row["AssignmentStatus"] == "Accepted": continue
		if not workerid in right: right[workerid] = 0
		if not workerid in wrong: wrong[workerid] = 0
		for i in range(1,11):
			snip = row["Input.snip"+str(i)]
			answer = row["Answer.Q"+str(i)]
			if snip in td.good_gold or snip in td.bad_gold:
				if (snip in td.good_gold and answer == "good") or (snip in td.bad_gold and answer != "good"):
					right[workerid] = right[workerid] + 1
				else:
					wrong[workerid] = wrong[workerid] + 1
	sorted_wrong = cf.sorted_freqs(wrong)
	for k,v in sorted_wrong:
		yield {"worker":k,"wrong":wrong[k],"right":right[k]}

def amazonDictWriter(filename,fieldnames):
	writer = csv.DictWriter(file(filename,"w"),fieldnames,delimiter="\t",quotechar='"',quoting=csv.QUOTE_ALL,escapechar='\\')
	writer.writerow(dict((x,x) for x in fieldnames))
	return writer
			
def writeRejectFile(filename,reason):
	fieldnames = ["assignmentIdToReject","assignmentIdToRejectComment"]
	writer = amazonDictWriter(filename,fieldnames)
	for hitid in rejected:
		writer.writerow({"assignmentIdToReject":hitid,"assignmentIdToRejectComment":reason})
