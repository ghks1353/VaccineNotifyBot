import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

import { TargetSites, Site, SiteType } from "./sites";
import { BotConfig } from "./config";

interface ProxyInfo {
    ip: string;
    port: number;
}

const VACCINE_PENDING: string = "대기중";
const VACCINE_FINISHED: string = "마감";
const VACCINE_EMPTY: string = "0개";

let vaccineInfo: {[k: string]: string} = {};
let workers: NodeJS.Timer[] = [];
// const agent = new HttpsProxyAgent('http://username:pass@myproxy:port');

const proxies: HttpsProxyAgent[] = [
    // new HttpsProxyAgent('http://140.227.69.124:3128'),
    new HttpsProxyAgent('http://140.227.69.170:6000'),
    // new HttpsProxyAgent('http://140.227.70.129:6000'),
    // new HttpsProxyAgent('http://140.227.77.186:6000'),
    // new HttpsProxyAgent('http://136.243.211.104:80'),
    new HttpsProxyAgent('http://140.227.80.43:3128'),
    new HttpsProxyAgent('http://140.227.65.3:6000'),
    new HttpsProxyAgent('http://140.227.58.238:3128'),
    // new HttpsProxyAgent('http://140.227.76.44:6000'),
    new HttpsProxyAgent('http://140.227.72.100:6000'),
    // new HttpsProxyAgent('http://140.227.64.38:6000'),
    // new HttpsProxyAgent('http://140.227.66.105:58888'),
    new HttpsProxyAgent('http://201.94.250.217:3128'),
    new HttpsProxyAgent('http://140.227.64.248:58888'),
    // new HttpsProxyAgent('http://140.227.71.136:6000'),
    new HttpsProxyAgent('http://140.227.62.35:58888'),
    new HttpsProxyAgent('http://140.227.63.136:58888'),
    // new HttpsProxyAgent('http://140.227.77.186:6000'),
    new HttpsProxyAgent('http://113.20.31.22:8080'),
    new HttpsProxyAgent('http://117.54.11.82:3128'),
    // new HttpsProxyAgent('http://140.227.66.105:58888'),
    new HttpsProxyAgent('http://140.227.70.129:6000'),
    // new HttpsProxyAgent('http://140.227.73.61:3128'),
    new HttpsProxyAgent('http://140.227.80.43:3128'),
    new HttpsProxyAgent('http://140.227.58.238:3128'),
    new HttpsProxyAgent('http://140.227.69.124:3128'),
    // new HttpsProxyAgent('http://140.227.69.170:3128'),
    new HttpsProxyAgent('http://140.227.73.174:3128'),
    // new HttpsProxyAgent('http://140.227.76.44:3128'),
    new HttpsProxyAgent('http://140.227.81.13:3128'),
    // new HttpsProxyAgent('http://95.216.106.38:3128'),
    new HttpsProxyAgent('http://119.110.75.51:63123'),
    // new HttpsProxyAgent('http://52.175.18.223:8080'),
    // new HttpsProxyAgent('http://66.42.56.2:8080'),
    // new HttpsProxyAgent('http://202.138.249.241:8000'),
    // new HttpsProxyAgent('http://117.4.115.169:8080'),
    new HttpsProxyAgent('http://46.163.72.169:80'),
    new HttpsProxyAgent('http://197.248.184.157:53281'),
    new HttpsProxyAgent('http://1.186.34.68:80'),
    new HttpsProxyAgent('http://202.21.117.78:8080'),
    new HttpsProxyAgent('http://177.93.39.210:999'),
    new HttpsProxyAgent('http://119.110.66.82:63123'),
    new HttpsProxyAgent('http://185.33.239.224:8080'),
    // new HttpsProxyAgent('http://168.138.33.79:80'),
    // new HttpsProxyAgent('http://92.204.129.161:80'),
    // new HttpsProxyAgent('http://8.210.210.60:80'),
    new HttpsProxyAgent('http://217.79.181.109:443'),
    new HttpsProxyAgent('http://160.16.75.178:3128'),
    new HttpsProxyAgent('http://177.73.52.252:8080'),
    // new HttpsProxyAgent('http://140.227.61.25:58888'),
    new HttpsProxyAgent('http://140.227.67.135:6000'),
    new HttpsProxyAgent('http://140.227.68.113:6000'),
    new HttpsProxyAgent('http://41.223.119.156:3128'),
    // new HttpsProxyAgent('http://212.85.66.140:8380'),
    new HttpsProxyAgent('http://185.38.111.1:8080'),
    new HttpsProxyAgent('http://118.99.73.45:8080'),
    new HttpsProxyAgent('http://118.140.160.85:80'),
    new HttpsProxyAgent('http://140.227.68.230:58888'),
    new HttpsProxyAgent('http://149.129.62.207:3128'),
    // new HttpsProxyAgent('http://34.87.84.105:80'),
    new HttpsProxyAgent('http://119.28.250.189:80'),
    new HttpsProxyAgent('http://221.162.172.176:3128'),
    // new HttpsProxyAgent('http://35.197.159.27:3128'),
    // new HttpsProxyAgent('http://104.248.50.109:8080'),
];

