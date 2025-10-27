document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado - iniciando script');
    
    // Elementos do DOM
    const baseUrlInput = document.getElementById('baseUrl:');
    const requestPathInput = document.getElementById('requestPath:');
    const endpointDiv = document.getElementById('endpoint');
    const userInput = document.getElementById('user:');
    const passInput = document.getElementById('pass');
    const accIdInput = document.getElementById('acc_id');
    const lifetimeInput = document.getElementById('lifetime');
    const nonExpInput = document.getElementById('non_exp');
    const saveInput = document.getElementById('save');
    const authBtn = document.getElementById('authBtn');
    const bodyJsonTextarea = document.getElementById('bodyJson');
    const responseJsonTextarea = document.getElementById('responseJson');
    const curlTextarea = document.getElementById('curlEquivalent');

    console.log('Elementos DOM encontrados:', {
        baseUrlInput: !!baseUrlInput,
        requestPathInput: !!requestPathInput,
        endpointDiv: !!endpointDiv,
        userInput: !!userInput,
        passInput: !!passInput,
        accIdInput: !!accIdInput,
        authBtn: !!authBtn
    });

    // Carregar dados do .settings.json (usando XMLHttpRequest para evitar CORS)
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '.settings.json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                const settings = JSON.parse(xhr.responseText);
                userInput.value = settings.user || '';
                passInput.value = settings.pass || '';
                accIdInput.value = settings.acc_id || '10289';
                console.log('Configurações carregadas:', settings);
            } catch (error) {
                console.error('Erro ao parsear configurações:', error);
            }
        }
    };
    xhr.send();

    // Atualizar endpoint quando inputs mudarem
    function updateEndpoint() {
        const baseUrl = baseUrlInput.value;
        const requestPath = requestPathInput.value;
        endpointDiv.textContent = `${baseUrl}${requestPath}`;
    }

    baseUrlInput.addEventListener('input', updateEndpoint);
    requestPathInput.addEventListener('input', updateEndpoint);

    // Inicializar endpoint
    updateEndpoint();

    // Função para fazer requisição de autenticação
    async function authenticate() {
        const baseUrl = baseUrlInput.value;
        const requestPath = requestPathInput.value;
        const user = userInput.value;
        const pass = passInput.value;
        const accId = accIdInput.value;
        const lifetime = lifetimeInput.value;
        const nonExp = nonExpInput.value;
        const save = saveInput.value;

        // Validar campos obrigatórios
        if (!user || !pass) {
            alert('Por favor, preencha usuário e senha');
            return;
        }

        // Construir URL com parâmetros
        const params = new URLSearchParams({
            user: user,
            pass: pass,
            acc_id: accId,
            Lifetime: lifetime,
            'non-exp': nonExp,
            save: save
        });

        const url = `${baseUrl}${requestPath}?${params.toString()}`;

        // Atualizar JSON do corpo (para GET, mostramos os parâmetros)
        const requestBody = {
            method: 'GET',
            url: url,
            parameters: {
                user: user,
                pass: pass,
                acc_id: accId,
                Lifetime: lifetime,
                'non-exp': nonExp,
                save: save
            }
        };
        bodyJsonTextarea.value = JSON.stringify(requestBody, null, 2);

        // Gerar comando cURL
        const curlCommand = `curl -X GET "${url}"`;
        curlTextarea.value = curlCommand;

        try {
            // Fazer requisição GET
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            // Exibir resposta formatada
            responseJsonTextarea.value = JSON.stringify(data, null, 2);

            // Armazenar token no localStorage se existir
            if (data.token) {
                localStorage.setItem('sms_token', data.token);
                console.log('Token armazenado no localStorage:', data.token);
                alert('Token obtido e armazenado com sucesso!');
            } else {
                alert('Token não encontrado na resposta');
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            responseJsonTextarea.value = `Erro: ${error.message}`;
            alert('Erro ao obter token: ' + error.message);
        }
    }

    // Adicionar evento de clique no botão
    console.log('Adicionando evento de clique no botão');
    authBtn.addEventListener('click', function(event) {
        console.log('Botão clicado!', event);
        authenticate();
    });

    // Função para verificar se há token armazenado
    function checkStoredToken() {
        const storedToken = localStorage.getItem('sms_token');
        if (storedToken) {
            console.log('Token armazenado encontrado:', storedToken);
        }
    }

    // Verificar token ao carregar a página
    checkStoredToken();
});
