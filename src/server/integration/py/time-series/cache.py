import redis
import loader

class Cache:
	
	def __init__(self):
		cacheParams = loader.getCacheParams('redis')

		for key in cacheParams:
			setattr(self, key, cacheParams[key])

		self.rserver = redis.StrictRedis(self.host, self.port)

	def addPrefix(self, cacheKey):
		return self.prefix + cacheKey

	def get(self, cacheKey):
		if self.enable:
			cacheKey = self.addPrefix(cacheKey)

			res = self.rserver.get(cacheKey)

			if res is not None:
				self.rserver.expire(cacheKey, self.expiration)

			return res
		else:
			return None

	def set(self, cacheKey, value):
		if self.enable:
			cacheKey = self.addPrefix(cacheKey)

			if self.expiration is None:
				self.rserver.set(cacheKey, value)
			else:
				self.rserver.setex(cacheKey, self.expiration, value)

	def delete(self, keyPattern):
		if self.enable:
			keysList = self.rserver.keys(keyPattern)

			for x in keysList:
				self.rserver.delete(x)
