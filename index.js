const puppeteer = require('puppeteer');
require('dotenv').config();

function run() {
  const CONFIG = process.env;
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto('https://auth.afip.gob.ar/contribuyente_/login.xhtml');

      await page.evaluate((cuit) => {
        const inputs = document.querySelectorAll('#F1 input');
        inputs[1].value = cuit;
        inputs[2].click();
      }, CONFIG.AFIP_CUIT);
      await page.waitForSelector('#F1');

      await page.evaluate((password) => {
        const inputs = document.querySelectorAll('#F1 input');
        inputs[3].value = password;
        inputs[4].click();
      }, CONFIG.AFIP_PASSWORD);
      const pageTarget = page.target();
      await page.waitForSelector(
        '#j_idt49 > div > div.unit-65 > div.units-row > div:nth-child(1) > ul > li:nth-child(4) > a'
      );
      await page.click(
        '#j_idt49 > div > div.unit-65 > div.units-row > div:nth-child(1) > ul > li:nth-child(4) > a'
      );
      const newTarget = await browser.waitForTarget(
        (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();
      await newPage.waitForSelector(
        '.btn_empresa.ui-button.ui-widget.ui-state-default.ui-corner-all'
      );
      await newPage.click(
        '.btn_empresa.ui-button.ui-widget.ui-state-default.ui-corner-all'
      );
      await newPage.waitForSelector('#btn_gen_cmp');
      await newPage.click('#btn_gen_cmp');

      await newPage.waitForSelector('#puntodeventa');
      await newPage.select('#puntodeventa', '1');
      await newPage.waitFor(1000);
      await newPage.click(
        '#contenido > form > input[type=button]:nth-child(4)'
      );
      await newPage.waitForSelector('#idconcepto');
      await newPage.select('#idconcepto', '2');
      await newPage.waitForSelector('input[name="periodoFacturadoDesde"]');
      await newPage.focus('input[name="periodoFacturadoDesde"]');
      await newPage.keyboard.type(CONFIG.FROM_DATE);

      await newPage.focus('input[name="periodoFacturadoHasta"]');
      await newPage.keyboard.type(CONFIG.TO_DATE);
      await newPage.click(
        '#contenido > form > input[type=button]:nth-child(4)'
      );
      await newPage.waitForSelector('#idivareceptor');
      await newPage.select('#idivareceptor', '5');
      await newPage.click('#formadepago1');
      await newPage.click('#formulario > input[type=button]:nth-child(4)');

      await newPage.waitForSelector('input[name="detalleCodigoArticulo"]');
      await newPage.focus('input[name="detalleCodigoArticulo"]');
      await newPage.keyboard.type('1');

      await newPage.waitForSelector('textarea[name="detalleDescripcion"]');
      await newPage.focus('textarea[name="detalleDescripcion"]');
      await newPage.keyboard.type('Servicios de desarrollo de software');

      await newPage.waitForSelector('input[name="detallePrecio"]');
      await newPage.focus('input[name="detallePrecio"]');
      await newPage.keyboard.type(CONFIG.AMOUNT);

      await newPage.click(
        '#contenido > form > input[type=button]:nth-child(15)'
      );
      await newPage.waitForSelector('#btngenerar');
      const button = await newPage.$('#btngenerar');
      await button.evaluate((e) => e.scrollIntoView(true));
      await newPage.on('dialog', async (dialog) => {
        await dialog.accept();
      });
      await newPage.click('#btngenerar');
      browser.close();
      resolve();
    } catch (e) {
      return reject(e);
    }
  });
}
run().then(console.log).catch(console.error);
