import utils
import loader
from sys import argv
from datetime import datetime

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
	dates = utils.oneArray(timeserieData, 0)
	dates = [datetime.strptime(x, "%Y-%m-%d") for x in dates]

	#Pega apenas os valores entre startYear e endYear
	startYearDt = datetime.strptime(str(startYear)+"-01-01", "%Y-%m-%d")
	startYearIndex = utils.findIndex(dates, startYearDt)
	endYearDt = datetime.strptime(str(endYear)+"-12-31", "%Y-%m-%d")
	endYearIndex = utils.findIndex(dates, endYearDt)

	values = utils.oneArray(timeserieData[startYearIndex:endYearIndex])

	#Calcula o valor do parametro h(minimal segment size) para o bfast
	days = 0
	if timeChangeUnits.lower() == 'meses':
		days = timeChange * 30
	elif timeChangeUnits.lower() == 'anos':
		days = timeChange * 365

	minimalSegmentSize = days/16.0/len(values)

	filters = loader.getFilters(layerId)

	#Encontra o indice do filtro bfast
	bfastIndex = next((i for i, item in enumerate(filters) if item.id.lower() == 'bfast'), -1)

	result = filters[bfastIndex].run(values, longitude, latitude, minimalSegmentSize)

	return {
			'Algorithm': 'BFAST',
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