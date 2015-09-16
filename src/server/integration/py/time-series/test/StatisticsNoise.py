#-------------------------------------------------------------------------------
# Name:       StatisticsNoise
# Purpose:
#
# Author:      bernard.oliveira
#
# Created:     19/08/2015
# Copyright:   (c) bernard.oliveira 2015
# Licence:     <GNL>
#-------------------------------------------------------------------------------

#Importando modulos
import numpy as np

#Construcao da funcao
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

    PercEstimatioValues = float(1)-(float(NoneValue)/float(BadValues))


    print "Porcentagem de valores bons: %.2f " % (PercGoodValues*100.0)
    print "Porcentagem de valores ruins: %.2f " % (PercBadValues*100.0)
    print "Porcentagem de Valores Substitudos: %.2f" % (PercEstimatioValues*100.0)


    return PercGoodValues,PercBadValues,PercEstimatioValues


if __name__ == '__main__':

  aEVI2 = map(float, list(open(r'C:\Users\bernard.oliveira\Documents\HagenFilter\evi2_3A.txt','r')))
  aFLAG = map(int, list(open(r'C:\Users\bernard.oliveira\Documents\HagenFilter\flag_3AMod.txt','r')))
  StatisticNoise(aFLAG,aEVI2)


