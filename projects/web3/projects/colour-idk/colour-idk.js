//i=0; while(1) { if (Math.pow(i,2) < 8799) { i++;} else {console.log(i);break;}}

doConversion = true;

function colourFill()
{
	console.log("Starting colour fill...");
	
	if (doConversion)
	{
		doConversion=false;
		return;
	}

	doConversion = true;

	spanStatus = document.getElementById("span_status");
	spanStatus.innerHTML = "<b>Processing...</b>";
	spanStatus.style="color: #00ced1;";

	var file = document.getElementById("filething");

	var reader = new FileReader();
	reader.onloadend = function()
	{
		//get file bytes
		var str = new Uint8Array(reader.result);	
		//get canvas
		var canvas = document.getElementById("colourCanvas");
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//get values from inputs
		canvas.width = document.getElementById("input_cWidth").value;
		canvas.height = document.getElementById("input_cHeight").value;
		
		var xCellNo = document.getElementById("input_xcells").value;
		var yCellNo = document.getElementById("input_ycells").value;

		var calcInterval = document.getElementById("input_interval").value;
		
		var cWidth = canvas.width / xCellNo;
		var cHeight = canvas.height / yCellNo;
		
		//canvas.width = xCellNo * cWidth;
		//canvas.height = yCellNo * cHeight;
		
		var colourStr = "";
		
		//convert bytes to hex string
		for (var i=0;i<str.length;i++)
		{
			colourStr+=(str[i].toString(16));
		}
		
		//create coloured boxes
		var x=0; var y=0;
		var colourCount=0;	//i don't like this, but i am tired
		var offScreenQuestionMark = 0
		var colouringQuestionMark = false  //i also don't like this

		//for (var i=0;i<colourStr.length;i+=6)

		var i=0;
		var calcColour = setInterval(function(){

			smallColourStr=(colourStr.substring(i,i+6));
			if (smallColourStr.length<6) { smallColourStr=zeroFill(smallColourStr,6); }
			//console.log(smallColourStr + "    " + Math.floor(( (colourCount*6) / (file.files.item(0).size) )*100) + "%");
			//console.log( Math.floor((colourCount*3)/(file.files.item(0).size)*100) + "%" );
			ctx.fillStyle = "#"+smallColourStr;
			ctx.fillRect(x*cWidth,y*cHeight,cWidth,cHeight);
			
			if (y>yCellNo) { offScreenQuestionMark+=1;}
			//{offScreenQuestionMark+=1;}
			
			colourCount++;
			if (x<xCellNo-1) {x++;}
			else {x=0; y++;}
			
			spanStatus.innerHTML = "<b>Processing... </b>"+( Math.floor((colourCount*3)/(file.files.item(0).size)*100) )+" percent processed.";
			spanStatus.style="color: #00ced1;";
			
			
			if (!(i<colourStr.length) || !doConversion)
			{
				clearInterval(calcColour);
				spanStatus.innerHTML = colourCount + " colours generated from " + file.files.item(0).size + " bytes.";
				spanStatus.style="color: white;";
				
				spanColourStatus = document.getElementById("span_coloursOnGridMsg");
				if (offScreenQuestionMark===0)
				{
					spanColourStatus.innerHTML = "All colours are on the canvas.";
					spanColourStatus.style="color: green;";
				}
				else
				{
					spanColourStatus.innerHTML = "<b>Some colours were not drawn.</b>  Consider increasing the cell sizes.";
					spanColourStatus.style="color: red;";
				}

				if (!doConversion)
				{
					spanStatus.innerHTML = "Conversion stopped.  "+colourCount + " colours generated from " + file.files.item(0).size + " bytes.";
					spanStatus.style="color: white;";
				}
			}
			else
			{
				i+=6;
			}

		}, calcInterval);

	
		
	}
	if (file.files.length>0) 
	{
		reader.readAsArrayBuffer(file.files.item(0));
	}
	else
	{
		spanStatus.innerHTML = "<b>No file selected.</b>";
		spanStatus.style="color: red;";
	}
}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return number + new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' );
  }
  return number + ""; // always return a string
}

/*

    11 boxes
	should fit into a
    400 x 300 pixel box
	
	divide the box into columns and rows
	
	|---|---|---|---|
	|	|	|	|	|
	|---|---|---|---|
	|	|	|	|	|
	|---|---|---|---|
	|	|	|	|	|
	|---|---|---|---|
	
	how to calculate the size of each cell to fit all 11 boxes?



*/