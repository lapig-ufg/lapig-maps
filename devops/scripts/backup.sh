#!/bin/bash

BACKUP_SERVER=200.137.221.230
BACKUP_USER=lapig

GEOSERVER_DATADIR=/data/geoserver_datadir
PROJETOS_HOME=/data/projetos
LAPIGMAPS_HOME=/data/programas/lapig-maps

date=$(date +'%Y-%m-%d')

echo "LAPIG-MAPS BACKUP"
echo " 1/5) Geoserver data_dir (FILES)"
tar cjf - $GEOSERVER_DATADIR | ssh $BACKUP_USER@$BACKUP_SERVER "dd of=/data/lapig-maps/geoserver_datadir-$date.tar.bz2"
echo " 2/5) Dados satelitários (FILES)"
tar cjf - $PROJETOS_HOME/projeto_base_de_dados_satelitarias | ssh $BACKUP_USER@$BACKUP_SERVER "dd of=/data/lapig-maps/projeto_base_de_dados_satelitarias-$date.tar.bz2"
echo " 3/5) Dados vetoriais (FILES)"
tar cjf - $PROJETOS_HOME//projeto_base_de_dados_vetoriais | ssh $BACKUP_USER@$BACKUP_SERVER "dd of=/data/lapig-maps/projeto_base_de_dados_vetoriais-$date.tar.bz2"
echo " 4/5) LAPIG-MAPS (FILES)"
tar cjf - $LAPIGMAPS_HOME/anexo $LAPIGMAPS_HOME/out | ssh $BACKUP_USER@$BACKUP_SERVER "dd of=/data/lapig-maps/lapig_maps-$date.tar.bz2"
echo " 5/5) LAPIG-MAPS (POSTGRESQL DUMP)"
pg_dump -Fc -U lapig_bd_admin -h 200.137.217.158 -C lapig-maps | ssh $BACKUP_USER@$BACKUP_SERVER "dd of=/data/lapig-maps/lapig_maps-$date.dump"

