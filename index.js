function optimize(option_list){
    // This function takes a list of options and orders it from best to worst
    // The option list is an array containing key-pair objects
    // Each object contains {att: xxx%, boss: xxx%, dmg: xxx%, cdmg: xxx%, ied: xxx%}
    // It doesn't return a new list but adds the scores to the initial list

    // Loop over array
    //$.each(option_list, function(index, object){
    //    object = calculate_fd_score(object);
    //})

    let sorted_options = option_list.sort((op1, op2) => (op1.fd_score > op2.fd_score) ? -1 : (op1.fd_score < op2.fd_score) ? 1 : 0);

    return sorted_options
}

function calculate_fd_score(object){
    // Calculates the FD score for each option
    var att = null; var boss = null; var dmg = null; var cdmg = null; var ied = null;
    var boss_pdr = 380/100;
    var fd_score = null;

    att  = object.att;
    boss = object.boss;
    dmg  = object.dmg;
    cdmg = object.cdmg;
    ied  = object.ied;
    fd_score = (att/100) * ((boss + dmg)/100) * (cdmg/100) * (1 - (boss_pdr * (1 - ied)));
    object.fd_score = fd_score;

    return object;
}

function add_base_stats_yourself(base_stats_to_add, option_list){
    // In this function the user adds options themselves
    // Mostly useful for base stats

    var att = 0; var boss = 0; var dmg = 0; var cdmg = 0; var ied = 0;
    
    $.each(base_stats_to_add, function(index0, value0){
        $.each(value0, function(index, value){
            console.log("BASE STAT:", value, index);
            if(index == "att"){
                att += value;
            } else if(index == "boss"){
                boss += value;
            } else if(index == "dmg"){
                dmg += value;
            } else if(index == "cdmg"){
                cdmg += value;
            } else if(index == "ied"){
                ied = calculate_new_ied(ied, value);
            }
        })
    })

    // Also add base stats that everyone has
    att  += 100;
    dmg  += 100;
    cdmg += 35;

    // Add legion stats, assuming maxed legion : no new players allowed
    // Commented out because this is included into stat window!
    //cdmg += 20;
    //boss += 40;
    //ied   = calculate_new_ied(ied, 40);

    var base_stats = {"att":att,"boss":boss,"dmg":dmg,"cdmg":cdmg,"ied":ied};
    var new_option_list = [];
    console.log("BASE STATS: ", base_stats);

    $.each(option_list, function(index, option){
        option.att += base_stats.att;
        option.boss += base_stats.boss;
        option.dmg += base_stats.dmg;
        option.cdmg += base_stats.cdmg;
        option.ied = calculate_new_ied(option.ied, base_stats.ied);

        new_option_list.push(option)
    })
    
    return option_list;

}

function add_familiars_options(familiars_list, option_list){
    // In this function the user adds available familiars to option list
    var new_option_list = []; var familiars_to_add = []; var new_option = null;

    familiars_to_add = [];
    for (var i = 0; i < familiars_list.length - 2; i++) {
        for (var j = i + 1; j < familiars_list.length - 1; j++) {
            for (var k = j + 1; k < familiars_list.length; k++) {
                familiars_to_add.push([familiars_list[i], familiars_list[j], familiars_list[k]]);
            }
        }
    }

    console.log("FAMILIAR ARRAYS: ", familiars_to_add);

    $.each(option_list, function(option_index, option){
        var JSON_option = JSON.stringify(option);
        $.each(familiars_to_add, function(indx1, familiar_array){
            new_option = JSON.parse(JSON_option);
            $.each(familiar_array, function(indx2, familiar){
                $.each(familiar, function(indx3, fam_stats){
                    $.each(fam_stats, function(index, value){
                        if(index == "att"){
                            new_option.att += value;
                        } else if(index == "boss"){
                            new_option.boss += value;
                        } else if(index == "dmg"){
                            new_option.dmg += value;
                        } else if(index == "cdmg"){
                            new_option.cdmg += value;
                        } else if(index == "ied"){
                            new_option.ied = calculate_new_ied(option.ied, value);
                        }
                    })
                })
            })
            new_option.fams = familiar_array;
            new_option_list.push(new_option);
        })
    })

    return new_option_list;
}

