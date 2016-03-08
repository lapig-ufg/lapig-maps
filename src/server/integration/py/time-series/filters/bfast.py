import utils
from _filter import Filter
from subprocess import check_output
import os

class Bfast(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)

		try:
			self.time_change = utils.num(layerParams['time_change'])
		except KeyError:
			self.time_change = utils.num(filterParams['time_change'])

		try:
			self.units = layerParams['units']
		except KeyError:
			self.units = filterParams['units']
		
		try:
			self.season = layerParams['season']
		except KeyError:
			self.season = filterParams['season']
			
		try:
			self.start_date = layerParams['start_date']
		except KeyError:
			self.start_date = filterParams['start_date']
		
		try:
			self.end_date = layerParams['end_date']
		except KeyError:
			self.end_date = filterParams['end_date']

	def run(self, timeserieData, longitude = None, latitude = None, h = None):
		
		if self.time_change is not None and self.units is not None:
			days = 0
			if self.units == 'year':
				days = self.time_change * 365
			elif self.units == 'month':
				days = self.time_change * 30
			else:
				days = self.time_change

			self.h = str(days/16.0/len(timeserieData))

		h = str(h) if h else self.h

		# Must be in the following order: h, season, start_date, end_date, timeseriesData
		bfast_result = check_output(["integration/py/time-series/lib/bfast.r", h, self.season,
		 self.start_date, self.end_date, str(timeserieData)])

		bfast_res_list = bfast_result.encode('utf-8').split(' ')
		bfast_res_int = map(float, bfast_res_list)
		
		return bfast_res_int
