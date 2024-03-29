from fastapi import FastAPI
import spacy
from spacy.tokenizer import Tokenizer
from spacy.lang.en import English
from starlette.middleware.cors import CORSMiddleware
from security_config import hash_password
from pydantic import BaseModel  # pylint: disable=no-name-in-module
import json
import time
import bisect
import pickle
from nltk.tokenize import WhitespaceTokenizer
import os.path
from db import Database
from fpdf import FPDF
from fastapi.responses import FileResponse
import suggest_questions
import random
import security
from sqlalchemy import func
from collections import Counter
import unidecode
from scipy.spatial.distance import cosine
import hashlib

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
app.include_router(security.router, prefix="/quel/token")

class NounPhrase(BaseModel):
    str_entity_names: str
    str_entity_spans: str
    username: str
    question_id: int
    time: int

class Preference(BaseModel):
    username: str
    category: str
    difficulty: str

nlp = spacy.load("en_core_web_sm")
tokenizer = Tokenizer(nlp.vocab)
all_questions_year = pickle.load(open("year_freq.p","rb"))

user_category = {}
user_difficulty = {}
last_question = {}

start = time.time()
print("Starting loading of pickle file")
wiki = {}#pickle.load(open("all_wiki.p","rb"))
names = []#sorted(wiki.keys())
print("Took {} time".format(time.time()-start))

wikipedia_embeddings = pickle.load(open("k_closest_wiki.p","rb"))

start = time.time()
db = Database()
print("Took {} time to create databases".format(time.time()-start))

@app.get("/quel/")
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

def get_annotations(username,question_num,question_data):
    mentions = db.get_mentions_by_user(username,str(question_num))

    if len(mentions) == 0:
        mentions = db.get_mentions_by_user("system",question_num)
    
    answer = question_data['wiki_answer'].replace(" ","_").lower()
    names = ["","{}".format(answer)]
    spans = [[],[]]

    spans = {}
    names = {}
    names[0] = ""
    names[1] = answer

    spans[0] = [{'start':-1,'end':-1,'content':'','confidence':1}]
    spans[1] = [{'start':-1,'end':-1,'content':'','confidence':1}]

    num_to_wiki = {}

    wiki_pages = set()

    if len(mentions)>0:
        names = {0:""}
        spans = {0:[]}

        for i in mentions:
            if i['number'] not in names:
                names[i['number']] = i['wiki_page']
                spans[i['number']] = []
                wiki_pages.add(i['wiki_page'])
            spans[i['number']].append({'start':i['start'],'end':i['end'],'content':i['content'],'confidence':i['confidence']})

        if answer not in wiki_pages:
            names[0.5] = answer
            spans[0.5] = []

    keys = sorted(list(names.keys()))

    real_names_keys = {}
    real_names = []
    real_spans = []

    num = 0
    for i in keys:
        if names[i] not in real_names_keys or 'no_entity' in names[i]:
            real_names_keys[names[i]] = num
            real_names.append(names[i])
            real_spans.append(spans[i])
            num+=1
        else:
            real_spans[real_names_keys[names[i]]]+=spans[i]
    
        

    print("Names are {}".format(names))
    
    return {'names':json.dumps(real_names),
            'spans':json.dumps(real_spans)}

@app.get("/quel/dump_data/{password}")
def dump_data(password):
    print("Password {}".format(password))
    if hashlib.md5(password.encode()).hexdigest() == hash_password:
        all_mentions = db.get_all_mentions()
        for i in all_mentions:
            del i['user']
            del i['confidence']

        all_mentions = [i for i in all_mentions if i['question']!=-1]

        w = open("dumped_data.jsonl","w")
        for i in all_mentions:
            w.write("{}\n".format(json.dumps(i)))
        w.close()
        return FileResponse(path="dumped_data.jsonl", filename="dumped_data.jsonl", media_type='text')

    

@app.get("/quel/get_id/{entity}")
def get_id(entity):
    return (db.get_id(entity)+[0])[0]

@app.get("/quel/question_num/{question_num}")
def get_question_num(question_num):
    return db.get_question(int(question_num))

def k_closest(entity,k):
    if unidecode.unidecode(entity) in wikipedia_embeddings:
        return wikipedia_embeddings[unidecode.unidecode(entity)]
    return []

