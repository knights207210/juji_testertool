# juji_tester
This juji tester is used to repeat the jujibot chatting experiences so that chatbot designers can design better.

# Some points to be improved:

1. ability to recognize varations of questions

2. can use the cong file to generate the question-answer pair

3. time efficiency

4. add break point functionality

5. some GUI-based design features (like multiple choice questions) -- but current API does not support it yet, however if we can use conf file itself, no problem


code reference: https://github.com/juji-io/cli-client

# Usage:

1a. run CSVtoDict_Converter.py to convert csv file (the csv of users' answers downloaded from juji platform) to json. (sample csv is provided)

or

1b. run TranscripttoDict_Converter.py to convert original transcripts to json. (sample csv is provided)

2. run juji_tester.js
