import Offline from "helper/Offline";
export default function(callback, value, threshold){
	if (typeof threshold === "undefined"){
		threshold = 0.01;
	}
	return Offline(callback).then(function(buffer){
		expect(buffer.value()).to.be.closeTo(value, threshold);
	});
}

