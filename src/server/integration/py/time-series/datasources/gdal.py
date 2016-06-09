import os
from subprocess import Popen, PIPE, STDOUT
from _datasource import Datasource
import re

class Gdal(Datasource):

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

		longitude, latitude = re.findall("[-+]?\d+[\.]?\d*", geoJsonGeometry);

		if('month' == self.temporal_resolution_type):
			date = self.localDateByMonth()
		else:		
			date = self.LocalDateByDay()

		filepath = os.path.join(self.imageDbPath, self.file)

		cmd = 'gdallocationinfo -valonly -wgs84'+" "+filepath+" "+str(longitude)+" "+str(latitude)

		process = Popen(cmd, shell=True, stdin=PIPE, stdout=PIPE, stderr=STDOUT, close_fds=True)
		output = process.stdout.read();
		stdoutStr = output.split();
		
		for i,j in zip(stdoutStr,date):
			count = []
			count.append(j)		
			count.append(float(i))
			result.append(count)

		finalResult = {
			"series": [
				{
					"position": 1,
					"id": "original",
					"label": "Valores originais"
				}
			],
			"values": result
		}

		return finalResult