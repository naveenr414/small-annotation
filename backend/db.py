from sqlalchemy import Integer, ForeignKey, Column, Text, create_engine,and_,or_, desc, DateTime
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


Base = declarative_base()

class Mention(Base):
    __tablename__ = "mention"
    id = Column(Integer, primary_key=True)
    number = Column(Integer)
    user_id = Column(Text(), index=True)
    question_id = Column(Integer, ForeignKey("question.id"), nullable=False,index=True)
    start= Column(Integer)
    end= Column(Integer)
    wiki_page = Column(Text(),index=True)
    content = Column(Text())

class WikiSummary(Base):
    __tablename__ = "wiki"
    id = Column(Integer, primary_key=True)
    title = Column(Text(), nullable=False, index=True)
    text = Column(Text(), nullable=False)
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
            # Mentions
            print("Populating mentions")
            w = open("baseline_entities.json")
            i = 0
            start = time.time()
            objects = []
            while True:
                line = w.readline()
                if line.strip() == '':
                    break
                wiki_obj = json.loads(line.strip())

                j = 2
                for mention in wiki_obj['clusters']:
                    for span in mention['clusters']:
                            objects.append({'user_id':'system','question_id':wiki_obj['qanta_id'],'start':span[0],
                                            'end':span[1],'wiki_page':mention['name'],'number':j,'content':span[2]})
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
            start = time.time()
            dev = json.load(open("qanta.dev.2018.04.18.json"))['questions']
            test = json.load(open("qanta.test.2018.04.18.json"))['questions']
            train = json.load(open("qanta.train.2018.04.18.json"))['questions']

            all_qanta = train+dev+test

            objects = []
            for i in range(len(all_qanta)):
                objects.append({'id':all_qanta[i]['qanta_id'], 'question': all_qanta[i]['text'], 'category': all_qanta[i]['category'],'wiki_answer':all_qanta[i]['page'].replace("_", " "),
                                'sub_category': all_qanta[i]['subcategory'],'difficulty': all_qanta[i]['difficulty'],'tournament': all_qanta[i]['tournament'],
                                'year': all_qanta[i]['year'],'answer':all_qanta[i]['answer']})
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
            print("Qanta time {}".format(time.time()-start))
            
            # Wiki
            w = open("all_wiki.json")
            start = time.time()
            
            objects = []
            i = 0
            while True:
                line = w.readline()
                if line.strip() == '':
                    break
                wiki_obj = json.loads(line.strip())
                objects.append({'id':int(wiki_obj['id']),'title':wiki_obj['name'],'text':wiki_obj['summary'],'popularity':wiki_obj['popularity']})
                i+=1

                if i%100000 == 0:
                    print(i,time.time()-start)                
                    session.bulk_insert_mappings(WikiSummary,objects)
                    objects = []
            session.bulk_insert_mappings(WikiSummary,objects)
            print("Wiki time {}".format(time.time()-start))


            session.commit()
            print("Commit time {}".format(time.time()-start))

    def user_starts(self,user_id,question_id):
        with self._session_scope as session:
            t = datetime.datetime.now()
            if session.query(UserEdits).filter(and_(UserEdits.user_id == user_id,UserEdits.question_id == question_id)).count() == 0:
                session.bulk_insert_mappings(UserEdits,[{'id': None, 'user_id':user_id,'question_id':question_id,'start_time':t,'update_time': t}])

            return True

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
            if(len(word)<=3):
                end_count = 0
                count_time = 0
                count = 5
                results = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).limit(5)
            else:
                count = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).count()
                if count>1000:
                    results = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).limit(5)
                else:
                    results = session.query(WikiSummary).filter(and_(WikiSummary.title>=word,WikiSummary.title<=upper_bound)).order_by(desc(WikiSummary.popularity)).limit(5)

        names = [i.title for i in results]
        summaries = [i.text for i in results]
        print("Took {} time with {} count {}".format(time.time()-start,count,word))
        return [(names[i].replace("&amp;","&"),summaries[i]) for i in range(len(names))]

    def get_all_mentions(self):
        with self._session_scope as session:
            results = session.query(Mention).filter(Mention.user_id!="system")
            return [{'question':i.question_id,'user':i.user_id,'start':i.start,'end':i.end,'wiki_page': i.wiki_page} for i in results]

    def get_user_mentions(self,username):
        with self._session_scope as session:
            results = session.query(Mention).filter(Mention.user_id==username)
            return [{'question':i.question_id,'user':i.user_id,'start':i.start,'end':i.end,'wiki_page': i.wiki_page} for i in results]


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
            results = [{'start':i.start,'end':i.end,'wiki_page':i.wiki_page,'content':i.content,'number':i.number} for i in results]
            return results

    def get_questions_by_entity(self,entity):
        with self._session_scope as session:
            print("Entity {}".format(entity))
            entity = entity.strip("_").replace("_"," ")
            results = session.query(Mention).filter(and_(Mention.user_id == "system",func.lower(Mention.wiki_page)==entity.lower().replace(" ","_")))
            questions = session.query(Question).filter(func.lower(Question.wiki_answer) == entity.lower().replace("_"," "))
            return list(set([i.question_id for i in results]).union(set([i.id for i in questions])))

    def get_question_answers(self,question_ids,category,difficulty):
        with self._session_scope as session:
            data = []

            difficulty_converter = {'College': ['regular_college','easy_college','hard_college','college'],'High School': ['hs','regular_high_school','hard_high_school','easy_high_school','national_high_school'],
                                    'Open':['open'],'Middle School':['middle_school','ms']}
            
            for i in question_ids:
                results = session.query(Question).filter(Question.id==i).limit(1)
                data += [{'question':i.question,'answer':i.answer.replace("{","").replace("}",""),'difficulty': i.difficulty, 'tournament': i.tournament}
                         for i in results if (category == 'Any' or category == i.category) and (difficulty == 'Any' or i.difficulty.lower() in difficulty_converter[difficulty])]

            return data
        
    def get_tournament_entities(self,entity_name,tournament,year):
        with self._session_scope as session:
            entity_name = entity_name.replace("_", " ")
            data = []
            year = int(year)
            tournament_questions = [{'id':i.id,'answer':i.answer.replace("{","").replace("}",""),'question':i.question} for i in session.query(Question).filter(and_(Question.tournament==tournament,Question.year==year))]

            print(len(tournament_questions))
            for i in tournament_questions:
                has_entity = False
                if entity_name in i['answer'].lower():
                    next_char = i['answer'].lower().index(entity_name)
                    s = i['answer'].lower()[next_char:]
                    if len(s) == len(entity_name) or not s[len(entity_name)].isalpha():
                            has_entity = True
                else:
                    mentions = session.query(Mention).filter(and_(Mention.question_id == i['id'],func.lower(Mention.wiki_page)==entity_name.lower())).count()
                    has_entity = mentions>0
                    
                if has_entity:
                    data.append({'question':i['question'],'answer':i['answer']})


            return data

    def remove_mentions(self,user,question_num):
        with self._session_scope as session:
            results = session.query(Mention).filter(and_(Mention.user_id == user,
                                                         Mention.question_id==question_num)).delete()
            session.commit()
            return True

    def get_tournament(self,year,tournament):
        with self._session_scope as session:
            results = session.query(Question).filter(and_(Question.tournament==tournament,Question.year==year))
            mentions = [{'question': i.id, 'page': i.wiki_answer} for i in results]
            results = [i.id for i in results]

            for i in results:
                results = session.query(Mention).filter(Mention.question_id == i)
                mentions+=[{'question': j.question_id, 'page': j.wiki_page} for j in results if (j.user_id == "system") and (j.wiki_page!="")]

            return mentions
    
    def insert_mentions(self,mentions):
        with self._session_scope as session:
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

    def get_id(self,word):
        start = time.time()
        with self._session_scope as session:
            results = session.query(WikiSummary).filter(WikiSummary.title==word).limit(1)

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
