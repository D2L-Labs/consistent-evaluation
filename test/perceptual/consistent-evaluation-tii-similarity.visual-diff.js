const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('consistent-evaluation-tii-similarity', () => {

	const visualDiff = new VisualDiff('consistent-evaluation-tii-similarity', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 1000, height: 2000 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-tii-similarity.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	it('report exists', async function() {
		const rect = await visualDiff.getRect(page, '#report-exists');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('file to be submitted', async function() {
		const rect = await visualDiff.getRect(page, '#file-to-be-submitted');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('file-being-submitted', async function() {
		const rect = await visualDiff.getRect(page, '#file-being-submitted');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('no-report', async function() {
		const rect = await visualDiff.getRect(page, '#no-report');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('error', async function() {
		const rect = await visualDiff.getRect(page, '#error');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

});
