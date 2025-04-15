document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Coletar dados do formulário
        const userData = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            senha: document.getElementById('senha').value,
            confirmarSenha: document.getElementById('confirmarSenha').value,
            premium: document.getElementById('premium').checked
        };

        // Validações
        if (!userData.nome || !userData.email || !userData.senha || !userData.confirmarSenha) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (userData.senha !== userData.confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }

        if (userData.senha.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Configurar botão de loading
        const btn = form.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Cadastrando...';

        try {
            const response = await fetch('https://back-spider.vercel.app/user/cadastrarUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: userData.nome,
                    email: userData.email,
                    senha: userData.senha,
                    premium: userData.premium ? "1" : "0",
                    imagemPerfil: "https://example.com/default-profile.jpg",
                    senhaRecuperacao: "TempRecovery" + Math.floor(Math.random() * 1000)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erro ${response.status}`);
            }

            alert('Cadastro realizado com sucesso!');
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Erro no cadastro:', error);
            
            let errorMessage = 'Erro ao cadastrar: ';
            if (error.message.includes('400')) {
                errorMessage += 'Dados inválidos enviados ao servidor. Verifique os campos.';
            } else {
                errorMessage += error.message || 'Erro desconhecido. Tente novamente.';
            }
            
            alert(errorMessage);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Cadastrar';
        }
    });
});