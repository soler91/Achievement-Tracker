	const path = require('path'),
			fs = require('fs');
	
	function saveJson(obj) {
		if(Object.keys(obj).length){
        try {
            fs.writeFileSync(path.join(__dirname, "data.json"), JSON.stringify(obj, null, "\t"));
        } catch (err) {
			console.log("ERROR SAVING!!!!");
			console.log(err);
            return false;
        }
		}
    }
	
	function loadJson(thepath) {
        try {
			console.log("Loading file: " + path.join(__dirname, thepath));
            return JSON.parse(fs.readFileSync(path.join(__dirname, thepath), "utf8"));
        } catch (err) {
			console.log("ERROR LOADING!!!!");
			console.log(err);
            return {};
        }
    }
	
	process.on('exit', ()=> {
		console.log('Exiting program...');
	});
	
	console.log("STARTING");

	let adc = {};
	let astr = {};
	let data = {};
	
	astr = loadJson("StrSheet_Achievements-ALL.json");
	adc = loadJson("AchievementList-ALL.json");
	
	function getstring(input)
	{
		return astr[Number(input.replace("@Achievement:", ""))].string;
	}
	
	for(let i in adc.CategoryInfo)
	{
		if(adc.CategoryInfo[i].id)
		{
			data[adc.CategoryInfo[i].id] = {};
			data[adc.CategoryInfo[i].id].name = getstring(adc.CategoryInfo[i].name);
			//data[adc.CategoryInfo[i].id].description = getstring(adc.CategoryInfo[i].description); // useless duplicate info of detail?
			if(adc.CategoryInfo[i].detail)
			{
				data[adc.CategoryInfo[i].id].detail = getstring(adc.CategoryInfo[i].detail);
			}
			else // no detail ?
			{
				data[adc.CategoryInfo[i].id].detail = getstring(adc.CategoryInfo[i].description);
			}
			data[adc.CategoryInfo[i].id].condition = {};
			for(let n in adc.CategoryInfo[i].Condition)
			{
				data[adc.CategoryInfo[i].id].condition[n] = {};
				if(adc.CategoryInfo[i].Condition[n].string)
				{
					data[adc.CategoryInfo[i].id].condition[n].string = getstring(adc.CategoryInfo[i].Condition[n].string);
				}
				else // no string ?
				{
					data[adc.CategoryInfo[i].id].condition[n].string = data[adc.CategoryInfo[i].id].detail;
				}
				if(adc.CategoryInfo[i].Condition[n].max)
				{
					data[adc.CategoryInfo[i].id].condition[n].max = adc.CategoryInfo[i].Condition[n].max;
				}
				else if(adc.CategoryInfo[i].Condition[n].templateId == 4023) // 4023 = condition - complete another achievement
				{
					data[adc.CategoryInfo[i].id].condition[n].subid = Number(adc.CategoryInfo[i].Condition[n].value1);
				}
				/*else // tested, 4023 above is enough
				{
					for(let l in data)
					{
						if(data[l].name.length && l != adc.CategoryInfo[i].i && data[l].name == data[adc.CategoryInfo[i].id].condition[n].string)
						{
							console.log("POSSIBLE MISSED SUBID " +l+ " with " + adc.CategoryInfo[i].id + " condition : " + data[l].name);
						}
					}
				}*/
			}
		}
	}
   
	saveJson(data);
	
	console.log("FINISHED, parsed " + Object.keys(data).length + " entries");
