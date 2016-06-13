SPATIALITE_DB="$1"

for table in $(spatialite -silent $SPATIALITE_DB 'select f_table_name from geometry_columns;'); do
	geometry=$(spatialite -silent $SPATIALITE_DB "select GeometryType(Geometry) from $table LIMIT 1;")
	geometry=$(echo $geometry | sed s/MULTI//)
	echo "
	LAYER
	  NAME \"$table\" 
	  CONNECTIONTYPE OGR 
	  CONNECTION \"Ocultos/spatial-intelligence.sqlite\" 
	  DATA \"$table\" 
	  EXTENT  -73.794489 -33.752414 -35.117489 5.047586 
	  METADATA 
	    \"ows_title\" \"$table\" 
	    \"ows_abstract\" \"\" 
	    \"gml_exclude_items\" \"the_geom\" 
	    \"gml_include_items\" \"all\" 
	    \"gml_geometries\"  \"the_geom\" 
	    \"wms_enable_request\" \"GetMap GetFeatureInfo\" 
	  END 
	  PROJECTION 
	    \"init=epsg:4674\" 
	  END 
	  STATUS ON 
	  TYPE $geometry 
	  TEMPLATE \"DUMMY\" 
	  VALIDATION 
	    \"CQL_FILTER\" \".\" 
	    \"DEFAULT_CQL_FILTER\" '\"TRUE\"=\"TRUE\"' 
	  END 
	  FILTER (%CQL_FILTER%) 
	END"
done