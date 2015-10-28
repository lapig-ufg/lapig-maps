import utils
from _filter import Filter
from scipy.signal import hilbert
import numpy as np

class Hilbert(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)


	def run(self, timeserieData, longitude = None, latitude = None):
		return hilbert(timeserieData); 