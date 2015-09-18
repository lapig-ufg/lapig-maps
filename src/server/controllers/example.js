module.exports = function(app) {

	var Example = {};

	Example.test = function(request, response) {
	  
	  var layerCollection = app.repository.collections.layers;

		layerCollection.find({}).toArray(function(err, docs) {
				//response.send(docs);
				response.end('Hello World!');
		});

	};

	Example.grid = function(request, response) {
		var data = [
		    {
			    task:'Rebanho Bovino',
			    duration:1.2,
			    user:'Preview/Info',
			    iconCls:'task-folder',
			    children:[
			    {
		            task: 'M1',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M2',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M3',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        },
		    	{
		            task: 'M4',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M5',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M6',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        },
		        {
		            task: 'M7',
		            duration: 3,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        },
		    	]
			},
			{
			    task:'Desmatamentos',
			    duration:2.3,
			    user:'Preview/Info',
			    iconCls:'task-folder',
			    children:[
			    {
		            task: 'M1',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M2',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M3',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        },
		    	{
		            task: 'M4',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M5',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M6',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        },
		        {
		            task: 'M7',
		            duration: 3,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        },
		    	{
		            task: 'M8',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M9',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }
		    	]
			},
			{
			    task:'Frigoríficos',
			    duration:1.4,
			    user:'Preview/Info',
			    iconCls:'task-folder',
			    children:[
		    	{
		            task: 'M1',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		       	}, 
		       	{
		            task: 'M2',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		        {
		            task: 'M3',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        },
		    	{
		            task: 'M4',
		            duration: 0.25,
		            user: '',
		            iconCls: 'task',
		            leaf: true
		        }, 
		    	]
			}
		]

		response.send(data)
		response.end()
	}

	return Example;

}
