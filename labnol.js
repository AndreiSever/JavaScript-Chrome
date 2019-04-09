(function($){
var arrayPhones = {};
var ticker = 1;
var maxTickCount = 1000000;
function requrs(catid,fullCount,tik,url){
	if( ticker>maxTickCount||tik>fullCount )return 0;
	console.log('Будет спарсена страница '+tik+' категории '+catid);
	$.ajax(pageurl(tik,catid,url)).done(function (data) {
		analizeSite(data,function(){
			if(tik+1<=fullCount){
				requrs(catid,fullCount,tik+1,url);
			}
		},url);
	});
	
}
var pageurl = function(page,catid,url){
	return url+page+'&category_id='+catid+'&orderBy=1'
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
function parserGo(e){
	//e.which=2;
	$.ajax('https://habr.com/hub/webdev/').done(function (data) {
		var s = '';
		let index=0;
		$(data).find('article h2 a').each(function(){
			let rating=$(data).find('footer .voting-wjt span');
			console.log(rating.length)
			s+="<table style='border-collapse: collapse;border: 1px solid black;width:400px;'><tr><td style='padding-right:10px;width:30px;'><span class='voting-wjt__counter voting-wjt__counter_positive  js-score'><h2>"+rating[index].innerText+"</h2></span></td><td><h5 class='post__title'><a href='"+$(this).attr('href')+"'>"+this.innerText+"</a></h5></td></tr></table><br>";//+'-'+'http://www.skelbiu.lt'+$(this).attr('href')+'<br/>'
			index=index+1;
			//var name = this.innerText;
			//var url = 'http://www.skelbiu.lt'+$(this).attr('href');
			/*$.ajax(url).done(function (data) {
				if( ticker>maxTickCount )return 0;
				$last = $(data).find('#nextLink').parent().prev().find('a');
				var maxpage = parseInt($last.text());
				console.log($last.attr('href'));
				//var cat = $last.attr('href').match(/([0-9]+)\?&category_id=([0-9]+)&orderBy=[0-9]+/);;
				//requrs( cat[2],maxpage,1,url);
			});*/
		})
		let serch = $('#resultbox').html(s);
		serch.find('a').click(middleClick);
	});
}

var writed = false;
function writeBlob(){
	if(writed) return 0;
	writed = true;
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(window.PERSISTENT, 50*1024*1024 /*5MB*/, function(fsy){
		fsy.root.getFile('1.txt', {create: true}, function(fileEntry) {
			fileEntry.createWriter( function(fileWriter) {
				fileWriter.onwriteend = function(e) {
					console.log('Write completed.');
					writed = false;
				};
				fileWriter.onerror = function(e) {
					console.log('Write failed: ' + e.toString());
				};
				var bb = new window.WebKitBlobBuilder;
				for(var i in arrayPhones)
					bb.append(i+'\n');
				fileWriter.write(bb.getBlob('text/plain'));
			}, errorHandler);
	  }, errorHandler);
		
	}, function(e){alert(e)});
}
var mch = ''
function analizeSite(data,f,url){
	$(data).find('div.adsInfo a').each(function(){
		if( ticker%100==0 ){ 
			writeBlob();
			ticker++;
		}
		var dt = $.ajax({url:url+$(this).attr('href'),async:false}).responseText;
		if(mch = dt.match(/<\!--googleoff\: index-->([\+0-9]+)<!--googleon: index-->/))
			arrayPhones[mch[1]]='';
		console.log(ticker+')Cпарсена страница '+url+$(this).attr('href')+((mch&&mch.length>1)?' найденный номер '+mch[1]:''));
		ticker++;
	})
	delete data;
	if(f)f();
}
function middleClick(e) {
	let href=$(this).attr('href');
	open(href, null)
}
 
$(function(){
	$('#starter').click(parserGo);
	//$('#starter1').mousedown(middleClick);
});

})(jQuery);

   
   
   
   
   
   //"permissions": [
    //    "http://vk.com"
    //],
   
   /*google.load("feeds", "1");

    function initialize() {
      var feed = new google.feeds.Feed("http://feeds.labnol.org/labnol");
      feed.setNumEntries(10);
      var count = 1;
      feed.load(function(result) {
        if (!result.error) {
          var container = document.getElementById("feed");
          var html = "";
          for (var i = 0; i < result.feed.entries.length; i++) {
            var entry = result.feed.entries[i];
            html = "<h5>" + count++ + ". <a href='" + entry.link + "'>" + entry.title + "</a></h5>";
            var div = document.createElement("div");
            div.innerHTML = html;
            container.appendChild(div);            
          }
          document.write(html);
        }
      });
    }
    google.setOnLoadCallback(initialize);*/

