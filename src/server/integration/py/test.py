from __future__ import print_function

import HagenFilter
import TimeSeriesEE
import matplotlib.pyplot as plt
import datetime
import matplotlib.pyplot as plt
import string
import numpy as np
import random


from matplotlib.dates import MONDAY
from matplotlib.dates import MonthLocator, WeekdayLocator, DateFormatter

def generateDates(date1, date2, nDays):
	firstTuple = date1.timetuple()
	lastTuple = date2.timetuple()

	result = []
	for year in xrange(firstTuple[0], lastTuple[0] + 1):
		internalDt1 = datetime.date(year, firstTuple[1], firstTuple[2]) if year == firstTuple[0] else datetime.date(year, 1, 1)
		internalDt2 = datetime.date(year, lastTuple[1], lastTuple[2] + 1) if year == lastTuple[0] else datetime.date(year, 12, 31)
		result += range(internalDt1.toordinal(), internalDt2.toordinal(), nDays)

	return result

def showChart(series,dates):
	fig, ax = plt.subplots()

	ax.xaxis.set_major_formatter(DateFormatter("%b '%y"))
	ax.autoscale_view()
	ax.grid(True)
	fig.autofmt_xdate()

	for label, values in series.iteritems():
		ax.plot_date(dates, values, label = label, ls='-', marker='', fmt='')

	ax.legend(loc=4)
	plt.show()

def getValues(lon, lat):
	pixelValuesEE = TimeSeriesEE.run('MOD13Q1_EVI2', lon, lat, 0);
	pixelFlagsEE = TimeSeriesEE.run('MOD13Q1_PR', lon, lat, 3);

	pixelValues = [item[1] for item in pixelValuesEE ]
	pixelFlags = [item[1] for item in pixelFlagsEE ]

	datesArray = [item[0] for item in pixelValuesEE ]

	return [pixelValues, pixelFlags, datesArray]

def QAError(aOriginal,aEstimation,lNoisedFlag,ValueMin,ValueMax):
   aPercError = []
   deltaMinMax = float(ValueMax) - float(ValueMin)
   for k in lNoisedFlag:
     if aOriginal[k] is not None:
      if aEstimation[k] is not None:
       pErrorO = (aOriginal[k]-float(ValueMin))/deltaMinMax
       pErrorE = (aEstimation[k]-float(ValueMin))/deltaMinMax
       deltaError = pErrorO - pErrorE
       aPercError.append(deltaError)

   return sum(aPercError)*100.00

def StatisticNoise(ArrayPR,ArrayHG):
    aArray = np.array(ArrayPR)
    GoodValues = np.size(np.argwhere(aArray == 0))
    BadValues = np.size(np.argwhere(aArray > 0))
    SumValues = np.size(aArray)
    PercGoodValues = float(GoodValues)/float(SumValues)
    PercBadValues = float(BadValues)/float(SumValues)
    aHG = np.array(ArrayHG)
    NoneValue = 0
    for i in aHG[np.where(aArray > 0)]:
       if i  is None:
         NoneValue +=1
    PercEstimatioValues = PercBadValues*(float(1)-(float(NoneValue)/float(BadValues)))
    PercNotEstimatioValues = PercBadValues*((float(NoneValue)/float(BadValues)))
    QtdNotEst = NoneValue
    QtdEst = abs(NoneValue - BadValues)
    return PercGoodValues,PercBadValues,PercEstimatioValues,PercNotEstimatioValues,QtdEst,QtdNotEst

def AddNoise(iArray,nNoise):
   Array = np.array(iArray)
   location = np.where(Array == 0)[0]
   pRandom = random.sample(location,nNoise)
   Array[pRandom] = 1
   return list(Array),pRandom

#Abrindo arquivos
evi2Open = open(r'C:\Users\bernard.oliveira\Documents\TimeSeries-LAPIG\Pontos_Arielle_LAPIG.txt','r')
ReportFile = open(r'C:\Users\bernard.oliveira\Documents\TimeSeries-LAPIG\Report.txt','w')
ReportFile.writelines("NM_PONTO;LAT_DD;LONG_DD;CLASS;GOODPIXELS_PERC;BADPIXELS_PERC;SUBSPIXELS_PERC;NOTSUBPIXELS_PERC;DIFSUBPIXELS_PERC"+'\n')

for d in evi2Open.readlines():
    Values = string.split(d,";")
    pixelValues, pixelFlags, datesArray = getValues(float(Values[2]),float(Values[1]))
    minDt = min(datesArray).split('-')
    maxDt = max(datesArray).split('-');

    startDate = datetime.date(int(minDt[0]), int(minDt[1]), int(minDt[2]))
    endDate = datetime.date(int(maxDt[0]), int(maxDt[1]), int(maxDt[2]))
    temporalResolution = 16
    nComposites = 23
    goodFlags = [0]

    hagenPixelValues = HagenFilter.run(pixelValues, pixelFlags, nComposites, goodFlags)
    dates = generateDates(startDate, endDate, temporalResolution)
    gValue,bValue,gpValue,gpnVlaue,qValues,qnValues = StatisticNoise(pixelFlags,hagenPixelValues)

    Noise,locationNoise = AddNoise(pixelFlags,1)
    resultNoise = HagenFilter.run(pixelValues, Noise, nComposites, goodFlags)
    qA = QAError(pixelValues,resultNoise,locationNoise,-1.00,1.00)


    series = {
	   	   'EVI2 HagenFilter': hagenPixelValues
	   ,   'EVI2 Original': pixelValues
    }

    delimiter = ";"
    seq = (Values[0],Values[1],Values[2],Values[3],str(gValue*100),str(bValue*100),str(gpValue*100),str(gpnVlaue*100),str(qA))
    ReportFile.writelines(delimiter.join(seq))
    ReportFile.writelines('\n')
    print ("Ponto:"+str(Values[0])+" processado...")

evi2Open.close()
ReportFile.close()

#showChart(series,  dates)
