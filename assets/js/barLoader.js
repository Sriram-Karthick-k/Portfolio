var languages=[
{name:"java script" ,percentage:"65",color:"#cbd362"},
{name:"python",percentage:"55",color:"#e6f606"},
{name:"MongoDB",percentage:"65",color:"#3FA037"},
{name:"C",percentage:"60",color:"#5d7bff"},
{name:"C++",percentage:"30",color:"#9badff"},
{name:"MySql",percentage:"68",color:"#F29111"},
{name:"Html",percentage:"70",color:"#e42ea7"},
{name:"CSS",percentage:"65",color:"#e42e55"}
]
var frameWorks=[
  {name:"Reactjs",percentage:"70",color:"#0ca0db"}, 
  {name:"Bootstrap",percentage:"80",color:"#5f22e2"},
]
var tools=[
  {name:"Git",percentage:"75",color:"#F1502F"},
  {name:"Jupyter",percentage:"50",color:"#f5fff5"},
  {name:"Postman",percentage:"60",color:"#d14b1b"},
  {name:"Photoshop",percentage:"55",color:"#0c5bdb"},
]
var environments=[
  {name:"Nodejs",percentage:"75",color:"#2ef12e"},
]
const frameWorks_container=document.querySelector(".skill-bar-container.frame-works")
const language_container=document.querySelector(".skill-bar-container.languages")
const tools_container=document.querySelector(".skill-bar-container.tools")
const environment_container=document.querySelector(".skill-bar-container.environments")
languages.forEach(elem=>{
  language_container.innerHTML+="<div class=skillBox><div class=skill_text><p>"+elem.name+"</p><p><span class=skill_percentage>"+elem.percentage+"</span>%</p></div><div class=skill><div></div><div class=skill_level style=background-color:"+elem.color+" data-width="+elem.percentage+" ></div></div></div>"
})
frameWorks.forEach(elem=>{
  frameWorks_container.innerHTML+="<div class=skillBox><div class=skill_text><p>"+elem.name+"</p><p><span class=skill_percentage>"+elem.percentage+"</span>%</p></div><div class=skill><div></div><div class=skill_level style=background-color:"+elem.color+" data-width="+elem.percentage+" ></div></div></div>"
})
tools.forEach(elem=>{
  tools_container.innerHTML+="<div class=skillBox><div class=skill_text><p>"+elem.name+"</p><p><span class=skill_percentage>"+elem.percentage+"</span>%</p></div><div class=skill><div></div><div class=skill_level style=background-color:"+elem.color+" data-width="+elem.percentage+" ></div></div></div>"
})
environments.forEach(elem=>{
  environment_container.innerHTML+="<div class=skillBox><div class=skill_text><p>"+elem.name+"</p><p><span class=skill_percentage>"+elem.percentage+"</span>%</p></div><div class=skill><div></div><div class=skill_level style=background-color:"+elem.color+" data-width="+elem.percentage+" ></div></div></div>"
})