# SMS Sender and Webhook Tester
Protótipo de teste para enviar SMS e receber respostas pelo webhook.

## Para Rodar o Sistema
(.venv) PS C:\dev\teste\sms> ./.venv/Scripts/Activate.ps1 
(.venv) PS C:\dev\teste\sms> pip install -r requirements.txt 
(.venv) PS C:\dev\teste\sms> python app.py

## URLs

### Site principal - root
http://127.0.0.1:7600

### Webhook para teste retorno status
http://127.0.0.1:7600/webhook_status    - Ambiente Dev

#### Teste do webhook - Status
curl -X POST https://arqia.dwith.click/webhook_status -H "Content-Type: application/json" -d "{""error_code"": null, ""error_message"": null, ""message_id"": ""a6a8a9b9c5c4e3ff"", ""recipient"": ""5521997765656"", ""status"": ""delivered"", ""timestamp"": ""2026-06-23T22:23:16.017Z""}"	

### Webhook para teste retorno status
http://127.0.0.1:5000/webhook_msg   

#### Teste do webhook - Mensagem
curl -X POST https://arqia.dwith.click/webhook_msg -H "Content-Type: application/json" -d "{""from"": ""5521997765656"", ""text"": ""Teste 01"", ""timestamp"": ""2026-06-23T22:59:06.165Z"", ""to"": ""12062""}"



## cURL real de envio de mensagem
Complete o token no  Authorization Header 
curl --location "https://api.datora.alarislabs.com/rest/send_sms?acc_id=10289&from=12062&message=API%20ARQIA%20SMS%20-%20Teste02%2001&to=5521997765656" --header "Authorization: Bearer eyJhbGci.... COLOQUE O TOKEN GERADO"

