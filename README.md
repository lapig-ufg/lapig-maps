# LAPIG-Maps

With the continuous advancement in Geographic Information Systems, ultimately turned to the availability and analysis of data in Web environments, geographic information becomes fundamental for pure or applied researches, especially in assisting decision making, either by private entities or governmental. On the other hand, the sheer amount of data, coupled with a variety of uses and audiences, makes these systems complex, while unique, which, in a simple and intuitive way, need to provide, as accurately as possible, a Cartographic information to the end user. Currently, some systems of this level already operate in Brazil, focused on the management and monitoring of natural ecosystems, as Amazon, Cerrado (savanna) and Atlantic Forest. Specifically for the Cerrado, a consistent platform and database have been developed and maintained for almost a decade by LAPIG / UFG with the main purpose of assisting the management and conservation of this tropical savanna environment. In this context, this study aims to present the concepts and Technologies that have been supporting the development of platforms such as the Interactive Map (from LAPIG platform). Among the numerous solutions and products, this system presents a huge collection of maps and aerial and satellite images, accessible through a free and interactive platform (based on open source technology), currently counting with almost 10,000 layers of geographic information, with real-time visualization and analysis

[See the paper for more info](http://www.seer.ufu.br/index.php/revistabrasileiracartografia/article/view/43983)

Link to access: [https://maps.lapig.iesa.ufg.br/lapig.html](https://maps.lapig.iesa.ufg.br/lapig.html)

![alt tag](https://raw.githubusercontent.com/lapig-ufg/lapig-maps/master/proj/application.png)

## Prerequisites and necessary dependencies!:

-GDAL 2.4.0 specific

-Python 3.7.3 higher

-Node.js v8.11.4 specific

-npm 5.6.0 or higher

-nvm 0.37.0 or higher

- python-mapscript 7.2.2-1 specific

## Running:
 1. Start MongoDB
 ```
 mongod
 ```
 2. Start Server
 ```
 ./prod-start.sh
 ```
