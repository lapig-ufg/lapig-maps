import utils
from _filter import Filter
from scipy.signal import decimate
import numpy as np

class Decimate(Filter):

	def __init__(self, layerParams, filterParams):
		Filter.__init__(self, layerParams, filterParams)

	def numpyFLoatToFloat(self, listDecimate):
		listReturn = []

		for i in listDecimate:
			listReturn.append(np.float32(i).item())

		return listReturn

	def run(self, timeserieData, longitude = None, latitude = None):
		return self.numpyFLoatToFloat(decimate(timeserieData,2))