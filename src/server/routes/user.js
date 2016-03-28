module.exports = function (app) {

	var users = app.controllers.user

	app.put('/user/insert', users.insert);
	app.post('/user/login', users.login);
	app.get('/user/info', users.info);
	app.get('/user/logout', users.logout);
	
	app.get('/user/points', users.getPoints);
	app.put('/user/points', users.insertPoint);
	app.delete('/user/points', users.deletePoint);

}