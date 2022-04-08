from flask import Flask, jsonify, request, render_template, redirect, url_for,send_file 
from flask_api import FlaskAPI, status, exceptions
import os, json 
import threading, requests
from werkzeug.utils import secure_filename
import Algo2

app = Flask(__name__)

@app.route('/') 
def index(): 
	return "Flask server" 

@app.route('/getStatus', methods = ['GET','POST']) 
def severity():
    req_data = request.get_json()
    print(req_data)
    result=Algo2.fetchStatus(req_data[0],req_data[1],req_data[2])
    print(type(result))
    #result=Predict.predict(text)

    # result=Predict.predict(req_data["text"])
    print(result)    
    # result=json.dumps(str(result))
    return jsonify({'msg': 'success','result':result})

def callToAlgoAPI():
    # requests.post('http://localhost:2900/ambulance/triggerAlgo')
    requests.post('https://health-express.herokuapp.com/ambulance/triggerAlgo')
    print("Happening!!")
    threading.Timer(15.0, callToAlgoAPI).start()

threading.Timer(15.0, callToAlgoAPI).start()


if __name__ == "__main__": 
	app.run(threaded=True, port = int(os.environ.get('PORT', 5000)))

