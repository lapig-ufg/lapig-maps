import os
import sys
import gdal, ogr, osr, numpy
import datetime
import math
import time
import traceback

from joblib import Parallel, delayed
import multiprocessing

def polygonize(input_feature, input_feature_srs, input_feature_def, input_value_raster, fid, output_tablename):
		timestart = time.time()
		memory_driver = ogr.GetDriverByName("Memory")
		memory_ds = memory_driver.CreateDataSource("tempDS")
		
		#name = input_feature.GetField(str(sys.argv[4]))
		input_geometry = input_feature.GetGeometryRef()

		temp_vector_layer = memory_ds.CreateLayer("tempLayer", input_feature_srs, input_geometry.GetGeometryType())    
		polygon_feature = ogr.Feature(temp_vector_layer.GetLayerDefn());
		polygon_feature.SetGeometry(input_geometry);
		temp_vector_layer.CreateFeature(polygon_feature);

		raster = gdal.Open(input_value_raster)

		raster_srs = osr.SpatialReference()
		raster_srs.ImportFromWkt(raster.GetProjectionRef())

		transform = raster.GetGeoTransform()
		xOrigin = transform[0]
		yOrigin = transform[3]
		pixelWidth = transform[1]
		pixelHeight = transform[5]

		if (input_geometry.GetGeometryName() == 'MULTIPOLYGON'):
				count = 0
				pointsX = []; pointsY = []
				for polygon in input_geometry:
						geomInner = input_geometry.GetGeometryRef(count)
						ring = geomInner.GetGeometryRef(0)
						numpoints = ring.GetPointCount()
						for p in range(numpoints):
										lon, lat, z = ring.GetPoint(p)
										pointsX.append(lon)
										pointsY.append(lat)
						count += 1
		elif (input_geometry.GetGeometryName() == 'POLYGON'):
				ring = input_geometry.GetGeometryRef(0)
				numpoints = ring.GetPointCount()
				pointsX = []; pointsY = []
				for p in range(numpoints):
								lon, lat, z = ring.GetPoint(p)
								pointsX.append(lon)
								pointsY.append(lat)

		else:
				sys.exit("ERROR: Geometry needs to be either Polygon or Multipolygon")


		xmin = min(pointsX)
		xmax = max(pointsX)
		ymin = min(pointsY)
		ymax = max(pointsY)

		xmin = xOrigin+abs(round((xOrigin-xmin)/pixelWidth))*pixelWidth
		ymax = yOrigin+abs(round((yOrigin-ymax)/pixelHeight))*pixelHeight

		xoff = int((xmin - xOrigin)/pixelWidth)
		yoff = int((yOrigin - ymax)/pixelWidth)
		xcount = int((xmax - xmin)/pixelWidth)
		ycount = int((ymax - ymin)/pixelWidth)
		
		#temp_raster_layer = gdal.GetDriverByName('GTiff').Create('teste.tif', xcount, ycount, 1, gdal.GDT_Byte)
		temp_raster_layer = gdal.GetDriverByName('MEM').Create('', xcount, ycount, gdal.GDT_Byte)
		temp_raster_layer.SetGeoTransform((xmin, pixelWidth, 0,ymax, 0, pixelHeight))
		temp_raster_layer.SetProjection(raster_srs.ExportToWkt())

		gdal.RasterizeLayer(temp_raster_layer, [1], temp_vector_layer, burn_values=[1], options = [])

		input_raster_band = raster.GetRasterBand(1)
		temp_raster_band = temp_raster_layer.GetRasterBand(1)

		input_raster_data = input_raster_band.ReadAsArray(xoff, yoff, xcount, ycount).astype(numpy.byte)
		temp_raster_data = temp_raster_band.ReadAsArray(0, 0, xcount, ycount).astype(numpy.byte)

		temp_raster_data = input_raster_data * temp_raster_data

		temp_raster_band.WriteArray(temp_raster_data)
		temp_raster_band.FlushCache()

		dst_ds = memory_driver.CreateDataSource("tempVec")
		dst_layer = dst_ds.CreateLayer("tempVec", srs = raster_srs)

		dn = ogr.FieldDefn("dn", ogr.OFTInteger)
		dst_layer.CreateField(dn)
		
		conn_str = "PG: host=localhost port=5432 dbname=atlas_pastagem user=postgres password=lapig123"

		# user: lapig
		# senha: L4P1Gsu
		# Formato de Saida (Alterar para PostGIS)
		drv2 = ogr.GetDriverByName("PostgreSQL")
		out_ds = drv2.CreateDataSource(conn_str)
		out_lyr = out_ds.GetLayerByName(output_tablename)

		if out_lyr is None:
			out_lyr = out_ds.CreateLayer(output_tablename, srs = raster_srs, geom_type=ogr.wkbMultiPolygon)

			area_field = ogr.FieldDefn("area_ha", ogr.OFTReal)
			area_field.SetWidth(32)
			area_field.SetPrecision(8)

			category_field = ogr.FieldDefn("category", ogr.OFTString)

			out_lyr.CreateField(area_field)
			out_lyr.CreateField(category_field)

			for i in range(input_feature_def.GetFieldCount()):
				input_field = input_feature_def.GetFieldDefn(i)
				out_lyr.CreateField(input_field)

		gdal.Polygonize(temp_raster_band, None, dst_layer, 0, [],  callback=None )
		
		field_names = []
		for i in range(input_feature_def.GetFieldCount()):
			input_field = input_feature_def.GetFieldDefn(i)
			field_names.append(input_field.GetName())

		defn = out_lyr.GetLayerDefn()
		
		albers = osr.SpatialReference()
		albers.ImportFromProj4("+proj=aea +lat_1=-2 +lat_2=-22 +lat_0=-12 +lon_0=-54 +x_0=0 +y_0=0 +ellps=aust_SA +units=m +no_defs")

		osrTransform = osr.CoordinateTransformation(raster_srs, albers)

		agg_geometries = {}

		for feat in dst_layer:

			if feat.geometry():
				pixel_value = feat.GetField('dn')

				if pixel_value > 0:
					if pixel_value not in agg_geometries:
						agg_geometries[pixel_value] = {
							'area': 0.0,
							'geom': ogr.Geometry(ogr.wkbMultiPolygon)
						}

					agg_geometries[pixel_value]['geom'].AddGeometry(feat.geometry())

					feat.geometry().Transform(osrTransform)
					agg_geometries[pixel_value]['area'] = agg_geometries[pixel_value]['area'] + feat.geometry().GetArea()
		

		for pixel_value in agg_geometries.keys():

			geom = agg_geometries[pixel_value]['geom']
			area = agg_geometries[pixel_value]['area']

			out_feat = ogr.Feature(defn)
			out_feat.SetGeometry(geom)
			out_feat.SetField("category", pixel_value)
			out_feat.SetField("area_ha", area / 10000)

			for field_name in field_names:
				out_feat.SetField(field_name, input_feature.GetField(field_name))

			out_lyr.CreateFeature(out_feat)
		
		out_ds.Release()
		timeend = time.time() - timestart
		print('Inserted: '+ str(fid) + " - " + input_feature.GetField('MUNICIPIO')+ " - "+"%.2f seconds" % round(timeend,2));

def feature_loop(input_value_raster, input_zone_polygon, output_tablename):

		shp = ogr.Open(input_zone_polygon)
		vector_layer = shp.GetLayer()

		FID_List = range(vector_layer.GetFeatureCount())
		    
		def parallelProcess(input_value_raster, input_zone_polygon, output_tablename, FID):
			shp = ogr.Open(input_zone_polygon)
			vector_layer = shp.GetLayer()
			input_feature = vector_layer.GetFeature(FID)
			input_feature_srs = vector_layer.GetSpatialRef()
			input_feature_def = vector_layer.GetLayerDefn()
			try:
				polygonize(input_feature, input_feature_srs, input_feature_def, input_value_raster, FID, output_tablename)
			except Exception:
				traceback.print_exc()
				print('ERROR: '+ str(FID) + " - " + input_feature.GetField('MUNICIPIO'));

		num_cores = 20
		Parallel(n_jobs=num_cores)(delayed(parallelProcess)(input_value_raster, input_zone_polygon, output_tablename, FID) for FID in FID_List)

feature_loop(sys.argv[1], sys.argv[2], sys.argv[3])