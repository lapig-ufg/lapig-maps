class Filter:

	def __init__(self, layerParams, filterParams):
		for key in layerParams:
			setattr(self, key, layerParams[key])

		self.id = self.__class__.__name__
		self.label = filterParams['label']