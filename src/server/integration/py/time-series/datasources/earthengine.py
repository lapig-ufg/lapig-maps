import ee
import os
import utils
import time
import datetime
import traceback
import math
from _datasource import Datasource
from threading import Thread
import Queue
from cache import Cache
import ast
from hashlib import sha1
import loader
import utils
from operator import itemgetter
from itertools import groupby
from oauth2client.service_account import ServiceAccountCredentials

class EarthEngine(Datasource):

	def __init__(self, layerParams, datasourceParams):
		Datasource.__init__(self, layerParams)

		self.expression = self.expression
		self.fill_value = utils.num(self.fill_value)
		self.collection_id = self.collection_id.upper();
		self.pixel_resolution = utils.num(self.pixel_resolution)
		self.fn_parsedate = getattr(self, self.fn_parsedate + "Date");
		self.nThreads = int(datasourceParams['threads'])
		self.ignore_filter = ast.literal_eval(self.ignore_filter.capitalize()) if hasattr(self, "ignore_filter") else None;
		
		privateKeyFilepath = os.path.join(datasourceParams['run_path'],datasourceParams['private_key'])
		# self.credentials = ee.ServiceAccountCredentials(datasourceParams['account'], privateKeyFilepath);
		self.credentials = ServiceAccountCredentials(datasourceParams['account'], privateKeyFilepath);

		self.cache = Cache()

	def landsatDate(self, imgId):
		year = imgId[9:13]
		doy = imgId[13:16]

		return year + doy

	def modisDate(self, imgId):
		#MOD13Q1_005_2000_02_18

		year = imgId[12:16]
		month = imgId[17:19]
		day = imgId[20:22]

		doy = datetime.date(int(year), int(month), int(day)).timetuple().tm_yday;
		doy = '{0:03d}'.format(doy);

		return year + doy

	def removeDuplicate(self, eeResultList):

		new_eeResultList = [];
		newPixelSeries = [];

		for pixelSeries in eeResultList:
			dates = {};
			newPixelSeries = [];
			for item in pixelSeries:
				if item[0] not in dates:
					dates[item[0]] = True;
					newPixelSeries.append(item);
			new_eeResultList.append(newPixelSeries);

		return new_eeResultList;

	def dateJulianToGregorian(self, eeResultList):
		
		for pixelSeries in eeResultList:
			for item in pixelSeries:
				item[0] = self.fn_parsedate(item[0]);
				ano = int(item[0][0:4])
				juliano = int(item[0][4:7])
				mes = ''

				if (ano%4==0) & ((ano%400==0) | (ano%100 != 0)):

					ab = True

					if (juliano >= 1) & (juliano <= 31):
						dia = juliano
						mes = '01'

					elif (juliano > 31) & (juliano <= 60):
						dia = juliano - 31
						mes = '02'

					elif (juliano > 60) & (juliano <= 91):
						dia = juliano - 60
						mes = '03'

					elif (juliano > 91) & (juliano <= 121):
						dia = juliano - 91
						mes = '04'

					elif (juliano > 121) & (juliano <= 152):
						dia = juliano - 121
						mes = '05'

					elif (juliano > 152) & (juliano <= 182):
						dia = juliano - 152
						mes = '06'

					elif (juliano > 182) & (juliano <= 213):
						dia = juliano - 182
						mes = '07'

					elif (juliano > 213) & (juliano <= 244):
						dia = juliano - 213
						mes = '08'

					elif (juliano > 244) & (juliano <= 274):
						dia = juliano - 244
						mes = '09'

					elif (juliano > 274) & (juliano <= 305):
						dia = juliano - 274
						mes = '10'

					elif (juliano > 305) & (juliano <= 335):
						dia = juliano - 305
						mes = '11'

					elif (juliano > 335) & (juliano <= 366):
						dia = juliano - 335
						mes = '12'

				else:

					if (juliano >= 1) & (juliano <= 31):
						dia = juliano
						mes = '01'

					elif (juliano > 31) & (juliano <= 59):
						dia = juliano - 31
						mes = '02'

					elif (juliano > 59) & (juliano <= 90):
						dia = juliano - 59
						mes = '03'

					elif (juliano > 90) & (juliano <= 120):
						dia = juliano - 90
						mes = '04'

					elif (juliano > 120) & (juliano <= 151):
						dia = juliano - 120
						mes = '05'

					elif (juliano > 151) & (juliano <= 181):
						dia = juliano - 151
						mes = '06'

					elif (juliano > 181) & (juliano <= 212):
						dia = juliano - 181
						mes = '07'

					elif (juliano > 212) & (juliano <= 243):
						dia = juliano - 212
						mes = '08'

					elif (juliano > 243) & (juliano <= 273):
						dia = juliano - 243
						mes = '09'

					elif (juliano > 273) & (juliano <= 304):
						dia = juliano - 273
						mes = '10'

					elif (juliano > 304) & (juliano <= 334):
						dia = juliano - 304
						mes = '11'

					elif (juliano > 334) & (juliano <= 365):
						dia = juliano - 334
						mes = '12'

				item[0] = str(datetime.date(int(ano),int(mes), dia))

		return eeResultList;

	def splitDate(self):
				
		year1, year2 = int(self.start_date[0:4]), int(self.end_date[0:4])
		day1, day2 = self.start_date[8:10], self.end_date[8:10]
		month1, month2 = self.start_date[5:7], self.end_date[5:7]

		yearInc = int(math.floor( (year2 - year1) / self.nThreads ))
		if yearInc == 0:
			yearInc = 1

		result = []
		
		for i in xrange(year1, year2, yearInc):
			
			startDay, startMonth = '01','01'
			endDay, endMonth = '31','12'

			endYear = i + (yearInc - 1)

			if(year1 == i):
				startDay, startMonth = day1, month1
			if(endYear >= (year2 - 1)):
				endDay, endMonth = day2, month2
				endYear = year2

			startDate = str(i)+'-'+str(startMonth)+'-'+str(startDay)
			endDate = str(endYear)+'-'+str(endMonth)+'-'+str(endDay)

			result.append([ startDate, endDate ])

		return result

	def groupValuesByCoord(self, eeResultList):
		groupedValues = [];
		def lonlat(item):
			return str(item[1])+str(item[2])

		groups = groupby(sorted(sorted(eeResultList, key=itemgetter(1)), key=itemgetter(2)), lonlat)
		for key, group in groups:
			groupedValues.append(list(group));

		return groupedValues;

	def createPixelStructure(self, eeResultList):
		pixels = [];
		dates = [];
		datesFull = False;
		originalIndex = 4;

		for pixelSeries in eeResultList:
			pixelSeries.sort(key=itemgetter(0));
			pixels.append({"values": [], "lon": pixelSeries[0][1], "lat": pixelSeries[0][2]});

			for item in pixelSeries:
				if datesFull == False: dates.append(item[0]);
				pixels[-1]["values"].append(item[originalIndex] if item[originalIndex] is not None else self.fill_value);
			datesFull = True;

		return {
			"dates": dates,
			"series": [{"filterProperties": {"id": "original", "label": "Valores originais"}, "pixels": pixels}]
		}

	def calcFilters(self, pixels, mode):

		filteredPixels = []

		for filter in loader.getFilters(self.layer_id):
			if filter.id == 'Bfast' and mode == 'series':
				continue;
			elif filter.id != 'Bfast' and mode == 'trend':
				continue;

			filteredPixels.append({"filterProperties": {"id": filter.id, "label": filter.label}, "pixels": []});
			for pixel in pixels:

				values = pixel["values"];
				longitude = pixel["lon"];
				latitude = pixel["lat"];

				filteredValues = filter.run(values, longitude, latitude);
				filteredValues = filteredValues if type(filteredValues) == list else filteredValues.tolist();
			
				if len(filteredValues) == len(values):
					filteredPixels[-1]["pixels"].append({"values": filteredValues, "lon": longitude, "lat": latitude});
				else:
					filteredPixels[-1]["pixels"].append({"values": [0 for _ in xrange(len(values))], "lon": longitude, "lat": latitude});

		return filteredPixels;	

	def calcTrend(self, resultMean):
		filters = loader.getFilters(self.layer_id);

		bfastIndex = utils.findIndexByAttribute(filters, 'id', 'Bfast')
		origSeriesProp = utils.findIndexByAttribute(resultMean['series'], 'type', 'original');
		
		originalValues = utils.oneArray(resultMean['values'], resultMean['series'][origSeriesProp]['position']-1)
		filteredValues = filters[bfastIndex].run(originalValues, None, None);
		filteredValues = filteredValues if type(filteredValues) == list else filteredValues.tolist();
		
		result = {
			'series': {
				'id': "Bfast",
				'label': 'BFAST',
				'position': len(resultMean['values'][0])+1,
				'type': 'trend'
			},
			'values': filteredValues
		}
		
		return result

	def calculateMean(self, pixelsStruct):
		series = [];
		
		values = [[] for _ in xrange(len(pixelsStruct[0]["pixels"][0]["values"]))];

		position = 0;
		for filterBlock in pixelsStruct:

			invalidFilter = all([px["values"].count(0)==len(px["values"]) for px in filterBlock["pixels"]])
			if invalidFilter:
				continue;
			
			position+=1;
			series.append({
				'id': filterBlock["filterProperties"]["id"],
				'label': filterBlock["filterProperties"]["label"],
				'position': position,
				'type': 'trend' if filterBlock["filterProperties"]["id"] == "Bfast"

					else 'original' if filterBlock["filterProperties"]["id"] == "original" else "filter"
			});

			lenSeries = len(filterBlock["pixels"][0]["values"]);
			numPixels = len(filterBlock["pixels"]);

			for dt in xrange(lenSeries):
				sum = 0;
				mean = -9999;
				for px in xrange(numPixels):
					sum += filterBlock["pixels"][px]["values"][dt];

				mean = sum/numPixels;
				values[dt].append(mean);

		return {
			"series": series,
			"values": values
		};

	def runjob(self, date, geoJsonGeometry, q):
		ee.Initialize(self.credentials);

		def calculateIndex(image):
			return image.expression(self.expression);

		geometry = ee.Geometry(ast.literal_eval(geoJsonGeometry));
		timeSeries = ee.ImageCollection(self.collection_id).filterDate(date[0], date[1]).map(calculateIndex).getRegion(geometry, self.pixel_resolution);

		count = 0;
		while(count < 4):
			try:
				eeResult = timeSeries.getInfo();
				break;	
			except ee.ee_exception.EEException:
				count = count + 1;
				time.sleep(1)

		# remove the header
		# ['id', 'longitude', 'latitude', 'time', 'NDVI']
		eeResult = eeResult[1:];

		q.put(eeResult)

	def lookup(self, geoJsonGeometry, mode=None):

		cacheStr = ",ts-"+self.layer_id + geoJsonGeometry;
		cacheKey = sha1(cacheStr.encode()).hexdigest();

		pixelsStruct = None;

		if(self.cache.enable == '1'):
			cacheResult = self.cache.get(cacheKey)

		if cacheResult is not None:
			pixelsStruct = ast.literal_eval(cacheResult)
		else:
			dates = self.splitDate()
			eeResult = []

			# Todas as threads usam a mesma queue
			q = Queue.Queue();

			for i in dates:
				x=Thread(name='Thread',target=self.runjob, args=[i, geoJsonGeometry, q])
				x.start()

			# Pega os resultados bloqueando ate as threads teminarem
			for i in dates:
				eeResult.extend(q.get());

			groupedValues = self.groupValuesByCoord(eeResult);

			groupedValues = self.dateJulianToGregorian(groupedValues);
			groupedValues =  self.removeDuplicate(groupedValues);

			pixelsStruct = self.createPixelStructure(groupedValues);

			if(self.cache.enable == '1'):
				self.cache.set(cacheKey, pixelsStruct);

		dates = pixelsStruct["dates"];
		pixelsOriginal = pixelsStruct["series"][0]["pixels"];

		result = None
		if mode == 'series' or mode is None:
			if not self.ignore_filter:
				pixelsStruct["series"].extend(self.calcFilters(pixelsOriginal, mode));

			result = self.calculateMean(pixelsStruct["series"]);

		elif mode == 'trend':
			result = self.calculateMean(pixelsStruct["series"]);
			resTrend = self.calcTrend(result);

			if len(resTrend['values']) == len(result['values']):	
				utils.joinArray(result['values'], resTrend['values']);
				result['series'].append(resTrend['series'])

		for i, dtRow in enumerate(result["values"]):
			dtRow.insert(0, dates[i])

		return result;