import pandas as pd
import json

table = pd.read_csv('Sam-team-experiences-individual.csv',header = None)
answers = []
for index, row in table.iterrows():
    if index == 0:
        keys = row
    else:
        dic = {}
        dic['name'] = row[0]
        for i in range(8,len(row)):
            if pd.isnull(row[i]):
                dic[keys[i]] = ''
            else:
                dic[keys[i]] = row[i]
        answers.append(dic)


#write to json file
with open("QA_dict.json", "w") as fp:
    json.dump(answers , fp)


