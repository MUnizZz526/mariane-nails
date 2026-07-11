/* =====================================
   MARIANE NAILS STUDIO
   JavaScript
===================================== */


// Animação de entrada dos elementos

const elementos = document.querySelectorAll(".animar");


elementos.forEach((elemento, index) => {



    elemento.style.animationDelay = `${index * 0.12}s`;

}
);


// Animação suave ao abrir páginas

document.body.style.opacity = "0";

window.addEventListener("load", () => {


    document.body.style.transition = "opacity .6s ease";

    
    document.body.style.opacity = "1";
});

// Confirmação de links externos
const linksExternos = document.querySelectorAll('a[target="_blank"]');

linksExternos.forEach(link => {

    link.addEventListener("click", () => {

        console.log("Abrindo link:", link.href);

    });

});



// ===============================
// CARREGAR DADOS DO SUPABASE
// ===============================

async function carregarPerfil() {

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .single();

    if (error) {
        console.error(error);
        return;
    }

    console.log("Perfil:", data);

    document.getElementById("nomePerfil").textContent = data.nome;

    document.getElementById("descricaoPerfil").innerHTML = data.descricao;

    document.getElementById("fotoPerfil").src = data.foto;

}

carregarPerfil();