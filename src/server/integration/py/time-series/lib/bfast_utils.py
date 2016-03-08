import utils
from datetime import datetime
from itertools import groupby
from operator import itemgetter

def calculateMinimalSegmentSize(values_length, timeChange, units):
	days = 0
	if units.lower() == 'month':
		days = timeChange * 30
	elif units.lower() == 'year':
		days = timeChange * 365
	else:
		days = timeChange

	minimalSegmentSize = days/16.0/values_length
	if minimalSegmentSize > 0.5:
		raise ValueError("minimum segment size error")

	return minimalSegmentSize

def clipValuesByYear(startYear, endYear, timeserieData, datesStr):

	dates = [datetime.strptime(x, "%Y-%m-%d") for x in datesStr]

	#Pega apenas os valores entre startYear e endYear
	startYearDt = datetime.strptime(str(startYear)+"-01-01", "%Y-%m-%d")
	startYearIndex = utils.findIndex(dates, startYearDt)
	endYearDt = datetime.strptime(str(endYear)+"-12-31", "%Y-%m-%d")
	endYearIndex = utils.findIndex(dates, endYearDt)

	return {
		'values': utils.oneArray(timeserieData[startYearIndex:endYearIndex]),
		'datesStr': datesStr[startYearIndex:endYearIndex],
		'dates': dates
	}

def groupData(dates, values, groupBy):
	
	split = groupBy.split('_')
	gtype = split[0]
	goperation = split[1]
	groupValues = []

	if gtype == 'NONE':
		return values
	elif gtype == 'YEAR':
		yearsIndexes = [(dt.year, index) for index, dt in enumerate(dates)]

		get_item = itemgetter(0)
		groupDates = [list(group) for key, group in groupby(sorted(yearsIndexes, key=get_item), get_item)]
		groupValues = [[values[tup[1]] for tup in item_list] for item_list in groupDates]
	elif gtype == 'MONTH-YEAR':
		monthyearIndexes = [(int(str(dt.month)+str(dt.year)), index) for index, dt in enumerate(dates)]
		
		get_item = itemgetter(0)
		groupValues = [list(group) for key, group in groupby(sorted(monthyearIndexes, key=get_item), get_item)]
	else:
		raise ValueError(gtype + ' is not a valid group type')

	if goperation == 'mean':
		new_values = listMean(groupValues)
	else:
		raise ValueError(goperation + ' is not a valid group operation')

	return new_values

def listMean(values):
	means = [float(sum(x))/len(x) for x in values]
	return means
