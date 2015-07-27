#!/bin/bash

REPOSITORY_DIR=/home/lapig-server/repositories/lapig
LOG_DIR=/var/log/lapig-maps
NODE_VERSION=0.10.25
DEV_DIR=/data/lapig-maps/dev
PROD_DIR=/data/lapig-maps/prod

alias update='cd $REPOSITORY_DIR; git pull'
alias deploy='$REPOSITORY_DIR/devops/lapig-maps/scripts/deploy.sh $@'
alias log-dev='tail -f $LOG_DIR/dev.log'
alias log-prod='tail -f $LOG_DIR/prod.log'
alias restart-lapig-maps="su -c 'kill $(pgrep -f app.js)'"
alias prod='cd $PROD_DIR'
alias dev='cd $DEV_DIR; NODE_ENV=dev node app.js'
alias rep='cd $REPOSITORY_DIR'

[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh # This loads NVM
nvm use "v$NODE_VERSION"
