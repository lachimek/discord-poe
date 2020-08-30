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
    const channel = client.channels.cache.get(process.env.POE_CHANNEL_ID);
    const startMsg = channel.send("xxx");

    const timeInterval = setInterval(()=>{
        const {total, days, hours, minutes, seconds} = getTimeRemaining(process.env.DEADLINE_DATE || deadline);
        startMsg.then(msg =>{
            msg.edit(`Do startu ligi **Expedition** zostało: ${days}D ${hours}H ${minutes}M`);
        });
        if(total <= 0) clearInterval(timeInterval);
    }, process.env.MSG_TIMEOUT || 2000);
})

client.login(process.env.BOT_TOKEN);