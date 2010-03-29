
import fileinput

def main():
	for line in fileinput.input():
		cols = line.split("\t")
		claim = cols[2]
		print claim

if __name__ == "__main__":
	main()
