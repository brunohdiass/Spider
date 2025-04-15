// Função para enviar dados de login para a API
const enviarDadosLogin = async (email, senha) => {
    const url = 'https://back-spider.vercel.app/login'; // Endpoint de login

    const dados = {
        "email": email,
        "senha": senha
    };

    try {
        const resposta = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            throw new Error(`Erro: ${resposta.status}`);
        }

        const resultado = await resposta.json(); 
        if (resultado.success) { // Se a resposta da API for "true"
            alert("Login bem-sucedido! Redirecionando...");
            window.location.href = "home.html"; // Redireciona para a tela de registro
        } else {
            alert("Erro ao fazer login. Verifique suas credenciais.");
        }
    } catch (erro) {
        console.error("Erro ao enviar dados:", erro);
        alert("Erro ao fazer login. Verifique suas credenciais.");
    }
};

// Captura o evento de submit no formulário de login
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const email = document.getElementById("nome").value; // ID correto do campo de usuário
    const senha = document.getElementById("senha").value; // ID correto do campo de senha

    if (email && senha) {
        enviarDadosLogin(email, senha); // Passa os valores corretamente
    } else {
        alert("Por favor, preencha todos os campos.");
    }
});