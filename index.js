require('dotenv').config();
const Discord = require('discord.js')
const client = new Discord.Client();

const deadline = 'September 18 2020 22:00:00 GMT+0200';
const sources = {
    days: "750058655507939350",
    hours: "750058667822285022",
    minutes: "750058677775368240"
};

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
    const targets = {
        days: client.channels.cache.get(sources.days),
        hours: client.channels.cache.get(sources.hours),
        minutes: client.channels.cache.get(sources.minutes),
    };
    const timeInterval = setInterval(()=>{
        const {total, days, hours, minutes} = getTimeRemaining(process.env.DEADLINE_DATE || deadline);

        targets.days.setName(`${days} - ${days < 2 && days !== 0 ? 'dzień' : 'dni'}`);
        targets.hours.setName(`${hours} - ${hours < 2 && hours !== 0 ? 'godzina' : 'godzin'}`);
        targets.minutes.setName(`${minutes} - ${minutes < 2 && minutes !== 0 ? 'minuta' : 'minut'}`);

        if(total <= 0) clearInterval(timeInterval);
    }, process.env.MSG_TIMEOUT || 2000);

})

client.login(process.env.BOT_TOKEN);