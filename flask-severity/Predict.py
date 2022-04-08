from joblib import dump, load
import numpy as np
from tensorflow.keras.models import model_from_json
## First perform scaling on input data

# input1=[1,4,5,6,7]
# input1 = np.array(input1)
# sc = StandardScaler()
# input1_rescaled = sc.fit_transform(input1.reshape(-1,1))

# input1_pred = autoenco_model.predict(input1_rescaled)
# mse_new = np.mean(np.power(input1_rescaled - input1_pred, 2), axis=1)

# thresh = 3.6
# y_ans = 0
# if(mse_new>thresh):
#     y_ans =1

def predict(x):
    # inp=np.array(x)
    json_file = open('model.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    loaded_model = model_from_json(loaded_model_json)

    loaded_model.load_weights("modelweights.h5")
    loaded_model.compile(metrics=['accuracy'],
                    loss='mean_squared_error',
                    optimizer='adam')
    print(x)
    sc=load('std_scaler.bin')

    input1 = np.array(x)
    input1=input1.reshape(1,24)
    input1 = sc.transform(input1)

    input1_pred = loaded_model.predict(input1)
    mse_new = np.mean(np.power(input1 - input1_pred, 2), axis=1)
    thresh = 3.6
    y_ans = 0
    if(mse_new>thresh):
        y_ans =1


    # xgBoostt=joblib.load('XGBoost_model.pkl')
    
    # pred=xgBoostt.predict(np.array([x]))
    # np.array([[3,1,1,0,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,1,1,1,1,1]])
#)
    return y_ans


# xgBoostt=joblib.load('XGBoost_model.pkl')

# pred=xgBoostt.predict(np.array([[3,1,1,0,0,1,0,1,0,1,0,1,0,1,1,0,0,0,0,1,1,1,1,1]]))

# print("Output")
# print(pred)