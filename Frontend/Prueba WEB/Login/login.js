document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    // Obtén los valores del formulario
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
  
    // Realiza la petición para obtener la información del usuario
    fetch('http://127.0.0.1:8080/usuarios')
        .then(response => response.json())
        .then(data => {
            // Busca el usuario en la respuesta
            var user = data.find(user => user.userName === username);
  
            if (user) {
                // Compara la contraseña
                if (user.password === password) {
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
  
                    // Agrega un pequeño retraso antes de redireccionar
                    setTimeout(function() {
                        window.location.href = '../Index/index.html';
                    }, 100);
                } else {
                    console.log('Contraseña incorrecta');
                }
            } else {
                console.log('Usuario no encontrado');
            }
        })
        .catch(error => console.error('Error:', error));
  });
  
  