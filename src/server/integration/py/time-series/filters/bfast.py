import utils
from lib import bfast_utils
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
			self.frequency = layerParams['frequency']
		except KeyError:
			self.frequency = filterParams['frequency']
		
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

	def run(self, timeserieData, longitude = None, latitude = None, h = None, freq = None, startdate = None, enddate = None):
		
		freq = str(freq) if freq else self.frequency

		if(h is None):
			if self.time_change is not None and self.units is not None:
				h = bfast_utils.calculateMinimalSegmentSize(len(timeserieData), self.time_change, self.units, float(freq))
				h = str(h)
		elif(h>0.5):
			raise ValueError("minimum segment size error")

		startdate = str(startdate) if startdate else self.start_date
		enddate = str(enddate) if enddate else utils.isNow(self.end_date)

		# Must be in the following order: h, season, start_date, end_date, timeseriesData, freq
		bfast_result = check_output(["integration/py/time-series/lib/bfast.r", str(h), self.season,
		 startdate, enddate, str(timeserieData), freq])

		bfast_res_list = bfast_result.encode('utf-8').split(' ')
		bfast_res_float = map(float, bfast_res_list)
		
		return bfast_res_float
