from sqlalchemy import Integer, Float,ForeignKey, Column, Text, create_engine,and_,or_, desc, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import (
    Load,
    sessionmaker,
    scoped_session,
    relationship,
    selectinload,
)
from sqlalchemy.orm.scoping import ScopedSession
from contextlib import contextmanager
from sqlalchemy import func

import pickle
import time
import json
import unidecode
import datetime
import re
import random
import numpy as np 
from collections import Counter

def sigmoid(x):
    return 1/(1+np.exp(-x))

Base = declarative_base()

gender_dict = pickle.load(open("gender_dict.p","rb"))

class Redirect(Base):
    __tablename__ = "redirect"
    name = Column(Text(),index=True, primary_key=True)
    page = Column(Text())

class Mention(Base):
    __tablename__ = "mention"
    id = Column(Integer, primary_key=True)
    number = Column(Integer)
    user_id = Column(Text(), index=True)
    question_id = Column(Integer, ForeignKey("question.id"), nullable=False,index=True)
    start= Column(Integer)
    end= Column(Integer)
    confidence = Column(Float)
    wiki_page = Column(Text(),index=True)
    content = Column(Text())

class WikiSummary(Base):
    __tablename__ = "wiki"
    id = Column(Integer, primary_key=True)
    title = Column(Text(), nullable=False, index=True)
    title_lower = Column(Text(),index=True)
    text = Column(Text(), nullable=False)
    gender = Column(Text(),nullable=False)
    popularity= Column(Integer, index=True)

class User(Base):
    __tablename__ = "user"
    id = Column(Text(), primary_key=True)
    password = Column(Text(), nullable=False)

class UserTopic(Base):
    __tablename__ = "topic"
    id = Column(Integer,primary_key=True)
    user_id = Column(Text(),index=True)
    question_id = Column(Integer,ForeignKey("question.id"),index=True)
    topic = Column(Text())
    subtopic = Column(Text())
    num_mentions = Column(Integer,index=True)
    time_spent = Column(Integer)

class UserEdits(Base):
    __tablename__ = "user_edits"
    id = Column(Integer, primary_key=True,autoincrement=True)
    user_id = Column(Text(),index=True)
    question_id = Column(Integer, ForeignKey("question.id"), nullable=False,index=True)
    start_time = Column(DateTime())
    update_time = Column(DateTime())

class Question(Base):
    __tablename__ = "question"
    id = Column(Integer, primary_key=True)
    category= Column(Text(), index=True)
    sub_category = Column(Text(), index=True)
    question= Column(Text(), index=True)
    answer = Column(Text(), index=True)
    wiki_answer = Column(Text(), ForeignKey("wiki.title"),index=True)
    wiki_answer_lower = Column(Text(),index=True)
    difficulty = Column(Text(),index=True)
    tournament = Column(Text(), index=True)
    year = Column(Integer, index=True)

