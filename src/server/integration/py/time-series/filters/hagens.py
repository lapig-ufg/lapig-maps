import loader
import utils
from _filter import Filter
from lib import hagens_filter

class Hagens(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)

	def getQualityValues(self, longitude, latitude):
		datasourceInstance = loader.getDatasource(self.quality_layer)
		qvalues = utils.oneArray( datasourceInstance.lookup(str({
		    "type": "Point",
		    "coordinates": [
		        longitude,
		        latitude
		    ]
			}))["values"] );

		qvalues = [int(i) for i in qvalues]
		
		return qvalues;
	
	def getGoodValues(self)	:
		good_values = []
		for value in self.quality_layer_good_values.split(','):
			good_values.append( utils.num(value) )

		return good_values

	def run(self, timeserieData, longitude = None, latitude = None):

		if loader.hasLayer(self.quality_layer):
			
			self.fill_value = utils.num(self.fill_value)
			self.quality_layer_n_composites = utils.num(self.quality_layer_n_composites)
			
			qualityData = self.getQualityValues(longitude, latitude)
			good_values = self.getGoodValues()

			return hagens_filter.run(timeserieData, qualityData, self.quality_layer_n_composites, good_values, self.fill_value )
		else:
			return []