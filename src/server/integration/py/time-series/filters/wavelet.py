import utils
from _filter import Filter
from scipy import signal
import numpy as np

class Wavelet(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)


	def run(self, timeserieData, longitude = None, latitude = None):
		lista1 = []

		points = len(timeserieData)
		width = 40
		ricker = signal.ricker(points, width)
		
		return ricker