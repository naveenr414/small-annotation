import json
import csv
import unidecode
import nltk
from collections import Counter
import spacy

nlp = spacy.load("en_core_web_sm")

def tokenize(d):
    doc = nlp(d)
    tokenizations = [[s.start_char, s.end_char] for s in doc.sents]
    return tokenizations

unmatched = json.load(open("qanta.unmapped.2021.07.25.json"))['questions']
print("Loaded unmatched")
redirects = {}
raw_pages = {}
num_lines = 0

with open('all_wiki_redirects.csv',encoding='utf-8') as csvfile:
    line = csvfile.readline()

    while line != '':
        split = line.split('","')
        option_one = split[0][1:]
        option_two = split[1].strip()[:-1]
        option_one = option_one.replace('\\"','"').replace("_"," ")
        option_two = option_two.replace('\\"','"').replace("_"," ")
        num_lines+=1
        redirects[unidecode.unidecode(option_one).lower()] = option_two
        raw_pages[unidecode.unidecode(option_two).lower()] = option_two

        line = csvfile.readline()

print("Loaded redirects")

        
wiki_pages = open("pagecounts-2020-09-01",encoding='utf-8')
line = wiki_pages.readline()
while line.split(" ")[0] != "en.z":
    line = wiki_pages.readline()

while line.split(" ")[0] == "en.z":
    article = line.split(" ")[1]
    if "User" != article[:4]:
        raw_pages[unidecode.unidecode(article).lower()] = article
    line = wiki_pages.readline()

print("Loaded in all wiki pages")

def works(word):
    return word in raw_pages or word in redirects
ps = nltk.PorterStemmer()

mistakes = 0
matchings = {}
num_per = {'easy': 0, 'w/o author': 0, 'remove brace': 0, 'plural': 0, 'subset': 0}
for question in unmatched:
    raw_answer = question['answer']
    answer = unidecode.unidecode(question['answer'].lower().strip("!?")).replace('"','')
    if works(answer):
        matchings[raw_answer] = answer
        num_per['easy']+=1
        continue
    potential_answer = answer.split("<")[0].split("[")[0].split("(")[0].strip()
    if works(potential_answer):
        matchings[raw_answer] = potential_answer
        num_per['w/o author']+=1
        continue
    remove_middle = potential_answer.replace("{","").replace("}","")
    if works(remove_middle):
        matchings[raw_answer] = remove_middle
        num_per['remove brace']+=1
        continue

    singular = ps.stem(remove_middle)
    if works(singular):
        matchings[raw_answer] = singular
        num_per['plural']+=1
        continue

    if len(remove_middle)>0 and remove_middle[-1] == "s":
        singular = remove_middle[:-1]

        if works(singular):
            matchings[raw_answer] = singular
            num_per['plural']+=1
            continue

    words = remove_middle.split(" ")
    longest = 0
    autocorrect = ""
    
    # prefixes
    for i in range(1,len(words)):
        if works(" ".join(words[:i])):
            longest = i
            autocorrect = " ".join(words[:i])
        if works(" ".join(words[-i:])):
            longest = i
            autocorrect = " ".join(words[-i:])

    if longest>0:
        matchings[raw_answer] = autocorrect
        num_per['subset']+=1
        continue

    if raw_answer in matchings:
        continue

num_works = 0
for i in unmatched:
    if i['answer'] in matchings:
        wiki_name = matchings[i['answer']]
        if wiki_name != '':
            if wiki_name in redirects:
                i['page'] = redirects[wiki_name].replace(" ","_")
                num_works+=1
            elif wiki_name in raw_pages:
                i['page'] = raw_pages[wiki_name].replace(" ","_")
                num_works+=1

all_questions = [i for i in unmatched if i['page']!='']

print("Tokenizing")
for i in all_questions:
    i['tokenizations'] = tokenize(i['text'])

print("Done tokenizing")

json.dump({'questions': all_questions},open("mostly_right.json","w"))
