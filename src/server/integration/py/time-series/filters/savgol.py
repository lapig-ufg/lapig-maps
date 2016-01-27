import utils
from _filter import Filter
from scipy.signal import savgol_filter

class Savgol(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)

		try:
			self.window_length = utils.num(layerParams['window_length'])
		except KeyError:
			self.window_length = utils.num(filterParams['window_length'])
		
		try:
			self.polyorder = utils.num(layerParams['polyorder'])
		except KeyError:
			self.polyorder = utils.num(filterParams['polyorder'])	


	def run(self, timeserieData, longitude = None, latitude = None):	
		return savgol_filter(timeserieData, self.window_length, self.polyorder);	