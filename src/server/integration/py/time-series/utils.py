from datetime import date
from datetime import datetime
from bisect import bisect_left

def isNow(dateStr):
	if dateStr == 'NOW':
		return str(date.fromordinal(date.today().toordinal() - 1))
	else:
		return str(dateStr)

def num(s):
	if type(s) == int or type(s) == float:
		return s;
		
	if '.' in s:
		return float(s)
	else:
		return int(s)

def oneArray(dataArray, index=1):
	result = []
	for i in dataArray:
		result.append(i[index])	
	return result

def joinArray(dataArray1, dataArray2):
	for i in xrange(0, len(dataArray1)):
		dataArray1[i].append(dataArray2[i]);

def findIndex(data, value):
	index = bisect_left(data, value)
	return index

def findIndexByAttribute(collection, attr, value):
	if type(collection[0]) == dict:
		index = next((i for i, item in enumerate(collection) if item[attr] == value), -1)
	else:
		index = next((i for i, item in enumerate(collection) if getattr(item, attr) == value), -1)
	return index