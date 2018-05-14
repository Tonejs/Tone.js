define(["Test", "Examples", "helper/Supports"], function (Test, Examples, Supports) {

	var baseUrl = "../examples/";
	if (window.__karma__){
		baseUrl = "/base/examples/";
	}

	if (Supports.RUN_EXAMPLES){

		function getIframeError(url){
			return new Promise(function(success, error){
				var iframe = document.createElement("iframe");
				iframe.onload = function(){
					iframe.remove();
					success();
				};
				iframe.width = 1;
				iframe.height = 1;
				iframe.src = url;
				document.body.appendChild(iframe);
				//capture the error
				iframe.contentWindow.onerror=function(e) {
					error(e);
				};
			});
		}

		function createTest(url){

			it(url, function(){
				url = baseUrl + url + ".html";
				return testUrl(url).then(getIframeError);
			});
		}

		function testUrl(url){
			return new Promise(function(success, fail){
				var httpRequest = new XMLHttpRequest();
				httpRequest.onreadystatechange = function() {
					if (httpRequest.readyState === 4) {
						if (httpRequest.status === 200) {
							success(url);
						} else {
							fail("404: "+url);
						}
					}
				};
				httpRequest.open("GET", url);
				httpRequest.send();
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
	}

});
