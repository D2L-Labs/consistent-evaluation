const puppeteer = require('puppeteer');
const VisualDiff = require('@brightspace-ui/visual-diff');

describe('consistent-evaluation-tii-grade-mark', () => {

	const visualDiff = new VisualDiff('consistent-evaluation-tii-grade-mark', __dirname);

	let browser, page;

	before(async() => {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=en-GB']
		});
		page = await visualDiff.createPage(browser, { viewport: { width: 1000, height: 2000 } });
		await page.goto(`${visualDiff.getBaseUrl()}/test/perceptual/consistent-evaluation-tii-grade-mark.visual-diff.html`, { waitUntil: ['networkidle0', 'load'] });
		await page.bringToFront();
	});

	after(async() => await browser.close());

	it('default', async function() {
		const rect = await visualDiff.getRect(page, '#default');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('no tii grade', async function() {
		const rect = await visualDiff.getRect(page, '#no-grade');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('no assignment grade', async function() {
		const rect = await visualDiff.getRect(page, '#hide-use-grade');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});

	it('no href', async function() {
		const rect = await visualDiff.getRect(page, '#no-href');
		await visualDiff.screenshotAndCompare(page, this.test.fullTitle(), { clip: rect });
	});
});
