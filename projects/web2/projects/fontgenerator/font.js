
console.log("e");

function loadimg(callback)
{

	const glyphs = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"

	var image_input = document.getElementById("template-file");
	var image_path = "e.png";

	var glyph_width = 6;
	var glyph_height = 6;

	var canvas = document.createElement("canvas");
	var ctx    = canvas.getContext("2d");
	var imagedata = new Uint8ClampedArray();

	var image = new Image();
	image.crossOrigin = "anonymous";
	image.onload = function() {
		
		canvas.width = this.width;
		canvas.height = this.height;
		
		ctx.drawImage(this, 0, 0);
		imagedata = ctx.getImageData(0, 0, this.width, this.height).data;
		
		imagedata2 = new Uint8ClampedArray(this.width * this.height);
		imagedata3 = new Uint8ClampedArray(this.width * this.height * 4);
		
		document.getElementById("threshold").addEventListener("input", function(e) {
		
			//generate posterised 1 bit image array
			for (var i = 0; i < imagedata.length; i+=4)
			{
				if (imagedata[i] > e.target.value && imagedata[i+1] > e.target.value && imagedata[i+2] > e.target.value) imagedata2.set([1], i/4);
				else imagedata2.set([0], i/4);
			}
			
			//generate rgba image array
			for (var i = 0; i < imagedata2.length; i+=1)
			{
				imagedata3[(i * 4) + 0] = imagedata2[i] ? 255 : 0; //r
				imagedata3[(i * 4) + 1] = imagedata2[i] ? 255 : 0; //g
				imagedata3[(i * 4) + 2] = imagedata2[i] ? 255 : 0; //b
				imagedata3[(i * 4) + 3] = 255;                     //a
			}
			
			preview_canvas = document.getElementById("preview-canvas");
			preview_ctx = preview_canvas.getContext("2d");
			
			preview_canvas.width = image.width;
			preview_canvas.height = image.height;
			
			preview_ctx.fillRect(0, 0, preview_canvas.width, preview_canvas.height);
			preview_data = new ImageData(imagedata3, image.width, image.height);
			preview_ctx.putImageData(preview_data, 0, 0);
			
			/*ImageTracer.imageToSVG(image_path, function(svgstring) {
				
				//document.getElementById("char").innerHTML = svgstring;
				
			}, "posterized1");*/
		
		});
		
		callback();
	};
	//line 18
	image.src = image_path;

}

/*
// data can be any indexable array
const data = new Uint8Array([
	0, 1, 1, 1, 0, 0,
	1, 0, 1, 0, 0, 1,
	1, 1, 0, 0, 1, 1,
	1, 0, 0, 1, 0, 1,
	0, 0, 1, 0, 1, 1,
	1, 0, 1, 1, 1, 0,
]);
*/