def load_question(name,question_num):
    question_data = db.get_question(int(question_num))

    last_question[name] = int(question_num)

    w = ["Empty"]
    word_indices = [0]
    entity_names = "[]"
    entity_list = "[]"
    question = "No Question"
    answer = "No Answer"
    metadata = {'difficulty': '', 'category': '', 'year': '', 'tournament': ''}

    if question_data != {}:
        question = question_data['question']
        for i in metadata:
            metadata[i] = question_data[i]
        answer = question_data['answer']
        w,word_indices = chunk_words(question)
        db.user_starts(name,int(question_num))

        annotation_data = get_annotations(name,question_num,question_data)
        entity_names = json.dumps(json.loads(annotation_data['names'])+[""])
        entity_list = json.dumps(json.loads(annotation_data['spans'])+[[]])

    answer = bytes(unidecode.unidecode(answer),'ascii').decode("unicode-escape")
    question = bytes(unidecode.unidecode(question),'ascii').decode('unicode-escape')


    return {'words':w,'indices':word_indices,
            'entity_names':entity_names,
            'entity_list':entity_list,
            'loaded_question':question_num,
            'question': unidecode.unidecode(question),
            'answer': unidecode.unidecode(answer),
            'question_num': question_num,
            'metadata': metadata}

@app.get("/quel/user_mentions/{username}")
def get_all_user_mentions(username):
    return db.get_user_mentions(username)[::-1]

@app.get("/quel/user/{token}")
def get_user_info(token):
    username = security.decode_token(token)
    edits = db.get_all_useredits(username)
    return {'username':security.decode_token(token),'edits':edits}

@app.get("/quel/noun_phrases_suggested/{question_num}")
def get_noun_phrase_suggested_num(question_num):
    print("Getting suggested")
    start = time.time()
    name = "_".join(question_num.split("_")[1:])
    question_num = question_num.split("_")[0]

    name = security.decode_token(name)
    all_user_topics = db.get_all_user_topics_user(name)

    question_num = suggest_questions.get_random_question(all_user_topics)
    return load_question(name,question_num)

@app.get("/quel/noun_phrases_last/{username}")
def get_last_question(username):
    print("Getting last with {}\n\n\n".format(username))
    real_name = security.decode_token(username)
    if real_name not in last_question:
        return get_noun_phrase("{}_{}".format(1,username))
    return load_question(real_name,last_question[real_name])

@app.get("/quel/noun_phrases_selected/{question_num}")
def get_selected_question(question_num):
    username = "_".join(question_num.split("_")[1:])
    question_num = int(question_num.split("_")[0])
    print("Getting selected with {} {}".format(question_num,username))
    real_name = security.decode_token(username)
    return load_question(real_name,question_num)

@app.get("/quel/website_works")
def website_works():
    answer = db.get_answer(0)
    return answer == "queequeg"

@app.get("/quel/responses")
def responses():
    return db.get_num_responses()

@app.get("/quel/get_sample_question")
def get_sample_question():    
    return load_question("nav.j.raman@gmail.com",-1)

@app.get("/quel/noun_phrases/{question_num}")
def get_noun_phrase(question_num):
    start = time.time()
    print("QUESTION NUM {}".format(question_num))
    name = security.decode_token("_".join(question_num.split("_")[1:]))

    print(user_category,user_difficulty)

    if name not in user_category:
        user_category[name] = 'Any'
        user_difficulty[name] = 'Any'

    print(user_category,user_difficulty)


    question_num = db.get_random_question(user_category[name],user_difficulty[name])
    while db.get_question(question_num) == {}:
        question_num = db.get_random_question(user_category[name],user_difficulty[name])
    return load_question(name,question_num)

@app.get("/quel/category/{username}")
def get_category(username):
    username = security.decode_token(username)
    if username not in user_category:
        user_category[username] = "Any"
        user_difficulty[username] = "Any"
    return "{}_{}".format(user_category[username],user_difficulty[username])



