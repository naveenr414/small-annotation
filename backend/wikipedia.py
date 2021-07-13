import pickle
from sklearn.cluster import KMeans
import numpy as np
import json



questions = json.load(open("qanta.train.2018.04.18.json"))['questions']#+json.load(open("qanta.test.2018.04.18.json"))['questions']+json.load(open("qanta.dev.2018.04.18.json"))['questions']


pages = set()


categories = []
subcategories = {}
num_subcategory = {}

for i in questions:
    if i['category'] == 'Mythology':
        pages.add(i['page'])

for i in questions:
    if i['category'] not in subcategories:
        categories.append(i['category'])
        subcategories[i['category']] = ['Any']

    if i['subcategory'] not in subcategories[i['category']]:
        subcategories[i['category']].append(i['subcategory'])
        num_subcategory["{}_{}".format(i['category'],i['subcategory'])] = 0
    
    num_subcategory["{}_{}".format(i['category'],i['subcategory'])] += 1

def get_buckets(k,pages,question_ids):
    x_vals = [i for i in pages if i in wikipedia_info]
    y_vals = np.array([wikipedia_info[i] for i in x_vals])

    kmeans = KMeans(n_clusters=k)
    kmeans.fit(y_vals)
    y_kmeans = kmeans.predict(y_vals)
    buckets = {}
    for i in range(k):
                    buckets[i] = []
    for i in range(len(x_vals)):
                    buckets[y_kmeans[i]].append(question_ids[i])
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
        


def create_subcategories():
    categories = {}

    for i in questions:
        if i['category'] not in categories:
            categories[i['category']] = []
        if "{}_{}".format(i['category'],i['subcategory']) not in categories:
            categories["{}_{}".format(i['category'],i['subcategory'])] = []
        categories[i['category']].append((i['page'],i['qanta_id']))
        categories["{}_{}".format(i['category'],i['subcategory'])].append((i['page'],i['qanta_id']))

    buckets = {}
    k =  4

    for i in categories:
        a,b = zip(*categories[i])
        if len(a)>k*k and (i == "Mythology_Norse" or "Norse" not in i):
            buckets[i] = get_buckets(k,a,b)

    pickle.dump(buckets,open('kmeans_subcategories.p','wb'))
    return buckets

