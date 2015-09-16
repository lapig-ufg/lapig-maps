import utils
import loader
from sys import argv

def run(layerId, longitude, latitude):

	datasourceInstance = loader.getDatasource(layerId)
	timeserieData = datasourceInstance.lockup(longitude, latitude)
	
	values = utils.oneArray(timeserieData)
	
	position = 1
	series = [ { 'id': 'original', 'label': 'Valores originais', 'position': 1 } ];
	
	for filter in loader.getFilters(layerId):

		filteredValues = filter.run(values, longitude, latitude);
		if len(filteredValues) == len(values):
			position += 1
			series.append({ 'id': filter.id, 'label': filter.label, 'position': position })
			utils.joinArray(timeserieData, filteredValues)

	return {
		'series': series,
		'values': timeserieData
	}
	
result = run(argv[1], float(argv[2]), float(argv[3]))
	
print result