@app.get("/quel/entity/{entity_name}")
def get_questions_entity(entity_name):
    entity_name = unidecode.unidecode(entity_name)
    print("Getting entity name! {}".format(entity_name))
    start = time.time()
    entity_name = entity_name.strip("_").strip()
    print("Entity name {}".format(entity_name))
    e = entity_name.split("_")
    category = e[-2]
    difficulty = e[-1]
    entity_name = "_".join(e[:-2]).strip("_")
    print(entity_name)
    print("Splitting up entity took {}".format(time.time()-start))
    start = time.time()
    questions = db.get_questions_by_entity(entity_name)
    print("Getting questions took {} time".format(time.time()-start))
    start = time.time()
    locations = questions['locations']
    questions = questions['questions']
    print(locations)
    print(questions)
    common_entities = db.get_entities(questions,category,difficulty)
    temp = []
    for i in common_entities:
        if i.lower()!=entity_name.replace("_", " ").lower().strip():
            if i.lower() not in ["ftps","file transfer protocol"]:
                temp.append(i)
    print("Getting common entities took {} time".format(time.time()-start))
    start = time.time()
    embedding_closest = k_closest(entity_name.lower(),10)
    embedding_closest = [i.replace("_", " ") for i in embedding_closest]
    common_entities = list(dict.fromkeys(embedding_closest+temp[:10]))
    print("Getting close embeddings {}".format(time.time()-start))
    start = time.time()
    common_entity_definitions = db.multiple_definitions(common_entities)
    ids = common_entity_definitions['ids']
    common_entities = common_entity_definitions['names']
    common_entity_definitions = common_entity_definitions['definitions']
    print("Getting info on these entities took {} time".format(time.time()-start))
    start = time.time()
    num_low_confidence,user_annotations = db.get_low_confidence_entities(questions)
    print("Time to get low confidence was {}".format(time.time()-start))

    start = time.time()
    
    results = db.get_question_answers(questions,category,difficulty)

    category_freq = dict(Counter([i['category'] for i in results]))
    
    print("Getting question answers took {} time".format(time.time()-start))
    start = time.time()
    year_freq = Counter([i['year'] for i in results])
    for year in range(2005,2021):
        if year not in year_freq:
            year_freq[year] = 0
        else:
            year_freq[year]/=all_questions_year[year]

    years = [year_freq[i] for i in range(2005,2021)]

    print("Getting year_freq took {} time".format(time.time()-start))
    start = time.time()

    chunked = {}
    for i in range(len(results)):
        chunked[results[i]['id']] = chunk_words(results[i]['question'])[1]

    for i in locations:
        if locations[i][0]!=-1:
            if i in chunked:
                real_start = chunked[i][locations[i][0]]
                if locations[i][1]+1 != len(chunked[i]):
                    end = chunked[i][locations[i][1]+1]
                else:
                    end = chunked[i][locations[i][1]]
                locations[i] = (real_start,end)
    print("Post processing took {} time".format(time.time()-start))

    entity_id = (db.get_id(entity_name.replace(" ","_").lower())+[0])[0]

    print("Got entity id")
    
    return {'results':results,'entities':common_entities,'year_freq': years,'definition':db.get_definition(entity_name),
            'common_definitions':common_entity_definitions,'categories':category_freq, 'entity_id': entity_id,
            'common_ids':ids, 'locations': locations, 'low_confidence': num_low_confidence, 'user_annotations': user_annotations}

@app.get("/quel/random_question/{question}")
def get_random_question(question):
    q =question.split("_")
    difficulty = q[1]
    category = q[0]
    return db.get_random_question(category,difficulty)

@app.get("/quel/tournament_entity/{entity_name}")
def get_questions_entity(entity_name):
    e = entity_name.split("_")
    category = e[-1]
    tourney = e[-2]
    year = e[-3]
    entity_name = "_".join(e[:-3]).strip().strip("_")

    results = db.get_tournament_entities(entity_name,tourney,year,category)
    
    
    if entity_name!='':
        chunked = [chunk_words(results['data'][i]['question'])[1] for i in range(len(results['data']))]

        for i in range(len(results['data'])):
            if results['data'][i]['location'][0]!=-1:
                start = chunked[i][results['data'][i]['location'][0]]
                if results['data'][i]['location'][1]+1 != len(chunked[i]):
                    end = chunked[i][results['data'][i]['location'][1]+1]
                else:
                    end = chunked[i][results['data'][i]['location'][1]]
                results['data'][i]['location'] = (start,end)

    return results

@app.get("/quel/similar/{question_id}")
def get_similar_questions(question_id):
    print("HERE!!!")
    username = security.decode_token("_".join(question_id.split("_")[:-2]))
    difficulty = question_id.split("_")[-1]
    question_id = int(question_id.split("_")[-2])
    mentions = db.get_mentions_by_user(username,str(question_id))
    wiki_pages = [db.get_answer(str(question_id)).replace(" ","_")]
    wiki_pages+=[i[0] for i in sorted(Counter([i['wiki_page'] for i in mentions]).items(),key=lambda k: k[1],reverse=True)[:2]]
    wiki_pages = list(set(wiki_pages))

    similar_questions = db.get_similar_questions(wiki_pages,difficulty)
    
    return similar_questions


