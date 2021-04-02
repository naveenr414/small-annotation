import pickle
from sklearn.cluster import KMeans
import numpy as np
import random

def get_buckets(k,pages):
    x_vals = [i['answer'] for i in pages]
    ids = [i['id'] for i in pages]
    y_vals = np.array([wikipedia_info[i] for i in x_vals])

    kmeans = KMeans(n_clusters=k)
    kmeans.fit(y_vals)
    y_kmeans = kmeans.predict(y_vals)
    buckets = {}
    for i in range(k):
                    buckets[i] = []
    for i in range(len(x_vals)):
                    buckets[y_kmeans[i]].append(ids[i])
    return buckets

def get_random_question():
    return buckets[bucket_num][random.randint(0,len(buckets[bucket_num])-1)]

k = 4
bucket_num = random.randint(0,k-1)

category = "Science"
subcategory = "Chemistry"

wikipedia_info = pickle.load(open("wikipedia_vectors_small.p","rb"))
question_data = pickle.load(open("question_categories.p","rb"))

questions = question_data[category][subcategory]

buckets = get_buckets(k,questions)


