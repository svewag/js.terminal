var socket = io.connect('http://localhost:3000');
socket.on('response', function (data) {
	console.log(data);
	cmdCounter++;
	var out = data.hideOutput ? "" : data.output;
					var user = data.user;
					var hostname = data.hostname;
					var path = data.path;
					currentPath = path;
					out = out.replace("\n", "<br />", "g");
					var line =  "<span class='user'>" + user + "@</span>" + "<span class='host'>" + hostname + "</span>:<span class='path'>" + path + "</span>$ ";
					commandLine = line;
					var content = "";
 					content += out + line + "<span data-cmd='"+cmdCounter+"'></span><span class='cursor'>&nbsp;</span>";
					content = content.replace(/\n/g, "<br />");
					$("#ende").before("<div class='commandLine'>"+content+"</div>");
					scrollToEnd();
});
			
var commandLine = "";
var lastCmd = [];
var cmdCounter = 0;
var lastCmdPosition = null;
var currentPath = "";
			var execute = function(cmd, hideOutput){
				$(".cursor").remove();
				var command = cmd || getCmd();
				if(command === ""){
					cmdCounter++;
					$("#ende").before("<div class='commandLine'>"+commandLine + "<span data-cmd='"+cmdCounter+"'></span><span class='cursor'>&nbsp;</span></div>");
					scrollToEnd();
					return;
				}
				if(command === "clear"){ location.href = location.href;}
				if(!hideOutput){ saveCmd(command);}	
				lastCmdPosition = null;
				socket.emit("command", {cmd: command, path: currentPath, hideOutput: hideOutput});
			}

			function scrollToEnd(){
				var offset = $("#ende").offset();
				offset && window.scrollTo(offset.left, offset.top);
			}

			function saveCmd(cmd){
				if(cmd === ""){return};
				if(cmd === lastCmd[lastCmd.length-1]){return}
				lastCmd.push(cmd);
			}

			function getLastCmd(){
				return lastCmd[lastCmd.length-1];
			}

			function getCmd(){
				return getCmdInput().text();
			}

			function getCmdInput(){
				return $("[data-cmd='"+cmdCounter+"']");
			}

			$("body").live("keydown", function(e){
				if(e.keyCode == "8"){ // backspace
					e.preventDefault();
					var input = getCmd();
					var newInput = input.substring(0, input.length-1);
					getCmdInput().text(newInput);
					return false;
				}

				if(e.keyCode == "9"){// TAB
					e.preventDefault();
					execute("^I");
					return false;
				}

				if(e.keyCode == "38"){ // up arrow
					if(lastCmd.length>0){
						if(lastCmdPosition == null){ 
							lastCmdPosition = lastCmd.length -1; 
						} else {
							lastCmdPosition -= 1;
						}
						if(lastCmdPosition < 0){ lastCmdPosition = 0; }
						getCmdInput().text(lastCmd[lastCmdPosition]);
					}
					return false;
				}

				if(e.keyCode == "40"){ // down arrow
					var c = null;
					
					if(lastCmdPosition != null && lastCmdPosition >= 0 && lastCmdPosition + 1 < lastCmd.length){
						lastCmdPosition++;
						c = lastCmd[lastCmdPosition];
					} else {
						c = "";
						lastCmdPosition = null;
					}

					getCmdInput().text(c);
				}
			});
	
			$("body").live("keypress", function(e){
				if(e.keyCode == "13"){
					execute();
					return;
				}
				var char = String.fromCharCode(e.charCode);
				getCmdInput().append(char);
			});
			
			$(document).ready(function(){
				execute("pwd", true);
			});