@app.get("/quel/tournament/{tournament}")
def get_tournament(tournament):
    start = time.time()
    year,tournament = tournament.split("_")
    tourney_data = db.get_tournament(int(year),tournament)
    categories = tourney_data['categories']
    tourney_data = tourney_data['entities'] 

    print("Searching for {} {} in {} time".format(year,tournament,time.time()-start))
    start = time.time()

    entity_popularity = {}
    for i in tourney_data:
        if i['page'] not in entity_popularity:
            entity_popularity[i['page']] = set()

        entity_popularity[i['page']].add(i['question'])

    data = [(i,len(entity_popularity[i])) for i in entity_popularity if i.lower() not in ['ftps','file_transfer_protocol']]
    data = sorted(data,key=lambda k: k[1],reverse=True)[:20]

    print("Got popular entities in {} time".format(time.time()-start))
    start = time.time()

    gender_counts = [db.get_gender(i) for i in set([j['page'] for j in tourney_data])]
    print("Length is {}".format(len(gender_counts)))
    counter = Counter(gender_counts)
    del counter['None']

    if 'male' not in counter:
        counter['male'] = 0
    if 'female' not in counter:
        counter['female'] = 0

    print("Gender took {} time".format(time.time()-start))
    start = time.time()
    data = [i[0] for i in data]
    common_entity_definitions = db.multiple_definitions(data)

    ids = {}
    data = []
    c = {}

    print(common_entity_definitions)

    j = 0
    for i in common_entity_definitions['ids']:
        if common_entity_definitions['ids'][i] != 0 and i!='':
            ids[i] = common_entity_definitions['ids'][i]
            data.append(i)
            c[i] = common_entity_definitions['definitions'][i]
        j+=1
    
    common_entity_definitions = c

    print("Final part took {} time".format(time.time()-start))

    print("Data {}".format(data))
    return {'data':data,'genders':counter,'definitions': common_entity_definitions,
            'ids': ids,'categories': categories}

@app.post("/quel/user_preferences")
async def update_preferences(preference: Preference):


    name = security.decode_token(preference.username)
    user_category[name] = preference.category
    user_difficulty[name] = preference.difficulty

    print("Setting user preference to {} {}".format(preference.category,preference.difficulty))

@app.post("/quel/submit")
async def write_phrases(noun_phrases: NounPhrase):
    question_id = noun_phrases.question_id
    edit_time = noun_phrases.time
    username = security.decode_token(noun_phrases.username)
    db.remove_mentions(username,int(question_id))
    entity_names = json.loads(noun_phrases.str_entity_names)
    entity_spans = json.loads(noun_phrases.str_entity_spans)

    mentions = []
    last_question[username] = question_id

    entity_to_number = {}

    print("Entity names {}".format(entity_names))

    curr_number = 1
    for i in range(1,len(entity_names)):
        if entity_names[i] not in entity_to_number:
            entity_to_number[entity_names[i]] = curr_number
            curr_number+=1

    print(entity_to_number)

    for i in range(1,len(entity_names)):
        for j in entity_spans[i]:
            mentions.append({'user_id':username,'question_id':question_id,'start':j['start'],
                             'end':j['end'],'wiki_page':entity_names[i],
                             'content':j['content'],'number': entity_to_number[entity_names[i]],'confidence':1})
    db.insert_mentions(mentions)
    db.user_updates(username,int(question_id),mentions)

    # Write the number of new mentions
    topic = db.get_topic(noun_phrases.question_id)
    subtopic = db.get_subtopic(noun_phrases.question_id)
    system_mentions = db.get_mentions_by_user("system",noun_phrases.question_id)
    for j in system_mentions:
        del j['content']
        del j['number']
        j['question'] = noun_phrases.question_id

    system_mentions = ["{}_{}_{}_{}".format(j['question'],j['start'],j['end'],j['wiki_page'].lower()) for j in system_mentions]

    user_mentions = [j for j in mentions if ("{}_{}_{}_{}".format(j['question_id'],j['start'],j['end'],j['wiki_page'].lower())) not in system_mentions]
    num_mentions = len(user_mentions)

    print("Updating user topic with {} time".format(edit_time))

    if num_mentions>0:
        db.update_user_topic(username,noun_phrases.question_id,topic,subtopic,num_mentions,edit_time)

    print("Topic {} unique mentions {}".format(topic,num_mentions))

@app.get("/quel/usertopics/all")
def get_all_usertopics():
    return db.get_all_user_topics()

