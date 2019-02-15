import mapscript
import sys

layername = sys.argv[1]
mapfile_path = sys.argv[2]

mapfile = open(mapfile_path, "r")
mapfile_content = mapfile.read()
mapfile_content = 'MAP\n' + mapfile_content + "\nEND"

mapObj = mapscript.fromstring(mapfile_content)
layerObj = mapObj.getLayerByName(layername)
layerObj.applySLDURL('http://ows.lapig.iesa.ufg.br/sld/'+layername, layername)

print(layerObj.convertToString())