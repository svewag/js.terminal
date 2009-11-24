var sys = require("sys");
var http = require("http");

http.createServer(function(request, response){
	var cmd = request.uri.params["cmd"];
	var callback = request.uri.params["jsonp"];
	
	if(cmd){
		sys.puts("exec " + cmd);
		sys.exec(cmd).addCallback(function(stdout, stderr){
			response.sendHeader(200, {"Content-Type": "application/json"});
			sys.puts("result: "+ stdout);
			var hash = {
				"output": stdout
			};
			var data = callback + "([" + JSON.stringify(hash) + "])";
			sys.puts(data);
			response.sendBody(data);
			response.finish();
		});
	}
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/")
