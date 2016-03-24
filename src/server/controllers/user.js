module.exports = function (app) {
	var User = {}
	var UsersCollection = app.repository.collections.users
	var PointsCollection = app.repository.collections.points

	User.insert = function(request, response) {
    var user = request.param('jsonData')
		var crypto = require('crypto')
		var password = user.password
		var hash = crypto.createHash('md5').update(password).digest('hex')
		user.password = hash
		delete user['repeatPassword']
		
 		UsersCollection.insertOne(user, function(failure, success){
		  if(failure){
		  	response.send("Cadastro invalido")
		  	response.end()
		  }else{
		  	response.send("Cadastro efetuado com sucesso. Bem vindo!")
			response.end()
		  }
		})
	}
	
	User.login = function(request, response) {
		var keysLogin = request.param('jsonData')
		var id = keysLogin._id
		var password = keysLogin.password
		var crypto = require('crypto')
		var hash = crypto.createHash('md5').update(password).digest('hex')
		password = hash

		UsersCollection.findOne({_id: id, password: password}, {}, function(err, user){
			if(user == null){
				response.send('Error')
				response.end()
			} else {
				request.session.user = user
				response.send(request.session.user)
				response.end()
			}
		})
	}
	
	User.info = function(request, response) {
		var session = request.session
		response.send(session.user)
		response.end()
	}

	User.logout = function(request, response) {
		var session = request.session
		response.send(session.user = null)
		response.end()
	}

	User.getPoints = function(request, response) {
		if(request.session.user == undefined){
			return
		}
		
		var userId = request.session.user._id;

		results = PointsCollection.find({"userId": userId}).toArray(function(err, results) {
			if (err){
				response.send({
					success: false,
					error: 'getpoints'
				});
				response.end();
			}else{
				response.send({
					success: true,
					result: results
				});
				response.end();
			}
		});
	}

	User.insertPoint = function(request, response) {
		if(request.session.user == undefined){
			return
		}

		var userId = request.session.user._id;
		var pointName = request.param('name');
		var lon = request.param('longitude');
		var lat = request.param('latitude');

		var point = {
			_id: userId+lon+lat,
			userId: userId,
			name: pointName,
			longitude: lon,
			latitude: lat
		};

		PointsCollection.insertOne(point, function(err, success){
			if(err){
				response.send({
					success: false,
					error: 'insertpoint'
				});
				response.end();
			}else{
				response.send({success: true});
				response.end();
			}
		});
	}

	User.deletePoint = function(request, response) {
		if(request.session.user == undefined){
			return
		}

		var userId = request.session.user._id;
		var lon = request.param('longitude');
		var lat = request.param('latitude');
		var pointId = userId+lon+lat;

		PointsCollection.deleteOne({_id: pointId}, function(err, result){
			if(err){
				response.send({
					success: false,
					error: 'deletepoint'
				});
				response.end();
			}else{
				response.send({success: true});
				response.end();
			}
		});
	}

	return User
}