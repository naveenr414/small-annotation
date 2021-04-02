import pickle
from sklearn.cluster import KMeans
import numpy as np
import random

categories = pickle.load(open("kmeans_subcategories.p","rb"))
category_list = list(categories.keys())

def get_random_question(category,subcategory,num):
    question_list = categories["{}_{}".format(category,subcategory)]
    return random.sample(question_list[num],1)[0]




