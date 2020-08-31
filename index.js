require('dotenv').config();
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

client.on('ready', ()=>{
    console.log(`Zalogowano jako ${client.user.tag}`);

    const timeInterval = setInterval(()=>{
        const {total, days, hours, minutes} = getTimeRemaining(process.env.DEADLINE_DATE || deadline);

        const msg = `${days}d : ${hours}h : ${minutes}m`

        client.channels.cache.get("750081896427421778").setName(msg)
            .catch(console.error);

        if(total <= 0) clearInterval(timeInterval);
    }, process.env.MSG_TIMEOUT || 60000);

})

client.on('rateLimit', (info) => {
    console.log(`Rate limit hit ${info.timeDifference ? info.timeDifference : info.timeout ? info.timeout: 'Unknown timeout '}`)
})

client.login(process.env.BOT_TOKEN);