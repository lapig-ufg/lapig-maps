#!/usr/bin/python

import ee
from sys import argv

EE_ACCOUNT = '163878256934-uorqnep89dmauei9tv8s5cmhcro4s0p9@developer.gserviceaccount.com'
EE_PRIVATE_KEY_FILE = 'lapig-ee-09144f43f3b5.pem'
EE_CREDENTIALS = ee.ServiceAccountCredentials(EE_ACCOUNT, EE_PRIVATE_KEY_FILE)

ee.Initialize(EE_CREDENTIALS)

def setCoordinates(rectangle):
	rct = [];
	for i in rectangle.split(',',3):
		rct.append(float(i))

	return rct;


def run(collection, startDate, endDate, composites, rectangleSides):

	idDict = {};

	coordinates = setCoordinates(rectangleSides);

	img = ee.ImageCollection(collection).filterBounds(ee.Geometry.Rectangle(coordinates[0], coordinates[1], coordinates[2], coordinates[3])).filterDate(startDate, endDate).max();
	mapId = img.getMapId({ "bands": composites, "min":"0.1,0,0", "max":"0.7,0.55,0.6", "gamma": "1.3,0.9,1.3" });

	for i in mapId:
		
		if(i == u'token'):
			idDict["token"] = str(mapId.get(i));
		elif (i == u'mapid'):
			idDict["mapid"] = str(mapId.get(i));
	

	print idDict

result = run(argv[1], argv[2], argv[3], argv[4], argv[5])

