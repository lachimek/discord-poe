require('dotenv').config();
const request = require('request-promise')
const axios = require('axios')
const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const Discord = require('discord.js')
const client = new Discord.Client();

const deadline = 'September 18 2020 22:00:00 GMT+0200';

function getTimeRemaining(endTime){
    const total = Date.parse(endTime) - Date.parse(new Date());
    const seconds = Math.floor( (total/1000) % 60 );
    const minutes = Math.floor( (total/1000/60) % 60 );
    const hours = Math.floor( (total/(1000*60*60)) % 24 );
    const days = Math.floor( total/(1000*60*60*24) );

    return {
        total,
        days,
        hours,
        minutes,
        seconds
    };
}
const covidApi = `https://api.apify.com/v2/actor-tasks/9DWQprhKovw6JndVB/run-sync-get-dataset-items?token=${process.env.API_KEY}`
const poeLabUrl = 'https://www.poelab.com/';
const absolutePath = '/html/body/div[1]/div[2]/div[1]/div[3]/div/div/center/div/';
const lab = {
    uber: `${absolutePath}div[1]/div/h2/a`,
    merc: `${absolutePath}div[2]/div/h2/a`,
    cruel: `${absolutePath}div[3]/div/h2/a`,
    normal: `${absolutePath}div[4]/div/h2/a`,
    img: `/html/body/div[1]/div[2]/div/div/article/div[3]/div[2]/img`,
}

client.on('ready', ()=>{
    console.log(`Zalogowano jako ${client.user.tag}`);
    client.user.setPresence({activity: {name: '&info'}}).then(r => console.log("ustawiono status"))

     const timeInterval = setInterval(()=>{
        const {total, days, hours, minutes} = getTimeRemaining(process.env.DEADLINE_DATE || deadline);

        const msg = `${days}d : ${hours}h : ${minutes}m`

        client.channels.cache.get("750081896427421778").setName(msg)
            .catch(console.error);

        if(total <= 0) clearInterval(timeInterval);
    }, process.env.MSG_TIMEOUT || 60000);

})

client.on('message', (message)=>{
    if(message.author.bot) return;
    if(!message.content.startsWith('&')) return;

    const command = message.content.split(' ');
    if(command[0].toLowerCase().substr(1) === 'lab'){
        let labType;
        switch (command[1].toLowerCase()) {
            case 'uber':
                labType = lab.uber;
                break;
            case 'merc':
                labType = lab.merc;
                break;
            case 'cruel':
                labType = lab.cruel;
                break;
            case 'normal':
                labType = lab.normal;
                break;
            default:
                message.channel.send('Opcje: uber, merc, cruel, normal');
        }
        if(typeof labType !== 'undefined'){
            request(poeLabUrl).then((data)=>{
                console.log(`Lab type: ${labType}`);
                const doc = new dom().parseFromString(data);
                const nodes = xpath.select(labType, doc);
                const href = nodes[0].attributes[1].value;
                request(href).then((data)=>{
                    const doc = new dom().parseFromString(data);
                    const nodes = xpath.select(lab.img, doc);

                    console.log(nodes[0].attributes[2].value);
                    message.channel.send(`Tak wygląda dziś ${command[1].toLowerCase()} lab`, {files: [nodes[0].attributes[2].value]});
                }).catch(err => console.log(err));
            });
        }
    }else if(command[0].toLowerCase().substr(1) === 'covid'){
        axios.get(covidApi).then(data =>{
            const tweets=data.data[0]['tweets'];
            let filtered = tweets.filter(tweet => tweet.contentText.includes("Mamy"))
            let discordEmbed = {
                "embed": {
                    "title": "Covid - Polska",
                    "color": 13053094,
                    "footer": {
                        "icon_url": "https://cdn.discordapp.com/emojis/432884822591930379.png",
                        "text": "Nowe dane codziennie o 11:00"
                    },
                    "thumbnail": {
                        "url": "https://image.flaticon.com/icons/png/512/2760/2760147.png"
                    },
                    "fields": [
                        {
                            "name": "no data error",
                            "value": "Top 5 województw"
                        }
                    ]
                }
            }
            discordEmbed.embed.fields[0].name = filtered[0].contentText.split(":")[0];
            let topka = filtered[0].contentText.split(":")[1].split(", ");
            for(let i = 0; i<5; i++){
                let item = topka[i].replace('go', '');
                discordEmbed.embed.fields.push({
                    "name": "\u200b",
                    "value": `${i+1}. ${i===0 ? item.substring(1) : item}`
                })
            }
            message.channel.send(discordEmbed);
        });
    }else if(command[0].toLowerCase().substr(1) === 'info') {
        message.channel.send(`Dostępne komendy: &lab (zepsute), &covid`);
    }
})

client.on('rateLimit', (info) => {
    console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
})

client.login(process.env.BOT_TOKEN);
