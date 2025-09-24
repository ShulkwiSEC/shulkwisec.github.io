async function resume(resumePath, targetElement) {
    const el = document.querySelector(targetElement);
    el.style.whiteSpace = 'pre-wrap';
    const data = await fetch(resumePath);
    const content = await data.text();
    el.innerText = content;
}
