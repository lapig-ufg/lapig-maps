from datetime import date

def isNow(dateStr):
	if dateStr == 'NOW':
		return str(date.fromordinal(date.today().toordinal() - 1))
	else:
		return str(dateStr)

def num(s):
	if '.' in s:
		return float(s)
	else:
		return int(s)

def oneArray(dataArray):
	result = []
	for i in dataArray:
		result.append(i[1])	
	return result

def joinArray(dataArray1, dataArray2):
	for i in xrange(0, len(dataArray1)):
		dataArray1[i].append(dataArray2[i]);