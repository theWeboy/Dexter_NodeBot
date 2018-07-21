console.log("Bot is running");

const Twit = require('twit');

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('Enter NewsAPI key here');

const createIsCool = require('iscool');

var t_arr,s_arr,query_url,query,t_url;
var t_name;
var t_tweet,f_tweet,reply;

var cur_date = new Date();
cur_date.toISOString();

var prev_date = new Date();
prev_date.setMonth(prev_date.getMonth() - 2);
prev_date.toISOString();

console.log(cur_date);
console.log(prev_date);


var config = require('./config');
var bList = require('./custom_bList');

var T = new Twit(config);

newsapi.v2.topHeadlines({
    sources: 'techcrunch,techradar,wired,the-verge,hacker-news',
    pageSize: 5
}).then(response => {
    t_arr = response.articles;
    //console.log(t_arr);
    for(var i=0; i<t_arr.length; i++){
        t_url = t_arr[i].url;
        t_name = (t_arr[i].source.name).replace(/ /g,'');
        // console.log(t_url);

        t_tweet = "New article on #"+t_name+" Check this out! " + t_url;

        //console.log(t_tweet);
        T.post('statuses/update',{status: t_tweet}, tweeted);
    }
});

//Fetch Top 5 articles every day
setInterval(
    function () {
        newsapi.v2.topHeadlines({
            sources: 'techcrunch,techradar,wired,the-verge,hacker-news',
            pageSize: 5
        }).then(response => {
            t_arr = response.articles;
            //console.log(t_arr);
            for(var i=0; i<t_arr.length; i++){
                t_url = t_arr[i].url;
                t_name = (t_arr[i].source.name).replace(/ /g,'');
                // console.log(t_url);

                t_tweet = "New article on #"+t_name+" Check this out! " + t_url;

                //console.log(t_tweet);
                T.post('statuses/update',{status: t_tweet}, tweeted);
            }
        })
    },1000*60*60*24);

//Setting up user stream
var stream = T.stream('user');

//When someone follows
stream.on('follow',followed);

function followed(data) {
    console.log("follow event!");
    var usr = data.source.name;
    var usr_name = data.source.screen_name;
    f_tweet = ".@"+usr_name+" Welcome onboard! Now you can keep a track of all the latest Tech Buzz! #DevFTW";
    T.post('statuses/update',{
        status: f_tweet
    }, tweeted())

}

//When someone mentions
stream.on('tweet',tweetEvent);

function tweetEvent(data) {
    var reply_to = data.in_reply_to_screen_name;
    var text = data.text;
    var from_u = data.user.screen_name;

    if(reply_to === 'dexterrickk'){
        query = text.replace('@dexterrickk','');
        console.log(from_u+' '+reply_to);
        console.log(query);
        if(isCool(query)){
            newsapi.v2.everything({
                sources: 'techcrunch,techradar,wired,the-verge,hacker-news',
                pageSize: 20,
                q: query,
                from: prev_date,
                to: cur_date,
                sortBy: 'relevancy'
            }).then(response => {
                s_arr = response.articles;
                if(s_arr.length===0){
                    reply =  "@"+from_u+" Sorry, could not find what you requested. Try something else!";
                }
                else {
                    query_url = s_arr[0].url;
                    reply = "@"+from_u+" Here you go! This is what I found. Take a look! "+query_url;
                }

                T.post('statuses/update',{
                    status: reply
                }, tweeted())
            });
        }
        else{
            reply = "@"+from_u+" Psst! Please don't use bad words!"
        }

    }
}

function tweeted(err, data, response) {
    if(err){
        console.log("An error occurred");
    }
    else{
        console.log("Tweeted!");
    }
}

// Add extra words in blacklist
var isCool = createIsCool({
    customBlacklist: bList,
    logger: console
});






