import { createPlaywrightRouter, createCheerioRouter } from 'crawlee'
import { convert } from 'html-to-text'
import fs from 'fs'

export const playwrightRouter = createPlaywrightRouter()
export const cheerioRouter = createCheerioRouter()

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

	if (link.startsWith('/') && link.includes(rootUrl)) {
		return `${httpMethod}://${link.replace('/', '')}`
	}

	return `${httpMethod}://${rootUrl}${link}`
}

playwrightRouter.addDefaultHandler(async ({ request, page, log, pushData }) => {
	log.info('URL: ' + request.loadedUrl)

	const [body, images, urls] = await Promise.all([
		page.$eval('body', (body) => body.innerHTML),
		page.$$('img'),
		page.$$eval('a', (anchors) => anchors.map((a) => a.href))
	])

	const url = request.loadedUrl
	const httpMethod = url.startsWith('https') ? 'https' : 'http'
	const rootUrl = url
		.replace(/https:\/\//, '')
		.replace(/http:\/\//, '')
		.split('/')[0]

	const links = urls.map((link) => fixLink(link, httpMethod, rootUrl))
	const bodyText = convert(body)
	const addonName = "I don't know how to get this yet, need demo url"
	const vendorName = "I don't know how to get this yet, need demo url"
	const imageCount = images.length

	const data = {
		url,
		addonName,
		vendorName,
		imageCount,
		links,
		body,
		bodyText
	}

	saveToJSON(data)

	await pushData(data)
})

cheerioRouter.addDefaultHandler(async ({ request, $, log, pushData }) => {
	log.info('URL: ' + request.loadedUrl)

	const url = request.loadedUrl
	const httpMethod = url.startsWith('https') ? 'https' : 'http'
	const rootUrl = url
		.replace(/https:\/\//, '')
		.replace(/http:\/\//, '')
		.split('/')[0]

	const links = $('a')
		.map((_, el) => $(el).attr('href'))
		.get()
		.map((link) => fixLink(link, httpMethod, rootUrl))

	const images = $('img').get()

	const body = $('body').html()
	const bodyText = convert(body)
	const addonName = "I don't know how to get this yet, need demo url"
	const vendorName = "I don't know how to get this yet, need demo url"
	const imageCount = images.length

	const data = {
		url,
		addonName,
		vendorName,
		imageCount,
		links,
		body,
		bodyText
	}

	saveToJSON(data)

	await pushData(data)
})
