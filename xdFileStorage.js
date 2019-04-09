/*!
 * xdFileStorage JavaScript Library
 * http://xdan.ru/
 *
 * Copyright 2012, Chupurnov Valeruiy
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: San Juli 2 0:58:34 2012 +0500
 */
var xdFileStorage = function(quota){
	var thisfs = this;
	thisfs.fisy = 0;
	/**
	 * @name fsWork
	 * @descr Метод проверяет работает ли в данном браузере функции для работы с файлами
	 * @example var fs = new xdFileStorage(50);
	 if(fs.fsWork){
	 //код
	 }
	 */
	thisfs.fsWork =function(){
		return window.File && window.FileReader && window.FileList && window.Blob;
	}
	/**
	 * @name writeBlob
	 * @descr Метод записывает в файл filename, содержимое параметра blob 
	 и вызывает callback функцию next по завершению процесса записи
	 */
	thisfs.writeBlob = function( filename,blob,next ){
		thisfs.fisy.root.getFile(filename, {create: true}, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
			fileWriter.onwriteend = function(e) {
				next&&next();
				console.log('Write completed.');
			};
			fileWriter.onerror = function(e) {
				console.log('Write failed: ' + e.toString());
			};
			fileWriter.write(blob);
			}, errorHandler);
	  }, errorHandler);
	}
	function onInitFs( fsyst ){
		thisfs.fisy = fsyst;
	}
	function errorHandler(e) {
		var msg = '';
		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
			msg = 'QUOTA_EXCEEDED_ERR';
			break;
			case FileError.NOT_FOUND_ERR:
			msg = 'NOT_FOUND_ERR';
			break;
			case FileError.SECURITY_ERR:
			msg = 'SECURITY_ERR';
			break;
			case FileError.INVALID_MODIFICATION_ERR:
			msg = 'INVALID_MODIFICATION_ERR';
			break;
			case FileError.INVALID_STATE_ERR:
			msg = 'INVALID_STATE_ERR';
			break;
			default:
			msg = 'Unknown Error';
			break;
		};
		console.log('Error: ' + msg);
	}
	/**
	 * @name removeFile
	 * @descr Метод удаляет из виртуальной файловой системы браузера файл с названием filename 
	 и вызывает callback функцию next по завершению процесса удаления
	 * @example (new xdFileStorage(50)).removeFile('1.png');
	 */
	thisfs.removeFile = function ( filename,next ){
		thisfs.fisy.root.getFile( filename, {}, function( fileEntry ) {
			fileEntry.remove(function() {
				console.log('File removed.');
			}, errorHandler);
		}, errorHandler);
	}
	/**
	 * @name loadRemoteFile
	 * @descr Метод загружает удаленный файл dataurl c MIME типом MIMEType в файл с именем filename
	 и вызывает callback функцию next по завершению процесса загрузки и сохраненеия, для работы с другими доменами требуется разрешенный cross-domain ajax
	 * @example 
	 var fs = new xdFileStorage(50);
	 fs.loadRemoteFile('1.png','http://xdan.ru/views/lite/images/logo.png',function(){
		alert('Загрузка завершена');
	 })
	 */
	thisfs.loadRemoteFile = function( filename,dataurl,next,MIMEType ){
		var req = new XMLHttpRequest();
		req.responseType = "arraybuffer";
		req.open('GET', dataurl, true); // загружаем асинхронно
		req.onreadystatechange = function (data){ 
			if ( req.status == 200 && req.readyState==4 ) {
				var bb = new BlobBuilder();
				bb.append( req.response ); 
				thisfs.writeBlob(filename,bb.getBlob( MIMEType||'image/jpg' ),next);
			}
		};
		req.send(null);
	}
	/**
	 * @name saveObjectToFile
	 * @descr Метод распечатывает объект obj в файл с именем filename
	 и вызывает callback функцию next по завершению процесса сохраненеия
	 * @example var fs = new xdFileStorage(50);
	 fs.saveObjectToFile('1.txt',{1:1,2:2,3:3,'a':123},function(){
		alert('wrtie completed!');
	 })
	 Результатом будет файл с содержанием
	 1=>1
	 2=>2
	 3=>3
	 a=>123
	 or
	 fs.saveObjectToFile('1.txt',[1,2,3,4],function(){
		alert('wrtie completed!');
	 })
	 Результат
	 0=>1
	 1=>2
	 2=>3
	 3=>4
	 */
	thisfs.saveObjectToFile = function( filename,obj,next ){
		var bb = new BlobBuilder();
		for( var i in obj )
			bb.append(i+'=>'+obj[i]+'\n');
		thisfs.writeBlob(filename,bb.getBlob('text/plain'),next);
	}
	/**
	 * @name strToFile
	 * @descr Метод сохраняет строку str в файл с именем filename
	 и вызывает callback функцию next по завершению процесса сохраненеия
	 * @example var fs = new xdFileStorage(50);
	 fs.strToFile('1.txt','Привет Мир!',function(){
		alert('wrtie completed!');
	 })
	 Результатом будет файл с содержанием
	 Привет Мир!
	 */
	thisfs.strToFile = function( filename,str,next ){
		var bb = new BlobBuilder();
		bb.append(str);
		thisfs.writeBlob(filename,bb.getBlob('text/plain'),next);
	}
	window.BlobBuilder = window.BlobBuilder||window.WebKitBlobBuilder;
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.PERSISTENT, (quota||5)*1024*1024 /*5MB*/, onInitFs, errorHandler); // дисковая квота под файл, по умолчанию 5MB
	return this;
};
