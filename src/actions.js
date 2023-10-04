const playwright = 'playwright'
const cheerio = 'cheerio'

const actions = [
	{
		url: 'https://en.wikipedia.org/wiki/1919%E2%80%9320_Gillingham_F.C._season',
		scraper: cheerio,
		addonSelector: '#mw-content-text > div.mw-parser-output > table.infobox.vcard > caption > a',
		vendorSelector: '#firstHeading > span',
		options: {}
	},
	{
		url: 'https://en.wikipedia.org/wiki/Hungarian_language',
		scraper: playwright,
		addonSelector: '#mw-content-text > div.mw-parser-output > table.infobox.vevent > tbody > tr:nth-child(1) > th',
		vendorSelector: '#firstHeading > span',
		options: {}
	}
]

export default actions
