import utils
import loader
from sys import argv
from lib import bfast_utils

def time_series(layerId, longitude, latitude):

	datasourceInstance = loader.getDatasource(layerId)	

	timeserieData = datasourceInstance.lockup(longitude, latitude)
	
	values = utils.oneArray(timeserieData)
	
	position = 1
	series = [{'id': 'original', 'label': 'Valores originais', 'position': 1}];
	
	for filter in loader.getFilters(layerId):

		filteredValues = filter.run(values, longitude, latitude);
		if len(filteredValues) == len(values):
			position += 1
			series.append({ 'id': filter.id, 'label': filter.label, 'position': position ,
				'type': 'trends' if filter.id == 'Bfast' else 'filter'})
			utils.joinArray(timeserieData, filteredValues)

	return {
		'series': series,
		'values': timeserieData
	}
	
def trend(layerId, longitude, latitude, startYear, endYear, interpolation, groupData, timeChange, timeChangeUnits):
	
	#Obtem a serie
	datasourceInstance = loader.getDatasource(layerId)
	timeserieData = datasourceInstance.lockup(longitude, latitude)

	#Obtem as datas
	datesStr = utils.oneArray(timeserieData, 0)

	#Obtem os valores entre os anos startYear e endYear
	clippedValues = bfast_utils.clipValuesByYear(startYear, endYear, timeserieData, datesStr)

	values = clippedValues['values']
	datesStr = clippedValues['datesStr']
	dates = clippedValues['dates']

	#Encontra o indice do filtro e do bfast
	filters = loader.getFilters(layerId)
	bfastIndex = utils.findIndexByAttribute(filters, 'id', 'Bfast')
	interpolationIndex = utils.findIndexByAttribute(filters, 'id', interpolation)

	series = [{'id':'Bfast', 'label':'BFAST', 'position':1}]
	if interpolationIndex != -1:
		values = filters[interpolationIndex].run(values, longitude, latitude)
		values = values if type(values) is list else values.tolist()

		series.append({'id':filters[interpolationIndex].id, 'label': filters[interpolationIndex].label, 'position': 2})
	else:
		series.append({'id':'original', 'label':'Valores Originais', 'position':2})

	values = bfast_utils.groupData(dates, values, groupData)
	
	#Calcula o valor do parametro h(minimal segment size) para o bfast
	minimalSegmentSize = bfast_utils.calculateMinimalSegmentSize(len(values), timeChange, timeChangeUnits)

	result = []
	if bfastIndex != -1:
		result = filters[bfastIndex].run(values, longitude, latitude, minimalSegmentSize)
	else:
		raise IndexError("Bfast filter could not be found.")

	datesList = [[i] for i in datesStr]

	utils.joinArray(datesList, result)
	result = datesList
	utils.joinArray(result, values)

	return {
			'series': series,
			'values': result
	}

result = []

if argv[1] == 'TS':
	result = time_series(argv[2], utils.num(argv[3]), utils.num(argv[4]))
elif argv[1] == 'BFAST':
	# id
	# longitude
	# latitude
	# startYear: startYear,
 	# endYear: endYear,
 	# interpolation: interpolation,
 	# groupData: groupData,
 	# timeChange: timeChange,
 	# timeChangeUnits: timeChangeUnits
	result = trend(argv[2], utils.num(argv[3]), utils.num(argv[4]), utils.num(argv[5]), utils.num(argv[6]), argv[7], argv[8], utils.num(argv[9]), argv[10])

print result