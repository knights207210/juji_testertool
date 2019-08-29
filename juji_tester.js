#!/usr/bin/env node

/*
 * parse command line argument
 */

var program = require('commander');
const color = require("colors");

program
    .arguments('<url>')
    .arguments('<transcript>')
    .option('-f, --firstName <firstName>', 'first name', 'Guest')
    .option('-l, --lastName [lastName]', 'last name')
    .option('-e, --email [email]', 'email address');

program.on('--help', function(){
    console.log('')
    console.log('Example:');
    console.log('  juji_tester -f Mary https://juji.io/pre-chat/hanxu2017-3a27634/23 ./QA_dict.json');
});

program.parse(process.argv);

var args = program.args;

if (!args.length) {
    console.error(color.red('URL is required'));
    program.outputHelp();
    process.exit(1);
}

if (!args[1]) {
    console.error(color.red('Transcript address is required'));
    program.outputHelp();
    process.exit(1);
}

const url = args[0];
const transcriptAddress = args[1]

if (!program.firstName) {
    console.error(color.red('First name is required'));
    program.outputHelp();
    process.exit(1);
}

/*
 * get json dic
 */

const dic = require(transcriptAddress)

/*
 * setup chat
 */
//const dic = require('./QAdict.js')
var chatInfo;
var ws;
var msg_array = [];
var question_count = {};

const request = require('request-promise'),
      util = require('util'),
      readline = require('readline'),
      rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
      });

function WordCount(str) { 
  return str.split(" ").length;
}

function console_out(msg) {
    if (msg != null) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(color.cyan("Juji-bot: "+msg));
        //rl.prompt(true);
        msg_array.push(msg);
        /*
         * This branch is used to give warning messages to designers, not necessary for the current goal
         */

        /*if (((msg.indexOf("?") !== -1) && WordCount(msg) > 27) || (msg.indexOf("$") !== -1)){

            console.log(color.red("Juji-bot: "+msg) + color.yellow("Warning: Interview questions are not supposed to related to actual money."))
        }
        else{
            console.log(color.cyan("Juji-bot: "+msg))
        }*/


        /* 
         * This branch is for questions from the CSV file donwloaded from Juji platform, there will be multiple users and after-processed question-answer pairs
         */
        // only use the data of the first user here

        /*if (msg in dic[0]){
            ws.send(util.format(chatFormat, chatInfo.participationId, dic[0][msg]))
            console.log("User: "+dic[0][msg])
        }
        else if(msg.indexOf("?") !== -1 || msg.indexOf("do tell") !== -1){
            ws.send(util.format(chatFormat, chatInfo.participationId, "no."))
            console.log("User: "+"no.")  
        }*/

        /*
         * This branch is for question-answer pairs directly converted from transcript json file
         */
         if (msg in dic){
            //This branch is for the case when a question is asked multiple times
            if (msg in question_count){
                question_count[msg] += 1
                count = question_count[msg]
                if (count<dic[msg].length){
                    ws.send(util.format(chatFormat, chatInfo.participationId, dic[msg][count]))
                    console.log("User: "+dic[msg][count])
                }
                else{
                    ws.send(util.format(chatFormat, chatInfo.participationId, dic[msg][dic[msg].length-1]))
                    console.log("User: "+dic[msg][dic[msg].length-1])
                }

            }
            else{
                question_count[msg] = 0
                ws.send(util.format(chatFormat, chatInfo.participationId, dic[msg][0]))
                console.log("User: "+dic[msg][0])
            }
        }
        else if(msg.indexOf("?") !== -1 || msg.indexOf("do tell") !== -1){
            ws.send(util.format(chatFormat, chatInfo.participationId, "no."))
            console.log("User: "+"no.")  
        }

    }

}


// take user input and send to server
const chatFormat = `
                mutation {
                    saveChatMessage(input: {
                        type: "normal"
                        pid: "%s"
                        text: "%s"
                    }) {
                        success
                    }
                }
                `;



async function startChat(url, firstName) {

    //
    // step 1: obtain chat information
    //
    const options =  {
        method: 'POST',
        url: url,
        formData: {
            firstName: firstName
        }
    };

    const response = await request(options);
    chatInfo = JSON.parse(response);
    

    //
    // step 2: setup WebSocket connection
    //
    const WebSocket = require('isomorphic-ws');
    ws = new WebSocket(chatInfo.websocketUrl);

    //
    // step 3: subscribe to incoming chat messages
    //
    ws.onopen = function () {

        const subFormat = `
        subscription {
            chat(input: {
                participationId: "%s"
            }) {
                role
                text
                type
            }
        }`
        ws.send(util.format(subFormat, chatInfo.participationId));
    };

    //
    // step 4: receive chat messages
    //
    ws.onmessage = function (incoming) {

        var data = JSON.parse(incoming.data);

        // only deal with chat messages, ignore other message types
        if ('data' in data && 'chat' in data.data)  {

            var message = data.data.chat;

            // only print out REP's chat messages
            if (message.role == 'rep') {
                if (message.type == 'normal') {
                    console_out(message.text);
                } else if ( message.type == 'user-joined') {
                    console.log('');
                    console.log(color.blue('=== Welcome to Juji Bot ==='));
                    console.log('');
                }
            }
        }

    //
    // setp 5: check input properties
        /*setTimeout(function timeout(){

            //console.log("Chat ended.")
            checkProperties();
            rl.close();
            //return;
            process.exit(0);
            ws.onclose = function close(){
                console.log("Chat ended.");
            }
        }, 60000);
*/    };

}

/*
 * checking properties
 */
/*function checkProperties(){
    var i;
    var flag_longerThan20Words = true;
    var flag_containPlease = false;
    var flag_noMoney =true;
    for (i =0; i < msg_array.length; i++){
        if((msg_array[i].indexOf("?") !== -1) && WordCount(msg_array[i]) > 27){
            flag_longerThan20Words = false;
        } 
        if(msg_array[i].indexOf("$") !== -1){
            flag_noMoney = false;
        }
        if(msg_array[i].indexOf("please") !== -1){
            flag_containPlease = true;
        }
    }
    console.log(" ")
    if (flag_containPlease){
        console.log("The chatbot contains at least one 'please' word:")
        console.log(color.green("PASS"))
    }
    else{
        console.log("The chatbot contains at least one 'please' word:")
        console.log(color.red("FAIL"))
    }

    if (flag_noMoney){
        console.log("The chatbot contains no money-related question:")
        console.log(color.green("PASS"))
    }
    else{
        console.log("The chatbot contains no money-related question:")
        console.log(color.red("FAIL"))
    }

    if (flag_longerThan20Words){
        console.log("No questions are longer than 25 words:")
        console.log(color.green("PASS"))
    }
    else{
        console.log("No questions are longer than 25 words:")
        console.log(color.red("FAIL"))
    }
    console.log("Check done.")
    //return [flag_containPlease, flag_noMoney, flag_longerThan20Words]
}*/


/*
 * start chat after input properties
 */

/*rl.on('SIGINT', () => {
    //console.log("hi")
    rl.question('Have you finished all the properties input? ', (answer) => {
        if (answer.match(/^y(es)?$/i)) {
            rl.close();
            startChat(url, dic[0]['name']).catch(error => console.error(error))
        }
    });
}); */

/*
 * start chat directly
 */

//if directly converted from transcripts
startChat(url,dic['name'])

// if converted from the csv file
//startChat(url,dic[0]['name'])

module.exports = startChat;
