/* 

https://github.com/cwilso/oscilloscope

The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

function Oscilloscope(analyser,width,height) {
	this.analyser = analyser;
	this.data = new Uint8Array(analyser.frequencyBinCount);
	this.width = width;
	this.height = height;
}

Oscilloscope.prototype.draw = function (context) {
	var data = this.data;
	var quarterHeight = this.height/4;
	var scaling = this.height/256;

	this.analyser.getByteTimeDomainData(data);
	context.strokeStyle = "red";
	context.lineWidth = 1;
	context.fillStyle="#004737";
	context.fillRect(0,0,this.width, this.height);
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(this.width,0);
	context.stroke();
	context.moveTo(0,this.height);
	context.lineTo(this.width,this.height);
	context.stroke();
	context.save();
	context.strokeStyle = "#006644";
	context.beginPath();
	if (context.setLineDash)
		context.setLineDash([5]);
	context.moveTo(0,quarterHeight);
	context.lineTo(this.width,quarterHeight);
	context.stroke();
	context.moveTo(0,quarterHeight*3);
	context.lineTo(this.width,quarterHeight*3);
	context.stroke();

	context.restore();
	context.beginPath();
	context.strokeStyle = "blue";
	context.moveTo(0,quarterHeight*2);
	context.lineTo(this.width,quarterHeight*2);
	context.stroke();

	context.strokeStyle = "white";

	context.beginPath();

	var zeroCross = findFirstPositiveZeroCrossing(data, this.width);

	context.moveTo(0,(256-data[zeroCross])*scaling);
	for (var i=zeroCross, j=0; (j<this.width)&&(i<data.length); i++, j++)
		context.lineTo(j,(256-data[i])*scaling);

	context.stroke();
};

var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

function findFirstPositiveZeroCrossing(buf, buflen) {
  var i = 0;
  var last_zero = -1;
  var t;

  // advance until we're zero or negative
  while (i<buflen && (buf[i] > 128 ) )
    i++;

  if (i>=buflen)
    return 0;

  // advance until we're above MINVAL, keeping track of last zero.
  while (i<buflen && ((t=buf[i]) < MINVAL )) {
    if (t >= 128) {
      if (last_zero == -1)
        last_zero = i;
    } else
      last_zero = -1;
    i++;
  }

  // we may have jumped over MINVAL in one sample.
  if (last_zero == -1)
    last_zero = i;

  if (i==buflen)  // We didn't find any positive zero crossings
    return 0;

  // The first sample might be a zero.  If so, return it.
  if (last_zero === 0)
    return 0;

  return last_zero;
}

