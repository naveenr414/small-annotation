from fastapi import FastAPI
import spacy
from spacy.tokenizer import Tokenizer
from spacy.lang.en import English
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel  # pylint: disable=no-name-in-module
import json
import time
import bisect
import pickle
from nltk.tokenize import WhitespaceTokenizer
import os.path

app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:2020",
    "http://localhost:1234",
    "http://quenya.umiacs.umd.edu:3000",
    "http://quel.cs.umd.edu:3000",
    "http://quel.cs.umde.du",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.ngrok\.io",
    allow_credentials=True,
    allow_methods=["*", "POST","GET"],
    allow_headers=["*", "POST","GET"],
)

class NounPhrase(BaseModel):
    str_entity_names: str
    str_entity_spans: str
    username: str
    question_id: int

nlp = spacy.load("en_core_web_sm")
tokenizer = Tokenizer(nlp.vocab)

start = time.time()
wiki = pickle.load(open("all_wiki.p","rb"))
names = sorted(wiki.keys())
print("Took {} time".format(time.time()-start))

@app.get("/api/")
async def root():
    return {"message": "Hello World"}

def chunk_words(question):
    original_doc = nlp(question)

    words = [token.text for token in original_doc]
    indexes = [token.idx for token in original_doc]
    return words,indexes

def get_word_indices(question):
    span_generator = WhitespaceTokenizer().span_tokenize(question)
    return [span for span in span_generator]

def load_annotations(person_name):
    try:
        f = open("../data/{}_annotations.csv".format(person_name)).read().split("\n")[1:-1]
    except FileNotFoundError:
        return {}

    annotations = {}

    for i in f:
        s = i.split(",")
        question_num = int(s[0])
        start = int(s[1])
        end = int(s[2])
        annotation = s[3]
        is_nel = s[4] == 'True'
        if question_num not in annotations:
            annotations[question_num] = []
        annotations[question_num].append((start,end,annotation,is_nel))

    return annotations

def write_annotations_dict(person_name,d):
    w = open("../data/{}_annotations.csv".format(person_name),"w")

    print("Writing {}".format(d))

    w.write("question_num,start,end,annotation,is_named_entity\n")
    for k in d:
        for i in d[k]:
            w.write("{},{},{},{},{}\n".format(k,i[0],i[1],i[2],i[3]))
    w.close()
        

def write_annotation(question_num,start,end,annotation,is_nel,person_name):
    l = load_annotations(person_name)
    if question_num not in l:
        l[question_num] = []
    l[question_num].append((start,end,annotation,is_nel))
    
def noun_indices(question):
    original_doc = nlp(question)
    all_noun_phrases = []

    index = 0
    nounIndices = []
    for token in original_doc:
        # print(token.text, token.pos_, token.dep_, token.head.text)
        if token.pos_ == 'NOUN' or token.pos_ == "PROPN":
            nounIndices.append(index)
        index = index + 1
    word_indices = [(token.text,token.i) for token in original_doc]
    character_indices = [(token.text,token.idx) for token in original_doc]


    texts = []
    spans_seen = []
    for idxValue in nounIndices:
        doc = nlp(question)
        span = doc[doc[idxValue].left_edge.i : doc[idxValue].right_edge.i+1]

        for token in span:
            if token.dep_ in ['dobj','pobj','det','nsubj'] or token.pos_ in ["PRON",'PROPN',"NOUN","ADJ","NUM"]:
                char_index = token.idx

                for i in range(len(character_indices)):
                    if(character_indices[i][1] == char_index):
                        start = word_indices[i][1]

                end = doc[idxValue].right_edge.i
                start_context = max(start-3,0)
                end_context = min(end+3,len(original_doc)-1)

                if (start,end) not in spans_seen:
                    spans_seen.append((start,end))
                    texts.append({'context_left':str(original_doc[start_context:start]).strip(),'content':str(original_doc[start:end+1]).strip(),'context_right':str(original_doc[end+1:end_context+1]).strip()})

    spans_seen,texts = zip(*sorted(zip(spans_seen,texts)))

    spans_seen = []
    texts = []

    return {'spans':list(spans_seen),'text':list(texts)}