function create_all_wse_options(){
    // Generates all possible weapon, emblem and secondary potential options

    var att = null; var boss = null; var dmg = null; var ied = null;

    let weapon_list     = create_all_weapon_options();
    let emblem_list     = create_all_emblem_options();
    let secondary_list  = create_all_secondary_options();

    let combined_list = [];

    $.each(weapon_list, function(index_weapon, value_weapon){
        $.each(emblem_list, function(index_emblem, value_emblem){
            $.each(secondary_list, function(index_secondary, value_secondary){
                att  = value_weapon["att"] + value_emblem["att"] + value_secondary["att"];
                boss = value_weapon["boss"] + value_emblem["boss"] + value_secondary["boss"];
                ied  = calculate_new_ied(calculate_new_ied(value_weapon["ied"] , value_emblem["ied"]) , value_secondary["ied"]);

                combined_list.push({"att": att, "boss": boss, "ied": ied, "dmg": 0, "cdmg": 0, "wse":[value_weapon, value_secondary, value_emblem]});
            })
        })
    })

    return combined_list;
}

function create_all_weapon_options(){
    let prime_line_options  = {att: 13, boss1: 40, boss2: 35, ied1: 40, ied2: 35};
    let normal_line_options = {att: 10, boss1: 30, ied1: 30};

    all_weapon_pots = combine_all_line_options(prime_line_options, normal_line_options);
    return all_weapon_pots;
}

function create_all_emblem_options(){
    let prime_line_options  = {att: 13, ied1: 40, ied2: 35};
    let normal_line_options = {att: 10, ied1: 30};

    all_emblem_pots = combine_all_line_options(prime_line_options, normal_line_options);
    return all_emblem_pots;
}

function create_all_secondary_options(){
    let prime_line_options  = {att: 12, boss1: 40, boss2: 35, ied1: 40, ied2: 35};
    let normal_line_options = {att: 9, boss1: 30, ied1: 30};

    all_secondary_pots = combine_all_line_options(prime_line_options, normal_line_options);
    return all_secondary_pots;
}


function combine_all_line_options(prime_line_options, normal_line_options){
    let all_options = [];
    var att = null; var boss = null; var dmg = null; var ied = null;

    $.each(prime_line_options, function(index_prime, value_prime){
        $.each(normal_line_options, function(index_normal1, value_normal1){
            $.each(normal_line_options, function(index_normal2, value_normal2){

                att = 0; var boss = 0; var dmg = 0; var ied = 0;

                if(index_prime == "att"){
                    att += value_prime;
                } else if(index_prime == "boss1"){
                    boss += value_prime;
                } else if(index_prime == "boss2"){
                    boss += value_prime;
                } else if(index_prime == "ied1"){
                    ied = calculate_new_ied(ied, value_prime);
                } else if(index_prime == "ied2"){
                    ied = calculate_new_ied(ied, value_prime);
                }
                if(index_normal1 == "att"){
                    att += value_normal1;
                } else if(index_normal1 == "boss1"){
                    boss += value_normal1;
                } else if(index_normal1 == "boss2"){
                    boss += value_normal1;
                } else if(index_normal1 == "ied1"){
                    ied = calculate_new_ied(ied, value_normal1);
                } else if(index_normal1 == "ied2"){
                    ied = calculate_new_ied(ied, value_normal1);
                }
                if(index_normal2 == "att"){
                    att += value_normal2;
                } else if(index_normal2 == "boss1"){
                    boss += value_normal2;
                } else if(index_normal2 == "boss2"){
                    boss += value_normal2;
                } else if(index_normal2 == "ied1"){
                    ied = calculate_new_ied(ied, value_normal2);
                } else if(index_normal2 == "ied2"){
                    ied = calculate_new_ied(ied, value_normal2);
                }

                all_options.push({"att": att, "boss": boss, "ied": ied});

            })
        })
    })

    return all_options;
}

