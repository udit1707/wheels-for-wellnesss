import pickle
import pandas as pd
from pandas.tseries.offsets import DateOffset
import joblib
from pmdarima.arima import auto_arima




def predict(x):
    df = pd.read_csv("covid_19_delhi.csv")
    df.drop(["Sno","Time","ConfirmedIndianNational","ConfirmedForeignNational","Cured","Deaths"],axis=1,inplace=True)
    df_delhi = df[df["State/UnionTerritory"]=="Delhi"].copy()
    df_delhi.drop("State/UnionTerritory",axis=1,inplace=True)
    df_delhi["Date"] = pd.to_datetime(df_delhi["Date"])
    df_delhi.set_index("Date",inplace=True,drop=True)
    df_data = df_delhi.copy()
    extra_dates = [df_data.index[-1] + DateOffset(days=d) for d in range (1,8)]
    df_new = pd.DataFrame(index=extra_dates,columns=df_data.columns)

    loaded = joblib.load("final_model_arima.sav")
    curr = df_data.tail(1)["Confirmed"][0]
    li_new = list(loaded.predict(n_periods=len(df_new)))
    li_new.sort(reverse=True)
    print(f'Current cases are {curr} and maximum of predicted cases in further week is {li_new[0]}')

    # x={'1':100,'2':500,'3':1000}
    
    print(x)    
    for key in x:
        if curr > li_new[0]:
            x[key]=0
            #print("Predicting decrease in cases")
        else:
            if (li_new[0]-curr)>x[key]:
                x[key]=1
            else:
                x[key]=0
            #print(f'Predicting increase in cases with {li_new[0]-curr}')
     
    return x

    # with open('arima.pkl', 'rb') as pkl:
    #     loaded = pickle.load(pkl)
    #     curr = df_data.tail(1)["Confirmed"][0]
    #     li_new = list(loaded.predict(n_periods=len(df_new)))
    #     li_new.sort(reverse=True)
    #     print(f'Current cases are {curr} and maximum of predicted cases in further week is {li_new[0]}')

    #     if curr > li_new[0]:
    #         print("Predicting decrease in cases")
    #     else:
    #         print(f'Predicting increase in cases with {li_new[0]-curr}')