module.exports = function (app) {
	var User = {}
	var UserCollection = app.repository.collections.user

	User.insert = function(request, response) {
    	var user = request.param('jsonData')
		var crypto = require('crypto')
		var password = user.password
		var hash = crypto.createHash('md5').update(password).digest('hex')
		user.password = hash
		delete user['repeatPassword']
		
 		UserCollection.insertOne(user, function(failure, success){

		  if(failure){
		  	response.send({ result: false })
		  	response.end()
		  }else{
		  	response.send({ result: true })
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

		UserCollection.findOne({_id: id, password: password}, {}, function(err, user){
			if(user == null){
				response.send({ error: true})
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

	return User
}