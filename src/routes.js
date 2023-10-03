import { createPlaywrightRouter } from 'crawlee'
import { convert } from 'html-to-text'
import fs from 'fs'

export const playwrightRouter = createPlaywrightRouter()

function saveToJSON(data) {
	const date = new Date().toISOString()
	let url = data.url.replace(/https?:\/\//, '')
	if (url.endsWith('/')) url = url.slice(0, -1)
	const fileName = `./data/${date}-${url}--path--path.json`
	fs.writeFileSync(fileName, JSON.stringify(data, null, 2))
}

playwrightRouter.addDefaultHandler(async ({ request, page, log, pushData }) => {
	const title = await page.title()
	log.info(`${title}`, { url: request.loadedUrl })

	const [body, images, links] = await Promise.all([
		page.$eval('body', (body) => body.innerHTML),
		page.$$('img'),
		page.$$('a')
	])

	const url = request.loadedUrl
	const bodyText = convert(body)
	const addonName = "I don't know how to get this yet, need demo url"
	const vendorName = "I don't know how to get this yet, need demo url"
	const imageCount = images.length
	const urls = Promise.all([links.map((link) => link.getAttribute('href'))])

	const data = {
		url,
		body,
		bodyText,
		addonName,
		vendorName,
		imageCount,
		urls
	}

	saveToJSON(data)

	await pushData(data)
})
