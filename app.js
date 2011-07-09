
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var io = require("socket.io").listen(app);
var child = require("child_process");
var exec = child.exec;
var spawn = child.spawn;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'js.terminal'
  });
});

app.listen(3000);

io.sockets.on('connection', function (socket) {
  socket.on('command', function (data) {
    	var path = data.path;
	var cmd = data.cmd;

	if(path){process.chdir(path);}
		exec(cmd, function(error, stdout, stderr){
			if(cmd.match(/^cd/)){ process.chdir(cmd.replace(/^cd /, "")); }
			exec("pwd", function(err, path){
				path = path.replace(/\n/, "");
				var result = stdout || stderr;
				console.log("result: "+ result);
				var hash = {
					"hostname": hostname,
					"user": user,
					"path": path,
					"output": result,
					"hideOutput": data.hideOutput,
				};
				socket.emit("response", hash);
			});
		});    
  });
});

var user = "unknown";
var hostname = "unknown";

exec("whoami", function(error, stdout, stderr){
        user = stdout.replace(/\n/, "");
});

exec("hostname", function(error, stdout, stderr){
        hostname = stdout.replace(/\n/, "");
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
