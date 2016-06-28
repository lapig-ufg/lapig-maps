import ee
import os
import utils
import time
import datetime
from _datasource import Datasource
from threading import Thread
import Queue
import loader

class Composite(Datasource):

	def __init__(self, layerParams, datasourceParams):
		Datasource.__init__(self, layerParams)

		self.start_date = layerParams['start_date'].split()
		self.end_date = layerParams['end_date'].split()
		self.layers = layerParams['layers'].split()


	def lookup(self, geoJsonGeometry, mode=None):

		result = {"values":[]};
		for i in xrange(0, len(self.start_date)):

			datasourceInstance = loader.getDatasource(self.layers[i])
			datasourceInstance.start_date = self.start_date[i]

			if self.end_date[i] == 'NOW':
				datasourceInstance.end_date = utils.isNow(self.end_date[i])
			else:
				datasourceInstance.end_date = self.end_date[i]

			timeserieData = datasourceInstance.lookup(geoJsonGeometry, mode)

			if "series" not in result:
				result["series"] = timeserieData["series"];

			result["values"].extend(timeserieData["values"]);
			
		return result
		
		
				

			
		