@app.get("/quel/mentions/all")
def get_all_mentions():
    return db.get_mentions()

@app.get("/quel/edits/all")
def get_all_mentions():
    return db.get_edits()


@app.get("/quel/autocorrect/{word}")
def get_autocorrect(word):
    word = word.replace("&","&amp;")    
    return db.get_autocorrect(word)

@app.get("/quel/definition/{word}")
def get_definition(word):
    return db.get_definition(word)[0]

@app.get("/quel/status")
def status_check():
    if not db:
        return "Error in DB"
    if not db.get_mentions():
        return "Error in selecting from DB"
    if not db.insert_mentions([{'start':-1,'end':-1,'content':'','wiki_page':'','user_id':'test','question_id':0}]):
        return "Error in inserting to DB"
    if not db.remove_mentions('test',0):
        return "Error in deleting from DB"
    if not db.get_autocorrect("john"):
        return "Error with autocorrect"
    if not db.get_id("magna_carta"):
        return "Error with get id"
    if not db.get_question(0):
        return "Error with get question"

    return "No Errors Found"

@app.get("/quel/leaderboard")
def get_leaderboard():
    all_user_topics = db.get_all_user_topics()
    num_mentions = {}
    num_questions = {}

    for i in all_user_topics:
        if i['user_id'] not in num_mentions:
            num_mentions[i['user_id']] = 0
            num_questions[i['user_id']]= 0

        num_mentions[i['user_id']]+=i['num_mentions']
        num_questions[i['user_id']]+=1
    
    l = []
    for i in num_mentions:
        l.append((i,num_mentions[i],num_questions[i]))

    l = sorted(l,key=lambda k: k[1],reverse=True)

    print(l,all_user_topics)

    return l

@app.get("/quel/multipledefinitions/{words}")
def get_multiple_definitions(words):
    common_entities = words.strip().split(" ")
    print(common_entities)
    common_entities = [i.lower() for i in common_entities if len(i)>0 and 'no_entity' not in i]
    common_entity_definitions = db.multiple_definitions(common_entities)
    ids = common_entity_definitions['ids']
    common_entity_definitions = common_entity_definitions['definitions']

    return {'definitions': common_entity_definitions, 'ids': ids}
    
@app.get("/quel/topics/{username}")
def get_topic_distro(username):
    username = security.decode_token(username)
    print("Getting topics for {}".format(username))

    all_user_topics = db.get_all_user_topics_user(username)
    topics = [i['topic'] for i in all_user_topics]
    questions = [i['question_id'] for i in all_user_topics]
    common_entities = db.get_entities(questions,'Any','Any')[:20]
    common_entity_definitions = db.multiple_definitions(common_entities)
    ids = common_entity_definitions['ids']
    common_entity_definitions = common_entity_definitions['definitions']

    c = {}
    id_new = {}

    for i in common_entity_definitions:
        c[i.lower()] = common_entity_definitions[i]
        id_new[i.lower()] = ids[i]

    ids = id_new
    common_entity_definitions = c

    common_entities = [i for i in common_entity_definitions]
    
    return {'topics':Counter(topics),'common_entities':common_entities,
            'common_entity_definitions': common_entity_definitions,
            'common_ids':ids}

@app.get("/quel/pdf_question_nums/{question_nums}")
def pdf_question_nums(question_nums):
    username = "system"
    question_nums = [int(i) for i in question_nums.split("_")]
    return write_pdf_question_nums(username,question_nums)

