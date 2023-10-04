import { PlaywrightCrawler, CheerioCrawler } from 'crawlee'
import { convert } from 'html-to-text'
import fs from 'fs'

export default async function genscraper(actions) {
	for await (const action of actions) {
		switch (action.scraper) {
			case 'playwright':
				await scrapeWithPlaywright(action)
				break
			case 'cheerio':
				await scrapeWithCheerio(action)
				break
			default:
				throw new Error(`Unknown scraper: ${action.scraper}`)
		}
	}
}

function errorHandler({ request, log }) {
	log.info(`Request ${request.url} failed too many times.`)
}

function saveToJSON(data) {
	const date = new Date().toISOString()

	let url = data.url
		.replace(/https:\/\//, '')
		.replace(/http:\/\//, '')
		.replace(/\//g, '--')

	if (url.endsWith('/')) url = url.slice(0, -1)

	const fileName = `./data/${date}-${url}.json`

	fs.writeFileSync(fileName, JSON.stringify(data, null, 2))
}

function fixLink(link, httpMethod, rootUrl) {
	if (link.startsWith('http')) {
		return link
	}

	if (link.startsWith('//')) {
		return link.replace('//', 'https://')
	}

	if (link.startsWith('/') && link.includes(rootUrl)) {
		return `${httpMethod}://${link.replace('/', '')}`
	}

	return `${httpMethod}://${rootUrl}${link}`
}

async function scrapeWithPlaywright({ url, addonSelector, vendorSelector, options }) {
	const playwrightCrawler = new PlaywrightCrawler({
		...options,
		failedRequestHandler: errorHandler,
		async requestHandler({ request, page, log, pushData }) {
			log.info('URL: ' + request.loadedUrl)

			const [body, images, urls, addonName, vendorName] = await Promise.all([
				page.$eval('body', (body) => body.innerHTML),
				page.$$eval('img', (images) => images.map((img) => img.src)),
				page.$$eval('a', (anchors) => anchors.map((a) => a.href)),
				page.$eval(addonSelector, (addon) => addon.innerHTML),
				page.$eval(vendorSelector, (vendor) => vendor.innerHTML)
			])

			const url = request.loadedUrl
			const httpMethod = url.startsWith('https') ? 'https' : 'http'
			const rootUrl = url
				.replace(/https:\/\//, '')
				.replace(/http:\/\//, '')
				.split('/')[0]

			const imageUrls = images.map((link) => fixLink(link, httpMethod, rootUrl))
			const bodyText = convert(body)
			const imageCount = images.length

			const data = {
				url,
				addonName,
				vendorName,
				imageCount,
				imageUrls,
				urls,
				body,
				bodyText
			}

			saveToJSON(data)

			await pushData(data)
		}
	})

	await playwrightCrawler.run([url])
}

async function scrapeWithCheerio({ url, addonSelector, vendorSelector, options }) {
	const cheerioCrawler = new CheerioCrawler({
		...options,
		failedRequestHandler: errorHandler,
		async requestHandler({ request, $, log, pushData }) {
			log.info('URL: ' + request.loadedUrl)

			const url = request.loadedUrl
			const httpMethod = url.startsWith('https') ? 'https' : 'http'
			const rootUrl = url
				.replace(/https:\/\//, '')
				.replace(/http:\/\//, '')
				.split('/')[0]

			const images = $('img')
				.map((_, el) => $(el).attr('src'))
				.get()

			const urls = $('a')
				.map((_, el) => $(el).attr('href'))
				.get()
				.map((link) => fixLink(link, httpMethod, rootUrl))

			const imageUrls = images.map((link) => fixLink(link, httpMethod, rootUrl))

			const body = $('body').html()
			const bodyText = convert(body)

			const addonName = $(addonSelector).text()
			const vendorName = $(vendorSelector).text()
			const imageCount = images.length

			const data = {
				url,
				addonName,
				vendorName,
				imageCount,
				imageUrls,
				urls,
				body,
				bodyText
			}

			saveToJSON(data)

			await pushData(data)
		}
	})
	await cheerioCrawler.run([url])
}
