const Twitter = require('twitter');
const fetch = require('node-fetch');

class ArkTwiAlert extends Twitter{
    constructor(keys, webHookURL){
        super(keys);
        this.webHookURL = webHookURL;
        this.latestId = "";
    }

	async getTweets(params){
        let tweets = await new Promise(
            (resolve, reject)=>{
                this.get('statuses/user_timeline', params, (error, tweets, response)=>{
                    if(!error){
                        resolve(tweets);
                    }else{
                        reject(error);
                    }
                });
            }
        ).catch((err)=>console.log(err));
        
        
        if(this.latestId === tweets[0].id_str){
            return null;
        }else{
            this.latestId = tweets[0].id_str;
            return tweets;
        }
        
	}

    getTwiURL(tweet, accountId){
        let twId = tweet.id_str;
        let url = "https://twitter.com/" + accountId + "/status/" + twId;

        return url;
    }

    sendDiscord(content){
        let options = {
            method: 'post',
            body: JSON.stringify({'content': content}),
            headers: {
                "Content-type": "application/json",
            },
        };

        fetch(this.webHookURL, options);
    }
}

(function (){
    const client = new ArkTwiAlert({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    },
    process.env.DISCORD_ARK_WEBHOOK_URL);

    const tergetAcount = 'survivetheark';

    let params = {
		screen_name: tergetAcount,
		count: 1,
		include_rts: false
	};

    setInterval(async() => {
        let tweets = await client.getTweets(params);

        if(tweets !== null){
            console.log('send!');
            client.sendDiscord(client.getTwiURL(tweets[0], tergetAcount));
        }else{
            console.log('none');
        }
    }, 5000);
})()