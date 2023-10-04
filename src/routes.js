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

	if (link.startsWith('//')) {
		return link.replace('//', 'https://')
	}

	if (link.startsWith('/') && link.includes(rootUrl)) {
		return `${httpMethod}://${link.replace('/', '')}`
	}

	return `${httpMethod}://${rootUrl}${link}`
}

playwrightRouter.addDefaultHandler(async ({ request, page, log, pushData }) => {
	log.info('URL: ' + request.loadedUrl)

	const [body, images] = await Promise.all([
		page.$eval('body', (body) => body.innerHTML),
		page.$$eval('img', (images) => images.map((img) => img.src))
	])

	const url = request.loadedUrl
	const httpMethod = url.startsWith('https') ? 'https' : 'http'
	const rootUrl = url
		.replace(/https:\/\//, '')
		.replace(/http:\/\//, '')
		.split('/')[0]

	const imageUrls = images.map((link) => fixLink(link, httpMethod, rootUrl))
	const bodyText = convert(body)
	const addonName = "I don't know how to get this yet, need demo url"
	const vendorName = "I don't know how to get this yet, need demo url"
	const imageCount = images.length

	const data = {
		url,
		addonName,
		vendorName,
		imageCount,
		imageUrls,
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

	const images = $('img')
		.map((_, el) => $(el).attr('src'))
		.get()

	const imageUrls = images.map((link) => fixLink(link, httpMethod, rootUrl))

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
		imageUrls,
		body,
		bodyText
	}

	saveToJSON(data)

	await pushData(data)
})
