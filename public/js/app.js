document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    if(skills) {
        skills.addEventListener('click', agregarSkills);

        // Una vez que estamos en editas, llamar la función
        skillsSeleccionados();
    }
})

const skills = new Set();

const agregarSkills = e => {
    if(e.target.tagName === 'LI'){
        if(e.target.classList.contains('activo')){
            // quitarlo del set y quitar la clase
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        } else {
            // agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}

const skillsSeleccionados = () => {
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientes .activo') );

    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent);
    })

    // Inyectarlo en el hidden
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray;
}