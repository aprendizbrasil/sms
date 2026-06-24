# SMS Sender and Webhook Tester
Protótipo de teste para enviar SMS e receber respostas pelo webhook.

## Para Rodar o Sistema
(.venv) PS C:\dev\teste\sms> ./.venv/Scripts/Activate.ps1 
(.venv) PS C:\dev\teste\sms> pip install -r requirements.txt 
(.venv) PS C:\dev\teste\sms> python app.py

## URLs

### Site principal - root
http://127.0.0.1:5000

### Webhook para teste retorno status
http://127.0.0.1:5000/webhook_status

curl -X POST http://127.0.0.1:5000/webhook_status ^
    -H "Content-Type: application/json" ^
    -d "{""error_code"": null, ""error_message"": null, ""message_id"": ""a6a8a9b9c5c4e3ff"", ""recipient"": ""5521997765656"", ""status"": ""delivered"", ""timestamp"": ""2026-06-23T22:23:16.017Z""}"	

### Webhook para teste retorno status
http://127.0.0.1:5000/webhook_msg

curl -X POST http://127.0.0.1:5000/webhook_msg ^
-H "Content-Type: application/json" ^
-d "{""from"": ""5521997765656"", ""text"": ""Teste 01"", ""timestamp"": ""2026-06-23T22:59:06.165Z"", ""to"": ""12062""}"


