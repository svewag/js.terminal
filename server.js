var sys = require("sys");
var http = require("http");
var URL = require("url");
var exec = require('child_process').exec;

http.createServer(function(request, response){
	var query = URL.parse(request.url, true).query;
	if(!query){ response.end(); return; }
	var cmd = query.cmd;
	var callback = query.jsonp;
	
	if(cmd){
		sys.puts("exec " + cmd);
		exec(cmd, function(error, stdout, stderr){
			response.writeHead(200, {"Content-Type": "application/json"});
			sys.puts("result: "+ stdout);
			var hash = {
				"output": stdout
			};
			var data = callback + "([" + JSON.stringify(hash) + "])";
			sys.puts(data);
			response.write(data);
			response.end();
		});
	}
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/")
