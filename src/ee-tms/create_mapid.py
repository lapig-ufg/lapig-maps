#!/usr/bin/python

import ee

EE_ACCOUNT = '163878256934-uorqnep89dmauei9tv8s5cmhcro4s0p9@developer.gserviceaccount.com'
EE_PRIVATE_KEY_FILE = 'lapig-ee-09144f43f3b5.pem'
EE_CREDENTIALS = ee.ServiceAccountCredentials(EE_ACCOUNT, EE_PRIVATE_KEY_FILE)

def run(collection, enDate, startDate, composites):

	ee.Initialize(EE_CREDENTIALS)

	img = ee.ImageCollection('LANDSAT/LC8_L1T_TOA').filterDate('2014-06-01', '2014-07-01').first();
	mapId = img.getMapId({ "bands": 'B6, B5, B4'});

	print(mapId);

result = run(argv[1], argv[2], argv[3], argv[4])
