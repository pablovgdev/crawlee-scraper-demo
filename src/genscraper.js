import { playwrightRouter, cheerioRouter } from './routes.js'
import { PlaywrightCrawler, CheerioCrawler } from 'crawlee'

export default async function genscraper(actions) {
	for await (const { url, scraper, options } of actions) {
		switch (scraper) {
			case 'playwright':
				await scrapeWithPlaywright({ url, options })
				break
			case 'cheerio':
				await scrapeWithCheerio({ url, options })
				break
			default:
				throw new Error(`Unknown scraper: ${scraper}`)
		}
	}
}

function errorHandler({ request, log }) {
	log.info(`Request ${request.url} failed too many times.`)
}

async function scrapeWithPlaywright({ url, options }) {
	const playwrightCrawler = new PlaywrightCrawler({
		...options,
		requestHandler: playwrightRouter,
		failedRequestHandler: errorHandler
	})
	await playwrightCrawler.run([url])
}

async function scrapeWithCheerio({ url, options }) {
	const cheerioCrawler = new CheerioCrawler({
		...options,
		requestHandler: cheerioRouter,
		failedRequestHandler: errorHandler
	})
	await cheerioCrawler.run([url])
}