// startup
console.log("Bot will parsing", TargetSites.length, "shops");

/// Init telegrambot
const bot = new TelegramBot(BotConfig.telegramToken, {polling: false});

let workerTimer: NodeJS.Timer;
let currentIndex: number = 0;

// make all sites as unavailable
for (let i = 0; i < TargetSites.length; ++i) {
    TargetSites[i].available = false;
}

function workerHandler() {
    let cachedIndex: number = Number(currentIndex.toString());
    let proxyIndex: number = Math.round(Math.random() * (proxies.length - 1));
    let target: Site = TargetSites[cachedIndex];
    console.log("Parsing", target.url);

    axios.get(target.url, {
        headers: { // for prevent device blocking
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"
        },
        httpsAgent: proxies[proxyIndex]
    }).then(result => {
        if (!result.data) {
            console.log("Index", cachedIndex, "returned no data");
            return;
        }

        let resultString: string = result.data as string;
        let hospitalName: string = resultString.split(`_3XamX">`)[1].split(`</span>`)[0];
        let vaccineStatus: string = resultString.split(`">화이자`)[1].split(`">`)[1].split("</em>")[0];

        if (vaccineStatus.indexOf("</span>") != -1) {
            vaccineStatus = resultString.split(`">화이자`)[1].split(`<em>`)[1].split("<span")[0];
            vaccineStatus += "개";
        }

        console.log(cachedIndex, hospitalName, vaccineStatus);

        if (vaccineStatus != VACCINE_PENDING && vaccineStatus != VACCINE_FINISHED && vaccineStatus != VACCINE_EMPTY && vaccineInfo[hospitalName] != vaccineStatus) {
            bot.sendMessage(BotConfig.targetChatID, `[백신알림] ${hospitalName} 잔여백신 발생 (${vaccineStatus})
            바로가기 => ${target.url}`);
        }

        vaccineInfo[hospitalName] = vaccineStatus;
    }).catch(error => {
        // some sites can be unaccessable because of heavy access
        console.log("Index", cachedIndex, "returned server error", (proxies[proxyIndex] as any).proxy.host);
        // handleNextSite();
    })

    handleNextSite();
}

function handleNextSite() {
    currentIndex += 1;

    if (currentIndex >= TargetSites.length) {
        currentIndex = 0;
    }

    // Next queue after 1s
    workers.push(setTimeout(workerHandler, 500));

    if (workers.length > 30) {
        workers.shift();
    }
}

// function parseNaverShop(target: Site, response: string): Product {
//     let canBuy: boolean = false;
//     let productName: string = "";
//     let productPrice: string = "";

//     let tmp: string = response.split("<span class=\"buy\"")[1];
//     tmp = tmp.split("</a>")[0];

//     // Can user buy this product? (by masking class)
//     if (tmp.indexOf("<span class=\"mask2\"") <= -1) {
//         canBuy = true;
//     }

//     // Get product name
//     tmp = response.split("<dt class=\"prd_name\">")[1];
//     productName = tmp.split("<strong>")[1].split("</strong>")[0].trim();
    
//     // Get price
//     tmp = response.split("<strong class=\"info_cost")[1];
//     productPrice = tmp.split("class=\"thm\">")[1].split("</span>")[0].trim();

//     return {
//         name: productName,
//         price: productPrice + "원",
//         url: target.url,
//         available: canBuy
//     };
// }

// Start bot
workerHandler();
