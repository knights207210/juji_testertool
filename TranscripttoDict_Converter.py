import json

def readFile(filename):
    f = open(filename,"r")
    dic = {}
    personName = ''
    for i, line in enumerate(f):
        if line[1:3]=='20':
            #first line, get name
            if i==0:
                indBotNameSt = line.find(']')+1
                #first ":" appears in the timestamp
                indFirstCoBotName = line.find(':')
                indSecondCoBotName = indFirstCoBotName + line[indFirstCoBotName+1:].find(':') + 1
                botName = line[indBotNameSt:indSecondCoBotName].strip()
                
            elif not personName:            
                indPersonNameSt = line.find(']')+1
                indFirstCoPersonName = line.find(':')
                indSecondCoPersonName = indFirstCoPersonName + line[indFirstCoPersonName+1:].find(':') + 1
                tmpName = line[indPersonNameSt:indSecondCoPersonName].strip()
                if tmpName != botName:
                    personName = tmpName
                    
            if line.find(botName) == -1:
            #{ in line means it's the special format
            #example: [{:type Action, :gid user-defined-question-1, :question user-defined-question-1, :value 1, :text Shared Leadership}]
            
                if '{' in line: 
                    ind = line.find('text')
                    #the text between text: and closing bracket is the answer
                    line_sliceFromText = line[ind:]
                    indBracket = line_sliceFromText.find('}')
                    ans = line[ind+5:ind+indBracket]
                else:
                    #regular format, the text after second ":" is the answer (first ":" is in the date part)
                    indFirstCo = line.find(':')
                    indSecondCo = indFirstCo + line[indFirstCo+1:].find(':') + 1
                    ans = line[indSecondCo+1:].strip()
                    
                if lastLine.find(botName) == -1: 
                    #when having 2 or more consecutive answers, just add them to the first answer
                    dic[question][-1] += ' ' + ans
                else:
                    #regular case
                    if 'wording' in lastLine: 
                    #wording in line means it's the special format
                    #example:Sam: {:type form, :data {:type :form, :instruction , :gid user-defined-question-1, :questions [{:kind :single-choice, :choices [{:text Single Leadership, :value 0} {:text Shared Leadership, :value 1}], :heading What’s your leadership preference?, :wording What’s your leadership preference?, :required true, :qid user-defined-question-1, :context-var-name ?q}]}}
                    #the text between wording and wording's next ":" is the question
                        ind = lastLine.find('wording')
                        line_sliceFromWording = lastLine[ind:]
                        indCo = line_sliceFromWording.find(':')
                        question = lastLine[ind+8:ind+indCo-2]
                    elif '{:type' not in lastLine:
                        #regular format, quesiton text is after Sam:
                        indBotName = lastLine.find(botName)
                        question = lastLine[indBotName+len(botName)+1:].strip()
                    
                    #question already asked, append a new answer
                    if question in dic:
                        dic[question].append(ans)
                    else:
                        dic[question] = [ans]
        
            lastLine = line 
    dic['name'] =  personName         
    return dic

answers = readFile("./sample_transcripts.txt")
#write to json file
with open("QA_dict.json", "w") as fp:
    json.dump(answers , fp)


