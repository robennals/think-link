
import filter_claims as f
import fileinput

def main():
	claims = [line.strip() for line in fileinput.input()]
	good = f.filter_claims(claims)
	for claim in good:
		print claim
			
	
if __name__ == '__main__':
	main()