function add_hyper_stat_options(available_pts, option_list){
    // This function first gets all possible (maxed) hyper stat combinations

    var base_hyper_stats = {"boss":0,"dmg":0,"cdmg":0,"ied":0};
    var best_fd_score = 0; var lowest_fd_score = 0;
    var amount_of_scores = 0;
    var max_amount_of_scores = 1000;
    

    // Then create all possible options
    possible_hyper_stat_levels = distributePoints(available_pts);
    possible_hyper_stats = translate_hyper_stat_levels_to_stats(possible_hyper_stat_levels);

    var perct = 0;
    var new_option_list = [];
    // Then add all possible hyper stats to each option in the option list
    $.each(option_list, function(option_index, option){
        var JSON_option = JSON.stringify(option);
        $.each(possible_hyper_stats, function(hyper_index, hypers){
            new_option = JSON.parse(JSON_option);
            new_option["hypers"] = hypers;
            new_option["cdmg"] += hypers["cdmg"];
            new_option["boss"] += hypers["boss"];
            new_option["dmg"] += hypers["dmg"];
            new_option["ied"] = calculate_new_ied(new_option["ied"],hypers["ied"]);
            new_option = calculate_fd_score(new_option);

            // Check if we should add it to the list
            if( amount_of_scores < max_amount_of_scores ){

                new_option_list.push(new_option);
                new_option_list = optimize(new_option_list);
                amount_of_scores++;
                lowest_fd_score = new_option_list[new_option_list.length - 1].fd_score;

            } else if(new_option.fd_score > lowest_fd_score){

                new_option_list[new_option_list.length - 1] = new_option;
                new_option_list = optimize(new_option_list);
                lowest_fd_score = new_option_list[new_option_list.length - 1].fd_score;

            }            
        })
        perct = 100*(option_index / option_list.length).toFixed(3);
        console.log(perct+"%");
    })

    return new_option_list;

}

function distributePoints(budget) {

    var maxLevel = 15;
    var resource_levels = [0, 0, 0, 0];
    var level_up_cost = [0, 1, 2, 4, 8, 10, 15, 20, 25, 30, 35, 50, 65, 80, 95, 110];
    var cumulative_level_up_cost = [0, 1, 3, 7, 15, 25, 40, 60, 85, 115, 150, 200, 265, 345, 440, 550];
    var output = [];

    function distributeHelper(budget, index) {
        if (index === 4) {
            if (budget < Math.min(level_up_cost[resource_levels[0]], level_up_cost[resource_levels[1]], level_up_cost[resource_levels[2]], level_up_cost[resource_levels[3]])) {
                output.push(resource_levels.slice());
            }
            return;
        }

        for (var i = 0; i <= maxLevel; i++) {
            var cost = cumulative_level_up_cost[i];
            if (cost <= budget) {
                budget -= cost;
                resource_levels[index] += i;
                distributeHelper(budget, index + 1);
                resource_levels[index] -= i;
                budget += cost;
            } else {
                break;
            }
        }
    }

    distributeHelper(budget, 0);
    return output;
}

function translate_hyper_stat_levels_to_stats(hyper_stat_levels){
    var crit_damage_amount = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var ied_amount = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45];
    var damage_amount = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45];
    var boss_amount = [0, 3, 6, 9, 12, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55];

    hyper_stats = [];
    var cdmg = null; var ied = null; var dmg = null; var boss = null;
    $.each(hyper_stat_levels, function(index, levels){
        cdmg = crit_damage_amount[levels[0]]; ied = ied_amount[levels[1]]; dmg = damage_amount[levels[2]]; boss = boss_amount[levels[3]];
        hyper_stats.push({"cdmg": cdmg, "ied": ied, "dmg": dmg, "boss": boss});
    })

    return hyper_stats;
}

