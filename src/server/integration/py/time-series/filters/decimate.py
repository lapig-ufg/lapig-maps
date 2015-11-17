import utils
from _filter import Filter
from scipy.signal import decimate
import numpy as np

class Decimate(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)


	def run(self, timeserieData, longitude = None, latitude = None):
		x = decimate(timeserieData,2);
		print x
		return decimate(timeserieData,2); 