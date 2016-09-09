#!/bin/bash

##
# TODO: salvar log de saída em arquivo
# TODO: salvar log de erros em arquivo
#	TODO: Corrigir erros ao instalar o servidor e o ows
# 	* Em alguns sistemas deve ser root ao executar "npm install"
# TODO: Corrigir erro ao instalar o pacote bfast ao R
# 	* Erro ocorre ao tentar escrever na biblioteca padrão e não cria uma pessoal
#
##

if [ $(id -u) != "0" ]; then
    echo -e "Você de mais poder precisa para maravilhoso este script executar, jovem padawan!\nTreinar você deve, e encontrar a frase de poder você precisa.\nQue a força esteja com você" >&2
    echo -e "\n\n\n\n\n Se não entendeu a mensagem legal acima (você é normal demais, por favor seja mais esquisito).... E precisa ser root para executar" >&2
    exit 1
fi

echo "Instalando os pacotes necessários..."
sleep 0.7
sudo apt-get install build-essential git mongodb redis-server cgi-mapserver inotify-tools ant sshfs fonts-droid python2.7 python2.7-dev libpython2.7-dev python-pip python-scipy r-base

echo "Clonando o repositório do LAPIG-maps no diretório atual..."
sudo git clone https://github.com/lapig-ufg/lapig-maps.git

echo "Instalando Node Version Manager (NVM)..."
echo "Usando wget..."
sleep 0.7
echo "Obtendo script de instalação: https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh"
sleep 0.7
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash

echo "Carregando NVM..."
NVM_DIR=$HOME/.nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"   #This loads nvm

echo "Instalando Node.js, versão v0.12.2..."
sleep 0.7
nvm install v0.12.2

echo "Definindo a versão Node.js padrão: v0.12.2"
nvm use v0.12.2
echo -e "#Sets the Node.js default version\nnvm use v0.12.2 --silent" >> ~/.bashrc

echo "Preparando ambiente para o MongoDB..."
sleep 0.7

echo "Você deve ter pelo menos 4GB de espaço livre no seu diretório raiz (/) para executar o MongoDB."
echo "Caso não haja basta subistituir a pasta '/data' por um link simbólico (ln -s) para um local com espaço."
echo "Ou definir outro local para o banco de dados usando --dbpath."
sleep 2

echo -e "\nCriando pasta /data/db"
sudo mkdir -p /data/db
sudo chmod +777 /data
sudo chmod +777 /data/*

echo "Configurando o lapig-maps-server..."
sleep 0.7
cd lapig-maps/src/server
npm install
npm install always -g

echo "Criando arquivo de senha passwords.json em lapig-maps/src/server..."
echo "Você deve preenchê-lo com o usuário e senha corretos."
sleep 2
echo -e "{\n\t\"gmailUser\":\"usuario\"\n\t\"gmailPassword\":\"senha_dificil_aqui\"\n}" > passwords.json

echo "Configurando o OWS..."
sleep 0.7
cd ../ows
npm install

echo "Criando link para o servidor de imagens e criando partição temporária para o servidor OWS..."
sleep 0.7
sudo mkdir /mnt/su04
sudo mkdir /mnt/tmpfs

#sudo sshfs -o allow_other -o ro -o Ciphers=arcfour -o cache_stat_timeout=600 -o workaround=nodelaysrv lapig@10.0.0.14:/data/lapig /mnt/su04
echo -e "sshfs#lapig@10.0.0.14:/data/lapig\t/mnt/su04\tfuse\tallow_other,ro,cache_stat_timeout=600,workaround=nodelaysrv\t0 0" | sudo tee -a /etc/fstab > /dev/null
echo -e "tmpfs\t/mnt/tmpfs\ttmpfs\tnodev,nosuid,size=2G\t0 0" | sudo tee -a /etc/fstab > /dev/null
sudo mount -a

ln -s /mnt/su04/GEO/REPOSITÓRIO\ DE\ DADOS/DADOS\ DO\ PORTAL/ ./data_dir/catalog

echo "Configurando fontes..."
sleep 0.7
FONT_PATH = "$(dpkg -L fonts-droid | grep DroidSans.ttf)"
echo "droid ""$FONT_PATH" > ./data_dir/ows_fonts.list

echo "Restaurando banco de dados..."
sleep 0.7
cd ../db
mongod &
sleep 2
mongorestore prod
sleep 5
mongod --shutdown

echo "Configurando Google Mercator..."
sleep 0.7
#/usr/share/proj/epsg
echo -e "# Google Mercator\n<900913> +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs <>" | sudo tee -a /usr/share/proj/epsg

echo "Configurando Earth Engine API..."
sleep 0.7
sudo pip install google-api-python-client
sudo pip install pyCrypto
sudo pip install earthengine-api

echo "Agora é nencessário autenticar suas credencias para utilizar o EarthEngine."
echo "Tentarei executar um script que realiza esta autenticação..."
echo "CASO A EXECUÇÃO FALHE execute o seguinte comando no terminal e siga as intruções:"
echo -e "'python -c \"import ee; ee.Initialize()\"'"
sleep 2

echo -e "\n\nTentando realizar a autenticação agora...\nO browser será aberto.\nAutentique-se com sua conta Google e permita o acesso do EarthEngine...\nCopie o código apresentado e cole no terminal."
sleep 2
python /usr/local/lib/python2.7/dist-packages/ee/authenticate.py

echo "Testando EarthEngine... Você verá informações de uma imagem, se der certo..."
python -c "import ee; ee.Initialize(); image = ee.Image('srtm90_v4'); print(image.getInfo())"

echo "Instalando o pacote bfast para o R..."
sleep 0.7
Rscript -e 'install.packages("bfast", repos="https://cran.rstudio.com")'

echo -e "\n\n\tF I N I T A ! !\n"
