var sys = require("sys");
var http = require("http");
var URL = require("url");
var exec = require('child_process').exec;

var user = "unknown";
var hostname = "unknown";

exec("whoami", function(error, stdout, stderr){
	user = stdout.replace(/\n/, "");
});

exec("hostname", function(error, stdout, stderr){
	hostname = stdout.replace(/\n/, "");
});

http.createServer(function(request, response){
	var query = URL.parse(request.url, true).query;
	if(!query){ response.end(); return; }
	var cmd = query.cmd;
	var callback = query.jsonp;
	
	if(cmd){
		sys.puts("exec " + cmd);
		exec(cmd, function(error, stdout, stderr){
			exec("pwd", function(err, path){
				path = path.replace(/\n/, "");
				response.writeHead(200, {"Content-Type": "application/javascript"});
				var result = stdout || stderr;
				sys.puts("result: "+ result);
				var hash = {
					"hostname": hostname,
					"user": user,
					"path": path,
					"output": result,
				};
				var data = callback + "([" + JSON.stringify(hash) + "])";
				sys.puts(data);
				response.write(data);
				response.end();
			});
		});
	}
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/")
