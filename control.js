
	var http 		= require('http'),
		fileSystem 	= require('fs'),
		path 		= require('path'),
		util 		= require('util');

	var server = http.createServer(function(request,response){
		
		//criando caminho arquivo
		//__dirname = caminho do projeto
		//stream 	= nome do diretorio
		//video.mp4 = nome arquivo
		var filePath = path.join(__dirname,"stream","video.mp4");
		
		//
		var stat = fileSystem.statSync(filePath);
		
		var inicio 	= 0;
		var fim	= 0;
		
		//capturar notação range do cabeçalho
		var range = request.headers.range;
		
		console.log(range);
		
		//verifica se existe informação no range
		if(range) {
			
			//obtem a parte necessaria para o inicio
			inicio = parseInt(range.slice(range.indexOf("bytes=") + 6, range.indexOf("-")));
			//obtem a parte final
			fim	= parseInt(range.slice(range.indexOf("-") + 1, range.lenght));
		}
		
		//verificando fim do arquivo
		if(inicio > fim) { return; }
		
		if(isNaN(fim) || fim == 0) {
			fim = stat.size -1;
		}
		
		//206 = diz que a requisição ainda não terminou
		response.writeHead(206,{
			"Content-Type"		: "video/mp4",
			"Content-Range"		: "bytes " + inicio + "-" + fim + "/" + stat.size,
			"Content-Length"	: stat.size,	
			"Transfer-Encoding"	: "chanked"
		});
		
		//identificar cabeçalho
		//http://webdesign.about.com/od/multimedia/a/mime-types-by-content-type.htm
		
		console.log(inicio);
		
		console.log(fim);
		
		//para indicar que esta trabalhando com partes do arquivo,
		//passamos como paametro
		var readStream = fileSystem.createReadStream(filePath, {
			
			//informar que o arquivo é de leitura
			flags: 'r',
			
			//indicar inicio e fim
			start: inicio,
			end: fim			
			
		});
		
		//otimizar buffer
		util.pump(readStream, response);
		
	});
	
	var port = process.env.PORT || 3000;
	
	server.listen(port);