function add_buffs(option_list){
    // First gets buffs and then adds them to each option in the list

    // Get buffs
    buff_list = get_activated_buffs()

    // Add them to the options
    var new_option_list = [];
    $.each(option_list, function(index, option){
        option["att"]  += buff_list["att"];
        option["dmg"]  += buff_list["dmg"];
        option["cdmg"] += buff_list["cdmg"];
        option["boss"] += buff_list["boss"];
        option["ied"] = calculate_new_ied(option["ied"], buff_list["ied"]);
        new_option_list.push(option);
    })

    return new_option_list;
}

function calculate_new_ied(old_ied, new_ied){
    return 100 * (1 - (1-old_ied/100) * (1-new_ied/100));
}

function get_activated_buffs(){
    // This function gets activated buffs depending on checkmarks

    buff_list = {"dmg":0, "boss":0, "cdmg":0, "ied":0, "att":0};

    // Go through each checkbox ...
    // Link skills
    if($('#toggle-switch-cadena').is(':checked')){
        buff_list["dmg"] += 12;
    }
    if($('#toggle-switch-ark').is(':checked')){
        buff_list["dmg"] += 16;
    }
    if($('#toggle-switch-mage').is(':checked')){
        buff_list["dmg"] += 9;
        buff_list["ied"]  = calculate_new_ied(buff_list["ied"], 9);
    }
    if($('#toggle-switch-thief').is(':checked')){
        buff_list["dmg"] += 9;
    }
    if($('#toggle-switch-illium').is(':checked')){
        buff_list["dmg"] += 12;
    }
    if($('#toggle-switch-kain').is(':checked')){
        buff_list["dmg"] += 17/2;
    }

    // Guild skills
    if($('#toggle-switch-gskill-boss').is(':checked')){
        buff_list["boss"] += 30;
    }
    if($('#toggle-switch-gskill-dmg').is(':checked')){
        buff_list["dmg"] += 30;
    }
    if($('#toggle-switch-gskill-cdmg').is(':checked')){
        buff_list["cdmg"] += 30;
    }
    if($('#toggle-switch-gskill-ied').is(':checked')){
        buff_list["ied"]  = calculate_new_ied(buff_list["ied"], 30);
    }

    // Other
    if($('#toggle-switch-echo').is(':checked')){
        buff_list["att"] += 4;
    }
    if($('#toggle-switch-boss-dmg-pot').is(':checked')){
        buff_list["boss"] += 20;
    }
    if($('#toggle-switch-ied-pot').is(':checked')){
        buff_list["ied"] = calculate_new_ied(buff_list["ied"], 20);
    }
    if($('#toggle-switch-home').is(':checked')){
        buff_list["boss"] += 15;
    }
    if($('#toggle-switch-soul').is(':checked')){
        buff_list["att"] += 3;
    }

    return buff_list;
}

function generate_table(result_options){
    // get a reference to the existing table element
    $("#result_table tr").remove(); 
    const table = document.getElementById("result_table");
    table.classList.add("bordered-table");
    

    // create a header row if necessary
    const headerRow = table.createTHead().insertRow();
    const wseHeader = headerRow.insertCell();
    wseHeader.textContent = "WSE";
    const famHeader = headerRow.insertCell();
    famHeader.textContent = "Familiars";
    const hyperHeader = headerRow.insertCell();
    hyperHeader.textContent = "Hyperstats";

    // create a row for each item in the data array
    for (let i = 0; i < result_options.length; i++) {
        const row = table.insertRow();
        const wseCell = row.insertCell();
        wseCell.innerHTML = "Weapon: " + JSON.stringify(result_options[i].wse[0]) + "<br>Secondary: " + JSON.stringify(result_options[i].wse[1]) + "<br>Emblem: " + JSON.stringify(result_options[i].wse[2]);
        //wseCell.textContent = JSON.stringify(result_options[i].wse);
        const famCell = row.insertCell();
        famCell.innerHTML = "Familiar 1: " + JSON.stringify(result_options[i].fams[0]) + "<br>Familiar 2: " + JSON.stringify(result_options[i].fams[1]) + "<br>Familiar 3: " + JSON.stringify(result_options[i].fams[2]);
        //famCell.textContent = JSON.stringify(result_options[i].fams);
        const hyperCell = row.insertCell();
        hyperCell.innerHTML = JSON.stringify(result_options[i].hypers);
    }
}

