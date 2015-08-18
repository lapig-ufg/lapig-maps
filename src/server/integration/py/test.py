from __future__ import print_function

import HagenFilter
import TimeSeriesEE
import matplotlib.pyplot as plt
import datetime
import matplotlib.pyplot as plt

from matplotlib.dates import MONDAY
from matplotlib.dates import MonthLocator, WeekdayLocator, DateFormatter

def generateDates(date1, date2, nDays):
	firstTuple = date1.timetuple()
	lastTuple = date2.timetuple()

	result = []
	for year in xrange(firstTuple[0], lastTuple[0] + 1):
		internalDt1 = datetime.date(year, firstTuple[1], firstTuple[2]) if year == firstTuple[0] else datetime.date(year, 1, 1)
		internalDt2 = datetime.date(year, lastTuple[1], lastTuple[2] + 1) if year == lastTuple[0] else datetime.date(year, 12, 31)
		result += range(internalDt1.toordinal(), internalDt2.toordinal(), nDays)	

	return result

def showChart(series,dates):
	fig, ax = plt.subplots()

	ax.xaxis.set_major_formatter(DateFormatter("%b '%y"))
	ax.autoscale_view()
	ax.grid(True)
	fig.autofmt_xdate()

	for label, values in series.iteritems():
		ax.plot_date(dates, values, label = label, ls='-', marker='', fmt='')

	ax.legend(loc=4)
	plt.show()

def getValues(lon, lat):
	pixelValuesEE = TimeSeriesEE.run('MOD13Q1_EVI2', lon, lat, 0);
	pixelFlagsEE = TimeSeriesEE.run('MOD13Q1_PR', lon, lat, 3);

	pixelValues = [item[1] for item in pixelValuesEE ]
	pixelFlags = [item[1] for item in pixelFlagsEE ]

	datesArray = [item[0] for item in pixelValuesEE ]

	return [pixelValues, pixelFlags, datesArray]
	
pixelValues, pixelFlags, datesArray = getValues(-50.38413889, -14.2583333)
minDt = min(datesArray).split('-')
maxDt = max(datesArray).split('-');

startDate = datetime.date(int(minDt[0]), int(minDt[1]), int(minDt[2]))
endDate = datetime.date(int(maxDt[0]), int(maxDt[1]), int(maxDt[2]))
temporalResolution = 16
nComposites = 23
goodFlags = [0]

hagenPixelValues = HagenFilter.run(pixelValues, pixelFlags, nComposites, goodFlags)
dates = generateDates(startDate, endDate, temporalResolution)

series = {
		'EVI2 HagenFilter': hagenPixelValues
	,	'EVI2 Original': pixelValues
}

showChart(series,  dates)
