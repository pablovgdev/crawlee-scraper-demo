import { playwrightRouter } from './routes.js'
import { PlaywrightCrawler, CheerioCrawler } from 'crawlee'

export default async function genscraper(url, scraper, options) {
	let crawler

	if (scraper === 'playwright') {
		crawler = new PlaywrightCrawler({ ...options, requestHandler: playwrightRouter })
	} else if (scraper === 'cheerio') {
		crawler = new CheerioCrawler(options)
	}

	if (!crawler) {
		throw new Error('No correct scraper option provided')
	}

	await crawler.run([url])
}