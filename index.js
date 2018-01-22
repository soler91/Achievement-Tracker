const   Command = require('command'),
        ACHS = require('./data.json');

module.exports = function achs(dispatch) {
    const command = Command(dispatch);

    let tracking = false,
        trackList = {};
        
    command.add('ach', (opt, value) => {
        opt = opt.toLowerCase();
        
        switch(opt){
            case 'e':
                tracking = !tracking;
                command.message("Tracking enabled: "+tracking);
            break;
            
            case 't':
                if(ACHS[value]){
                    command.message("Tracking: ");
                    command.message(ACHS[value].name);
                    trackList[value] = value;
                }
            break;
            
            case 'r':
                if(trackList[value]){
                    delete trackList[value]
                }
                command.message("Removed from tracking: ");
                command.message(ACHS[value].name);
            break;
            
            case 'l':
                command.message("Tracking list:");
                for(let i in trackList){
                    command.message(ACHS[trackList[i]].name);
                }
            break;
            
            default:
                command.message("Invalid input");
            break;
        }
	})

    dispatch.hook('S_UPDATE_ACHIEVEMENT_PROGRESS', 1, e => {
        if(tracking){
            for(let i in e.achievements){
                
                if(trackList[(e.achievements[i].id).toString()]){
                    if(ACHS[(e.achievements[i].id).toString()].name){
                    let name = ACHS[(e.achievements[i].id).toString()].name;
                    command.message(name+':');
                    }
                    
                    for(let j in e.achievements[i].requirements){
                        let str = ACHS[(e.achievements[i].id).toString()].condition[(e.achievements[i].requirements[j].index).toString()].string,
                            amount = e.achievements[i].requirements[j].amount;
                        if(ACHS[(e.achievements[i].id).toString()].condition[(e.achievements[i].requirements[j].index).toString()].max){
                            let max = ACHS[(e.achievements[i].id).toString()].condition[(e.achievements[i].requirements[j].index).toString()].max;
                            command.message(`${str} <font color="#FF0000">${amount}</font>/<font color="#FF0000">${max}</font>`);
                        }
                        else{
                        command.message(str+' '+amount)
                        }
                    }
                }
            }
        }
    })
    
}