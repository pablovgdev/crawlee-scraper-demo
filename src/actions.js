const playwright = 'playwright'
const cheerio = 'cheerio'

const actions = [
	{
		url: 'https://en.wikipedia.org/wiki/1919%E2%80%9320_Gillingham_F.C._season',
		scraper: cheerio,
		options: {}
	},
	{
		url: 'https://en.wikipedia.org/wiki/Hungarian_language',
		scraper: playwright,
		options: {}
	}
]

export default actions