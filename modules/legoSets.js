/********************************************************************************
* BTI325 – Assignment 02
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: ______Ram Grover________________ Student ID: ___158824219___________ Date: ____27/09/2023______
*
********************************************************************************/




const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize(){
    return new Promise((resolve,reject)=>{
    sets=[];
    sets=setData.map
    (
        set=>{
            const themeMatch=themeData.find(function(theme){
                return theme.id===set.theme_id;
            });
            const mySet={...set};
            if(themeMatch){
                mySet.theme=themeMatch.name;
            }
            sets.push(mySet);
            return mySet;
           // console.log(mySet);
        });
resolve();
    })
    
}
function getAllSets(){
    return new Promise((resolve,reject)=>{
    if(sets.length>0)
    {
    resolve(sets);
    }
    else{reject("No sets");}
});
}

function getSetByNum(setNum)
{
    return new Promise((resolve,reject)=>{
    const x= sets.find(function(set){
        return set.set_num===setNum;
    })
    if(x)
    {resolve(x);}
    else
    {reject("Unable to find requested set.");}
});
}


function getSetsByTheme(theme){
    return new Promise((resolve,reject)=>{
    const c= sets.filter(s_theme=> s_theme.theme.toLowerCase().includes(theme.toLowerCase()));

    if(c.length>0)
    {resolve(c);}
    else{reject("Unable to find requested sets.");}
    });
}
// Testing the functions
//initialize(); // Initialize the 'sets' array


//console.log(getAllSets());


//console.log(getSetByNum("001-1"));


//console.log(getSetsByTheme("tech"));
module.exports = {initialize,getAllSets,getSetByNum,getSetsByTheme};