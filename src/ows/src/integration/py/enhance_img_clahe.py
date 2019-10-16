#!/usr/bin/python3

import numpy as np
import cv2
import os
import osr
import sys

def adjust_gamma(image, gamma=1.0):

   invGamma = 1.0 / gamma
   table = np.array([((i / 255.0) ** invGamma) * 255
      for i in np.arange(0, 256)]).astype("uint8")

   return cv2.LUT(image, table)

def enhance_img(data):
  
  r, g, b = cv2.split(data)

  claheSmall = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(8,8))
  claheBig = cv2.createCLAHE(clipLimit=10.0, tileGridSize=(8,8))
  
  rl = claheBig.apply(r)
  gl = claheSmall.apply(g)
  bl = claheBig.apply(b)
  limg = cv2.merge((rl, gl, bl))
  limg = adjust_gamma(limg, 1.5)
  
  return limg

if __name__ == "__main__":
  
  stdin = sys.stdin.buffer.read()
  array = np.frombuffer(stdin, dtype='uint8')
  
  data = cv2.imdecode(array, 1)
  data = enhance_img(data)
  
  stdout = cv2.imencode('.png', data)[1].tostring()
  sys.stdout.buffer.write(bytes(stdout))