async function resume(resumePath,targetElement){
    resume = document.querySelector(targetElement)
    resume.style.textWrap = 'auto'
    data = await fetch(resumePath)
    content = await data.text()
    resume.innerText = content
}