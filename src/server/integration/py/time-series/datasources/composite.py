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

		#self.collection_id = self.collection_id.upper();
		#self.pixel_resolution = utils.num(self.pixel_resolution)
		#self.fn_parsedate = getattr(self, self.fn_parsedate + "Date");		
		self.tredao = int(datasourceParams['threads'])
		self.start_date = layerParams['start_date'].split()
		self.end_date = layerParams['end_date'].split()
		self.layers = layerParams['layers'].split()

		
		#privateKeyFilepath = os.path.join(datasourceParams['run_path'],datasourceParams['private_key'])

		#self.credentials = ee.ServiceAccountCredentials(datasourceParams['account'], privateKeyFilepath);	


	def lockup(self, longitude, latitude):

		result = []
		for i in xrange(0, len(self.start_date)):

			datasourceInstance = loader.getDatasource(self.layers[i])
			
			datasourceInstance.start_date = self.start_date[i]

			if self.end_date[i] == 'NOW':
				datasourceInstance.end_date = utils.isNow(self.end_date[i])
			else:
				datasourceInstance.end_date = self.end_date[i]

			timeserieData = datasourceInstance.lockup(longitude, latitude)
			
			for j in timeserieData:
				result.append(j) 
			
		return result
		
		
				

			
		
