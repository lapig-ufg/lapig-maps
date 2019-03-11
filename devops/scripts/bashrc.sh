#!/bin/bash

REPOSITORY_DIR=/home/lapig-server/repositories/lapig
LOG_DIR=/var/log/lapig-maps
NODE_VERSION=0.12.2
DEV_DIR=/data/lapig-maps/dev
PROD_DIR=/data/lapig-maps/prod

OWS_PID_PATTERN='/data/lapig-maps/prod/ows/app-cluster.js'
SERVER_PID_PATTERN='/data/lapig-maps/prod/server/app-cluster.js'

clear-cache() {
    redis-cli -h lapig-redis keys "*$1*" | xargs redis-cli -h lapig-redis DEL
}

alias update='cd $REPOSITORY_DIR; git pull'
alias deploy='$REPOSITORY_DIR/devops/scripts/deploy.sh $@'
alias deploy_ows='$REPOSITORY_DIR/devops/scripts/deploy_ows.sh $@'
alias deploy_server='$REPOSITORY_DIR/devops/scripts/deploy_server.sh $@'

alias prod='cd $PROD_DIR'
alias rep='cd $REPOSITORY_DIR'

alias ows-clear-cache=clear-cache
alias ows-pid='pgrep -f $OWS_PID_PATTERN'
alias ows-restart="sudo pgrep -f $OWS_PID_PATTERN | xargs kill"
alias ows-start="sudo svc -u /etc/service/ows/"
alias ows-stop="sudo svc -d /etc/service/ows/; sudo pgrep -f $OWS_PID_PATTERN | xargs kill"
alias ows-log="tail -f /var/log/lapig-maps/ows.log"
alias ows-mapserver-log="tail -f /var/log/lapig-maps/mapserver.log"

alias server-pid='pgrep -f $SERVER_PID_PATTERN'
alias server-restart="sudo pgrep -f $SERVER_PID_PATTERN | xargs kill"
alias server-start="sudo svc -u /etc/service/server/"
alias server-stop="sudo svc -d /etc/service/server/; pgrep -f $SERVER_PID_PATTERN | xargs kill"
alias server-log="tail -f /var/log/lapig-maps/server.log"

[[ -s $HOME/.nvm/nvm.sh ]] && . $HOME/.nvm/nvm.sh # This loads NVM
nvm use "v$NODE_VERSION"
