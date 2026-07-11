// Se já estiver logado, vai direto para o painel
async function verificarSessao() {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {

        window.location.href = "index.html";

    }

}

verificarSessao();



// Fazer login
async function fazerLogin() {

    const email = document.getElementById("email").value.trim();

    const senha = document.getElementById("senha").value;

    const erro = document.getElementById("erro");

    erro.textContent = "";

    const { error } = await supabaseClient.auth.signInWithPassword({

        email: email,
        password: senha

    });

    if (error) {

        erro.textContent = "E-mail ou senha incorretos.";

        return;

    }

    window.location.href = "index.html";

}



// Botão Entrar
document
    .getElementById("entrar")
    .addEventListener("click", fazerLogin);



// Entrar pressionando Enter
document.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        fazerLogin();

    }

});