$(document).ready(function() {

    // Add listeners for adding base stats
    var base_stat_array = []; var object = null;
    $("#add_stat_btn").click(function() {
        object = {};
        object[$("#base_stats_type").find(":selected").val()] = parseFloat($("#base_stats_amount_input").val());
        base_stat_array.push(object);

        var htmltoadd = "";
        htmltoadd += '<div class="card" style="width: 18rem;">';
        htmltoadd += '<div class="card-body">';
        htmltoadd += '    <h5 class="card-title">'+$("#base_stats_type").find(":selected").text()+'</h5>';
        htmltoadd += '    <h6 class="card-subtitle mb-2 text-muted">'+$("#base_stats_amount_input").val()+'</h6>';
        htmltoadd += '</div>';
        htmltoadd += '</div>';
        $("#base_stats_to_add").append(htmltoadd);
        console.log(base_stat_array);
    });

    // Add listeners for adding familiars
    var familiars = [{"fam":"none"},{"fam":"none"},{"fam":"none"}];
    let counter = 0;
    $("#add_fam_btn").click(function() {
        object = [{}, {}];
        object[0][$("#fam_stats_type1").find(":selected").val()] = parseFloat($("#fam_amount1_input").val());
        object[1][$("#fam_stats_type2").find(":selected").val()] = parseFloat($("#fam_amount2_input").val());
        familiars[counter] = object;
        counter++;

        var htmltoadd = "";
        htmltoadd += '<div class="card" style="width: 18rem;">';
        htmltoadd += '<div class="card-body">';
        htmltoadd += '    <h5 class="card-title">Familiar</h5>';

        if($("#fam_stats_type1").find(":selected").text() != "None"){
            htmltoadd += '    <h6 class="card-subtitle mb-2 text-muted">'+$("#fam_stats_type1").find(":selected").text()+':\t'+$("#fam_amount1_input").val()+'</h6>';
        }
        if($("#fam_stats_type2").find(":selected").text() != "None"){
            htmltoadd += '    <h6 class="card-subtitle mb-2 text-muted">'+$("#fam_stats_type2").find(":selected").text()+':\t'+$("#fam_amount2_input").val()+'</h6>';
        }

        htmltoadd += '</div>';
        htmltoadd += '</div>';
        $("#fams_to_add").append(htmltoadd);
    });

    $("#optimize_btn").click(function() {
        // Start optimization process
        // 1. Create all WSE
        var option_list = null;
        option_list = create_all_wse_options();
        console.log("Added all WSE options");

        // 2. Get each option with each familiar combination
        option_list = add_familiars_options(familiars, option_list);
        console.log("Added all familiar options");

        // 3. Add base stats
        option_list = add_base_stats_yourself(base_stat_array, option_list)
        console.log("Added base stats");

        // 4. Add buffs
        option_list = add_buffs(option_list);
        console.log("Added buffs");

        // 5. Get each option with each hyper stat combination, but don't save all possibilities since it'll blow up in memory
        var available_pts = parseFloat($("#hyper_stats_amount_input").val());
        option_list = add_hyper_stat_options(available_pts, option_list);
        console.log("Added all hyper stat options");

        // 6. Optimize
        //sorted_option_list = optimize(option_list);
        console.log("Sorted");

        
        generate_table(option_list);
        //console.log(sorted_option_list.slice(0,100));
    });

    $("#instructions").modal("show")

})