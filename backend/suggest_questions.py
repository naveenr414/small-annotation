import pickle
from sklearn.cluster import KMeans
import numpy as np
import random

categories = pickle.load(open("kmeans_subcategories.p","rb"))
category_list = list(categories.keys())

def get_random_question(category,num,user_topics):
    num_mentions = {}
    total_time = {}

    for i in user_topics:
        if i['topic'] not in num_mentions:
            num_mentions[i['topic']]= 0
            total_time[i['topic']] = 0.01
        num_mentions[i['topic']]+=1
        total_time[i['topic']]+=i['time']

    print(num_mentions)
    print(total_time)

    exploit = random.random()

    if exploit>0.5 and len(num_mentions)>5:
        best_category = min([(num_mentions[i]/total_time[i],i) for i in total_time])[1]
        print("Exploiting {}".format(best_category))
        return random.sample(categories[best_category+"_"][random.randint(0,3)],1)[0]
    else:
        category = random.sample(list(set([i for i in categories if i[-1] == '_'])),1)[0].replace("_","")
        print("Exploring {}".format(category))
        return random.sample(categories[category+"_"][random.randint(0,3)],1)[0]
    
