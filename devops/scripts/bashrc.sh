#!/bin/bash

REPOSITORY_DIR=/home/lapig-server/repositories/lapig
LOG_DIR=/var/log/lapig-maps
NODE_VERSION=0.10.25
DEV_DIR=/data/lapig-maps/dev
PROD_DIR=/data/lapig-maps/prod

alias update='cd $REPOSITORY_DIR; git pull'
alias deploy='$REPOSITORY_DIR/devops/scripts/deploy.sh $@'

alias restart-lapig-maps="su -c 'kill $(pgrep -f app.js)'"
alias prod='cd $PROD_DIR'
alias rep='cd $REPOSITORY_DIR'

alias ows-stop="su -c 'svc -u /etc/service/ows/'"
alias ows-start="su -c 'svc -d /etc/service/ows/'"
alias ows-log="tail -f /var/log/lapig-maps/ows.log.1"

alias server-start="su -c 'svc -d /etc/service/server/'"
alias server-stop="su -c 'svc -u /etc/service/server/'"
alias server-log="tail -f /var/log/lapig-maps/server.log.1"

[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh # This loads NVM
nvm use "v$NODE_VERSION"
