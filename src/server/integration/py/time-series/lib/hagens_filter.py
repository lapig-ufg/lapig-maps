#-------------------------------------------------------------------------------
# Name:        SthephenFilter
# Purpose:
#
# Author:      bernard.oliveira apud:Sthephen Hangen
#
# Created:     10/08/2015
# Copyright:   (c) bernard.oliveira 2015
# Licence:     GNL
#-------------------------------------------------------------------------------

import numpy
import math
import warnings

from ConfigParser import SafeConfigParser
cp = SafeConfigParser();


#Medias dos dias durante o Ano - Finalizado
def AveregeYearDoy(iArray,iFlag,nComposites,GoodFlags):
	aAveregeYearDay = []
	for i in range(nComposites):
		aAverege = []
		for j in range(i,len(iArray),nComposites):
			if iFlag[j] in GoodFlags:
				aAverege.append(iArray[j])
		
		# aAverege pode ser vazio, quando isso ocorre numpy.average lanca um warning e retorna nan
		# Condicao adicionada para evitar warning - Guilherme, 19/05/2016
		aAveregeYearDay.append(numpy.average(aAverege) if len(aAverege) > 0 else float('nan'))
	return aAveregeYearDay

#Desvio de cada dia na serie temporal em relacao a media do ano - Finalizado
def DevAveregeAnual(iArray,iFlag,nComposites,aAveregeYearDoy,GoodFlags):
		aAveregeTA = []
		for i in range(nComposites):
			for j in range(i,len(iArray),nComposites):
				if iFlag[j] in GoodFlags:
					dTA = math.pow(aAveregeYearDoy[i]-iArray[j],2)
					aAveregeTA.append(dTA)
		aAveregeTypicalAnual = math.sqrt(float(sum(aAveregeTA))/float(len(aAveregeTA)))
		return aAveregeTypicalAnual

#Desvio entre a vizinhanco do dia anterior e posterior - Finalizado
def DevNeighborhoodDay(iArray,iFlag,GoodFlags):
		aAveregeND = []
		for i in range(len(iArray)):
			if i == 0 or i == len(iArray)-1 :
				teste=1
			elif (iFlag[i] in GoodFlags and iFlag[i-1])in GoodFlags and iFlag[i+1] in GoodFlags:
				tDay = (iArray[i-1]+iArray[i+1])/float(2)
				vDay = math.pow(tDay - iArray[i],2)
				aAveregeND.append(vDay)
		aAveregeTypicalDay = math.sqrt(float(sum(aAveregeND))/float(len(aAveregeND)))
		return aAveregeTypicalDay

#Desvio entre a vizinhanco do dia anterior e posterior - Em desenvolvimento
def DevNeighborhoodAnual(iArray,iFlag,nComposites,GoodFlags):
		aAveregeNA = []
		for i in range(nComposites):
			for j in range(i,len(iArray),nComposites):
				if j < nComposites or j > (len(iArray)-1)-nComposites :
					teste=1
				elif iFlag[abs(j-nComposites)] in GoodFlags and iFlag[j+nComposites] in GoodFlags and iFlag[j] in GoodFlags:
					tYear = (iArray[abs(j-nComposites)]+iArray[j+nComposites])/float(2)
					vYear = math.pow(tYear - iArray[j],2)
					aAveregeNA.append(vYear)

		#Modificado em 27.08.2015 - Bernard
		if len(aAveregeNA) > 0:
			aAveregeTypicalDay = math.sqrt(float(sum(aAveregeNA))/float(len(aAveregeNA)))
		else:
			aAveregeTypicalDay = None
		return aAveregeTypicalDay


#Preenchimento dos buracos (FillGaps) - Em desenvolvimento
def FillGaps(iArray,iFlag,nComposites,iAveregeDOY,iAveregeAnual,iNeighborhoodDay,iNeighborhoodAnual,GoodFlags):
		Gaps = []
		FillGaps = []
		for i in range(len(iArray)):
			if not iFlag[i] in GoodFlags:
				Gaps.append(0.0)
				FillGaps.append(0.0)
			else:
				Gaps.append(iArray[i])
				FillGaps.append(iArray[i])


		for j in range(len(iArray)):
			if FillGaps[j] == 0.0:

				numerador=0.0;
				denominador=0.0;

				if iAveregeDOY[j%nComposites] > 0 and iAveregeAnual > 0:
					numerador += (iAveregeDOY[j%nComposites]*(float(1)/iAveregeAnual));
					denominador += (float(1)/iAveregeAnual);
					"""
					if j == 346:
						print((iAveregeDOY[j%nComposites]*(float(1)/iAveregeAnual)), (float(1)/iAveregeAnual))
					"""

				#Verificar se a vizinhanca local os valores sao bons
				if (j != 0 and j != len(iArray)-1) and ( iNeighborhoodDay > 0) and (iFlag[j-1] in GoodFlags and iFlag[j+1] in GoodFlags):
					numerador += ((iArray[j-1]+iArray[j+1])/float(2))*(float(1)/iNeighborhoodDay)
					denominador += float(1)/iNeighborhoodDay
					"""
					if j == 346:
						print(iFlag[j-1], iFlag[j+1])
						print(((iFlag[j-1]+iFlag[j+1])/float(2))*(float(1)/iNeighborhoodDay), (float(1)/iNeighborhoodDay))
					"""

				#Verificar se a vizinhanca anual os valores sao bons
				if (j > nComposites or j < (len(iArray)-1)-nComposites) and (iNeighborhoodAnual > 0) and [j-nComposites] in GoodFlags and iFlag[j+nComposites] in GoodFlags:
					numerador += ((iArray[j-nComposites]+iArray[j+nComposites])/float(2))*(float(1)/iNeighborhoodAnual)
					denominador += float(1)/iNeighborhoodAnual
					"""
					if j == 346:
						print(((iFlag[j-nComposites]+iFlag[j+nComposites])/float(2))*(float(1)/iNeighborhoodAnual), float(1)/iNeighborhoodAnual)
					"""

				#print(iFlag[j], iFlag[j] == 1)
				#Flag = 1
				#if(iFlag[j] == 1):
				#  numerador += iArray[j] * 1.00/200.00;
				#  denominador += 1.00/200.00;

				if denominador > 0.0:
					numerador = numerador/denominador
					"""
					if j == 346:
						print(numerador,denominador)
					"""
				else:
					numerador = iArray[j]

				FillGaps[j] = numerador

			else:
				FillGaps[j] = FillGaps[j]
		return FillGaps


def removeNone(E, fillValue):
	result = []
	
	for key in E:

		if key == None:
			result.append(fillValue)
		else:
			result.append(key)  
	return result


def run(pixelValues, flagValues, nComposites, goodFlags, fillValue = 0):
	# warnings.simplefilter("error", "RuntimeWarning")
	A = AveregeYearDoy(pixelValues,flagValues,nComposites,goodFlags)
	B = DevAveregeAnual(pixelValues,flagValues,nComposites,A,goodFlags)
	C = DevNeighborhoodDay(pixelValues,flagValues,goodFlags)
	D = DevNeighborhoodAnual(pixelValues,flagValues,nComposites,goodFlags)
	E = FillGaps(pixelValues,flagValues,nComposites,A,B,C,D,goodFlags)
	F = removeNone(E, fillValue)

##   print "Media Anual dos dias: "+str(A)
##   print "Desvio da media Anual em cada dia: "+str(B)
##   print "Desvio entre as vizinhanca da serie temporal: "+str(C)
##   print "Desvio entre as vizinhanca anual da serie temporal: "+str(D)
##   print "FillGaps: "+str(E[0])
		
	return F;