#!/usr/bin/env python
# coding: utf-8

# # Ambulance Scheduling Algorithm
# ![ambulance-108102ambulancesolutionforhealthcallcentre_1_o.jpg](attachment:ambulance-108102ambulancesolutionforhealthcallcentre_1_o.jpg)
# 
# * This algorithm schedules the ambulance to the patient.
# * It takes severity of the patient predicted using AutoEncoder model and location of the patient and ambulance driver as two parameters.
# * When severity of two or more patients are different, it serves the patient first who is more critical.
# * When severity of two or more patients are same, it serves the patient first who is nearest.
# * Loop runs untill there are no available ambulance.

# In[1]:


# In below patient_severity dictionary, we will be having patients unique id in key and their severity in value.
from operator import itemgetter

def fetchStatus(patient_severity,ambulance_distance):
    #patient_severity = {0:1,1:1,2:0,3:0}
    patient_severity_1 = {}
    patient_severity_0 = {}

    for k,v in patient_severity.items():
        if v==1:
            patient_severity_1[k] = v
        elif v==0:
            patient_severity_0[k] = v

# keys : patients id
# values : Severity


# In[2]:


# Now, we must have time required for ambulance to reach to every patient.

#ambulance_distance = {0:{0:1,1:4,2:9,3:2},1:{0:2,1:7,2:3,3:4},2:{0:3,1:4,2:1,3:9}}

# keys : ambulace id
# values : time from each patient in queue


# In[3]:


## ans format

# key : patient id
# value : ambulance id
    ans_dic = {}
    while(len(ambulance_distance)>0):
          
        if(len(patient_severity_1)>0 or len(patient_severity_0)>0):
    
        
            dist_patient = []
        
            if(len(patient_severity_1)>0):
            
                for k,v in patient_severity_1.items():
                
                    for k_a, v_a in ambulance_distance.items():
                    
                        dist_patient.append([k_a,k,v_a[k]])
                
                dist_patient = sorted(dist_patient, key=itemgetter(2)) 
                patient_severity_1.pop(dist_patient[0][1])
                ambulance_distance.pop(dist_patient[0][0])
            
            elif(len(patient_severity_0)>0):
                for k,v in patient_severity_0.items():
                
                    for k_a, v_a in ambulance_distance.items():
                    
                        dist_patient.append([k_a,k,v_a[k]])
                
                dist_patient = sorted(dist_patient, key=itemgetter(2)) 
                patient_severity_0.pop(dist_patient[0][1])
                ambulance_distance.pop(dist_patient[0][0])
            
            ans_dic[dist_patient[0][1]] = dist_patient[0][0]
        
        else:
            break


# In[4]:


    return ans_dic


# In[ ]:




