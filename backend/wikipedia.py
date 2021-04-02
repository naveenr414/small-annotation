import pickle
from sklearn.cluster import KMeans
import numpy as np
import json

questions = json.load(open("qanta.train.2018.04.18.json"))['questions']+json.load(open("qanta.test.2018.04.18.json"))['questions']+json.load(open("qanta.dev.2018.04.18.json"))['questions']


pages = set()


for i in questions:
    if i['category'] == 'Mythology':
        pages.add(i['page'])

def get_buckets(k,pages):
    x_vals = [i for i in pages if i in wikipedia_info]
    y_vals = np.array([wikipedia_info[i] for i in x_vals])

    kmeans = KMeans(n_clusters=k)
    kmeans.fit(y_vals)
    y_kmeans = kmeans.predict(y_vals)
    buckets = {}
    for i in range(k):
                    buckets[i] = []
    for i in range(len(x_vals)):
                    buckets[y_kmeans[i]].append(x_vals[i])
    return buckets


wikipedia_info = pickle.load(open("wikipedia_vectors_small.p","rb"))

l = {}
for i in questions:
    if i['page'] in wikipedia_info:
        if i['category'] not in l:
            l[i['category']] = {}

        if i['subcategory'] not in l[i['category']]:
            l[i['category']][i['subcategory']] = []
        l[i['category']][i['subcategory']].append({'answer':i['page'],'id':i['qanta_id']})
        


g = get_buckets(4,pages)

