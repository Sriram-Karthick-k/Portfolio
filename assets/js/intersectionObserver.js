var bars=document.querySelectorAll(".skill_level")
const options={}
const observer=new IntersectionObserver(function(entries,observer){
  entries.map(entry=>{
    if(entry.isIntersecting){
      entry.target.style.width=entry.target.dataset.width+"%"
    }
  })
},options)
bars.forEach(bar=>{
  observer.observe(bar)
})