def write_pdf_question_nums(username,all_questions):
    pdf = FPDF()
    pdf.add_page()

    count = 1

    if len(all_questions) == 0:
        pdf.set_font('Arial','',14)
        pdf.write(5,"No questions annotated")
    
    for question_num in all_questions:
        if count>50:
            break
        
        pdf.set_font('Arial', '', 14)
            
        question_data = db.get_question(question_num)        
        annotations = get_annotations(username,
                                      question_num,question_data)
        annotations['names'] = json.loads(annotations['names'])
        annotations['spans'] = json.loads(annotations['spans'])


        clean_annotations = []

        for i in range(1,len(annotations['names'])):
            if 'no entity' not in annotations['names'][i].lower() and annotations['names'][i]!='unknown' and annotations['names'][i]!='':
                for j in range(len(annotations['spans'][i])):
                    span = annotations['spans'][i][j]
                    del span['content']
                    span = (span['start'],span['end'])
                    clean_annotations.append((annotations['names'][i],
                                              span))

        clean_annotations = sorted(clean_annotations,key=lambda k: k[1])
        clean_annotations = [i for i in clean_annotations if min(i[1])>=0]
        f = db.get_question(int(question_num))['question']
        words = chunk_words(f)[0]
        annotation_pointer = 0
        i = 0

        pdf.write(5,"{}. Category: {}, Tournament: {} {}\n".format(count,question_data['category'],question_data['tournament'],question_data['year']))
        
        while i<len(words):
            if annotation_pointer == len(clean_annotations):
                pdf.set_text_color(0, 0, 0)
                pdf.set_font('', '')
                pdf.write(5," ".join(words[i:]).replace(" .",".").replace(" ?","?").replace(" !","!").replace(" ,",",").replace(" - ","-"))
                break
            elif clean_annotations[annotation_pointer][1][0] == i:
                sent = (" ".join(
                              words[clean_annotations[annotation_pointer][1][0]:clean_annotations[annotation_pointer][1][1]+1])+
                           " ")
                sent = sent.replace(" .",".").replace(" ?","?").replace(" !","!").replace(" ,",",").replace(" - ","-")
                
                pdf.set_text_color(0, 0, 255)
                pdf.set_font('', 'U')
                location = clean_annotations[annotation_pointer][0].lower().replace(" ","_")
                id = db.get_id(location)
                url = "https://en.wikipedia.org"
                if len(id)>0:
                    url = 'https://en.wikipedia.org/wiki?curid={}'.format(id[0])
                pdf.write(5,sent,url)
                i = clean_annotations[annotation_pointer][1][1]+1
                annotation_pointer+=1
            else:
                pdf.set_text_color(0, 0, 0)
                pdf.set_font('', '')
                if i+1<len(words) and words[i+1] in ['.','!',':',';','?',"'",",","-"] or words[i] in ['-',"'"]:
                    pdf.write(5,words[i])
                else:
                    pdf.write(5,words[i]+" ")
                i+=1
        pdf.set_font('Arial', 'B', 14)
        pdf.write(5,'\nAnswer:')
        pdf.set_font('Arial', '', 14)
        pdf.write(5,' {}'.format(unidecode.unidecode(question_data['answer'])))
        
        pdf.write(5,"\n\n\n\n")
        count+=1
        
    # Then put a blue underlined link
    pdf.output('question.pdf', 'F')
    file_path = "question.pdf"
    return FileResponse(path=file_path, filename=file_path, media_type='text')

@app.get("/quel/factbook/{username}")
def write_factbook(username):
    username,category = "_".join(username.split("_")[:-1]),username.split("_")[-1]
    username = security.decode_token(username)
    all_user_topics = db.get_all_user_topics_user(username)
    topics = [i['topic'] for i in all_user_topics]
    questions = [i['question_id'] for i in all_user_topics]
    common_entities = db.get_entities(questions,category,'Any')
    common_entity_definitions = db.multiple_definitions(common_entities)
    common_ids = common_entity_definitions['ids']

    
    common_entity_definitions = common_entity_definitions['definitions']

    common_entities = list(common_entity_definitions.keys())

    pdf = FPDF()
    pdf.add_page()

    if len(common_entities) == 0:
        pdf.set_font('Arial','',14)
        pdf.write(5,"No questions annotated")

    for entity in common_entities:
        pdf.set_font('Arial', 'B', 14)
        pdf.set_text_color(0, 0, 255)
        pdf.set_font('', 'U')
        id = common_ids[entity]
        url = "https://en.wikipedia.org"
        if id>0:
            url = 'https://en.wikipedia.org/wiki?curid={}'.format(id)
        pdf.write(5,"{}".format(unidecode.unidecode(entity)),url)
        pdf.set_font('Arial', '', 14)
        pdf.set_font('', '')
        pdf.set_text_color(0, 0, 0)
        pdf.write(5," - {}...\n\n\n\n".format(unidecode.unidecode(common_entity_definitions[entity])))

    pdf.output('facts.pdf', 'F')
    file_path = "facts.pdf"
    return FileResponse(path=file_path, filename=file_path, media_type='text')

@app.get("/quel/pdf/{username}")
def write_pdf(username):
    username,category = "_".join(username.split("_")[:-1]),username.split("_")[-1]
    print("Username {}".format(username))
    username = security.decode_token(username)
    all_questions = db.get_all_user_topics_user(username)
    all_questions = [i['question_id'] for i in all_questions]
    question_nums = [i for i in all_questions if db.get_question(i)['category'] == category or category == 'Any']
    return write_pdf_question_nums(username,question_nums)
