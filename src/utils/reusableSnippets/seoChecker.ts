const SEOChecker = require('advanced-seo-checker');

type result = {
  url: string
  title: string
  headers: {
    h1: string[]
    h2: string[]
    h3: string[]
    h4: string[]
    h5: string[]
    h6: string[]
  }
  description: string
  scores: {
    performance: {
      score: number
    }
    accessibility: {
      score: number
    }
    seo: {
      score: number
    }
    isMobileFriendly: string
  }
}

export default class CheckSEO {
  url: string
  
  constructor({
    url = ''
  }){
    this.url = url
  }

  async checkSEO () {
    const crawler = SEOChecker(this.url, {});
    return new Promise((resolve, reject) => {
      crawler.analyze([this.url]).then((summary: any) => {
        if (!summary.pages[0]) { reject('We were not able to collect data from your website') }
        const response: result = summary.pages[0]
        resolve(response)
      });
    })
  }
}

