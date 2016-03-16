import utils
import loader
from sys import argv
from lib import bfast_utils

def time_series(layerId, longitude, latitude, mode):

	datasourceInstance = loader.getDatasource(layerId)	

	timeserieData = datasourceInstance.lockup(longitude, latitude)
	
	values = utils.oneArray(timeserieData)
	
	position = 1
	series = [{'id': 'original', 'label': 'Valores originais', 'position': 1}];
	
	for filter in loader.getFilters(layerId):
		if filter.id == 'Bfast' and mode == 'series':
			continue

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
	dates = clippedValues['dates']
	startDate = dates[0]
	endDate = dates[-1]

	#Encontra o indice do filtro(se houver) e do bfast
	filters = loader.getFilters(layerId)
	bfastIndex = utils.findIndexByAttribute(filters, 'id', 'Bfast')
	interpolationIndex = utils.findIndexByAttribute(filters, 'id', interpolation)

	#Inicializa preparacao do objeto de resposta
	series = [{'id':'Bfast', 'label':'BFAST', 'position':1}]

	#Se ha filtro selecionado, executa e adiciona ao objeto de resposta
	if interpolationIndex != -1:
		values = filters[interpolationIndex].run(values, longitude, latitude)
		values = values if type(values) is list else values.tolist()

		series.append({'id':filters[interpolationIndex].id, 'label': filters[interpolationIndex].label, 'position': 2})
	else:
		series.append({'id':'original', 'label':'Valores Originais', 'position':2})

	#Agrupa os valores
	groupedData = bfast_utils.groupData(dates, values, groupData)
	values = groupedData['values']
	frequency = groupedData['frequency']
	dates = groupedData['dates']
	
	#Calcula o valor do parametro h(minimal segment size) para o bfast
	minimalSegmentSize = bfast_utils.calculateMinimalSegmentSize(len(values), timeChange, timeChangeUnits, frequency)
	#Executa o BFAST
	result = []
	if bfastIndex != -1:
		result = filters[bfastIndex].run(values, longitude, latitude, minimalSegmentSize, frequency, startDate, endDate)
	else:
		raise IndexError("Bfast filter could not be found.")

	#Acrescenta ao resultado as datas, os valores da tendencia e os valores originais (agrupados ou nao)
	datesList = [[i] for i in dates]
	utils.joinArray(datesList, result)
	result = datesList
	utils.joinArray(result, values)

	return {
		'series': series,
		'values': result
	}

result = []

if argv[1] == 'TS':
	result = time_series(argv[2], utils.num(argv[3]), utils.num(argv[4]), argv[5])
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