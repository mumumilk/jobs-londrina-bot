const SlackBot = require('slackbots');
const parser = require('rss-parser');
const http = require('http');

const port = process.env.PORT || 1337;
const token = process.env.TOKEN;
const channel = process.env.CHANNEL || 'vagas';
const interval = process.env.INTERVAL || 1000 * 60 * 60;

if (!token) {
	console.log('Error: Slackbot token is required');
	return;
}

const server = http.createServer((request, response) => {
	response.writeHead(200, { 'Content-Type': 'text/plain' });
	response.end('Jobs-Londrina-Bot!');
});
server.listen(port);

console.log('Server running at http://localhost:%d', port);

const bot = new SlackBot({
	token: token,
	name: 'Jobs Londrina'
});

bot.on('open', () => {
	const lastDate = new Date(-8640000000000000);
	const feedUrl = 'http://jobslondrina.com/?feed=job_feed&job_types=emprego%2Cestagio%2Cfreelancer%2Ctemporario&search_location&job_categories=programacao&search_keywords.xml';

	function refresh() {
		parser.parseURL(feedUrl, (err, parsed) => {
			parsed.feed.entries.forEach(entry => {
				if (new Date(entry.isoDate) > lastDate) {
					bot.postMessageToChannel(channel, '', {
						icon_emoji: ':jobs:',
						mrkdwn: true,
						attachments: [{
							'fallback': 'Required plain-text summary of the attachment.',
							'color': '#bc183c',
							'pretext': 'Vaga de trabalho encontrada. Confira!\n',
							'title': entry.title,
							'title_link': entry.link,
							'text': 'Descrição: ' + entry.contentSnippet
						}]
					});
				}
			});
			lastDate = parsed.feed.entries[0].isoDate;
		});
	}
	setInterval(refresh, interval);
});
