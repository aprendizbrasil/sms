document.addEventListener('DOMContentLoaded', () => {
    console.log('SEND SMS - DOM carregado');
    
    // Elementos do DOM
    const baseUrlInput = document.getElementById('baseUrl');
    const requestPathInput = document.getElementById('requestPath');
    const endpointDiv = document.getElementById('endpoint');
    const accIdInput = document.getElementById('acc_id');
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const messageInput = document.getElementById('message');
    const sendBtn = document.getElementById('sendBtn');
    const bodyJsonTextarea = document.getElementById('bodyJson');
    const responseJsonTextarea = document.getElementById('responseJson');
    const curlTextarea = document.getElementById('curlEquivalent');
    const tokenDisplay = document.getElementById('tokenDisplay');

    // Verificar e exibir token no localStorage
    const token = localStorage.getItem('sms_token');
    if (token) {
        console.log('Token encontrado no localStorage');
        tokenDisplay.value = token;
    } else {
        console.log('Token NÃO encontrado no localStorage - Obtenha um token primeiro');
        tokenDisplay.value = 'Token não encontrado';
        alert('Token não encontrado! Obtenha um token primeiro na página de autenticação.');
    }

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

    // Função para fazer requisição de envio de SMS
    async function sendSMS() {
        const baseUrl = baseUrlInput.value;
        const requestPath = requestPathInput.value;
        const accId = accIdInput.value;
        const from = fromInput.value;
        const to = toInput.value;
        const message = messageInput.value;

        // Verificar se há token
        const token = localStorage.getItem('sms_token');
        if (!token) {
            alert('Token não encontrado! Obtenha um token primeiro na página de autenticação.');
            return;
        }

        // Validar campos obrigatórios
        if (!accId || !from || !to || !message) {
            alert('Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Validar limite de caracteres
        if (message.length > 450) {
            alert('A mensagem excede o limite de 450 caracteres');
            return;
        }

        // Construir URL com todos os parâmetros como query parameters
        const params = new URLSearchParams({
            acc_id: accId,
            from: from,
            message: message,
            to: to
        });

        const url = `${baseUrl}${requestPath}?${params.toString()}`;

        // Atualizar JSON do corpo (para GET, mostramos os parâmetros da URL)
        const requestInfo = {
            method: 'GET',
            url: url,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            parameters: {
                acc_id: accId,
                from: from,
                message: message,
                to: to
            }
        };
        bodyJsonTextarea.value = JSON.stringify(requestInfo, null, 2);

        // Gerar comando cURL
        const curlCommand = `curl -X GET "${url}" \\\n  -H "Authorization: Bearer ${token}" \\\n  -H "Accept: application/json"`;
        curlTextarea.value = curlCommand;

        // Atualizar exibição do token
        tokenDisplay.value = token;

        try {
            console.log('Enviando requisição GET para:', url);
            console.log('Parâmetros:', requestInfo.parameters);
            
            // Fazer requisição GET
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            // Tentar obter mais informações sobre o erro
            let errorData = null;
            if (!response.ok) {
                try {
                    errorData = await response.text();
                    console.log('Resposta de erro:', errorData);
                } catch (e) {
                    console.log('Não foi possível obter detalhes do erro');
                }
                throw new Error(`Erro HTTP: ${response.status} - ${errorData || 'Bad Request'}`);
            }

            const data = await response.json();
            
            // Exibir resposta formatada
            responseJsonTextarea.value = JSON.stringify(data, null, 2);
            console.log('Resposta recebida:', data);

            if (data.message_id) {
                alert('SMS enviado com sucesso! ID: ' + data.message_id);
            } else {
                alert('SMS enviado, mas sem ID de mensagem na resposta');
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            responseJsonTextarea.value = `Erro: ${error.message}`;
            alert('Erro ao enviar SMS: ' + error.message);
        }
    }

    // Adicionar evento de clique no botão
    sendBtn.addEventListener('click', function(event) {
        console.log('Botão Enviar SMS clicado');
        sendSMS();
    });

    // Contador de caracteres para a mensagem
    messageInput.addEventListener('input', function() {
        const count = messageInput.value.length;
        const max = 450;
        if (count > max) {
            messageInput.value = messageInput.value.substring(0, max);
        }
    });
});
