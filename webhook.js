var parser = require('rss-parser');
var http = require('http');
var request = require('request');

var lastDate = new Date(-8640000000000000);

var port = process.env.PORT || 1337;
var uri = process.env.URI;
var interval = process.env.INTERVAL || 1000 * 60 * 60;


if (!uri) {
    console.log('Error. Parameter URI is missing.')
}

var server = http.createServer(function(request, response) {

    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Jobs-Londrina-Bot!");

});

server.listen(port);
console.log("Server running at http://localhost:%d", port);


function sendMessage(entry) {
    var url = uri;
    var postData = {
        mrkdwn: true,
        attachments: [{
            "fallback": "Required plain-text summary of the attachment.",
            "color": "#bc183c",
            "pretext": "Vaga de trabalho encontrada. Confira!\n",
            "title": entry.title,
            "title_link": entry.link,
            "text": 'Descrição: ' + entry.contentSnippet
        }]
    };
    var options = {
        method: 'post',
        body: postData,
        json: true,
        url: url
    };
    request(options, function(err, res, body) {
        if (err) {
            console.log(err);
        } else {
            console.log(res.statusCode)
        }
    });
}

function refresh() {
    parser.parseURL('http://jobslondrina.com/?feed=job_feed&job_types=emprego%2Cestagio%2Cfreelancer%2Ctemporario&search_location&job_categories=programacao&search_keywords.xml', function(err, parsed) {
        parsed.feed.entries.forEach(function(entry, i) {
            if (new Date(entry.isoDate) > lastDate) {
                sendMessage(entry);
            }
        });
        lastDate = parsed.feed.entries[0].isoDate;
    });
}


setInterval(refresh, interval);