class Database:
    def __init__(self, find_questions=True):
        self._engine = create_engine(
            # Separate name to avoid confusing it with the unmodified qanta db
            "sqlite:///quel_db.sqlite3",
            connect_args={'check_same_thread': False}
        )  # pylint: disable=invalid-name
        Base.metadata.bind = self._engine

    @property
    @contextmanager
    def _session_scope(self) -> ScopedSession:
        session = scoped_session(sessionmaker(bind=self._engine))
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def create_all(self):
        Base.metadata.create_all(self._engine, checkfirst=True)

    def drop_all(self):
        Base.metadata.drop_all(self._engine)

    def reset_all(self):
        self.drop_all()
        self.create_all()

    def reset_and_populate(self):
        print("Resetting and populating database")
        self.drop_all()
        print("Finished dropping")
        self.create_all()
        print("Finished creating")
        self.populate()
        print("Finished populating")

    def populate(self):
        with self._session_scope as session:
            start = time.time()

            all_qanta = json.load(open("mostly_right.json"))['questions']
            all_qanta = [i for i in all_qanta if i['page']!=None]
            all_answers = set([unidecode.unidecode(i['page']).lower() for i in all_qanta])

            pages = Counter([i['page'] for i in all_qanta])
            pages = list(dict(pages).items())
            pages = sorted(pages,key=lambda k: k[1])[::-1]

            redirected_pages = set()
            redirects = []

            for i in range(len(pages)):
                words = pages[i][0].split("_")
                if len(words)>1 and unidecode.unidecode(words[-1]).lower() not in redirected_pages:
                    redirected_pages.add(unidecode.unidecode(words[-1]).lower())
                    redirects.append({'name':unidecode.unidecode(words[-1]).lower(),'page':"_".join(words)})
                    
            total_writes = 0
            with open('all_wiki_redirects.csv',encoding='utf-8') as csvfile:
                line = csvfile.readline()

                while line != '':
                    split = line.split('","')
                    option_one = split[0][1:]
                    option_two = split[1].strip()[:-1]
                    option_one = option_one.replace('\\"','"').replace("_"," ")
                    option_two = option_two.replace('\\"','"').replace("_"," ")

                    if unidecode.unidecode(option_two).lower().replace("_"," ") in all_answers and unidecode.unidecode(option_one.lower()) not in redirected_pages:
                        if option_one != '':
                            redirects.append({'name': unidecode.unidecode(option_one.lower()), 'page': option_two})
                            redirected_pages.add(unidecode.unidecode(option_one.lower()))
                            total_writes+=1

                    if len(redirects)%10000 == 0 and len(redirects)>0:
                        print("Total writes {}".format(total_writes))
                        session.bulk_insert_mappings(Redirect,redirects)
                        print(redirects[-10:])
                        redirects = []
                    
                    line = csvfile.readline()
            session.bulk_insert_mappings(Redirect,redirects)
            print("Redirect time {}".format(time.time()-start))
            start = time.time()

            objects = []

            difficulty_map = {'regular_high_school': 'High School', 'middle_school': 'Middle School', 'college': 'College',
                              'hs': 'High School', 'easy_high_school': 'High School', 'national_high_school': 'High School',
                              'hard_high_school': 'High School', 'easy_college': 'College', 'open': 'Open', 'hard_college': 'College',
                              'ms': 'Middle School', 'regular_college': 'College'}
            
            for i in range(len(all_qanta)):
                objects.append({'id':all_qanta[i]['qanta_id'], 'question': all_qanta[i]['text'], 'category': all_qanta[i]['category'],'wiki_answer':all_qanta[i]['page'].replace("_", " "),
                                'sub_category': all_qanta[i]['subcategory'],'difficulty': difficulty_map[all_qanta[i]['difficulty'].lower()],'tournament': all_qanta[i]['tournament'],
                                'year': all_qanta[i]['year'],'answer':all_qanta[i]['answer'].replace("&lt;","<").replace("&gt;",">"),
                                'wiki_answer_lower':all_qanta[i]['page'].replace("_", " ").lower()})
                if i%100000 == 0:
                    print(i,time.time()-start)   
                if i%100000 == 0:
                    session.bulk_insert_mappings(Question,objects)
                    objects = []
            session.bulk_insert_mappings(Question,objects)
            objects = []
            dev = []
            test = []
            train = []

            question = json.load(open("sample_question.json"))
            mention = json.load(open("sample_mention.json"))

            session.bulk_insert_mappings(Question,question)
            session.bulk_insert_mappings(Mention,mention)

            print("Qanta time {}".format(time.time()-start))

            # Wiki
            print("Populating Wikipedia")
            start = time.time()
            g = open("all_gender.jsonl")
            l = g.readline()
            gender_list = {}
            while l!='':
                temp = json.loads(l)
                if temp['gender']!='None':
                    gender_list[temp['entity'].lower()] = temp['gender']
                l = g.readline()
            
            w = open("all_wiki.json")
            
            objects = []
            i = 0
            wiki_pages = {}
            while True:
                line = w.readline()
                if line.strip() == '':
                    break
                wiki_obj = json.loads(line.strip())
                gender = 'none'
                if wiki_obj['name'].replace("_"," ") in gender_list:
                    gender = gender_list[wiki_obj['name'].replace("_"," ")]

                if wiki_obj['name'] not in wiki_pages or wiki_pages[wiki_obj['name']]<wiki_obj['popularity']:
                    objects.append({'id':int(wiki_obj['id']),'title_lower':wiki_obj['name'],'title':wiki_obj['clean_name'],'text':wiki_obj['summary'],'popularity':wiki_obj['popularity'],'gender':gender})
                    wiki_pages[wiki_obj['name']] = wiki_obj['popularity']
                i+=1

                if i%100000 == 0:
                    print(i,time.time()-start)                
                    session.bulk_insert_mappings(WikiSummary,objects)
                    objects = []
            session.bulk_insert_mappings(WikiSummary,objects)
            print("Wiki time {}".format(time.time()-start))

            # Mentions
            start = time.time()
            print("Populating mentions")
            w = open("baseline_entities.json")
            i = 0
            objects = []
            while True:
                line = w.readline()
                if line.strip() == '':
                    break
                wiki_obj = json.loads(line.strip())

                wiki_obj['clusters'] = sorted(wiki_obj['clusters'],key=lambda k: k['score'])

                j = 2
                for mention in wiki_obj['clusters']:
                    confidence = sigmoid(mention['score'])
                    for span in mention['clusters']:
                        if mention['name'] != None:
                            objects.append({'user_id':'system','question_id':wiki_obj['qanta_id'],'start':span[0],
                                            'end':span[1],'wiki_page':unidecode.unidecode(mention['name'].lower()),'number':j,'content':span[2],'confidence':confidence})
                    j+=1
                i+=1
                if i%10000 == 0:
                    print(i,time.time()-start,len(objects))                
                    session.bulk_insert_mappings(Mention,objects)
                    objects = []
            session.bulk_insert_mappings(Mention,objects)
            print(len(objects))
            print("Mentions time {}".format(time.time()-start))

            # Load in qanta questions
            session.commit()
            print("Commit time {}".format(time.time()-start))

    def get_random_question(self,category,difficulty):
        with self._session_scope as session:
            print("{} {}".format(category,difficulty))
            start = time.time()
            if category == "Any" and difficulty == "Any":
                return [random.randint(0,190624) for i in range(50)]
            elif category == "Any":
                rows = session.query(Question).filter(Question.difficulty == difficulty).order_by(func.random()).limit(50)
            elif difficulty == "Any":
                rows = session.query(Question).filter(Question.category == category).order_by(func.random()).limit(50)
            else:
                rows = session.query(Question).filter(and_(Question.category == category,Question.difficulty == difficulty)).order_by(func.random()).limit(50)

            print("Took {} time".format(time.time()-start))

            if not rows:
                return [random.randint(0,190624) for i in range(50)]
            
            return [i.id for i in rows]

    def user_starts(self,user_id,question_id):
        with self._session_scope as session:
            t = datetime.datetime.now()
            if session.query(UserEdits).filter(and_(UserEdits.user_id == user_id,UserEdits.question_id == question_id)).count() == 0:
                session.bulk_insert_mappings(UserEdits,[{'id': None, 'user_id':user_id,'question_id':question_id,'start_time':t,'update_time': t}])

            return True

    def get_num_responses(self):
        with self._session_scope as session:
            all_edits = session.query(UserEdits).filter(UserEdits.user_id != "system")
            tod = datetime.datetime.now()
            d = datetime.timedelta(days = 7)
            a = tod - d
            return {'1 week': len([i for i in all_edits if i.start_time>=a]), 'total': len([i for i in all_edits])}


    def update_user_topic(self,user_id,question_id,topic,subtopic,num_mentions,edit_time):
        with self._session_scope as session:
            current_values = session.query(UserTopic).filter(and_(UserTopic.user_id==user_id,UserTopic.question_id==question_id))
            if current_values.count()>0:
                current_values = current_values.first()
                current_values.num_mentions = num_mentions
                current_values.time_spent+=edit_time
            else:
                session.bulk_insert_mappings(UserTopic,[{'user_id':user_id,'question_id':question_id,'topic':topic,'subtopic':subtopic,'num_mentions':num_mentions,'time_spent':edit_time}])

    def get_all_user_topics_user(self,user_id):
        with self._session_scope as session:
            return [{'user_id':i.user_id,'question_id':i.question_id,'topic':i.topic,'num_mentions':i.num_mentions,'time':i.time_spent} for i in
                session.query(UserTopic).filter(UserTopic.user_id==user_id)]

    def get_all_user_topics(self):
        with self._session_scope as session:
            return [{'user_id':i.user_id,'question_id':i.question_id,'topic':i.topic,'num_mentions':i.num_mentions} for i in
                session.query(UserTopic)]

    def get_answer(self,question_id):
        with self._session_scope as session:
            rows = session.query(Question).filter(Question.id == question_id).limit(1)
            
            return [i.wiki_answer_lower for i in rows][0]

    def get_similar_questions(self,wiki_pages,difficulty):
        with self._session_scope as session:
            question_ids = []
            for i in wiki_pages:
                rows = session.query(Question).filter(and_(Question.wiki_answer_lower == i.replace("_"," "),Question.difficulty == difficulty)).limit(5)
                question_ids += [{'id':j.id,'question':j.question,'answer':j.answer, 'tournament': j.tournament, 'year': j.year} for j in rows]
            return question_ids

    def user_updates(self,user_id,question_id,mentions):
        with self._session_scope as session:
            t = datetime.datetime.now()
            edit = session.query(UserEdits).filter(and_(UserEdits.user_id == user_id,UserEdits.question_id == question_id)).limit(1)
            start_time = [i.start_time for i in edit][0]
            session.bulk_insert_mappings(UserEdits,[{'user_id':user_id,'question_id':question_id,'start_time':start_time,'update_time':t}])
            return True

    def get_autocorrect(self,word):
        start = time.time()
        with self._session_scope as session:
            word = word.replace(" ", "_")
            upper_bound = word.lower()+"z"
            exact = []
            if(len(word)<=3):
                end_count = 0
                count_time = 0
                count = 5
                results = session.query(WikiSummary).filter(and_(WikiSummary.title_lower>=word,WikiSummary.title_lower<=upper_bound)).limit(5)
            else:
                count = session.query(WikiSummary).filter(and_(WikiSummary.title_lower>=word,WikiSummary.title_lower<=upper_bound)).count()
                exact = session.query(WikiSummary).filter(WikiSummary.title_lower==word).limit(1)
                if count>1000:
                    results = session.query(WikiSummary).filter(and_(WikiSummary.title_lower>=word,WikiSummary.title_lower<=upper_bound)).limit(5)
                else:
                    results = session.query(WikiSummary).filter(and_(WikiSummary.title_lower>=word,WikiSummary.title_lower<=upper_bound)).order_by(desc(WikiSummary.popularity)).limit(5)

            print("word {}".format(unidecode.unidecode(word.lower())))
            exact_match = session.query(Redirect).filter(Redirect.name == unidecode.unidecode(word.lower())).limit(1)
            exact_match = [i.page.replace(" ","_") for i in exact_match]

            if len(exact_match)>0:
                summary = session.query(WikiSummary).filter(WikiSummary.title_lower == exact_match[0].lower())
                ids = [i.id for i in summary] + [0]
                summary = [i.text for i in summary]+['']
                summary = summary[0]
                exact_match = [(exact_match[0],summary,ids[0])]
            print("Exact match {}".format(exact_match))

        print("Query took {} time".format(time.time()-start))

        names = [i.title for i in exact]+[i.title for i in results]
        summaries = [i.text for i in exact]+[i.text for i in results]
        ids = [i.id for i in exact]+[i.id for i in results]

        names = names[:5]
        summaries = summaries[:5]
        ids = ids[:5]

        print("Took {} time with {} count {}".format(time.time()-start,count,word))
        return exact_match+[(names[i].replace("&amp;","&"),summaries[i],ids[i]) for i in range(len(names))]

    def get_definition(self,word):
        with self._session_scope as session:
            word = word.strip().replace(" ", "_").lower().strip("_")
            print("Getting definition for word {}".format(word))
            results = session.query(WikiSummary).filter(WikiSummary.title_lower == word)
            results = [(i.text,i.popularity) for i in results]
            results = sorted(results,key=lambda k: k[1])
            print("Returnign definition {}".format(results))
            if len(results)>0:
                return [results[-1][0]]
            return ['']

    def multiple_definitions(self,word_list):
        with self._session_scope as session:
            d = {}
            e = {}
            f = []
            definitions = {}
            for i in word_list:
                d[i] = session.query(WikiSummary).filter(WikiSummary.title_lower == i.replace(" ", "_").lower().strip()).limit(1)
                f.append(([k.title for k in d[i]]+[''])[0])
                e[f[-1]] = ([k.id for k in d[i]]+[0])[0]
                definitions[f[-1]] = ([k.text for k in d[i]]+[''])[0]
            print("Returning {}".format(f))
            return {'definitions':definitions,'ids':e, 'names': f}
    
    def get_all_mentions(self):
        with self._session_scope as session:
            results = session.query(Mention).filter(Mention.user_id!="system")
            return [{'question':i.question_id,'user':i.user_id,'start':i.start,'end':i.end,'wiki_page': i.wiki_page,'confidence':i.confidence} for i in results]

    def get_user_mentions(self,username):
        with self._session_scope as session:
            results = session.query(Mention).filter(Mention.user_id==username)
            return [{'question':i.question_id,'user':i.user_id,'start':i.start,'end':i.end,'wiki_page': i.wiki_page,'confidence':i.confidence} for i in results]


    def get_questions_user(self,user):
        with self._session_scope as session:
            results = session.query(UserEdits).filter(UserEdits.user_id==user)
            return set([i.question_id for i in results])

    def get_topic(self,question_id):
        with self._session_scope as session:
            results = session.query(Question).filter(Question.id == question_id).limit(1)
            return [i.category for i in results][0]

    def get_subtopic(self,question_id):
        with self._session_scope as session:
            results = session.query(Question).filter(Question.id == question_id).limit(1)
            return [i.sub_category for i in results][0]

    def get_mentions_by_user(self,user,question_num):
        with self._session_scope as session:
            question_num = int(question_num)

            results = session.query(Mention).filter(and_(Mention.user_id == user,
                                                         Mention.question_id==question_num))
            results = [{'start':i.start,'end':i.end,'wiki_page':i.wiki_page,'content':i.content,'number':i.number,'confidence':i.confidence} for i in results]
            return results

    def get_entities(self,question_ids,category,difficulty):
        with self._session_scope as session:
            all_entities = []
            for i in question_ids:
                question = session.query(Question).filter(Question.id==i).limit(1)
                question = [1 for i in question if (category == 'Any' or category.lower() == i.category.lower()) and (difficulty == 'Any' or i.difficulty.lower() == difficulty.lower())]
                if len(question)>0:
                    results = session.query(Mention).filter(Mention.question_id==i)
                    all_entities+=list(set([i.wiki_page for i in results]))

            other_entities = list(Counter(all_entities).items())
            other_entities = sorted(other_entities,key=lambda k: k[1],reverse=True)
            other_entities = [i[0].replace("_"," ") for i in other_entities if i[0]!='']
            other_entities = [i for i in other_entities if "file transfer protocol" not in i and "ftps" not in i]
            return other_entities

    def get_low_confidence_entities(self,question_ids):
        with self._session_scope as session:
            num_low_confidence = []
            user_annotations = []
            for id in question_ids:
                low_confidence = session.query(Mention).filter(and_(Mention.question_id==id,
                                                                         Mention.user_id == "system"))

                confidence_by_entity = {}

                for i in low_confidence:
                    wiki_page = i.wiki_page
                    confidence = i.confidence

                    if wiki_page not in confidence_by_entity:
                        confidence_by_entity[wiki_page] = confidence
                    else:
                        confidence_by_entity[wiki_page] = max(confidence_by_entity[wiki_page],confidence)


                num_low = len([i for i in confidence_by_entity if confidence_by_entity[i]<0.5])
                num_low_confidence.append(num_low)
                user_annotations.append(session.query(Mention).filter(and_(Mention.question_id == id,
                                                                           Mention.user_id!="system")).count())
        
            return num_low_confidence, user_annotations

    def get_questions_by_entity(self,entity):
        with self._session_scope as session:
            print("Entity {}".format(entity))
            entity = entity.strip()
            entity = entity.strip("_").replace("_"," ")
            results = session.query(Mention).filter(and_(Mention.user_id == "system",Mention.wiki_page==entity.replace(" ","_").lower())).limit(100)
            locations = {}
            for i in results:
                locations[i.question_id] = (i.start,i.end)
            questions = session.query(Question).filter(Question.wiki_answer == entity.replace("_"," ")).limit(50)
            for i in questions:
                locations[i.id] = (-1,-1)

            return {'questions':list(set([i.question_id for i in results]).union(set([i.id for i in questions]))),
                    'locations':locations}

    def get_question_answers(self,question_ids,category,difficulty):
        with self._session_scope as session:
            data = []
            
            for i in question_ids:
                results = session.query(Question).filter(Question.id==i).limit(1)
                data += [{'question':i.question,'answer':i.answer.replace("{","").replace("}",""),'difficulty': i.difficulty, 'tournament': i.tournament,'id':i.id,'year':i.year,'category':i.category}
                         for i in results if (category == 'Any' or category.lower() == i.category.lower()) and (difficulty == 'Any' or i.difficulty.lower() == difficulty.lower())]

            return data
        
    def get_tournament_entities(self,entity_name,tournament,year,category):
        with self._session_scope as session:
            entity_name = entity_name.replace("_", " ").strip()
            data = []
            year = int(year)
            tournament_questions = [{'answer':i.answer.replace("{","").replace("}",""),'question':i.question,'category':i.category,
                                     'subcategory':i.sub_category,'id':i.id, 'tournament': i.tournament, 'year': i.year}
                                    for i in session.query(Question).filter(and_(Question.tournament==tournament,Question.year==year))]
            print("{} Tournament questions".format(len(tournament_questions)))
    
            other_entities = []

            for i in tournament_questions:
                
                has_entity = False
                mention_full_info = [{'wiki_page':i.wiki_page,'start':i.start,'end':i.end} for i in session.query(Mention).filter(Mention.question_id == i['id'])]
                mentions = [i['wiki_page'] for i in mention_full_info]

                in_answer = False
                coords = (-1,-1)

                if entity_name.replace("_", " ").lower() in i['answer'].lower():
                    e = entity_name.replace("_", " ").lower()
                    next_char = i['answer'].lower().index(e)
                    s = i['answer'].lower()[next_char:]
                    if len(s) == len(entity_name) or not s[len(e)].isalpha():
                            has_entity = True
                            in_answer = True
                if not has_entity:
                    l = [i.lower() for i in mentions]
                    if entity_name.replace(" ","_").lower() in l:
                        index = l.index(entity_name.replace(" ","_").lower())
                        has_entity = True
                        start = mention_full_info[index]['start']
                        end = mention_full_info[index]['end']
                        coords = (start,end)
                        

                if entity_name == "":
                    has_entity = True
                    coords = (0,0)

                if i['category'] == None:
                    i['category'] = ""
                if i['subcategory'] == None:
                    i['subcategory'] = ""

                has_category = i['category'] == category or i['category'] == None or category in ['Any','','undefined']
                if has_entity and has_category:
                    other_entities+=list(set(mentions))
                    data.append({'question':i['question'],'answer':i['answer'],'question_id': i['id'],'category':i['category'],'subcategory':i['subcategory'],'location':coords
                                 ,'year':i['year'],'tournament':i['tournament']})

            other_entities = list(Counter(other_entities).items())
            other_entities = sorted(other_entities,key=lambda k: k[1],reverse=True)
            other_entities = [i[0].replace("_"," ") for i in other_entities if i[0]!='' and i[0] not in ['FTPS',"File Transfer Protocol"]][:20]

            print("Ended with {} data".format(len(data)))
            print("Category {}".format(category))
            
            return {'data':data,'entities':other_entities}



    def remove_mentions(self,user,question_num):
        with self._session_scope as session:
            results = session.query(Mention).filter(and_(Mention.user_id == user,
                                                         Mention.question_id==question_num)).delete()
            session.commit()
            return True

    def get_tournament(self,year,tournament):
        with self._session_scope as session:
            results = session.query(Question).filter(and_(Question.tournament==tournament,Question.year==year))
            categories = Counter([i.category for i in results])
            mentions = [{'question': i.id, 'page': i.wiki_answer} for i in results]
            results = [i.id for i in results]

            for i in results:
                results = session.query(Mention).filter(Mention.question_id == i)
                mentions+=[{'question': j.question_id, 'page': j.wiki_page} for j in results if (j.user_id == "system") and (j.wiki_page!="")]

            return {'entities':mentions,'categories':categories}

    def insert_question(self,question):
        with self._session_scope as session:
            session.bulk_insert_mappings(Question,question)
            session.commit()
            return True
    
    def insert_mentions(self,mentions):
        with self._session_scope as session:
            for i in range(len(mentions)):
                if 'confidence' not in mentions[i]:
                    mentions[i]['confidence'] = 1
            session.bulk_insert_mappings(Mention,mentions)
            session.commit()
            return True

    def get_mentions(self):
        with self._session_scope as session:
            results = session.query(Mention)
            return [{'start':i.start,'end':i.end,'wiki_page':i.wiki_page,
                     'content':i.content,'user_id':i.user_id,'question_id':i.question_id} for i in results]

    def get_edits(self):
        with self._session_scope as session:
            results = session.query(UserEdits)
            return [{'start_time':i.start_time,'update_time':i.update_time,'user_id':i.user_id,
                     'question_id':i.question_id} for i in results]

    def get_question(self,question_num):
        with self._session_scope as session:
            results = session.query(Question).filter(Question.id == question_num)
            results = [{'question':unidecode.unidecode(i.question),'answer':i.answer,'wiki_answer':i.wiki_answer,
                        'sub_category':i.sub_category, 'category':i.category,
                        'difficulty': i.difficulty, 'year':i.year,'tournament':i.tournament} for i in results]

            
            results.append({})

            return results[0]

    def get_gender(self,wiki_page):
        with self._session_scope as session:
            if wiki_page.lower().replace(" ","_") in gender_dict:
                return gender_dict[wiki_page.lower().replace(" ","_")]
            return 'None'

    def get_id(self,word):
        start = time.time()
        with self._session_scope as session:
            results = session.query(WikiSummary).filter(WikiSummary.title_lower==word).limit(1)

        return [i.id for i in results]

    def get_all_useredits(self,username):
        with self._session_scope as session:
            edits = session.query(UserEdits).filter(UserEdits.user_id == username)
            results = [{'question_id':i.question_id,'start_time':i.start_time,'update_time':i.update_time} for i in edits]
            return results

    def insert_email_password(self,username,password):
        with self._session_scope as session:
            if session.query(User).filter(User.id==username).count()>0:
                return False
            print("Inserted!")
            session.bulk_insert_mappings(User,[{'id':username,'password':password}])
            return True

    def get_password(self,username):
        with self._session_scope as session:
            passwords = session.query(User).filter(User.id==username)
            passwords = [i for i in passwords]
            if len(passwords) == 0:
                return None
            print("Searching for passwords")
            return passwords[0].password
