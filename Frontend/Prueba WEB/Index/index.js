var userNotas = [];
var notasFiltradas = [];
var currentUser;
var modalVisible = false;
document.addEventListener('DOMContentLoaded', function () {
    // Recupera el usuario de sessionStorage
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));



    //Hacemos mensaje de bienvenida con el usuario logueado
    if (currentUser) {
        console.log(currentUser.id)
        // Obtiene el elemento h1
        var welcomeHeading = document.querySelector('h1');
        cargarCategorias();//cargo las categorias en el formualrio para agregar nota
        cargarCategoriasEditar();
        cargarNotasEditar();

        // Modifica el contenido del h1 para incluir el saludo y el nombre del usuario
        welcomeHeading.textContent = 'Bienvenido, ' + currentUser.userName;
        //Obtenemos als notas del usuario 
        fetch('http://127.0.0.1:8080/notas/usuario/' + currentUser.id)
            .then(response => response.json())
            .then(notas => {
                notasAsincronomo(notas);
                mostrarNotas();
            })
    } else {
        console.log('Usuario no encontrado en sessionStorage');
    }


});

//elimino el probelma de asincronomo
function notasAsincronomo(notas) {
    userNotas = notas;
}
function mostrarNotas() {
    var listNotas = document.getElementById('listNotas');
    listNotas.innerHTML = ''; // Limpio el div

    var filtro = document.getElementById('buscarNota').value.toLowerCase();
    var chkArchivadas = document.getElementById('chkArchivadas');
    var incluirArchivadas = chkArchivadas.checked;

    notasFiltradas = userNotas.filter(nota =>
        (nota.titulo.toLowerCase().includes(filtro) || nota.contenido.toLowerCase().includes(filtro)) &&
        (incluirArchivadas ? true : !nota.archivada)
    );

    notasFiltradas.forEach(nota => {
        // Por cada nota que cumple con el filtro y no está archivada, creo un div
        var notaElemento = document.createElement('div');
        // Agregamos para el CSS
        notaElemento.classList.add('nota');
        // Creamos un párrafo para mostrar el título y el contenido de la nota
        var notaInfo = document.createElement('p');
        notaInfo.textContent = `Título: ${nota.titulo}, Contenido: ${nota.contenido}`;
        notaElemento.appendChild(notaInfo);

        // Agregamos icono eliminar a cada nota
        var iconoEliminar = document.createElement('span');
        iconoEliminar.innerHTML = '&#10006;';
        iconoEliminar.addEventListener('click', function () {
            eliminarNota(nota.id);
        });
        notaElemento.appendChild(iconoEliminar);

        // Agregamos icono archivar o desarchivar según el estado de la nota
        var iconoToggleArchivar = document.createElement('span');
        if (nota.archivada) {
            iconoToggleArchivar.innerHTML = '&#128448;'; // Icono de archivar
            iconoToggleArchivar.addEventListener('click', function () {
                desarchivarNota(nota.id);
            });
        } else {
            iconoToggleArchivar.innerHTML = '&#128193;'; // Icono de desarchivar
            iconoToggleArchivar.addEventListener('click', function () {
                archivarNota(nota.id);
            });
        }
        notaElemento.appendChild(iconoToggleArchivar);

        listNotas.appendChild(notaElemento);
    });
}



function eliminarNota(idNota) {
    // Hacer la solicitud DELETE al servidor
    fetch(`http://127.0.0.1:8080/notas/${idNota}`, {
        method: 'DELETE',
    })
        .then(response => {
            if (response.ok) {
                // Si la respuesta es exitosa, actualizar las notas y mostrarlas
                console.log('Nota eliminada exitosamente');
                cargarNotas(); // Volver a cargar las notas después de la eliminación
            } else {
                // Si hay un error en la respuesta, lanzar una excepción
                throw new Error(`Nota no eliminada. Código de estado: ${response.status}`);
            }
        })
        .catch(error => console.error('Error:', error.message));
}



// Función para cargar las notas después de realizar una acción (eliminar, editar, etc.)
function cargarNotas() {
    fetch('http://127.0.0.1:8080/notas/usuario/' + currentUser.id)
        .then(response => response.json())
        .then(notas => {
            notasAsincronomo(notas);
            mostrarNotas();

        })
        .catch(error => console.error('Error:', error));
}


