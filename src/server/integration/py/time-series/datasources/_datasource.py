import utils

class Datasource:

	def __init__(self, layerParams):
		for key in layerParams:
			setattr(self, key, layerParams[key])

		self.end_date = utils.isNow(self.end_date)