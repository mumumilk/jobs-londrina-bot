const parser = require('rss-parser');
const http = require('http');
const request = require('request');

const lastDate = new Date(-8640000000000000);

const port = process.env.PORT || 1337;
const uri = process.env.URI;
const interval = process.env.INTERVAL || 1000 * 60 * 60;


if (!uri) {
	console.log('Error. Parameter URI is missing.')
}

const server = http.createServer((request, response) => {
	response.writeHead(200, { 'Content-Type': 'text/plain' });
	response.end('Jobs-Londrina-Bot!');
});

server.listen(port);
console.log('Server running at http://localhost:%d', port);

function sendMessage(entry) {
	const url = uri;
	const postData = {
		mrkdwn: true,
		attachments: [{
			'fallback': 'Required plain-text summary of the attachment.',
			'color': '#bc183c',
			'pretext': 'Vaga de trabalho encontrada. Confira!\n',
			'title': entry.title,
			'title_link': entry.link,
			'text': 'Descrição: ' + entry.contentSnippet
		}]
	};
	const options = {
		method: 'post',
		body: postData,
		json: true,
		url: url
	};
	request(options, (err, res, body) => {
		if (err) {
			console.log(err);
		} else {
			console.log(res.statusCode)
		}
	});
}

function refresh() {
	const feedUrl = 'http://jobslondrina.com/?feed=job_feed&job_types=emprego%2Cestagio%2Cfreelancer%2Ctemporario&search_location&job_categories=programacao&search_keywords.xml';

	parser.parseURL(feedUrl, (err, parsed) => {
		parsed.feed.entries.forEach(entry => {
			if (new Date(entry.isoDate) > lastDate) {
				sendMessage(entry);
			}
		});
		lastDate = parsed.feed.entries[0].isoDate;
	});
}

setInterval(refresh, interval);
