from __future__ import print_function

import HagenFilter
import matplotlib.pyplot as plt
import datetime
import matplotlib.pyplot as plt

from matplotlib.dates import MONDAY
from matplotlib.finance import quotes_historical_yahoo_ochl
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
		ax.plot_date(dates, values, label = label, ls='-', marker='')

	ax.legend(loc=4)
	plt.show()

aEVI2 = map(float, list(open(r'evi2.txt','r')))
aFLAG = map(int, list(open(r'flag.txt','r')))
nComposites = 23
goodFlags = [0]

startDate = datetime.date(2000, 2, 18);
endDate = datetime.date(2013, 12, 19);
temporalResolution = 16

result = HagenFilter.run(aEVI2, aFLAG, nComposites, goodFlags)
dates = generateDates(startDate, endDate, temporalResolution);

series = {
		'EVI2 HagenFilter': result
	,	'EVI2 Original': aEVI2
}

showChart(series,  dates)