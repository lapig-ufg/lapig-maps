# -*- coding: utf-8 -*-
import os
import gdal, ogr, osr, numpy;
from subprocess import Popen, PIPE, STDOUT;
from _datasource import Datasource;
import ast;



class Gdalds(Datasource):

	def __init__(self, layerParams, datasourceParams):
		Datasource.__init__(self, layerParams)

		self.imageDbPath = os.path.join(datasourceParams['run_path'],datasourceParams['image_db'])

	def LocalDateByDay(self):

		result = []

		days = int(self.temporal_resolution)

		startYearVariable = datetime.datetime.strptime(self.start_date, "%Y-%m-%d").date()
		endYearVariable = datetime.datetime.strptime(self.end_date, "%Y-%m-%d").date()

		p = startYearVariable

		while(startYearVariable.year < endYearVariable.year):

			result.append(str(p))

			p = p + datetime.timedelta(days)

			if p.year > startYearVariable.year:
				startYearVariable = startYearVariable + relativedelta(years=1)
				p = startYearVariable

		return result

	def localDateByMonth(self):

		startYear = int(self.start_date[0:4])
		endYear = int(self.end_date[0:4])

		endMonth = int(self.end_date[5:7])

		result = []

		for i in range(startYear,endYear+1):

			for j in range(1,13):

				result.append(str(i)+'-'+str(j).zfill(2)+'-'+'01');
				if (str(j) in str(endMonth)) & (str(i) in str(endYear)):
					break;

		return result

	def lookup(self, geoJsonGeometry, mode=None):
		result = []
		filepath = os.path.join(self.imageDbPath, self.file);
		mean = self.zonalStatistics(geoJsonGeometry, filepath);
		if('month' == self.temporal_resolution_type):
			date = self.localDateByMonth()
		else:
			date = self.LocalDateByDay()
		
		geoJsonGeometry = ast.literal_eval(geoJsonGeometry)

		for i,j in zip(mean,date):
			count = []
			count.append(j)
			count.append(float(i))
			result.append(count)

		series = [{'position': 1, 'type': 'original', 'id': 'original', 'label': 'Valores originais'}, {'position': 2, 'type': 'filter', 'id': 'Wiener', 'label': 'Wiener'}, {'position': 3, 'type': 'filter', 'id': 'Savgol', 'label': 'Savitzky Golay'}]
				
		return {
			"series": series,
			"values": result
		};

	def zonalStatistics(self, geoJsonGeometry, filepath):
		# Open data
		raster = gdal.Open(filepath);
		driver = ogr.GetDriverByName("Memory")

		data_source = driver.CreateDataSource("tempDS")
		srs = osr.SpatialReference()
		srs.ImportFromEPSG(4326)

		# Get raster georeference info
		transform = raster.GetGeoTransform()
		xOrigin = transform[0]
		yOrigin = transform[3]
		pixelWidth = transform[1]
		pixelHeight = transform[5]

		geoJsonGeometry = ogr.CreateGeometryFromJson(geoJsonGeometry);

		layer = data_source.CreateLayer("tempLayer", srs, geoJsonGeometry.GetGeometryType())
		feature = ogr.Feature(layer.GetLayerDefn());
		feature.SetGeometry(geoJsonGeometry);
		layer.CreateFeature(feature);

		if geoJsonGeometry.GetGeometryName() == "POINT":
			geoJsonGeometry = geoJsonGeometry.Buffer(0.0001);

		geometry = geoJsonGeometry.GetGeometryRef(0);
		numpoints = geometry.GetPointCount()
		pointsX = []; pointsY = []
		for p in range(numpoints):
			lon, lat, z = geometry.GetPoint(p);
			pointsX.append(lon)
		  	pointsY.append(lat)

		xmin = min(pointsX)
		xmax = max(pointsX)
		ymin = min(pointsY)
		ymax = max(pointsY)

		# Specify offset and rows and columns to read
		xoff = int((xmin - xOrigin)/pixelWidth)
		yoff = int((yOrigin - ymax)/pixelWidth)
		xcount = int((xmax - xmin)/pixelWidth)+1
		ycount = int((ymax - ymin)/pixelWidth)+1

		# Create memory target raster
		target_ds = gdal.GetDriverByName('MEM').Create('', xcount, ycount, 1, gdal.GDT_Byte)
		target_ds.SetGeoTransform((xmin, pixelWidth, 0, ymax, 0, pixelHeight))

		# Create for target raster the same projection as for the value raster
		raster_srs = osr.SpatialReference();
		raster_srs.ImportFromWkt(raster.GetProjectionRef());
		target_ds.SetProjection(raster_srs.ExportToWkt());

		# Rasterize zone polygon to raster
		gdal.RasterizeLayer(target_ds, [1], layer, options = ["ALL_TOUCHED=TRUE", "BURN_VALUE_FROM=[1]"]);

		# Read raster as arrays
		mean = [];
		valor = 0
		iteration = 0
		bands = raster.RasterCount;

		#get all rasters
		for i in range(1, bands):
			banddataraster = raster.GetRasterBand(i);
			dataraster = banddataraster.ReadAsArray(xoff, yoff, xcount, ycount).astype(numpy.float);			
			bandmask = target_ds.GetRasterBand(1);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
			datamask = bandmask.ReadAsArray(0, 0, xcount, ycount).astype(numpy.float);
			zoneraster = numpy.ma.masked_array(dataraster,  numpy.logical_not(datamask));
			for line in zoneraster:
				for colum in line:
					if(colum != 'NaN'):
						valor = valor+colum;
						iteration = iteration+1;
			mean.append(valor/iteration);
			valor = 0;
			iteration = 0;

		return mean;


		#verificar saida da aplicação do guilherme no google earth engine;