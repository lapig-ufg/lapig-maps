import utils
from _filter import Filter
from scipy.signal import wiener
import numpy as np

class Wiener(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)


	def run(self, timeserieData, longitude = None, latitude = None):
		return wiener(timeserieData); 
		