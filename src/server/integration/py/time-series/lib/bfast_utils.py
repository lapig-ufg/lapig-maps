import utils
from datetime import datetime
from itertools import groupby
from operator import itemgetter
from math import ceil

def calculateMinimalSegmentSize(values_length, timeChange, units, frequency=None):
	days = 0
	period = 16.0

	if frequency:
		period = ceil(365.0/frequency)

	if units.lower() == 'month':
		days = timeChange * 30
	elif units.lower() == 'year':
		days = timeChange * 365
	else:
		days = timeChange

	minimalSegmentSize = days/period/values_length
	if minimalSegmentSize > 0.5:
		raise ValueError("minimum segment size error")

	return minimalSegmentSize

def clipValuesByYear(startYear, endYear, timeserieValues, datesStr):

	dates = [datetime.strptime(x, "%Y-%m-%d") for x in datesStr]

	#Pega apenas os valores entre startYear e endYear
	startYearDt = datetime.strptime(str(startYear)+"-01-01", "%Y-%m-%d")
	startYearIndex = utils.findIndex(dates, startYearDt)
	endYearDt = datetime.strptime(str(endYear)+"-12-31", "%Y-%m-%d")
	endYearIndex = utils.findIndex(dates, endYearDt)

	return {
		'values': utils.oneArray(timeserieValues[startYearIndex:endYearIndex]),
		'dates': dates[startYearIndex:endYearIndex]
	}

def groupData(dates, values, groupBy):
	
	gsplit = groupBy.split('_')
	gtype = gsplit[0]
	goperation = gsplit[1]
	
	groupValues = []
	new_dates = []
	frequency = 0

	if gtype == 'NONE':
		return {
			'values': values,
			'frequency': 23,
			'dates': [str(dt.year)+'-%s'%('' if dt.month>9 else '0')+str(dt.month)+'-'+str(dt.day) for dt in dates]
		}
	else:
		gtypeIndexes = []
		groupDates = []

		if gtype == 'YEAR':
			frequency = 1
			gtypeIndexes = [(str(dt.year), index) for index, dt in enumerate(dates)]
		elif gtype == 'MONTH-YEAR':
			frequency = 12
			gtypeIndexes = [((str(dt.year)+'-%s'+str(dt.month)) % ('' if dt.month > 9 else '0'), index) for index, dt in enumerate(dates)]
		else:
			raise ValueError('"' + gtype + '" is not a valid group type')

		get_item = itemgetter(0)
		for key, group in groupby(sorted(gtypeIndexes, key=get_item), get_item):
			groupDates.append(list(group))
			new_dates.append(key)
			
		groupValues = [[values[tup[1]] for tup in item_list] for item_list in groupDates]

	if goperation == 'mean':
		new_values = listMean(groupValues)
	else:
		raise ValueError('"' + goperation + '" is not a valid group operation')

	return {
		'values': new_values,
		'frequency': frequency,
		'dates': new_dates
	}

def listMean(values):
	means = [float(sum(x))/len(x) for x in values]
	return means
