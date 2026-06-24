from flask import Flask, request, jsonify, render_template, send_from_directory
from datetime import datetime
import json
import os

app = Flask(__name__)

# Armazena históricos de payloads recebidos em memória
webhook_status_history = []
webhook_message_history = []

# Contadores para o arquivo de log
status_log_counter = 0
message_log_counter = 0
send_log_counter = 0

LOG_FILE = "historico.log"

def _append_to_log(log_type, payload_data, error_message=None):
    global status_log_counter, message_log_counter, send_log_counter
    
    current_timestamp = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
    log_index = 0
    log_label_suffix = ""

    if log_type == "Status":
        status_log_counter += 1
        log_index = status_log_counter
    elif log_type == "Mensagem":
        message_log_counter += 1
        log_index = message_log_counter
    elif log_type == "Envio de SMS":
        send_log_counter += 1
        log_index = send_log_counter
        if error_message:
            log_label_suffix = " - FALHOU"

    log_entry = (
        f"#{log_index} - {current_timestamp} - {log_type}{log_label_suffix}\n"
        f"{json.dumps(payload_data, indent=2)}\n\n"
    )

    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(log_entry)
        print(f"Payload de {log_type} adicionado ao {LOG_FILE}")
    except Exception as e:
        print(f"Erro ao escrever no arquivo de log {LOG_FILE}: {e}")


@app.route("/webhook_status", methods=["POST"])
def webhook_status():
    try:
        payload = request.get_json(force=True)
        
        # Adicionar timestamp ao payload em memória
        payload_with_timestamp = {
            "timestamp": datetime.now().isoformat(),
            "data": payload
        }
        
        # Adicionar ao histórico de status em memória (mantém os últimos 50)
        webhook_status_history.append(payload_with_timestamp)
        if len(webhook_status_history) > 50:
            webhook_status_history.pop(0)

        # Adicionar ao log persistente
        _append_to_log("Status", payload_with_timestamp["data"]) # Log the original payload data
        
        print(f"JSON de Status recebido ({len(webhook_status_history)}):", payload)
        return "Status recebido com sucesso!", 200
    
    except Exception as e:
        print(f"Erro ao processar webhook de status: {e}")
        return "Erro ao processar JSON de status", 400

@app.route("/webhook_msg", methods=["POST"])
def webhook_msg():
    try:
        payload = request.get_json(force=True)
        
        # Adicionar timestamp ao payload em memória
        payload_with_timestamp = {
            "timestamp": datetime.now().isoformat(),
            "data": payload
        }
        
        # Adicionar ao histórico de mensagens em memória (mantém os últimos 50)
        webhook_message_history.append(payload_with_timestamp)
        if len(webhook_message_history) > 50:
            webhook_message_history.pop(0)

        # Adicionar ao log persistente
        _append_to_log("Mensagem", payload_with_timestamp["data"]) # Log the original payload data
        
        print(f"JSON de Mensagem recebida ({len(webhook_message_history)}):", payload)
        return "Mensagem recebida com sucesso!", 200
    
    except Exception as e:
        print(f"Erro ao processar webhook de mensagem: {e}")
        return "Erro ao processar JSON de mensagem", 400

@app.route("/log_send_sms", methods=["POST"])
def log_send_sms():
    try:
        payload = request.get_json(force=True)
        error_message = payload.get("erro") # Get error message if present
        _append_to_log("Envio de SMS", payload, error_message)
        print(f"Log de Envio de SMS recebido: {payload}")
        return "Log de envio registrado com sucesso!", 200
    except Exception as e:
        print(f"Erro ao registrar log de envio: {e}")
        return "Erro ao registrar log de envio", 400


@app.route("/data/status")
def data_status():
    # Retorna o histórico completo de status
    return jsonify(webhook_status_history)

@app.route("/data/msg")
def data_msg():
    # Retorna o histórico completo de mensagens
    return jsonify(webhook_message_history)

@app.route("/clear", methods=["POST"])
def clear_history():
    history_type = request.args.get("type")
    if history_type == "status":
        webhook_status_history.clear()
        return "Histórico de status limpo!", 200
    elif history_type == "msg":
        webhook_message_history.clear()
        return "Histórico de mensagens limpo!", 200
    else:
        webhook_status_history.clear()
        webhook_message_history.clear()
        return "Todos os históricos limpos!", 200

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/auth.html")
def auth():
    return render_template("auth.html")

@app.route("/send.html")
def send():
    return render_template("send.html")

@app.route("/getFileName.html")
def get_file_name():
    return render_template("getFileName.html")

@app.route("/testStatus-wh.html")
def test_status_wh():
    return render_template("testStatus-wh.html")

@app.route("/testMsg-wh.html")
def test_msg_wh():
    return render_template("testMsg-wh.html")

@app.route("/download_history")
def download_history_file():
    try:
        return send_from_directory(os.getcwd(), LOG_FILE, as_attachment=True)
    except FileNotFoundError:
        return "Arquivo de histórico não encontrado.", 404

# Rota para servir arquivos estáticos da pasta assets
@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory("assets", filename)

if __name__ == "__main__":
    app.run(debug=True, port=7600)