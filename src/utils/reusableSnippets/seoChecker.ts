const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

type test = {
  title: string
  description: string
  score: number | string | null
}

type result = {
  score: number
  passed: test[]
  failed: test[]
}

export default class CheckSEO {
  url: string
  chromeOptions: any
  lighthouseOptions: any
  evaluationConfig: any
  
  constructor({
    url = '',
    chromeOptions = {
      chromeFlags: ['--headless']
    },
    lighthouseOptions = {
      onlyCategories: ['seo']
    },
    evaluationConfig = {
      output: ["json"],
      extends: 'lighthouse:default'
    }
  }){
    this.url = url
    this.chromeOptions = chromeOptions
    this.lighthouseOptions = lighthouseOptions
    this.evaluationConfig = evaluationConfig
  }

  async checkSEO (): Promise<result> {
    return new Promise(async (resolve, reject): Promise<void> => {
      try {
        const chrome = await chromeLauncher.launch(this.chromeOptions)
        this.lighthouseOptions.port = chrome.port
        const { lhr: { audits, categories: { seo } } } = await lighthouse(this.url, this.lighthouseOptions, this.evaluationConfig)
        await chrome.kill()
        const result = {
          score: seo.score * 100,
          passed: Object.entries(audits).filter((u: any) => u[1].score * 100 > 80)
            .map((u: any) => ({
              title: u[1].title,
              score: u[1].score * 100 || 'N/A',
              description: u[1].description
            })),
          failed: Object.entries(audits).filter((u: any) => !u[1].score || u[1].score * 100 < 80)
            .map((u: any) => ({
              title: u[1].title,
              score: u[1].score * 100,
              description: u[1].description
            }))
        }
        resolve(result)
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }
}

