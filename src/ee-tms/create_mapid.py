#!/usr/bin/python

import ee
from sys import argv

EE_ACCOUNT = '163878256934-uorqnep89dmauei9tv8s5cmhcro4s0p9@developer.gserviceaccount.com'
EE_PRIVATE_KEY_FILE = 'lapig-ee-09144f43f3b5.pem'
EE_CREDENTIALS = ee.ServiceAccountCredentials(EE_ACCOUNT, EE_PRIVATE_KEY_FILE)

ee.Initialize(EE_CREDENTIALS)

def run(collection, enDate, startDate, composites):

	idDict = {};

	img = ee.ImageCollection('LANDSAT/LC8_L1T_TOA').filterDate(enDate, startDate).max();
	mapId = img.getMapId({ "bands": composites});

	for i in mapId:
		
		if(i == u'token'):
			idDict["token"] = str(mapId.get(i));
		elif (i == u'mapid'):
			idDict["mapid"] = str(mapId.get(i));
	

	print idDict

result = run(argv[1], argv[2], argv[3], argv[4])
