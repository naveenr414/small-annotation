import pickle
from sklearn.cluster import KMeans
import numpy as np
import random

categories = pickle.load(open("kmeans_subcategories.p","rb"))
category_list = list(categories.keys())

def get_random_question(category,num):
    return random.sample(categories[category][num],1)[0]

