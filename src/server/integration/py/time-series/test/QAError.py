#-------------------------------------------------------------------------------
# Name:        QAError - Verify originals values witn estimations values
# Purpose:
#
# Author:      bernard.oliveira
#
# Created:     26/08/2015
# Copyright:   (c) bernard.oliveira 2015
# Licence:     <your licence>
#-------------------------------------------------------------------------------

def QAError(aOriginal,aEstimation,lNoisedFlag,ValueMin,ValueMax):

   #Criando Lista de erros
   aPercError = []

   #Diferenca de valores
   deltaMinMax = float(ValueMax) - float(ValueMin)

   #Loop para verificar os valores
   for k in lNoisedFlag:
      pErrorO = (aOriginal[k]-float(ValueMin))/deltaMinMax
      pErrorE = (aEstimation[k]-float(ValueMin))/deltaMinMax
      deltaError = pErrorO - pErrorE
      aPercError.append(deltaError)

   #Resultados
   return sum(aPercError)*100.00

if __name__ == '__main__':
    oArray = [0.37798199057579,0.369093060493469,0.67436146736145,0.26420858502388,0.594082355499268,0.482270181179047,0.490608185529709,0.500477731227875,0.467685788869858,0.570143580436707,0.57061493396759,0.434007674455643]
    eArray = [0.37798199057579,0.369093060493469,0.67436146736145,0.46420858502388,0.594082355499268,0.582270181179047,0.190608185529709,0.500477731227875,0.467685788869858,0.570143580436707,0.40061493396759,0.434007674455643]
    aNoise = [10,3,5,6]
    vMinimo = -1.0
    vMaximo = 1.0
    results = QAError(oArray,eArray,aNoise,vMinimo,vMaximo)
    print str(results)+' %'