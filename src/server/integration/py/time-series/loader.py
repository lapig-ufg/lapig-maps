import os
import datasources
import filters
import inspect
from ConfigParser import SafeConfigParser

cp = SafeConfigParser()

CONF_FILES = {
	'FILTERS': 'conf/filters.ini',
	'LAYERS': 'conf/layers.ini',
	'DATASOURCES': 'conf/datasources.ini',
	'CACHE': 'conf/cache.ini'
}

sectionPrefix = '';

if os.environ['PYTHON_ENV'] != '' and os.environ['PYTHON_ENV'] != 'dev':
	sectionPrefix = os.environ['PYTHON_ENV'] + ':';

def getRunPath():
	dirname, filename = os.path.split(os.path.abspath(__file__))
	return dirname

def getConfFromSection(filepath, sectionName):
	cp.read(filepath);
	result = {};
	
	haSection = False;
	section = sectionPrefix + sectionName;
	if cp.has_section(section):
		haSection = True;
	else:
		section = sectionName;
		if cp.has_section(section):
			haSection = True;
	
	if(haSection):
		for key, values in cp.items(section):
			result[key] = values
	
	return result


def getFilterParams(filterId):
	filepath = os.path.join(getRunPath(), CONF_FILES['FILTERS'])
	return getConfFromSection(filepath, filterId)


def getLayerParams(layerId):
	filepath = os.path.join(getRunPath(), CONF_FILES['LAYERS'])
	return getConfFromSection(filepath, layerId)
	

def getDatasouceParams(datasourceId):	
	filepath = os.path.join(getRunPath(), CONF_FILES['DATASOURCES'])	
	params = getConfFromSection(filepath, datasourceId)
	params['run_path'] = getRunPath()	
	return params

def getCacheParams(cacheId):
	filepath = os.path.join(getRunPath(), CONF_FILES['CACHE'])
	params = getConfFromSection(filepath, cacheId)
	return params


def getDatasource(layerId):	

	layerParams = getLayerParams(layerId)
	layerParams['layer_id'] = layerId

	datasourceId = layerParams['type']
	datasourceClass = getattr(datasources, datasourceId)
	datasouceParams = getDatasouceParams(datasourceId)
	
	return datasourceClass(layerParams, datasouceParams)



def hasLayer(layerId):
	filepath = os.path.join(getRunPath(), CONF_FILES['LAYERS'])
	cp.read(filepath)
	return cp.has_section(layerId)


def getFilters(layerId):
	layerParams = getLayerParams(layerId)
	result = []

	for className, classType in filters.__dict__.iteritems():
		if inspect.isclass(classType):
			filterParams = getFilterParams(className)
			result.append(classType(layerParams, filterParams))
	
	return result
