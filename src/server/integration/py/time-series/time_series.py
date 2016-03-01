import utils
import loader
from sys import argv

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
	
	datasourceInstance = loader.getDatasource(layerId)

	timeserieData = datasourceInstance.lockup(longitude, latitude)

	values = utils.oneArray(timeserieData)

	

	return None

result = []

if argv[1] == 'TS':
	result = time_series(argv[2], float(argv[3]), float(argv[4]))
elif argv[1] == 'BFAST':
	# startYear: startYear,
 	# endYear: endYear,
 	# interpolation: interpolation,
 	# groupData: groupData,
 	# timeChange: timeChange,
 	# timeChangeUnits: timeChangeUnits
	result = trend(int(argv[2]), int(argv[3]), argv[4], argv[5], int(argv[6]), argv[7], argv[8], arg[9], argv[10])

print result