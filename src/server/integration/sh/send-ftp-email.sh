#!/bin/bash

name=$1
email=$2
produto=$3
path=$4

username=lapig-dados
senha=dados

echo -e "$name,\n"\
"\n"\
"clique no link abaixo para acessar o produto $produto via LAPIG-FTP.\n\n"\
"	* URL: ftp://ftp.lapig.iesa.ufg.br/$path\n" \
"	* Usuário: $username\n"\
"	* Senha: $senha\n"\
"\nAcesse o FTP pelo próprio windows explorer ou utilizando um software FTP como o Filezilla:\n"\
"	* Windows Explorer: http://www.7tutorials.com/connect-ftp-server-windows-explorer\n"\
"	* Filezilla: http://www.techtudo.com.br/dicas-e-tutoriais/noticia/2012/09/como-usar-o-filezilla.html\n"\
"\nQualquer dúvida, estamos a disposição.\n"\
"\n"\
"Att.\n"\
"LAPIG/UFG"\ | mail -s "LAPIG DOWNLOAD - $produto" $email