define(["Test", "Examples"], function (Test, Examples) {

	var baseUrl = "../examples/";
	if (window.__karma__){
		baseUrl = "/base/test/";
	}

	function createTest(url){

		it (url, function(done){
			var iframe = document.createElement("iframe");
			var err = null;
			iframe.onload = function(){
				iframe.remove();
				done(err);
			};
			iframe.src = baseUrl + url + ".html";
			iframe.width = 1;
			iframe.height = 1;
			document.body.appendChild(iframe);
			//capture the error
			iframe.contentWindow.onerror=function(e) {
				err = e;
			};
		});
	}

	context("Examples", function(){

		for (var category in Examples){
			var group = Examples[category];
			for (var name in group){
				var url = group[name];
				createTest(url);
			}
		}
	});
});