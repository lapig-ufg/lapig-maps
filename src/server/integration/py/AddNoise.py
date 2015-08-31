#-------------------------------------------------------------------------------
# Name:        AddNoise in Array
# Purpose:
#
# Author:      Bernard.Oliveira
#
# Created:     25/08/2015
# Copyright:   (c) Bernard.Oliveira 2015
# Licence:     <GNL>
#-------------------------------------------------------------------------------
import numpy as np
import random


def AddNoise(iArray,nNoise):

   #Criando vetor
   Array = np.array(iArray)

   #Localizando valores bons do pixel reliability
   location = np.where(Array == 0)[0]

   #Gerando pontos aleatorios
   pRandom = random.sample(location,nNoise)

   #Substituido os valores bons por ruins
   Array[pRandom] = 1

   return list(Array),pRandom

if __name__ == '__main__':

    #Inserindo parametros
    aFlag =  map(int, list(open(r'C:\Users\bernard.oliveira\Documents\HagenFilter\flag_3AMod.txt','r')))
    NumberofNoise = 10 #limit 19 to array 66 elements

    #Gerando resultados
    result,NoiseLocation  = AddNoise(aFlag,NumberofNoise)

    #Visualizando resultados
    print 'Original Array: '+str(aFlag)
    print 'Noise    Array: '+str(result)
    print 'Noise Location: '+str(NoiseLocation)
    
