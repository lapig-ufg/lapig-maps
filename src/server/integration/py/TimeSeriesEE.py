
import config
import ee
import datetime
import traceback
from ConfigParser import SafeConfigParser
import numpy as np
from sys import argv
from scipy.signal import savgol_filter
import HagenFilter
from datetime import date

cp = SafeConfigParser();

def num(s):
	if '.' in s:
		return float(s)
	else:
		return int(s)

def isNow(s):
	if s == 'NOW':
		return str(date.fromordinal(date.today().toordinal() - 1))
	else:
		return str(s)

  

def landsatDate(imgId):
	year = imgId[9:13]
	doy = imgId[13:16]

	return year + doy

def modisDate(imgId):
	#MOD13Q1_005_2000_02_18

	year = imgId[12:16]
	month = imgId[17:19]
	day = imgId[20:22]

	doy = datetime.date(int(year), int(month), int(day)).timetuple().tm_yday;
	doy = '{0:03d}'.format(doy);

	return year + doy

def removeDuplicate(eeLockupResult, fillValue):
	result = []

	for key, value in eeLockupResult.iteritems():
		if key not in result:
			value = fillValue if value is None else value
			result.append([key, value])

	result = sorted(result, key=lambda x: x[0])

	for item in result:
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

	return result;

def lockupEE(timeSeriesID,longitude,latitude, configurationFile):
	#Se o timeSeriesID retornar flagCollection entao deve-se usar o HagenFilter
	EE_CREDENTIALS = ee.ServiceAccountCredentials(config.EE_ACCOUNT, config.EE_PRIVATE_KEY_FILE)
	ee.Initialize(EE_CREDENTIALS);
	
	cp.read(configurationFile);

	date1 = cp.get(timeSeriesID, 'startDate')
	date2 = isNow(cp.get(timeSeriesID, 'endDate'))

	
	pixelResolution = int((cp.get(timeSeriesID, 'pixelResolution')))
	collectionId = cp.get(timeSeriesID, 'collectionID')
	expression = cp.get(timeSeriesID, 'expresion')
	fnParseDateName = cp.get(timeSeriesID, 'fnParseDate') + "Date"

	fnParseDate = globals()[fnParseDateName];

	def calculateIndex(image):
		 return image.expression(expression);

	point = ee.Geometry.Point([longitude, latitude]);
	timeSeries = ee.ImageCollection(collectionId).filterDate(date1, date2).map(calculateIndex);
	eeResult = timeSeries.getRegion(point,pixelResolution).getInfo();

	result={}
	for item in eeResult:
		if item[0] == 'id':
			continue
		dateKey = fnParseDate(item[0]);
		result[dateKey]=item[4]

	result=removeDuplicate(result, fillValue = (num(cp.get(timeSeriesID, 'fillValue'))));
	
	return result;
	

def oneArray(colo):
	z = []
	for i in colo:
		z.append(i[1])	
	return z

def joinArray(result, idC):
	
	for i,j in zip(result,idC):
		i.append(j);

	return result


def savitsky(result):	
	values = []
	values = oneArray(result);
	idC = savgol_filter(values,5,2);	
	
	return joinArray(result, idC)

	
def hagenFilter(result, timeSeriesID, longitude, latitude, configurationFile):
	
	cp.read(configurationFile);
	flag = cp.get(timeSeriesID,'flagCollection')
	collection = [];
	flagList = [];
	
	flagCollection = lockupEE(flag, longitude, latitude, configurationFile);

	collection = oneArray(result)

	flagList = oneArray(flagCollection)

	x = HagenFilter.run(collection, flagList, 23, [0])	

	return joinArray(result,x);


def run(timeSeriesID, longitude, latitude, configurationFile):
	cp.read(configurationFile);
	
	result = lockupEE(timeSeriesID, longitude, latitude, configurationFile);

	result=savitsky(result);


	#result = hagenFilter(result, timeSeriesID, longitude, latitude, configurationFile)

	return {
		'series': [
			{ 'id': 'original', 'label': 'Valores originais', 'position': 1 },
			{ 'id': 'savgol', 'label': 'Savitzky Golay', 'position': 2 },
		],
		'values': result
	};

r = run(argv[1], float(argv[2]), float(argv[3]), argv[4]);

print(r)

