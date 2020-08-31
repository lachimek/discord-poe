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

    const timeInterval = setInterval(()=>{
        const {total, days, hours, minutes} = getTimeRemaining(process.env.DEADLINE_DATE || deadline);

        client.channels.cache.get(sources.days).setName(`${days} - ${days < 2 && days !== 0 ? 'dzień' : 'dni'}`)
            .catch(console.error);
        client.channels.cache.get(sources.hours).setName(`${hours} - ${hours < 2 && hours !== 0 ? 'godzina' : 'godzin'}`)
            .catch(console.error);
        client.channels.cache.get(sources.minutes).setName(`${minutes} - ${minutes < 2 && minutes !== 0 ? 'minuta' : 'minut'}`)
            .catch(console.error);

        if(total <= 0) clearInterval(timeInterval);
    }, process.env.MSG_TIMEOUT || 2000);

})

client.login(process.env.BOT_TOKEN);