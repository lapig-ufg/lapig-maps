# coding: utf-8

import utils
import loader
from sys import argv
from lib import bfast_utils

def time_series(layerId, mode, geoJsonGeometry):

	datasourceInstance = loader.getDatasource(layerId)
	timeserieData = datasourceInstance.lookup(geoJsonGeometry, mode)

	return timeserieData;
	
def trend(layerId, startYear, endYear, interpolation, groupData, timeChange, timeChangeUnits, geoJsonGeometry):
	
	#Obtem a série
	datasourceInstance = loader.getDatasource(layerId)
	timeserieData = datasourceInstance.lookup(geoJsonGeometry, mode="series")

	#Obtem as datas
	datesStr = utils.oneArray(timeserieData["values"], 0)

	#Obtem os valores entre os anos startYear e endYear
	clippedValues = bfast_utils.clipValuesByYear(startYear, endYear, timeserieData["values"], datesStr)

	values = clippedValues['values']
	dates = clippedValues['dates']
	startDate = dates[0]
	endDate = dates[-1]

	#Encontra o indice do filtro(se houver) e do bfast
	filters = loader.getFilters(layerId)
	bfastIndex = utils.findIndexByAttribute(filters, 'id', 'Bfast')
	
	# O filtro já foi calculado na datasource
	interpolation = interpolation if interpolation != "original" else 'STRING_NOT_FOUND';
	interpolationIndex, interpolationPos = next(((i, item['position']) for i, item in enumerate(timeserieData["series"]) if item['id'] == interpolation), (-1, -1))

	#Inicializa preparação do objeto de resposta
	series = [{'id':'Bfast', 'label':'BFAST', 'position':1, 'type':'trend'}]

	#Se há filtro selecionado, executa e adiciona ao objeto de resposta
	if interpolationPos != -1:
		values = utils.oneArray(timeserieData["values"], interpolationPos)
		series.append({'id':timeserieData["series"][interpolationIndex]["id"], 'label': timeserieData["series"][interpolationIndex]["label"], 'position': 2, 'type': 'filter'})

	else:
		series.append({'id':'original', 'label':'Valores Originais', 'position':2, 'type':'original'})

	#Agrupa os valores
	groupedData = bfast_utils.groupData(dates, values, groupData)
	values = groupedData['values']
	frequency = groupedData['frequency']
	dates = groupedData['dates']
	
	#Calcula o valor do parâmetro h(minimal segment size) para o bfast
	minimalSegmentSize = bfast_utils.calculateMinimalSegmentSize(len(values), timeChange, timeChangeUnits, frequency)
	#Executa o BFAST
	result = []
	if bfastIndex != -1:
		result = filters[bfastIndex].run(values, None, None, minimalSegmentSize, frequency, startDate, endDate)
	else:
		raise IndexError("Bfast filter could not be found.")

	#Acrescenta ao resultado as datas, os valores da tendência e os valores originais (agrupados ou não)
	datesList = [[i] for i in dates]
	utils.joinArray(datesList, result)
	result = datesList
	utils.joinArray(result, values)
	
	return {
		'series': series,
		'values': result
	}
	
result = [];

# for i in xrange(len(argv)):
# 	print("argv["+str(i)+"]: " + argv[i])


if argv[1] == 'TS':
	result = time_series(argv[2], argv[3], argv[4]);
elif argv[1] == 'BFAST':
 	# layerId, startYear, endYear, interpolation, groupData, timeChange, timeChangeUnits, geoJsonGeometry
	result = trend(argv[2], utils.num(argv[3]), utils.num(argv[4]), argv[5], argv[6], utils.num(argv[7]), argv[8], argv[9]);

print(result)