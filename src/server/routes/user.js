module.exports = function (app) {

	var users = app.controllers.user

	app.put('/user/insert', users.insert)
	app.post('/user/login', users.login)
	app.get('/user/info', users.info)
	app.get('/user/logout', users.logout)
}