def get_annotations(username,question_num):
    names = '[""]'
    spans = '[[]]'
    print("Getting annotations for {} {}".format(username,question_num))

    if os.path.isfile("../data/{}_{}.txt".format(username,question_num)):
        f = open("../data/{}_{}.txt".format(username,question_num)).read().strip().split("\n")
        names = f[0]
        spans = f[1]
    return {'names':names,'spans':spans}

@app.get("/api/questions")
def get_questions():
    print("Get questions")
    f = open("questions.txt").read().strip().split("\n")
    g = open("answers.txt").read().strip().split("\n")
    return {'questions':f,'answers':g}

@app.get("/api/question_num/{question_num}")
def get_question_num(question_num):
    return open("questions.txt").read().strip().split("\n")[int(question_num)]

@app.get("/api/noun_phrases/{question_num}")
def get_noun_phrase_num(question_num):
    name = question_num.split("_")[1].lower().strip()
    question_num = question_num.split("_")[0]

    annotation_data = get_annotations(name,question_num)
    
    l = load_annotations(name)
    
    f = open("questions.txt").read().strip().split("\n")[int(question_num)]
    annotations = []
    if int(question_num) in l:
        annotations = l[int(question_num)]

    formatted_annotations = {}
    formatted_checked = {}

    w,word_indices = chunk_words(f)
    n = noun_indices(f)


    if int(question_num) in l:
        for i in l[int(question_num)]:
            if (i[0],i[1]) not in n['spans']:
                n['spans'].append((i[0],i[1]))
                words = ' '.join(w[i[0]:i[1]+1])
                left_context = ' '.join(w[max(0,i[0]-5):i[0]])
                right_context = ' '.join(w[i[1]+1:min(len(w),i[1]+6)])
                n['text'].append({'content':words,'context_left':left_context,'context_right':right_context})
    spans_seen = list(n['spans'])
    texts = list(n['text'])
    if(len(texts)>0):
        spans_seen,texts = zip(*sorted(zip(spans_seen,texts)))

    n = {'spans':list(spans_seen),'text':list(texts)}


    for i in range(len(n['spans'])):
        for j in range(len(annotations)):
            if n['spans'][i][0] == annotations[j][0] and n['spans'][i][1] == annotations[j][1]:
                formatted_annotations[i] = annotations[j][2]
                formatted_checked[i] = annotations[j][3]
    
    return {'words':w,'indices':word_indices,'nouns':n,'annotations':annotations,'formatted_annotations':formatted_annotations,'formatted_checked':formatted_checked,
            'entity_names':annotation_data['names'],'entity_spans':annotation_data['spans']}

@app.post("/api/submit")
async def write_phrases(noun_phrases: NounPhrase):
    question_id = noun_phrases.question_id
    username = noun_phrases.username
    w = open("../data/{}_{}.txt".format(username,question_id),"w")
    w.write(noun_phrases.str_entity_names)
    w.write("\n")
    w.write(noun_phrases.str_entity_spans)
    w.write("\n")
    w.close()
    print("Wrote to {}_{}".format(username,question_id))

@app.get("/api/autocorrect/{word}")
def get_autocorrect(word):
    word = word.replace("_"," ")
    word = word.replace("&","&amp;")
    name_one = bisect.bisect_left(names,word)
    name_two = bisect.bisect_right(names,word+"z")
    if(name_two-name_one<10**4):
        popular_names = [i for i in sorted(names[name_one:name_two],key=lambda x: wiki[x][1],reverse=True) if i in wiki][:5]
    else:
        popular_names = names[name_one:name_one+5]

    if word in wiki and word not in popular_names:
        popular_names+=[word]
    
    return [(i.replace("&amp;","&"),wiki[i][0]) for i in popular_names]+[("no entity","")]+[("no entity character","")]+[("no entity literature","")]

