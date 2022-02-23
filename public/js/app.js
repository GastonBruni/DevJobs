document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    if(skills) {
        skills.addEventListener('click', agregarSkills);
    }
})

const skills = new Set();

const agregarSkills = e => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            //quitarlo del set y quitar la clase
        }else{
            //quitarlo del set y quitar la clase
            skills.add(e.target.textContent);
        }
    }
}