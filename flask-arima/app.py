from flask import Flask, jsonify, request, render_template, redirect, url_for,send_file 
from flask_api import FlaskAPI, status, exceptions
import os, json 
from werkzeug.utils import secure_filename
import Predict
# import statsmodels.api as sm
# import matplotlib.pyplot as plt
# from statsmodels.tsa.seasonal import seasonal_decompose



app = Flask(__name__)

@app.route('/') 
def index(): 
	return "Flask server" 

@app.route('/getForecast', methods = ['GET','POST']) 
def forecast():
    req_data = request.get_json()
    #print(req_data)
    result=Predict.predict(req_data[0])
    #print(result)
    #result=Predict.predict(req_data['input'])
    # print(type(result))
    # result=Predict.predict(text)

    # result=Predict.predict(req_data["text"])
    # print(result)    
    # result=json.dumps(str(result))
    return jsonify({'msg': 'success','result':result})

if __name__ == "__main__": 
	app.run(threaded=True, port = int(os.environ.get('PORT', 5000)))