var Terminal = function(){
	var self = this;
	self.cmdCounter = 0;
	self.currentPath = "";
	self.socket = null,
	self.lastCmd = [];
	self.lastCmdPosition = null;
	self.lastCommandContext = "";
	self.socketIOURL = "http://localhost:3000",
	self.connect = function(){
		if(!io){ return alert("Socket.IO not available!"); }
		self.socket = io.connect(Terminal.socketIOURL);
		self.defineSocketEvents();
	}
	self.defineSocketEvents = function(){
		if(self.socket === null){ return }
		self.socket.on('response', self.paintResult);
	}
	self.paintResult = function(data){
		self.cmdCounter++;
		var out = data.hideOutput ? "" : data.output;
		self.currentPath = data.path;
		out = out.replace("\n", "<br />", "g");
		var content = out + self.commandContext(data) + self.commandInput();
		content = content.replace(/\n/g, "<br />");
		self.addToScreen(content);
		self.scrollToEnd();
	}
	self.submitCommand = function(cmd, hideOutput){
		$(".cursor").remove();
		var command = cmd || self.getCmd();
		if(command === ""){
			self.cmdCounter++;
			self.addToScreen(self.commandContext() + self.commandInput());
			self.scrollToEnd();
			return;
		}

		if(command === "clear"){ location.href = location.href;}

		if(!hideOutput){ self.saveCmd(command);}	
		self.lastCmdPosition = null;
		self.socket.emit("command", {cmd: command, path: self.currentPath, hideOutput: hideOutput});
		
	}
	self.commandContext = function(data){
		if(data){
			self.lastCommandContext = "<span class='user'>" + data.user + "@</span><span class='host'>" + data.hostname + "</span>:<span class='path'>" + data.path + "</span>$ ";
		}

		return self.lastCommandContext;
	}
	self.commandInput = function(){
		return "<span data-cmd='" + self.cmdCounter + "'></span><span class='cursor'>&nbsp;</span>";
	}
	self.scrollToEnd = function(){
		var offset = $("#ende").offset();
		offset && window.scrollTo(offset.left, offset.top);
	}
	self.addToScreen = function(text){
		$("#ende").before("<div class='commandLine'>"+text+"</div>");
	}
	self.saveCmd = function(cmd){
		if(cmd === ""){return};
		if(cmd === self.lastCmd[self.lastCmd.length-1]){return}
		self.lastCmd.push(cmd);
	}

	self.getLastCmd = function(){
		return self.lastCmd[self.lastCmd.length-1];
	}

	self.getCmd = function(){
		return self.getCmdInput().text();
	}

	self.getCmdInput = function(){
		return $("[data-cmd='"+self.cmdCounter+"']");
	}
}

var terminal = new Terminal();
terminal.connect();

$("body").live("keydown", function(e){
	if(e.keyCode == "8"){ // backspace
		e.preventDefault();
		var input = terminal.getCmd();
		var newInput = input.substring(0, input.length-1);
		terminal.getCmdInput().text(newInput);
		return false;
	}

	if(e.keyCode == "9"){// TAB
		e.preventDefault();
		terminal.submitCommand("^I");
		return false;
	}

	if(e.keyCode == "38"){ // up arrow
		if(terminal.lastCmd.length>0){
			if(terminal.lastCmdPosition == null){ 
				terminal.lastCmdPosition = terminal.lastCmd.length -1; 
			} else {
				terminal.lastCmdPosition -= 1;
			}
				
			if(terminal.lastCmdPosition < 0){ terminal.lastCmdPosition = 0; }
			terminal.getCmdInput().text(terminal.lastCmd[terminal.lastCmdPosition]);
		}

		return false;
	}

	if(e.keyCode == "40"){ // down arrow
		var c = null;
	
		if(terminal.lastCmdPosition != null && terminal.lastCmdPosition >= 0 && terminal.lastCmdPosition + 1 < terminal.lastCmd.length){
			terminal.lastCmdPosition++;
			c = terminal.lastCmd[terminal.lastCmdPosition];
		} else {
			c = "";
			terminal.lastCmdPosition = null;
		}

		terminal.getCmdInput().text(c);
	}
});
	
$("body").live("keypress", function(e){
	if(e.keyCode == "13"){
		terminal.submitCommand();
		return;
	}
				
	var char = String.fromCharCode(e.charCode);
	terminal.getCmdInput().append(char);
});
			
$(document).ready(function(){
	terminal.submitCommand("pwd", true);
});
