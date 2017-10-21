var SlackBot = require('slackbots');
var parser = require('rss-parser');
var http = require('http');

var port = process.env.PORT || 1337;
var token = process.env.TOKEN;
var channel = process.env.CHANNEL || 'vagas';
var interval = process.env.INTERVAL || 1000 * 60 * 60;

if (!token) {
    console.log('Error: Slackbot token is required');
    return;
}

var server = http.createServer(function(request, response) {

    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Jobs-Londrina-Bot!");

});
server.listen(port);

console.log("Server running at http://localhost:%d", port);

var bot = new SlackBot({
    token: token,
    name: 'Jobs Londrina'
});

bot.on('open', function() {
    var lastDate = new Date(-8640000000000000);

    function refresh() {
        parser.parseURL('http://jobslondrina.com/?feed=job_feed&job_types=emprego%2Cestagio%2Cfreelancer%2Ctemporario&search_location&job_categories=programacao&search_keywords.xml', function(err, parsed) {
            parsed.feed.entries.forEach(function(entry, i) {
                if (new Date(entry.isoDate) > lastDate) {
                    bot.postMessageToChannel(channel, '', {
                        icon_emoji: ':jobs:',
                        mrkdwn: true,
                        attachments: [{
                            "fallback": "Required plain-text summary of the attachment.",
                            "color": "#bc183c",
                            "pretext": "Vaga de trabalho encontrada. Confira!\n",
                            "title": entry.title,
                            "title_link": entry.link,
                            "text": 'Descrição: ' + entry.contentSnippet
                        }]
                    });
                }
            });
            lastDate = parsed.feed.entries[0].isoDate;
        });
    }
    setInterval(refresh, interval);

});