function cargarCategorias() {
    // Realizar solicitud GET para obtener categorías
    fetch('http://localhost:8080/categorias')
        .then(response => response.json())
        .then(categorias => {
            // Obtener el elemento select
            var selectCategoria = document.getElementById('categoria');

            // Limpiar opciones existentes en el select
            selectCategoria.innerHTML = '';

            // Agregar una opción por cada categoría obtenida
            categorias.forEach(categoria => {
                var option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                selectCategoria.appendChild(option);

            });
        })
        .catch(error => console.error('Error al cargar categorías:', error));
}
//Vamos agregar nota
function agregarNota() {
    var tituloNota = document.getElementById('tituloNota').value;
    var contenidoNota = document.getElementById('contenidoNota').value;
    var idCategoria = document.getElementById('categoria').value;
    if (tituloNota.trim() === '' || contenidoNota.trim() === '') {
        alert('Por favor, complete tanto el título como el contenido para la nota.');
        return;
    }
    var nuevaNota = {
        titulo: tituloNota,
        contenido: contenidoNota,
        idUsuario: currentUser.id,
        idCategoria: parseInt(idCategoria, 10)
    };
    console.log(nuevaNota);
    // Configurar la solicitud POST
    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaNota),
    };
    // Realizar la solicitud POST a la API
    fetch('http://127.0.0.1:8080/notas', requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log('Nota agregada exitosamente:', data);
            // Puedes realizar acciones adicionales después de agregar la nota
            cargarNotas(); // Volver a cargar las notas después de agregar una nueva
            // Actualizar la página después de agregar la nota
            alert('Agregar Nota Exitosamente');
            window.location.reload();
        })
        .catch(error => {
            console.error('Error al agregar la nota:', error);
        });
}
function cargarCategoriasEditar() {
    // Realizar solicitud GET para obtener categorías
    fetch('http://localhost:8080/categorias')
        .then(response => response.json())
        .then(categorias => {
            // Obtener el elemento select
            var selectCategoria = document.getElementById('categoriaEditar');

            // Limpiar opciones existentes en el select
            selectCategoria.innerHTML = '';

            // Agregar una opción por cada categoría obtenida
            categorias.forEach(categoria => {
                var option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                selectCategoria.appendChild(option);

            });
        })
        .catch(error => console.error('Error al cargar categorías:', error));
}
//cragar notas paar editar
function cargarNotasEditar() {
    // Realizar solicitud GET para obtener notas
    fetch('http://localhost:8080/notas')
        .then(response => response.json())
        .then(notas => {
            // Obtener el elemento select
            var selectNotas = document.getElementById('notas');

            // Limpiar opciones existentes en el select
            selectNotas.innerHTML = '';

            // Agregar una opción por cada categoría obtenida
            notas.forEach(nota => {
                var option = document.createElement('option');
                option.value = nota.id;
                option.textContent = nota.titulo;
                selectNotas.appendChild(option);

            });
        })
        .catch(error => console.error('Error al cargar categorías:', error));
}
function editarNota(event) {
    event.preventDefault();
    var selectedNotaId = document.getElementById('notas').value;
    var nuevoTitulo = document.getElementById('tituloNotaEditar').value;
    var nuevoContenido = document.getElementById('contenidoNotaEditar').value;
    var nuevaCategoria = document.getElementById('categoriaEditar').value;
    console.log(selectedNotaId);
    console.log(nuevoTitulo);
    console.log(nuevoContenido);
    console.log(nuevaCategoria);
    var notaEditada = {
        titulo: nuevoTitulo,
        contenido: nuevoContenido,
        idCategoria: parseInt(nuevaCategoria, 10)
    };
    var requestOptions = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaEditada),
    };

    // Realizar la solicitud PUT a la API
    fetch(`http://127.0.0.1:8080/notas/${selectedNotaId}`, requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log('Nota editada exitosamente:', data);
            alert('Nota editada exitosamente');
            // Puedes realizar acciones adicionales después de editar la nota
            cargarNotas(); // Volver a cargar las notas después de editar
            // Actualizar la página después de editar la nota
            window.location.reload();
        })
        .catch(error => {
            console.error('Error al editar la nota:', error);
        });
}
//Funcion Agregar categoria
function agregarCategoria(event) {
    event.preventDefault();
    var nombreCategoria = document.getElementById('nombreCategoria').value;

    var nuevaCategoria = {
        nombre: nombreCategoria
    };
    var requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaCategoria),
    };
    // Realizar la solicitud POST a la API
    fetch('http://127.0.0.1:8080/categorias', requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log('Categoria agregada exitosamente:', data);
            // Puedes realizar acciones adicionales después de agregar la nota
            cargarNotas(); // Volver a cargar las notas después de agregar una nueva
            // Actualizar la página después de agregar la nota
            alert('Categoria agregada exitosamente');
            window.location.reload();
        })
        .catch(error => {
            console.error('Error al agregar la nota:', error);
        });


}
//Archivar notas
function archivarNota(idNota) {
    // Hacer la solicitud al servidor para archivar la nota
    fetch(`http://127.0.0.1:8080/notas/archivar/${idNota}`, {
        method: 'PUT',
    })
        .then(response => {
            if (response.ok) {
                // Si la respuesta es exitosa, actualizar las notas y mostrarlas
                console.log('Nota archivada exitosamente');
                cargarNotas(); // Volver a cargar las notas después de la archivación
            } else {
                // Si hay un error en la respuesta, lanzar una excepción
                throw new Error(`Nota no archivada. Código de estado: ${response.status}`);
            }
        })
        .catch(error => console.error('Error:', error.message));
}
//Desarchivar notas 
function desarchivarNota(idNota) {
    // Hacer la solicitud al servidor para desarchivar la nota
    fetch(`http://127.0.0.1:8080/notas/desarchivar/${idNota}`, {
        method: 'PUT',
    })
        .then(response => {
            if (response.ok) {
                // Si la respuesta es exitosa, actualizar las notas y mostrarlas
                console.log('Nota desarchivada exitosamente');
                cargarNotas(); // Volver a cargar las notas después de la desarchivación
            } else {
                // Si hay un error en la respuesta, lanzar una excepción
                throw new Error(`Nota no desarchivada. Código de estado: ${response.status}`);
            }
        })
        .catch(error => console.error('Error:', error.message));
}
