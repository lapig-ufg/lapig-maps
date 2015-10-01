import ee
import os
import utils
import time
import datetime 
from _datasource import Datasource
from threading import Thread
import Queue


class EarthEngine(Datasource):

	def __init__(self, layerParams, datasourceParams):
		Datasource.__init__(self, layerParams)

		self.expression = self.expression
		self.fill_value = utils.num(self.fill_value)
		self.collection_id = self.collection_id.upper();
		self.pixel_resolution = utils.num(self.pixel_resolution)
		self.fn_parsedate = getattr(self, self.fn_parsedate + "Date");		
		self.tredao = int(datasourceParams['threads'])
		
		privateKeyFilepath = os.path.join(datasourceParams['run_path'],datasourceParams['private_key'])

		self.credentials = ee.ServiceAccountCredentials(datasourceParams['account'], privateKeyFilepath);


	def landsatDate(self, imgId):
		year = imgId[9:13]
		doy = imgId[13:16]

		return year + doy

	def modisDate(self, imgId):
		#MOD13Q1_005_2000_02_18

		year = imgId[12:16]
		month = imgId[17:19]
		day = imgId[20:22]

		doy = datetime.date(int(year), int(month), int(day)).timetuple().tm_yday;
		doy = '{0:03d}'.format(doy);

		return year + doy

	def removeDuplicate(self, eeLockupResult, fillValue):
		result = []

		for key, value in eeLockupResult.iteritems():
			if key not in result:
				value = fillValue if value is None else value
				result.append([key, value])

		result = sorted(result, key=lambda x: x[0])

		for item in result:
			ano = int(item[0][0:4])
			juliano = int(item[0][4:7])
			mes = ''

			if (ano%4==0) & ((ano%400==0) | (ano%100 != 0)):

				ab = True

				if (juliano >= 1) & (juliano <= 31):
					dia = juliano
					mes = '01'

				elif (juliano > 31) & (juliano <= 60):
					dia = juliano - 31
					mes = '02'

				elif (juliano > 60) & (juliano <= 91):
					dia = juliano - 60
					mes = '03'

				elif (juliano > 91) & (juliano <= 121):
					dia = juliano - 91
					mes = '04'

				elif (juliano > 121) & (juliano <= 152):
					dia = juliano - 121
					mes = '05'

				elif (juliano > 152) & (juliano <= 182):
					dia = juliano - 152
					mes = '06'

				elif (juliano > 182) & (juliano <= 213):
					dia = juliano - 182
					mes = '07'

				elif (juliano > 213) & (juliano <= 244):
					dia = juliano - 213
					mes = '08'

				elif (juliano > 244) & (juliano <= 274):
					dia = juliano - 244
					mes = '09'

				elif (juliano > 274) & (juliano <= 305):
					dia = juliano - 274
					mes = '10'

				elif (juliano > 305) & (juliano <= 335):
					dia = juliano - 305
					mes = '11'

				elif (juliano > 335) & (juliano <= 366):
					dia = juliano - 335
					mes = '12'

			else:

				if (juliano >= 1) & (juliano <= 31):
					dia = juliano
					mes = '01'

				elif (juliano > 31) & (juliano <= 59):
					dia = juliano - 31
					mes = '02'

				elif (juliano > 59) & (juliano <= 90):
					dia = juliano - 59
					mes = '03'

				elif (juliano > 90) & (juliano <= 120):
					dia = juliano - 90
					mes = '04'

				elif (juliano > 120) & (juliano <= 151):
					dia = juliano - 120
					mes = '05'

				elif (juliano > 151) & (juliano <= 181):
					dia = juliano - 151
					mes = '06'

				elif (juliano > 181) & (juliano <= 212):
					dia = juliano - 181
					mes = '07'

				elif (juliano > 212) & (juliano <= 243):
					dia = juliano - 212
					mes = '08'

				elif (juliano > 243) & (juliano <= 273):
					dia = juliano - 243
					mes = '09'

				elif (juliano > 273) & (juliano <= 304):
					dia = juliano - 273
					mes = '10'

				elif (juliano > 304) & (juliano <= 334):
					dia = juliano - 304
					mes = '11'

				elif (juliano > 334) & (juliano <= 365):
					dia = juliano - 334
					mes = '12'

			item[0] = str(datetime.date(int(ano),int(mes), dia))

		return result;


	def splitDate(self):
		
		miniThread = []		
		ano1, ano2 = int(self.start_date[0:4]), int(self.end_date[0:4])
		day1, day2 = self.start_date[8:10], self.end_date[8:10]
		month1, mont2 = self.start_date[5:7], self.end_date[5:7]

		difAnos = ano2 - ano1
		intervalo = difAnos/self.tredao
	
		if difAnos > self.tredao:											
			
			count = 0
			threads = [[] for i in range(self.tredao)]
			
			for i,j in zip(range(ano1,ano2,intervalo),threads):
				
				count = count+ 1

				if i == ano1:
					iday = day1;
					imonth = month1;
					fday = '31'
					fmonth = '12'
					x= str(i)+'-'+imonth+'-'+iday
					y= str(i+intervalo)+'-'+fmonth+'-'+fday
					j.append(x)
					j.append(y)
				elif (i == ano2) | (count == len(threads)):					
					fday = day2
					fmonth = mont2
					iday = '01'
					imonth = '01'
					x= str(i+1)+'-'+imonth+'-'+iday
					y= str(ano2)+'-'+fmonth+'-'+fday					
					j.append(x)
					j.append(y)
				else:
					iday = '01'
					imonth = '01'
					fmonth = '12'
					fday = '31'
					x= str(i+1)+'-'+imonth+'-'+iday
					y= str(i+intervalo)+'-'+fmonth+'-'+fday					
					j.append(x)
					j.append(y)

			for i in threads:		
				miniThread.append(i)

			return miniThread
		
		else:
			
			threads = [[] for i in range(difAnos)]

			count = 0

			for i,j in zip(range(ano1,ano2,1),threads):
				
				count = count+ 1

				if i == ano1:
					iday = day1;
					imonth = month1;
					fday = '31'
					fmonth = '12'
					x= str(i)+'-'+imonth+'-'+iday
					y= str(i+intervalo)+'-'+fmonth+'-'+fday
					j.append(x)
					j.append(y)
				elif (i == ano2) | (count == len(threads)):					
					fday = day2
					fmonth = mont2
					iday = '01'
					imonth = '01'
					x= str(i)+'-'+imonth+'-'+iday
					y= str(ano2)+'-'+fmonth+'-'+fday					
					j.append(x)
					j.append(y)
				else:
					iday = '01'
					imonth = '01'
					fmonth = '12'
					fday = '31'
					x= str(i+1)+'-'+imonth+'-'+iday
					y= str(i+intervalo)+'-'+fmonth+'-'+fday					
					j.append(x)
					j.append(y)
			
			for i in threads:		
				miniThread.append(i)
			
			return miniThread



		 		

	def runjob(self, data, longitude, latitude, q):

		ee.Initialize(self.credentials);

		def calculateIndex(image):
			return image.expression(self.expression);

		point = ee.Geometry.Point([longitude, latitude]);
		timeSeries = ee.ImageCollection(self.collection_id).filterDate(data[0], data[1]).map(calculateIndex);


		while(True):
			try:
				eeResult = timeSeries.getRegion(point, self.pixel_resolution).getInfo();
				break;	
			except ee.ee_exception.EEException:
				time.sleep(1)
				print 'tentando novamente'		

		result={}
		
		for item in eeResult:
			if item[0] == 'id':
				continue
			dateKey = self.fn_parsedate(item[0]);
			result[dateKey]=item[4]

		result = self.removeDuplicate(result, fillValue = self.fill_value);

		q.put(result)
		


	def lockup(self, longitude, latitude):

		dates = self.splitDate()
		QueaueList = []
		pseudoResult = []
		result = []
		
		for i in dates:
			q = Queue.Queue()
			x=Thread(name='Thread',target=self.runjob, args=[i, longitude, latitude, q])
			x.start()
			QueaueList.append(q)
		
		for i in QueaueList:
			pseudoResult.append(i.get())

		for i in pseudoResult:
			for j in i:
				result.append(j)

		return result	
		
		
		
				

			
		
