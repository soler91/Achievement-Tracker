const   path = require('path'),
		fs = require('fs'),
        ACHS = require('./data.json');

module.exports = function achs(dispatch) {
    const command = dispatch.command

    let tracking = false,
        trackList = {},
		changed = false,
		settingsFileName;
	
	function saveJson(obj) {
		if(Object.keys(obj).length && changed){
        try {
            fs.writeFileSync(path.join(__dirname, settingsFileName), JSON.stringify(obj, null, "\t"));
			changed = false;
        } catch (err) {
            return false;
        }
		}
    }
	
	function loadJson() {
        try {
            return JSON.parse(fs.readFileSync(path.join(__dirname, settingsFileName), "utf8"));
        } catch (err) {
            return {};
        }
    }
	
	if(!fs.existsSync(path.join(__dirname, './saves')))
	{
		fs.mkdirSync(path.join(__dirname, './saves'));
	}
			
	process.on('exit', ()=> {
		console.log('Saving achievements to database file...');
		saveJson(trackList);
	});
	
	this.destructor = function() {
        //console.log('Saving achievements to database file...');
		saveJson(trackList);
	}
        
    command.add('a', (opt, ...value) => {
        //opt = opt.toLowerCase();
        value = value.join(' ');
        switch(opt){
            case 'e':
                tracking = !tracking;
                command.message("Tracking enabled: "+tracking);
            break;
            
			case 't':
            case 'a':
				let found = false;
                if(!isNaN(value) && ACHS[value])
				{
					found = true;
					if(!trackList[value])
					{
						tracking = true;
						command.message(`now Tracking: ${value}: <font color="#00FFFF"><ChatLinkAction param=\"7#####${value}\">&lt;${ACHS[value].name}&gt;</ChatLinkAction></font>: \n<font color="#FDD017">${ACHS[value].detail}</font>`);
						trackList[value] = {name: ACHS[value].name, count: 0};
					}
					else
					{
						command.message(value +" is already being tracked");
					}
                }
				else if(isNaN(value))
				{
					for(let l in ACHS)
					{
						if(ACHS[l].name.toLowerCase() === value.toLowerCase())
						{
							found = true;
							if(!trackList[l])
							{
								tracking = true;
								command.message(`now Tracking: ${l}: <font color="#00FFFF"><ChatLinkAction param=\"7#####${l}\">&lt;${ACHS[l].name}&gt;</ChatLinkAction></font>: \n<font color="#FDD017">${ACHS[l].detail}</font>`);
								trackList[l] = {name: ACHS[l].name, count: 0};
							}
							else
							{
								command.message(value +" is already being tracked");
							}
							break;
						}
					}
                }
				if(!found)
				{
					command.message(value+' not found in data.json, please request achievements database update, but before that please check that your input is 100% correct');
				}
				else
				{
					changed = true;
				}
            break;
            
			case 'd':
            case 'r':
                if(trackList[value])
				{
					command.message("Removed from tracking: " + trackList[value].name);
                    delete trackList[value];
					changed = true;
                }
				else
				{
					command.message(value +" not found, you should use correct numerical value");
				}
            break;
			
			case 'c':
			{
				command.message("Clearing whole tracking list...");
                for(let i in trackList)
				{
					delete trackList[i];
					changed = true;
				}
			}
            break;
			
			case 's':
			{
				command.message("Saving tracking list database...");
                saveJson(trackList);
			}
            break;
			
            case 'l':
                command.message("Tracking list:");
                for(let i in trackList)
				{
					if(trackList[i].count == 1 || trackList[i].count == 0)
					{
						let color = (!trackList[i].count ? "#FF0000" : "#008000" );
						command.message(`${i}: <font color="#00FFFF"><ChatLinkAction param=\"7#####${i}\">&lt;${trackList[i].name}&gt;</ChatLinkAction></font> \n<font color="#FDD017">${ACHS[i].detail}</font> - <font color="${color}">${trackList[i].count}</font>`);
					}
					else
					{
						command.message(`${i}: <font color="#00FFFF"><ChatLinkAction param=\"7#####${i}\">&lt;${trackList[i].name}&gt;</ChatLinkAction></font>: \n<font color="#FDD017">${ACHS[i].detail}</font> ${trackList[i].count}`);
						//console.log(`${i}: <font color="#00FFFF"><ChatLinkAction param=\"7#####${i}\">&lt;${trackList[i].name}&gt;</ChatLinkAction></font>: \n<font color="#FDD017">${ACHS[i].detail}</font> ${trackList[i].count}`);
					}
                }
            break;
            
            default:
                command.message("Invalid input");
            break;
        }
	})
	
	dispatch.hook('S_LOGIN', dispatch.majorPatchVersion >= 81 ? 13 : 12, e=> {
			if(settingsFileName) // it's a relogin to another character, lets save previous
			{
				saveJson(trackList);
			}
			settingsFileName = `./saves/${e.name}-${e.serverId}.json`;
			trackList = loadJson();
			if(Object.keys(trackList).length)
			{
				tracking = true;
			}

        });
		
    dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 1, e => {
        if(tracking){
			//command.message("Updating achievement list... ");
			loop0:
			for(let i in e.achievements)
			{
				let initialization = 0;
				if(trackList[e.achievements[i].id])
				{
					let done = 0;
					let total = Object.keys(ACHS[e.achievements[i].id].condition).length;
					
					/*command.message("Found match "+e.achievements[i].id);
					if(ACHS[e.achievements[i].id].name)
					{
						let name = ACHS[e.achievements[i].id].name;
						command.message(name+':');
					}*/
					
					let amount = 0;
					let ttamount = "";
					for(let j in e.achievements[i].requirements)
					{
						let reqname = ACHS[e.achievements[i].id].condition[e.achievements[i].requirements[j].index].string;
						let amount = e.achievements[i].requirements[j].amount;
						
						if(typeof ACHS[e.achievements[i].id].condition[e.achievements[i].requirements[j].index].max !== "undefined") // MM
						{
							let max = ACHS[e.achievements[i].id].condition[e.achievements[i].requirements[j].index].max;
							let color = (amount < max ? "#FF0000" : "#008000" );
							if(color !== "#FF0000")
							{
								done++;
							}
							ttamount = (j<1 ? '' : ttamount )+ '\n<font color="#FFF380">'+ACHS[e.achievements[i].id].condition[e.achievements[i].requirements[j].index].string+'</font>: <font color="#008000">'+amount+'</font>/<font color="'+color+'">'+max+'</font>';
							//console.log(String(ttamount));
							//command.message(ACHS[e.achievements[i].id].condition[e.achievements[i].requirements[j].index].string);
							if(j == total-1 && ttamount != trackList[e.achievements[i].id].count)
							{
								if (trackList[e.achievements[i].id].count === 0)
								{
									initialization = e.achievements[i].id;
									//console.log("initialization " + e.achievements[i].id)
								}
								if(e.achievements[i].id != initialization)
								{
									command.message(`UPD ${e.achievements[i].id}: <font color="#00FFFF"><ChatLinkAction param=\"7#####${e.achievements[i].id}\">&lt;${ACHS[e.achievements[i].id].name}&gt;</ChatLinkAction></font>: \n<font color="#FDD017">${ACHS[e.achievements[i].id].detail}</font> ${ttamount}`);
								}
								if(done < total)
								{
									trackList[e.achievements[i].id].count = ttamount;
									changed = true;
								}
							}
						}
						else
						{
							let thisdone = false;
							if(amount == 1)
							{
								done++;
								thisdone = true;
							}
							//command.message('UPD: '+e.achievements[i].id+' - '+reqname+ ' #'+j+' <font color="#FF0000">'+amount+'</font>')
							let found = false;
							for(let k in trackList) // already tracking?
							{
								if(trackList[k].name == reqname)
								{
									found = true;
									if(thisdone) // then what is it doing in our tracklist?
									{
										console.log("deleted achievement " + k + " " + trackList[k].name + " as completed (fix)");
										command.message("deleted achievement " + k + " " + trackList[k].name + " as completed (fix)");
										delete trackList[k];
									}
									break;
								}
							}
							if(!found && !thisdone) // not yet tracking and it's not completed
							{
								let queue = [reqname], aqueue = [amount];
								loop1:
								while(queue.length !== 0)
								{
									reqname = queue.pop();
									amount = aqueue.pop();
									loop2:
									for(let l in ACHS)
									{
										if(ACHS[l].name === reqname)
										{
											let tdone = 0;
											let ttotal = 99;
											if(typeof ACHS[l].condition[0].max === "undefined") // another link (probably)
											{
												//command.message("req is a link again");
												tdone = 0;
												ttotal = Object.keys(ACHS[l].condition).length;
												loop3:
												for(let m in ACHS[l].condition)
												{
													let treqname = ACHS[l].condition[m].string;
													let tamount = 0;
													loop4:
													for(let n in e.achievements)
													{
														if(l == e.achievements[n].id)
														{
															tamount = e.achievements[n].requirements[m].amount;
															//command.message('found amount '+ tamount +' for #'+ m +' sub-req of '+l+': '+treqname);
															break loop4; // we have already found our reqname, no need to look further
														}
													}
													if(tamount == 0)
													{
														//command.message('adding req '+l+': '+reqname);
														queue.push(treqname);
														aqueue.push(tamount);
													}
													else
													{
														tdone++;
													}
												}
											}
											else
											{
												amount = 1;
												loop5:
												for(let n in e.achievements)
												{
													if(l == e.achievements[n].id)
													{
														tdone = 0;
														ttotal = Object.keys(ACHS[l].condition).length;
														loop6:
														for(let p in ACHS[l].condition)
														{
															let tttamount = e.achievements[n].requirements[p].amount;
															let tmax = ACHS[l].condition[p].max;
															let tcolor = (tttamount < tmax ? "#FF0000" : "#008000" );
															if(tcolor !== "#FF0000")
															{
																tdone++;
															}
															//command.message('found MM amount '+ e.achievements[n].requirements[p].amount +'/'+ACHS[l].condition[p].max+' for #'+ p +' sub-req of '+l+': '+ACHS[l].condition[p].string);
															amount = (p<1 ? '' : amount )+ '\n<font color="#FFF380">'+ACHS[l].condition[p].string+'</font>: <font color="#008000">'+tttamount+'</font>/<font color="'+tcolor+'">'+tmax+'</font>';
														}
														break loop5; // we have already found our reqname, no need to look further
													}
												}
											}
											if(amount !== 1 && tdone < ttotal)
											{
												trackList[l] =  {name: reqname, count: amount};
												changed = true;
											}
											break loop2; // we have already found our reqname, no need to look further
										}
									}
								}
							}
						}
					}
					initialization = 0;
					if(done == total)
					{
						//console.log(e.achievements[i].id + ' done total ' +done+ ' of ' + total);
						command.message(`${e.achievements[i].id}: <font color="#00FFFF"><ChatLinkAction param=\"7#####${e.achievements[i].id}\">&lt;${ACHS[e.achievements[i].id].name}&gt;</ChatLinkAction></font>: \n<font color="#FDD017">${ACHS[e.achievements[i].id].detail}</font>: <font color="#008000">Completed</font>`);
						delete trackList[e.achievements[i].id];
						changed = true;
						done = 0;
						amount = 0;
					}
				}
			}
        }
    })
}
