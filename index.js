function optimize(option_list){
    // This function takes a list of options and orders it from best to worst
    // The option list is an array containing key-pair objects
    // Each object contains {att: xxx%, boss: xxx%, dmg: xxx%, cdmg: xxx%, ied: xxx%}
    // It doesn't return a new list but adds the scores to the initial list

    // Initialize variables
    var att = null; var boss = null; var dmg = null; var cdmg = null; var ied = null;
    var fd_score = null;
    var boss_pdr = 380/100;

    // Loop over array
    $.each(option_list, function(index, object){
        att  = object.att;
        boss = object.boss;
        dmg  = object.dmg;
        cdmg = object.cdmg;
        ied  = object.ied;


        fd_score = att * (boss + dmg) * cdmg * (1 - (boss_pdr * (1 - ied)));
        object.fd_score = fd_score;
    })
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

                combined_list.push({"att": att, "boss": boss, "ied": ied});
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

function calculate_new_ied(old_ied, new_ied){
    return 100 * (1 - (1-old_ied/100) * (1-new_ied/100));
}

let test_options = [
    {att: 1.7, boss: 4.54, dmg: 1.2, cdmg: 1.94, ied: 0.9541},
    {att: 1.7, boss: 4.54, dmg: 1.2, cdmg: 1.94, ied: 0.9641}
]