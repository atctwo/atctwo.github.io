//gen.js

//init stuff
generators = []	
//Stores all of the generators, but not conjunctives.
//Technically redundant since introduction of Sortable,
//but it'll probably break things if removed.

itemCount = 0	//Keeps track of the number of gens/conjs in existance
genOrder = null	//Used to retreive order of items

Sortable.create(document.getElementById("generators"),
{
	onUpdate: function(ev) { 
		genOrder=(ev.to.children); 
	}
});

function createContainer()
{
	//genereates a new container
	
	var container = document.createElement("div");
	container.style = "display:inline-block; border: 1px solid white; min-width:300px; min-height: 300px;";
	
	return container
}

function generateGenerator(gen, loadstr)
{
	//generates a new generator
	
	console.log("Creating generator...")

	var div = document.createElement("div");
	div.style = "width:300px; padding:20px; display:inline-block;";
	div.id = "div-gen-" + gen
	div.class = "div-gen";
	div.draggable = true;
	
	var entry = document.createElement("input")
	entry.type = "text";
	entry.id = "textbox-gen-" + generators.length
	entry.style = "width:60%";
	
	var selectbox = document.createElement("select")
	selectbox.size = 10;
	selectbox.id = "selectbox-gen"//-" + generators.length;
	selectbox.style = "width:100%";
	
	var btn_add = document.createElement("button");
	btn_add.appendChild( document.createTextNode("Add") );
	btn_add.addEventListener("click", function() {
		var option = document.createElement("option");
		option.text = entry.value
		selectbox.appendChild(option);
		entry.value = "";
	}, false);
	btn_add.style = "width:20%; display:inline-block;";
	
	var btn_rem = document.createElement("button");
	btn_rem.appendChild( document.createTextNode("Remove") );
	btn_rem.style = "width:20%; display:inline-block;";
	btn_rem.addEventListener("click", function() {
		if (selectbox.selectedIndex!=-1)
		{
			selectbox.remove( selectbox.selectedIndex);
		}
	}, false);
	
	var btn_rem_gen = document.createElement("button");
	btn_rem_gen.appendChild( document.createTextNode("Remove generator") );
	btn_rem_gen.style = "width:100%; display:inline-block;";
	btn_rem_gen.addEventListener("click", function() {
		if (confirm("Are you sure you want to remove this generator?"))
		{
			generators.splice(gen, 1);
			div.remove();
			itemCount-=1;
		}
	}, false);
	
	if (loadstr)
	{
		console.log(loadstr);
		opts = loadstr.split(",");
		for (var i=0;i<opts.length;i++)
		{
			var option = document.createElement("option");
			option.text = opts[i]
			selectbox.appendChild(option);
		}
	}
	
	div.appendChild(entry);
	div.appendChild(btn_add);
	div.appendChild(btn_rem);
	div.appendChild(selectbox);
	div.appendChild(btn_rem_gen);
	
	return div
}

function generateConjunctive(loadstr)
{
	//creates a new conjunctive
	console.log("Creating conjunctive");
	
	var div = document.createElement("div");
	div.style = "width:300px; padding:20px; display:inline-block;";
	div.class = "div-conj"
	div.draggable = true;
	
	var entry = document.createElement("input");
	entry.type = "text";
	entry.class = "textbox-conj"
	entry.style = "width:100%";
	
	if (loadstr)
	{
		entry.value = loadstr.split(",")[1];
	}
	
	var btn_rem_conj = document.createElement("button");
	btn_rem_conj.appendChild( document.createTextNode("Remove conjunctive") );
	btn_rem_conj.style = "width:100%; display:inline-block;";
	btn_rem_conj.addEventListener("click", function() {
		if (confirm("Are you sure you want to remove this conjunctive?"))
		{
			div.remove();
			itemCount-=1;
		}
	}, false);
	
	div.appendChild(entry);
	div.appendChild(btn_rem_conj);
	
	return div
}

function addNewGenerator()
{
	len = generators.length*1
	itemCount+=1;
	generators.push(generateGenerator(len));
	document.getElementById("generators").appendChild(generators[generators.length-1]);
}

function addNewConjunctive()
{
	itemCount+=1;
	document.getElementById("generators").appendChild(generateConjunctive());
}

function generateUsingGenerators()
{
	//actually generate a random string
	if (generators.length!=0)
	{
		randspan = document.getElementById("gentext");
		randstr = "";
		for (var i=0;i<itemCount;i++)
		{
			if ((genOrder.item(i).class)==="div-conj")	//if item is a conjunctive
			{
				randstr+=(genOrder.item(i).childNodes.item(0).value);
				randstr+=" ";
			}
			if ((genOrder.item(i).class)==="div-gen")	//if item is a generator
			{
				sbox = genOrder.item(i).children.namedItem("selectbox-gen")
				
				if (sbox.options.length!=0)
				{
					randstr += (sbox.options[Math.floor(Math.random() * sbox.options.length)].text);
					randstr += " ";
				}
			}
		}
		randspan.innerHTML = randstr
	}
	else
	{
		alert("You haven't added any generators!")
	}
}

function configSave()
{
	//prompt user to save config str
	if (itemCount!=0)
	{
		savestr = "";
		savestr += itemCount + ":";
		for (var i=0;i<itemCount;i++)
		{
			if ((genOrder.item(i).class)==="div-conj")	//if item is a conjunctive
			{
				savestr+="conj,";
				savestr+=(genOrder.item(i).childNodes.item(0).value);
			}
			if ((genOrder.item(i).class)==="div-gen")	//if item is a generator
			{
				sbox = genOrder.item(i).children.namedItem("selectbox-gen")
				savestr+="gen,";
				for (var j=0;j<sbox.options.length;j++)
				{
					savestr += (sbox.options[j].text);
					if (j!=sbox.options.length-1) {savestr += ",";}	//only add comma if not last option
				}
			}
			savestr+=":";
		}
		
		//save-------------------------------------------------------------------------------
		console.log(savestr);
		uriContent = "data:application/octet-stream," + encodeURIComponent(savestr);
		window.open(uriContent, "generator-config-"+Date()+".txt");
	}
	else
	{
		alert("You haven't added any generators!")
	}
}

function configLoad()
{
	
	files=document.getElementById("file-input").files
	
	if (files.length === 0) {alert("You have not selected any files")}
	else
	{
		freader=new FileReader;
		freader.readAsText(files[0]);
		freader.onloadend = function(event) {
			loadstr=(event.target.result);
			gens = loadstr.split(":")
			//for (var i=0;i<gens.length;i++)
			for (var j=0;j<gens[0].toString();j++)
			{
				
				if (gens[j+1].split(",")[0]==="gen")
				{
					itemCount+=1;
					len = generators.length*1
					generators.push(generateGenerator(len,gens[j+1]));
					document.getElementById("generators").appendChild(generators[generators.length-1]);
				}
				if (gens[j+1].split(",")[0]==="conj")
				{
					itemCount+=1;
					document.getElementById("generators").appendChild(generateConjunctive(gens[j+1]));
				}
			}
		}
	}
}









